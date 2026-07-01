import fs from 'fs';
import path from 'path';

/**
 * Updates all @@ variable references in docs to match values from globalVars.js.
 *
 * This script scans all MD/MDX files and ensures their @@ variable values
 * match the current values in globalVars.js by modifying the files directly.
 *
 * WHEN TO RUN:
 * - After updating values in globalVars.js
 * - Before committing changes that modify global variables
 *
 * Run with: `yarn update-variable-refs` (add `--check` to fail on drift in CI).
 */

import globalVars from '../src/resources/globalVars.js';
import { createVariableRefPattern } from './lib/variable-refs';
import { isCheckMode, runScript } from './lib/generated-partial';

// Find all .md and .mdx files recursively
function findDocFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory()
      ? findDocFiles(fullPath)
      : entry.isFile() && /\.(md|mdx)$/.test(entry.name)
      ? [fullPath]
      : [];
  });
}

// Process a single file and return stats about changes
function processFile(filePath: string, docsPath: string, check: boolean) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const found = new Set<string>();
  const updated = new Set<string>();

  // Update values for existing @@ variables
  const newContent = content.replace(createVariableRefPattern(), (match, varName, currentValue) => {
    if (varName in globalVars) {
      found.add(varName);
      const newValue = String(globalVars[varName]);
      if (currentValue.trim() !== newValue) {
        updated.add(varName);
        return `@@${varName}=${newValue}@@`;
      }
    }
    return match;
  });

  const relativePath = path.relative(docsPath, filePath);
  if (updated.size > 0) {
    if (check) {
      console.log(`Stale variables in ${relativePath}: ${[...updated].join(', ')}`);
    } else {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated ${updated.size} variables in: ${relativePath}`);
    }
  }

  return { found: found.size, updated: updated.size };
}

async function main() {
  const check = isCheckMode();
  console.log(check ? 'Checking variable references...' : 'Scanning for variable references...');

  const docsPath = path.resolve(__dirname, '../docs');
  const stats = findDocFiles(docsPath)
    .map((file) => processFile(file, docsPath, check))
    .reduce(
      (acc, curr) => ({
        filesWithVars: acc.filesWithVars + (curr.found > 0 ? 1 : 0),
        filesUpdated: acc.filesUpdated + (curr.updated > 0 ? 1 : 0),
        varsFound: acc.varsFound + curr.found,
        varsUpdated: acc.varsUpdated + curr.updated,
      }),
      { filesWithVars: 0, filesUpdated: 0, varsFound: 0, varsUpdated: 0 },
    );

  console.log('\nSummary:');
  console.log(`Found ${stats.varsFound} variable references in ${stats.filesWithVars} files`);

  if (check) {
    if (stats.varsUpdated > 0) {
      throw new Error(
        `${stats.varsUpdated} variable reference(s) in ${stats.filesUpdated} file(s) are out of date. ` +
          'Run `yarn update-variable-refs` and commit the result.',
      );
    }
    console.log('All variable references are up to date');
    return;
  }

  if (stats.varsUpdated > 0) {
    console.log(`Updated ${stats.varsUpdated} variables in ${stats.filesUpdated} files`);
  } else {
    console.log('No updates needed - all variables are up to date');
  }
}

runScript(main);
