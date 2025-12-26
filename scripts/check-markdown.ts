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
      console.error('************************************************************');
      console.error('************************************************************');
      console.error('Error: The following Markdown files are staged for deletion:');
      deletedMarkdownFiles.forEach((file) => console.error(`- ${file}`));
      console.error('Please unstage these deletions or remove them if unintended.');
      console.error('************************************************************');
      console.error('************************************************************');
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

// Run the check
checkStagedMarkdownDeletions();
