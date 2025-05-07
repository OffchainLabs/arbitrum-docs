import * as matter from 'gray-matter';
import * as fs from 'fs/promises';
import * as path from 'path';
import glob from 'glob';
import { execSync } from 'child_process';

// Path to the docs root and docusaurus config
const DOCS_ROOT = path.resolve(__dirname, '../../arbitrum-docs');
const CONFIG_PATH = path.resolve(__dirname, '../docusaurus.config.js');

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
    // Use absolute path and run git status from repo root
    const absPath = path.resolve(filePath);
    const repoRoot = path.resolve(__dirname, '../../');
    const relPath = path.relative(repoRoot, absPath);

    // Run git status from repo root
    return execSync(`git status --porcelain "${relPath}"`, {
      encoding: 'utf-8',
      cwd: repoRoot,
    }).trim();
  } catch (err) {
    console.error('Failed to check git status:', err);
    return '?? '; // Unknown status on error
  }
}

// Helper to check if a file has unstaged changes
function hasUnstagedChanges(filePath: string): boolean {
  const status = getGitStatus(filePath);
  // If empty, no changes
  // If starts with 'M  ' or 'A  ' (note the two spaces), fully staged
  // Otherwise, has unstaged changes
  return status !== '' && !status.match(/^[MA]  /);
}

// Helper to check if a file has any changes (staged or unstaged)
function hasAnyChanges(filePath: string): boolean {
  const status = getGitStatus(filePath);
  return status !== '';
}

// Helper to extract excludeRoutes from docusaurus.config.js
async function getLunrExcludeRoutes(): Promise<string[]> {
  const configRaw = await fs.readFile(CONFIG_PATH, 'utf-8');
  // Naive parse: look for excludeRoutes: [ ... ]
  const match = configRaw.match(/excludeRoutes:\s*\[([\s\S]*?)\]/);
  if (!match) throw new Error('Could not find excludeRoutes in docusaurus.config.js');
  // Extract each string route
  const routes = Array.from(match[1].matchAll(/'([^']+)'/g)).map((m) => m[1]);
  return routes;
}

// Helper to update excludeRoutes in docusaurus.config.js
async function updateLunrExcludeRoutes(newRoutes: string[]): Promise<void> {
  // Check if the config file has any unstaged changes before we modify it
  if (hasUnstagedChanges(CONFIG_PATH)) {
    throw new Error(
      'docusaurus.config.js has unstaged changes. Please commit or stash them before running this script.',
    );
  }

  let configRaw = await fs.readFile(CONFIG_PATH, 'utf-8');

  // Find the excludeRoutes array and capture the exact formatting
  const match = configRaw.match(/(excludeRoutes:\s*\[)([\s\S]*?)(\s*\])/);
  if (!match) throw new Error('Could not find excludeRoutes in docusaurus.config.js');

  const [fullMatch, prefix, currentRoutes, suffix] = match;

  // Get existing indentation from the first route
  const indentMatch = currentRoutes.match(/^\s+/m);
  const indent = indentMatch ? indentMatch[0] : '          '; // Default indentation if none found

  // Format new routes with proper indentation, exactly matching original format
  const allRoutes = [...new Set([...newRoutes])].sort();
  const formattedRoutes = allRoutes.map((route) => `${indent}'${route}'`).join(',');

  // Replace the old array with the new one, exactly matching original format
  const newConfig = configRaw.replace(fullMatch, `${prefix}${formattedRoutes}${suffix}`);

  await fs.writeFile(CONFIG_PATH, newConfig, 'utf-8');

  // Verify the file was changed
  if (!hasAnyChanges(CONFIG_PATH)) {
    throw new Error('Failed to update docusaurus.config.js - no changes detected after update');
  }
}

// Helper to get the route for a markdown file
function getRouteFromFile(file: string): string | null {
  // Remove DOCS_ROOT prefix and extension
  let rel = path.relative(DOCS_ROOT, file).replace(/\\/g, '/');
  rel = rel.replace(/\.(md|mdx)$/, '');
  // Remove leading partials/_ or _category_ files
  if (rel.startsWith('partials/') || rel.endsWith('_category_')) return null;
  return rel;
}

async function main() {
  // Check if config file has unstaged changes before we start
  if (hasUnstagedChanges(CONFIG_PATH)) {
    console.error('❌ Error: docusaurus.config.js has unstaged changes.');
    console.error('Please commit or stash your changes before running this script.');
    process.exit(1);
  }

  const files = await getAllMarkdownFiles();
  const excludeRoutes = await getLunrExcludeRoutes();
  const mismatches: { file: string; route: string }[] = [];
  const routesToAdd: string[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const fm = matter.default(content);
    const tags = fm.data.tags || [];
    if (Array.isArray(tags) && tags.includes('hide-from-search')) {
      const route = getRouteFromFile(file);
      if (route && !excludeRoutes.includes(route)) {
        mismatches.push({ file, route });
        routesToAdd.push(route);
      }
    }
  }

  if (mismatches.length > 0) {
    console.log('📝 Adding the following routes to lunr excludeRoutes:');
    for (const m of mismatches) {
      console.log(`  - ${m.route}`);
    }

    try {
      // Update the config file with new routes
      await updateLunrExcludeRoutes([...excludeRoutes, ...routesToAdd]);

      // Check if the config file has unstaged changes
      if (hasUnstagedChanges(CONFIG_PATH)) {
        console.error('\n❌ Error: Changes to docusaurus.config.js must be staged.');
        console.error('Please run the following command and try committing again:');
        console.error('\n  git add website/docusaurus.config.js\n');
        process.exit(1);
      }

      console.log('✅ Successfully updated docusaurus.config.js and changes are staged');
    } catch (err) {
      console.error('\n❌ Error updating docusaurus.config.js:', err.message);
      process.exit(1);
    }
  } else {
    console.log('✅ All hide-from-search files are correctly excluded from lunr search.');
  }
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
