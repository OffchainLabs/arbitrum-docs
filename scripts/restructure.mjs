/**
 * restructure — move a doc end to end, with a verification gate.
 *
 * Usage:
 *   pnpm restructure <from> <to> [--dry-run]
 *
 * Runs `move-doc <from> <to>` (rewrites links, moves the file, updates meta.json, appends the
 * redirect), then verifies with `pnpm types:check` and a broken-link diff. The link gate fails only on
 * links broken *by this move* (a regression), not on the tree's pre-existing broken links — so a move
 * is never blocked by unrelated rot. `--dry-run` delegates to `move-doc --dry-run` and skips the gate.
 *
 * There is no separate redirect-sync step: `next.config.mjs` reads `redirects.config.mjs` directly.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const repoRoot = process.cwd();

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit' });
}

function brokenLinks() {
  const out = execFileSync('node', ['scripts/check-links.mjs', '--json'], { encoding: 'utf8' });
  return JSON.parse(out.trim() || '[]');
}

function relOf(arg) {
  return path.relative(repoRoot, path.resolve(repoRoot, arg)).split(path.sep).join('/');
}

function main() {
  const argv = process.argv.slice(2);
  const positional = argv.filter((a) => !a.startsWith('--'));
  const dryRun = argv.includes('--dry-run');
  if (positional.length !== 2) {
    console.error('usage: pnpm restructure <from> <to> [--dry-run]');
    process.exit(1);
  }
  const [from, to] = positional;

  if (dryRun) {
    run('node', ['scripts/move-doc.mjs', from, to, '--dry-run']);
    return;
  }

  // Baseline before the move; remap the moved file's own path so its pre-existing broken links
  // aren't mistaken for regressions once it lives at the new path.
  const fromRel = relOf(from);
  const toRel = relOf(to);
  const beforeKeys = new Set(
    brokenLinks().map((b) => `${b.rel === fromRel ? toRel : b.rel}|${b.url}`),
  );

  run('node', ['scripts/move-doc.mjs', from, to]);

  console.log('\n--- verification gate ---');
  let typesOk = true;
  try {
    run('pnpm', ['types:check']);
  } catch {
    typesOk = false;
  }

  const after = brokenLinks();
  const regressions = after.filter((b) => !beforeKeys.has(`${b.rel}|${b.url}`));
  const fixedCount =
    beforeKeys.size - after.filter((b) => beforeKeys.has(`${b.rel}|${b.url}`)).length;

  if (regressions.length) {
    console.error(`\nrestructure: ${regressions.length} link(s) broken BY this move:`);
    for (const b of regressions) console.error(`  ${b.rel}:${b.line}  ->  ${b.url}`);
  }
  if (fixedCount > 0)
    console.log(`(note: this move also resolved ${fixedCount} previously-broken link(s))`);

  if (!typesOk || regressions.length) {
    console.error(
      '\nrestructure: verification failed AFTER the move was applied.\n' +
        '  Fix the reported issue, or revert the move:\n' +
        '    git restore --staged content/docs redirects.config.mjs 2>/dev/null; git checkout -- content/docs redirects.config.mjs',
    );
    process.exit(1);
  }

  console.log('\nrestructure: done — move applied and verified (no new broken links).');
}

main();
