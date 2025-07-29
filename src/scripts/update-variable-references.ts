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
 * Run with: `yarn update-variable-refs`
 */

import globalVars from '../resources/globalVars.js';

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
function processFile(filePath: string, docsPath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const found = new Set<string>();
  const updated = new Set<string>();

  // Update values for existing @@ variables
  const newContent = content.replace(
    /@@\s*([a-zA-Z0-9_-]+)=([^@]+)@@/g,
    (match, varName, currentValue) => {
      if (varName in globalVars) {
        found.add(varName);
        const newValue = String(globalVars[varName]);
        if (currentValue.trim() !== newValue) {
          updated.add(varName);
          return `@@${varName}=${newValue}@@`;
        }
      }
      return match;
    },
  );

  // Only write if we made changes
  if (updated.size > 0) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${updated.size} variables in: ${path.relative(docsPath, filePath)}`);
  }

  return { found: found.size, updated: updated.size };
}

function main() {
  console.log('Scanning for variable references...');

  const docsPath = path.resolve(__dirname, '../../../arbitrum-docs');
  const stats = findDocFiles(docsPath)
    .map((file) => processFile(file, docsPath))
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
  if (stats.varsUpdated > 0) {
    console.log(`Updated ${stats.varsUpdated} variables in ${stats.filesUpdated} files`);
  } else {
    console.log('No updates needed - all variables are up to date');
  }
}

main();
