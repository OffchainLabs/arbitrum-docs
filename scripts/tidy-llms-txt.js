#!/usr/bin/env node
// Post-build tidy pass on build/llms.txt:
//   1. Remove the floating root `- [Arbitrum Documentation](/index.md)` link
//      that duplicates the H1 with no added context.
//   2. Merge multiple "## Optional" H2 sections into a single one at the end
//      of the file, per the llmstxt.org convention for skippable content.
//   3. Strip ": description" from list items inside the merged Optional
//      section. These items are explicitly skippable; bare title+URL is
//      enough and keeps the file under the 50KB readiness threshold.
//
// The signalwire plugin's remark/rehype hooks operate on individual page
// content, not on the aggregate llms.txt — so this work happens after the
// docusaurus build completes.

const fs = require('node:fs');
const path = require('node:path');

const LLMS_TXT_PATH = path.join(__dirname, '..', 'build', 'llms.txt');
const OPTIONAL_HEADING = '## Optional';
const ROOT_INDEX_LINK_RE = /^- \[[^\]]+\]\(\/index\.md\)\s*$/m;

function tidy(source) {
  let out = source;

  // 1. Drop the bare root-index link. The H1 already conveys the project name,
  // so the duplicate entry adds nothing.
  out = out.replace(ROOT_INDEX_LINK_RE, '').replace(/\n{3,}/g, '\n\n');

  // 2. Merge "## Optional" sections.
  // Split on H2 boundaries. Each chunk starts with a "## <Label>\n" header
  // except possibly the first (preamble before any H2).
  const chunks = out.split(/^(## .*)$/m);
  // chunks: [preamble, "## A", bodyA, "## B", bodyB, ...]

  const merged = { preamble: chunks[0], sections: [], optionalBodies: [] };
  for (let i = 1; i < chunks.length; i += 2) {
    const heading = chunks[i];
    const body = chunks[i + 1] ?? '';
    if (heading.trim() === OPTIONAL_HEADING) {
      merged.optionalBodies.push(body);
    } else {
      merged.sections.push({ heading, body });
    }
  }

  let result = merged.preamble;
  for (const { heading, body } of merged.sections) {
    result += heading + body;
  }

  if (merged.optionalBodies.length > 0) {
    // Each Optional body already starts/ends with whitespace from the split.
    // Trim/normalize to keep the joined output clean.
    const combined = merged.optionalBodies
      .map((b) => b.replace(/^\s+|\s+$/g, ''))
      .filter(Boolean)
      .join('\n');
    // Drop descriptions from list items in the Optional section. Match the
    // bullet+link prefix non-greedily, then a literal ": " and everything to
    // EOL. The bracket-balance regex assumes link text contains no ']' chars
    // (true in practice for our entries).
    const stripped = combined.replace(/^(- \[[^\]]*\]\([^)]*\)): .*$/gm, '$1');
    // Ensure the rest of the file ends with a clean newline before appending.
    if (!result.endsWith('\n')) result += '\n';
    if (!result.endsWith('\n\n')) result += '\n';
    result += `${OPTIONAL_HEADING}\n\n${stripped}\n`;
  }

  return result;
}

function main() {
  if (!fs.existsSync(LLMS_TXT_PATH)) {
    console.error(`tidy-llms-txt: ${LLMS_TXT_PATH} not found; skipping.`);
    return;
  }
  const source = fs.readFileSync(LLMS_TXT_PATH, 'utf8');
  const tidied = tidy(source);
  if (tidied === source) {
    console.log('tidy-llms-txt: no changes needed.');
    return;
  }
  fs.writeFileSync(LLMS_TXT_PATH, tidied);
  console.log(`tidy-llms-txt: rewrote ${LLMS_TXT_PATH}`);
}

main();
