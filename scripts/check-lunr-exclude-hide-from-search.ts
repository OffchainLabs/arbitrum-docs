import * as matter from 'gray-matter';
import * as fs from 'fs/promises';
import * as path from 'path';
import glob from 'glob';
import { execSync } from 'child_process';

// Path to the docs root and docusaurus config
const DOCS_ROOT = path.resolve(__dirname, '../../arbitrum-docs');
const CONFIG_PATH = path.resolve(__dirname, '../docusaurus.config.js');
const REPO_ROOT = path.resolve(__dirname, '../../'); // For consistent repo root access

// Helper to get all markdown files
function getAllMarkdownFiles(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(`${DOCS_ROOT}/**/*.{md,mdx}`, { nodir: true }, (err, files) =>
      err ? reject(err) : resolve(files),
    );
  });
}

// Helper to check git status of a file
function getGitStatus(filePath: string): string {
  try {
    const absPath = path.resolve(filePath);
    const relPath = path.relative(REPO_ROOT, absPath);

    return execSync(`git status --porcelain "${relPath}"`, {
      encoding: 'utf-8',
      cwd: REPO_ROOT,
    }).trim();
  } catch (err) {
    console.error(
      'Failed to check git status for ' + path.basename(filePath) + ':',
      err instanceof Error ? err.message : String(err),
    );
    return '?? '; // Unknown status on error, treat as unstaged/problematic
  }
}

// Helper to check if a file has unstaged changes
function hasUnstagedChanges(filePath: string): boolean {
  const status = getGitStatus(filePath);
  // If empty, no changes (or all committed).
  // If starts with 'M  ' or 'A  ' (note the two spaces), it means fully staged.
  // Otherwise (e.g., ' M ', 'MM', '??'), it has unstaged changes.
  return status !== '' && !/^[MA]\s\s/.test(status);
}

// Helper to check if a file has any changes (staged or unstaged)
function hasAnyChanges(filePath: string): boolean {
  const status = getGitStatus(filePath);
  return status !== '';
}

// Helper to extract excludeRoutes from docusaurus.config.js
async function getLunrExcludeRoutes(): Promise<string[]> {
  const configRaw = await fs.readFile(CONFIG_PATH, 'utf-8');
  const match = configRaw.match(/excludeRoutes:\s*\[([\s\S]*?)\]/);
  if (!match) {
    // If the array is not found, it could be an error or simply mean no exclusions yet.
    // Depending on strictness, either throw or return empty.
    // Let's assume it's an error if it's expected to be there.
    console.warn(
      `Warning: Could not find 'excludeRoutes' in ${path.basename(
        CONFIG_PATH,
      )}. Assuming empty array.`,
    );
    return [];
    // throw new Error('Could not find excludeRoutes in docusaurus.config.js');
  }
  const routes = Array.from(match[1].matchAll(/'([^']+)'/g)).map((m) => m[1]);
  return routes;
}

// Helper to update excludeRoutes in docusaurus.config.js
async function updateLunrExcludeRoutes(newRoutes: string[]): Promise<void> {
  // Check if the config file has any unstaged changes before we modify it
  if (hasUnstagedChanges(CONFIG_PATH)) {
    throw new Error(
      `${path.basename(
        CONFIG_PATH,
      )} has unstaged changes. Please commit or stash them before running this script.`,
    );
  }

  let configRaw = await fs.readFile(CONFIG_PATH, 'utf-8');
  const originalConfigRaw = configRaw; // Keep a copy for comparison

  const match = configRaw.match(/(excludeRoutes:\s*\[)([\s\S]*?)(\s*\])/);
  if (!match)
    throw new Error(
      `Could not find 'excludeRoutes' array structure in ${path.basename(CONFIG_PATH)}.`,
    );

  const [fullMatch, prefix, currentRoutesString, suffix] = match;

  const indentMatch = currentRoutesString.match(/^\s+/m);
  const indent = indentMatch ? indentMatch[0] : '          ';

  const allRoutes = Array.from(new Set(newRoutes)).sort();

  let formattedRoutesString;
  if (allRoutes.length === 0) {
    // Handle empty array: decide if it should be `[]` or `[\n  ]` etc.
    // This simple version will make it `[]` if `indent` was just spaces,
    // or potentially `prefix\n  suffix` if `indent` had newlines and `formattedRoutes` becomes empty string.
    // A common desired format for an empty array is simply `[]` or `[\n]`.
    // Let's ensure it's at least `[]` or `[ \n  ]` (if suffix is multiline)
    if (suffix.startsWith('\n') && indent.length > 0 && !indent.startsWith('\n')) {
      // Suffix is multiline, indent is not (e.g. `excludeRoutes: [ /* here */ ]`)
      const baseIndent = indent.trimStart(); // Get indent level without leading newlines
      formattedRoutesString = `\n${baseIndent.slice(0, -2) || ''}`; // Example: `\n  ` if baseIndent was `    `
    } else if (suffix.startsWith('\n') && indent.startsWith('\n')) {
      // Both suffix and indent imply multiline
      formattedRoutesString = indent.trimEnd(); // Use indent's leading newline and spacing
    } else {
      formattedRoutesString = ''; // Will result in `excludeRoutes: []`
    }
  } else {
    formattedRoutesString = allRoutes.map((route) => `${indent}'${route}'`).join(',');
  }

  const newConfig = configRaw.replace(fullMatch, `${prefix}${formattedRoutesString}${suffix}`);

  if (newConfig === originalConfigRaw) {
    // No textual change needed. This can happen if the routes were already correct.
    // To prevent `hasAnyChanges` from falsely reporting failure if git doesn't see a change.
    // console.log('No textual changes to docusaurus.config.js were necessary.');
    return; // Exit early, no need to write or check git status for this file.
  }

  await fs.writeFile(CONFIG_PATH, newConfig, 'utf-8');

  // Verify the file was changed according to git.
  // This is important because fs.writeFile might not always trigger a git "change"
  // if the content is identical, though we try to avoid that with the check above.
  if (!hasAnyChanges(CONFIG_PATH)) {
    // This case should ideally be caught by `newConfig === originalConfigRaw`
    // but as a safeguard:
    throw new Error(
      `Failed to update ${path.basename(
        CONFIG_PATH,
      )} - no git changes detected after attempted update. Content might have been identical.`,
    );
  }
}

