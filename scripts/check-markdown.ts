import { execSync } from 'child_process';
import { exit } from 'process';

// Function to check for staged deletions, moves, or renames or .md and .mdx files
function checkStagedMarkdownChanges(): void {
  try {
    // Run git diff --cached --name-status to get staged changes
    const output = execSync('git diff --cached --name-status').toString().trim();

    // Split the output into lines
    const lines = output.split('\n');

    // Array to hold details of affected files
    const affectedFiles: string[] = [];

    lines.forEach((line) => {
      if (!line.trim()) return;

      const parts = line.split('\t');
      const status = parts[0];

      if (status === 'D') {
        const file = parts[1];
        if (file.endsWith('.md') || file.endsWith('.mdx')) {
          affectedFiles.push('Deleted: ${file}');
        }
      } else if (status.startsWith('R')) {
        // For renames: parts[0] is Rxxx, parts[1] is old file, parts[2] is new file
        const oldFile = parts[1];
        const newFile = parts[2];
        if (oldFile.endsWith('.md') || oldFile.endsWith('.mdx')) {
          affectedFiles.push('Renamed/Moved: ${oldFile} -> ${newFile}');
        }
      }
    });

    if (affectedFiles.length > 0) {
      console.error(
        '# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #',
      );
      console.error(
        'Error: The following Markdown files are staged for deletion, were moved or renamed:',
      );
      affectedFiles.forEach((detail) => console.error(`- ${detail}`));
      console.error('Please unstage these changes or review them if unintended.');
      console.error(
        '# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #',
      );
      exit(0);
    } else {
      console.log('No staged deletions, moved or renamed Markdown files.');
      exit(0);
    }
  } catch (error) {
    console.error('Failed to execute git command. Ensure this is run in a git repository.');
    console.error(error.message);
    exit(1);
  }
}

// Run the check
checkStagedMarkdownChanges;
