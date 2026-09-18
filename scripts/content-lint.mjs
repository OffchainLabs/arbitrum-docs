/**
 * content-lint — fail on structural MDX defects that render wrong to readers.
 *
 * Usage:
 *   pnpm content:lint                 # human report grouped by rule; exits 1 on any finding
 *   pnpm content:lint --json          # JSON array of findings to stdout; exits 0
 *   pnpm content:lint --rule=A1,A3    # restrict to specific rules
 *
 * Rules are documented in scripts/lib/content-lint.mjs. None of these are visible to `types:check`
 * or `build`: MDX is compiled, not type-checked, so an admonition with its body text stranded in a
 * `title=` attribute or a literal `:::caution` line ships silently.
 */
import { lintContent } from './lib/content-lint.mjs';

const RULE_TITLES = {
  A1: 'empty admonition body (prose likely stranded in title=)',
  A2: 'invalid admonition type',
  A3: 'unconverted Docusaurus ::: directive',
  A4: 'markdown/entity syntax inside a title= attribute',
  A5: 'internal link keeps a .md/.mdx suffix',
};

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const only = argv
    .find((a) => a.startsWith('--rule='))
    ?.slice('--rule='.length)
    .split(',');

  let findings = lintContent(process.cwd());
  if (only) findings = findings.filter((f) => only.includes(f.rule));

  if (json) {
    console.log(JSON.stringify(findings, null, 2));
    return;
  }

  if (findings.length === 0) {
    console.log('content-lint: no structural defects.');
    return;
  }

  const byRule = new Map();
  for (const f of findings) {
    if (!byRule.has(f.rule)) byRule.set(f.rule, []);
    byRule.get(f.rule).push(f);
  }

  const files = new Set(findings.map((f) => f.rel)).size;
  console.error(`content-lint: ${findings.length} finding(s) across ${files} file(s):`);

  for (const rule of [...byRule.keys()].sort()) {
    const group = byRule.get(rule);
    const groupFiles = new Set(group.map((f) => f.rel)).size;
    console.error(`\n  ${rule} — ${RULE_TITLES[rule]}: ${group.length} in ${groupFiles} file(s)`);
    for (const f of group.slice(0, 12)) console.error(`      ${f.rel}:${f.line}  ${f.message}`);
    if (group.length > 12) console.error(`      … ${group.length - 12} more`);
  }

  process.exit(1);
}

main();
