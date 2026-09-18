/**
 * migrate-quicklooks — one-shot codemod: convert legacy Docusaurus glossary links to the `<Term>`
 * component (see .claude/docs/superpowers/specs/2026-07-10-references-glossary-design.md).
 *
 * Two contexts:
 *   A. Normal MDX flow: `<a data-quicklook-from="key">text</a>` (literal single/double quotes, with
 *      or without a stray space after `=`) → `<Term id="key">text</Term>`.
 *   B. Nested inside a string attribute (e.g. `<VanillaAdmonition title="… <a
 *      data-quicklook-from=&quot;key&quot;>text</a> …">`): a JSX component can't live inside a
 *      string, so the link is unwrapped to its plain text label. Each is REPORTED — this is a
 *      knowingly accepted loss of a hover for term links buried in callout titles.
 *
 * Partials (`content/partials/`) are unwrap-only: some are ESM-imported and rendered client-side by
 * FloatingHoverModal, where the server `<Term>` component is illegal. So every quicklook link in a
 * partial is unwrapped to plain text (these were already non-hovering in that context).
 *
 *   node scripts/migrate-quicklooks.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { walk } from './lib/partials.mjs';

const repoRoot = process.cwd();
const convertRoots = ['content/docs', 'content/glossary'];
const unwrapRoots = ['content/partials'];

// `&quot;`-delimited (entity-encoded) links inside attribute strings → unwrap.
const nestedRe = /<a\s+data-quicklook-from\s*=\s*&quot;([^&]+)&quot;\s*>([\s\S]*?)<\/a>/g;
// Literal-quote links in normal flow.
const flowRe = /<a\s+data-quicklook-from\s*=\s*(?:"([^"]+)"|'([^']+)')\s*>([\s\S]*?)<\/a>/g;

function main() {
  let converted = 0;
  let unwrapped = 0;
  const unwrapReport = [];
  const mdx = (p) => /\.mdx?$/i.test(p);
  const record = (abs, id) => unwrapReport.push(`${path.relative(repoRoot, abs)}  (${id.trim()})`);

  for (const root of convertRoots) {
    for (const abs of walk(path.join(repoRoot, root), mdx)) {
      const src = readFileSync(abs, 'utf8');
      let out = src.replace(nestedRe, (_full, id, text) => {
        unwrapped++;
        record(abs, id);
        return text;
      });
      out = out.replace(flowRe, (_full, dq, sq, text) => {
        converted++;
        return `<Term id="${(dq ?? sq).trim()}">${text}</Term>`;
      });
      if (out !== src) writeFileSync(abs, out);
    }
  }

  for (const root of unwrapRoots) {
    for (const abs of walk(path.join(repoRoot, root), mdx)) {
      const src = readFileSync(abs, 'utf8');
      const out = src
        .replace(nestedRe, (_full, id, text) => (unwrapped++, record(abs, id), text))
        .replace(flowRe, (_full, dq, sq, text) => (unwrapped++, record(abs, dq ?? sq), text));
      if (out !== src) writeFileSync(abs, out);
    }
  }

  console.log(
    `migrate-quicklooks: converted ${converted} link(s) to <Term>, unwrapped ${unwrapped} nested link(s) to plain text.`,
  );
  if (unwrapReport.length) {
    console.log('\nUnwrapped (hover removed — nested in a string attribute):');
    for (const line of unwrapReport) console.log(`  ${line}`);
  }
}

main();
