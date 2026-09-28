/**
 * content-lint: fail on MDX that builds but renders wrong. Rules are in scripts/lib/content-lint.ts.
 *
 *   pnpm content:lint                             # every file under content/
 *   node scripts/content-lint.ts a.mdx [b.mdx …]  # only these files (the pre-commit hook)
 */
import { RULES, lintContent } from './lib/content-lint.ts';

const files = process.argv.slice(2);
const findings = lintContent(process.cwd(), files.length ? files : undefined);

if (findings.length === 0) {
  console.log('content-lint: no defects.');
} else {
  console.error(`content-lint: ${findings.length} finding(s):`);
  for (const f of findings) {
    console.error(`  ${f.rel}:${f.line}  ${f.rule} (${RULES[f.rule]}): ${f.message}`);
  }
  process.exit(1);
}
