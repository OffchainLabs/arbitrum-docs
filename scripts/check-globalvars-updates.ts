import * as path from 'path';
import { execSync } from 'child_process';

// Path constants
const WEBSITE_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = path.resolve(WEBSITE_ROOT, '.');
const REPO_ROOT = path.resolve(WEBSITE_ROOT, '.');

// Helper to check git status of a file
function getGitStatus(filePath: string): string {
  try {
    const absPath = path.resolve(filePath);
    const relPath = path.relative(REPO_ROOT, absPath);

    // Handle the case where relPath is empty (same as REPO_ROOT)
    const pathToCheck = relPath || '.';

    return execSync(`git status --porcelain "${pathToCheck}"`, {
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
  return status !== '' && !/^[MA]\s\s/.test(status);
}

// Helper to run yarn commands
function runYarnCommand(command: string, cwd: string = WEBSITE_ROOT): void {
  try {
    execSync(`yarn ${command}`, {
      stdio: 'inherit',
      cwd: cwd,
    });
  } catch (err) {
    console.error(
      `Failed to run yarn ${command}:`,
      err instanceof Error ? err.message : String(err),
    );
    process.exit(1);
  }
}

async function main() {
  console.log('🔄 Updating variable references...');
  runYarnCommand('update-variable-refs');

  console.log('🔄 Generating precompiles reference tables...');
  runYarnCommand('generate-precompiles-ref-tables');

  console.log('💅 Running formatter...');
  runYarnCommand('format');

  // Check for unstaged changes in relevant files/directories
  const filesToCheck = [
    path.join(WEBSITE_ROOT, 'src/resources/globalVars.js'),
    path.join(DOCS_ROOT),
    path.join(DOCS_ROOT, 'for-devs/dev-tools-and-resources/partials/precompile-tables'),
  ];

  const unstagedFiles = filesToCheck.filter(hasUnstagedChanges);

  if (unstagedFiles.length > 0) {
    console.error('\n❌ Error: The following files have unstaged changes:');
    unstagedFiles.forEach((file) => {
      console.error(`  - ${path.relative(REPO_ROOT, file)}`);
    });
    console.error('\nPlease stage these changes and try committing again:');
    console.error(
      `\n  git add ${unstagedFiles.map((f) => path.relative(REPO_ROOT, f)).join(' ')}\n`,
    );
    process.exit(1);
  }

  console.log('\n✅ All globalVars.js related changes have been processed and staged.');
}

main().catch((err) => {
  console.error(
    '❌ An unexpected error occurred:',
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
