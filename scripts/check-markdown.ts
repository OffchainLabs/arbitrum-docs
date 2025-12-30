import { execSync } from 'child_process';
import { exit } from 'process';

// Function to check for staged deletions of .md or .mdx files
function checkStagedMarkdownDeletions(): void {
  try {
    // Run git diff --cached --name-status to get staged changes
    const output = execSync('git diff --cached --name-status').toString().trim();

    // Split the output into lines
    const lines = output.split('\n');

    // Filter for deletions (D) of .md or .mdx files
    const deletedMarkdownFiles = lines
      .filter((line) => {
        const parts = line.split('\t');
        const status = parts[0];
        const file = parts[1];
        return status === 'D' && (file.endsWith('.md') || file.endsWith('.mdx'));
      })
      .map((line) => line.split('\t')[1]); // Extract the file names

    if (deletedMarkdownFiles.length > 0) {
      console.error('# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # ');
      console.error('Error: The following Markdown files are staged for deletion:');
      deletedMarkdownFiles.forEach((file) => console.error(`- ${file}`));
      console.error('Please unstage these deletions or remove them if unintended.');
      console.error('# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # ');
      exit(0);
    } else {
      console.log('No staged deletions of Markdown files found.');
      exit(0);
    }
  } catch (error) {
    console.error('Failed to execute git command. Ensure this is run in a git repository.');
    console.error(error.message);
    exit(1);
  }
}

// Function to check for staged renames or moves of .md or .mdx files
function checkStagedMarkdownRenames(): void {
  try {
    // Run git diff --cached --name-status to get staged changes
    const output = execSync('git diff --cached --name-status').toString().trim();

    // Split the output into lines
    const lines = output.split('\n');

    // Array to hold details of renamed/moved files
    const renamedMarkdownFiles: string[] = [];

    lines.forEach((line) => {
      if (!line.trim()) return;

      const parts = line.split('\t');
      const status = parts[0];

      if (status.startsWith('R')) {
        // For renames: parts[0] is Rxxx, parts[1] is old file, parts[2] is new file
        const oldFile = parts[1];
        const newFile = parts[2];
        if (oldFile.endsWith('.md') || oldFile.endsWith('.mdx')) {
          renamedMarkdownFiles.push(`${oldFile} -> ${newFile}`);
        }
      }
    });

    if (renamedMarkdownFiles.length > 0) {
      console.error('# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # ');
      console.error('Error: The following Markdown files are staged for rename or move:');
      renamedMarkdownFiles.forEach((detail) => console.error(`- ${detail}`));
      console.error('Please unstage these changes or review them if unintended.');
      console.error('# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # ');
      exit(0);
    } else {
      console.log('No staged renames or moves of Markdown files found.');
      exit(0);
    }
  } catch (error) {
    console.error('Failed to execute git command. Ensure this is run in a git repository.');
    console.error(error.message);
    exit(1);
  }
}

// Run the check
checkStagedMarkdownDeletions();
checkStagedMarkdownRenames();
