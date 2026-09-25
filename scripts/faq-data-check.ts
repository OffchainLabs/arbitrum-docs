/**
 * faq-data-check — fail when a `faqsId` used in `content/docs` has no matching data file, is not
 * a member of the `FaqsId` union in `types.ts`, or has a data file under
 * `components/mdx/FAQStructuredData/data/` that is malformed. An unused data file is reported as
 * a warning, not a failure.
 *
 * Usage:
 *   node scripts/faq-data-check.ts          # human report; exits 1 on a missing/malformed entry
 *   node scripts/faq-data-check.ts --json   # JSON report to stdout; exits 0 (for tooling)
 */
import path from 'node:path';

import { checkFaqData } from './lib/faq-data.ts';

function main(): void {
  const json = process.argv.slice(2).includes('--json');
  const docsRoot = path.join(process.cwd(), 'content', 'docs');
  const faqDir = path.join(process.cwd(), 'components', 'mdx', 'FAQStructuredData');
  const dataDir = path.join(faqDir, 'data');
  const typesFile = path.join(faqDir, 'types.ts');

  const { missingDataFile, missingDeclaration, malformed, unusedDataFile } = checkFaqData({
    docsRoot,
    dataDir,
    typesFile,
  });

  if (json) {
    console.log(JSON.stringify({ missingDataFile, missingDeclaration, malformed, unusedDataFile }));
    return;
  }

  if (
    missingDataFile.length === 0 &&
    missingDeclaration.length === 0 &&
    malformed.length === 0 &&
    unusedDataFile.length === 0
  ) {
    console.log('faq-data-check: every faqsId has a well-formed data file.');
    return;
  }

  if (missingDataFile.length > 0) {
    console.error(
      `faq-data-check: ${missingDataFile.length} faqsId(s) used in content/docs with no matching data file:`,
    );
    for (const { id, sites } of missingDataFile) {
      console.error(`  "${id}"`);
      for (const s of sites) console.error(`      ${s.rel}:${s.line}`);
    }
  }

  if (missingDeclaration.length > 0) {
    console.error(
      `faq-data-check: ${missingDeclaration.length} faqsId(s) used in content/docs that are not in the FaqsId union (types.ts):`,
    );
    for (const { id, sites } of missingDeclaration) {
      console.error(`  "${id}"`);
      for (const s of sites) console.error(`      ${s.rel}:${s.line}`);
    }
  }

  if (malformed.length > 0) {
    console.error(`faq-data-check: ${malformed.length} malformed data file(s):`);
    for (const { id, file, issues } of malformed) {
      console.error(`  ${file} (id "${id}")`);
      for (const issue of issues) console.error(`      ${issue}`);
    }
  }

  if (unusedDataFile.length > 0) {
    // Not a failure on its own — just worth surfacing so a stale file gets noticed.
    console.warn(
      `faq-data-check: ${unusedDataFile.length} data file(s) with no faqsId usage in content/docs: ${unusedDataFile.join(', ')}`,
    );
  }

  if (missingDataFile.length > 0 || missingDeclaration.length > 0 || malformed.length > 0) {
    process.exitCode = 1;
  }
}

main();
