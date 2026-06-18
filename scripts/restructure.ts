/**
 * restructure — run a doc move end to end, in the order that keeps the edge consistent.
 *
 * Usage:
 *   yarn restructure <from> <to> [--dry-run]
 *
 * Sequence:
 *   1. `move-doc`        — move the file + rewrite links + sidebars.js + redirects.config.js
 *   2. `yarn build`      — VERIFICATION GATE: fails on any broken link, and the client-redirects
 *                          plugin rejects a redirect whose target route doesn't exist. If this
 *                          fails the orchestrator aborts BEFORE touching the edge.
 *   3. `build-glossary`  — only if the move changed a glossary source partial. Quicklook tooltips
 *                          render from the generated static/glossary.json, which the build does
 *                          not validate, so it must be regenerated explicitly.
 *   4. `sync-redirects`  — mirror redirects.config.js into vercel.json, now that the move is verified.
 *
 * Keeping `yarn build` BETWEEN the move and the sync is the whole point: a redirect is never
 * propagated to vercel.json for a move that doesn't build. `--dry-run` previews the move only —
 * build, glossary, and sync are no-ops when nothing has changed, so they are skipped.
 */

import { execFileSync } from 'node:child_process';

/** Run a command, streaming its output; throws (non-zero exit) propagate to abort the sequence. */
function run(command: string, args: string[]): void {
  execFileSync(command, args, { stdio: 'inherit' });
}

/** True when the move left a glossary source partial dirty, so static/glossary.json is stale. */
function glossaryChanged(): boolean {
  try {
    const out = execFileSync('git', ['status', '--porcelain', '--', 'docs/partials/glossary'], {
      encoding: 'utf8',
    });
    return out.trim().length > 0;
  } catch {
    // Without git we can't tell; regenerate to be safe (build-glossary is idempotent).
    console.warn(
      '[restructure] could not check git for glossary changes — running build-glossary to be safe.',
    );
    return true;
  }
}

function main(): void {
  const argv = process.argv.slice(2);
  const positional = argv.filter((arg) => !arg.startsWith('--'));
  const dryRun = argv.includes('--dry-run');
  if (positional.length !== 2) {
    console.error('usage: yarn restructure <from> <to> [--dry-run]');
    process.exit(1);
  }
  const [from, to] = positional;

  // 1. Move + rewrite. In dry-run this is the only step — nothing else has anything to act on.
  run('yarn', ['move-doc', from, to, ...(dryRun ? ['--dry-run'] : [])]);
  if (dryRun) {
    console.log(
      '\n[restructure] dry-run: build, glossary, and sync were skipped (nothing changed).',
    );
    return;
  }

  // 2. Verification gate. A failure here throws and aborts before step 4 touches the edge.
  console.log('\n[restructure] verifying with `yarn build`…');
  run('yarn', ['build']);

  // 3. Regenerate quicklook data only when the move touched a glossary source.
  if (glossaryChanged()) {
    console.log('\n[restructure] glossary sources changed — running `yarn build-glossary`…');
    run('yarn', ['build-glossary']);
  }

  // 4. Mirror redirects to the edge, now that the move is verified.
  console.log('\n[restructure] syncing redirects to vercel.json…');
  run('yarn', ['sync-redirects']);

  console.log('\n[restructure] done.');
}

try {
  main();
} catch (error) {
  // execFileSync throws on a non-zero child exit; surface a concise abort rather than a stack.
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n[restructure] aborted: ${message}`);
  process.exit(1);
}