// Helper to get the route for a markdown file
function getRouteFromFile(file: string): string | null {
  let rel = path.relative(DOCS_ROOT, file).replace(/\\/g, '/');

  // Remove leading partials/_ or _category_ files
  if (rel.startsWith('partials/') || rel.endsWith('_category_')) return null;

  // Remove the file extension
  rel = rel.replace(/\.(md|mdx)$/, '');

  // Remove leading numbers like '01-', '02-', '04-', etc. from each path segment
  // This matches how Docusaurus processes numbered prefixes
  rel = rel.replace(/\d{2,3}-/g, '');

  // Handle index files
  if (rel.endsWith('/index')) {
    rel = rel.substring(0, rel.length - '/index'.length);
  }
  if (rel === 'index') {
    rel = '/';
  }

  // Add leading slash to match the format used in docusaurus.config.js
  if (!rel.startsWith('/')) {
    rel = '/' + rel;
  }

  return rel;
}

async function main() {
  const relativeConfigPath = path.relative(REPO_ROOT, CONFIG_PATH);

  if (hasUnstagedChanges(CONFIG_PATH)) {
    console.error(`❌ Error: ${relativeConfigPath} has unstaged changes.`);
    console.error('Please commit or stash your changes before running this script.');
    process.exit(1);
  }

  const allMarkdownFiles = await getAllMarkdownFiles();
  const currentConfigExcludedRoutes = (await getLunrExcludeRoutes()).sort();

  const targetActuallyTaggedRoutes: string[] = [];
  for (const file of allMarkdownFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const fm = matter.default(content);
    const tags = fm.data.tags || [];
    if (Array.isArray(tags) && tags.includes('hide-from-search')) {
      const route = getRouteFromFile(file);
      if (route !== null && route.trim() !== '') {
        // Ensure route is valid and not just whitespace
        if (!targetActuallyTaggedRoutes.includes(route)) {
          targetActuallyTaggedRoutes.push(route);
        }
      }
    }
  }

  const finalTargetExcludedRoutes = Array.from(new Set(targetActuallyTaggedRoutes)).sort();

  const routesToAdd = finalTargetExcludedRoutes.filter(
    (r) => !currentConfigExcludedRoutes.includes(r),
  );
  const routesToRemove = currentConfigExcludedRoutes.filter(
    (r) => !finalTargetExcludedRoutes.includes(r),
  );

  const configNeedsUpdate = routesToAdd.length > 0 || routesToRemove.length > 0;

  if (configNeedsUpdate) {
    console.log(`🔄 Lunr 'excludeRoutes' in ${relativeConfigPath} requires updates:`);
    if (routesToAdd.length > 0) {
      console.log('  ➕ Routes to ADD:');
      routesToAdd.forEach((r) => console.log(`    - ${r}`));
    }
    if (routesToRemove.length > 0) {
      console.log('  ➖ Routes to REMOVE (tag removed or file deleted):');
      routesToRemove.forEach((r) => console.log(`    - ${r}`));
    }

    try {
      await updateLunrExcludeRoutes(finalTargetExcludedRoutes);

      // After update, check if the made changes are staged.
      // If updateLunrExcludeRoutes returned (didn't throw due to no actual change, or other error),
      // and if it effectively modified the file, CONFIG_PATH will have unstaged changes.
      if (hasUnstagedChanges(CONFIG_PATH)) {
        console.error(`\n❌ Error: Changes to ${relativeConfigPath} were made but are not staged.`);
        console.error('Please run the following command and try committing again:');
        console.error(`\n  git add ${relativeConfigPath}\n`);
        process.exit(1);
      }
      // If we reach here, it means:
      // 1. updateLunrExcludeRoutes made changes AND those changes were already staged (e.g. script run, changes made, user staged, script run again).
      // 2. OR updateLunrExcludeRoutes made NO effective changes (e.g. target routes match current, formatted routes), and it returned early.
      //    In this case, the file status would be clean or already staged from previous actions.
      // The `if (newConfig === originalConfigRaw) return;` in `updateLunrExcludeRoutes` handles case 2 gracefully.

      console.log(
        `\n✅ Successfully updated ${relativeConfigPath}. All necessary changes are reflected and staged (if any were made by this run).`,
      );
    } catch (err) {
      console.error(
        `\n❌ Error updating ${relativeConfigPath}:`,
        err instanceof Error ? err.message : String(err),
      );
      process.exit(1);
    }
  } else {
    console.log(
      `✅ Lunr 'excludeRoutes' in ${relativeConfigPath} is already up-to-date. No changes needed.`,
    );
  }
}

main().catch((err) => {
  console.error(
    '❌ An unexpected error occurred in main:',
    err instanceof Error ? err.message : String(err),
  );
  if (err instanceof Error && err.stack) {
    // console.error(err.stack); // Optionally log full stack for debugging
  }
  process.exit(1);
});
