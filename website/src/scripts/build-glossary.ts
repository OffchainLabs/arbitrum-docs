/**
 * Glossary Builder Script
 *
 * This script processes Markdown glossary term definitions from individual files
 * and generates:
 * 1. A consolidated glossary partial file for inclusion in documentation pages
 * 2. A JSON file containing all terms for client-side search and reference
 *
 * The script expects each glossary term to be in its own .md/.mdx file with frontmatter
 * containing 'key', 'title', and 'titleforSort' properties.
 */

import matter = require('gray-matter'); // For parsing frontmatter in Markdown files
import { marked } from 'marked'; // For converting Markdown to HTML
import { GrayMatterFile } from 'gray-matter'; // TypeScript type for parsed frontmatter files
import * as fs from 'fs/promises'; // Async filesystem operations
import * as path from 'path'; // Path manipulation utilities
import { escapeForJSON } from '@offchainlabs/notion-docs-generator'; // String escaping utility

/**
 * Converts an array of parsed glossary terms into a JSON string format
 *
 * This function:
 * 1. Parses the Markdown content to HTML using marked
 * 2. Creates a structured JSON object with key, title, and HTML content
 * 3. Escapes special characters to prevent JSON syntax errors
 *
 * @param {GrayMatterFile<string>[]} terms - Array of parsed Markdown files with frontmatter
 * @returns {Promise<string>} JSON string containing all glossary terms
 */
async function renderGlossaryJSON(terms: GrayMatterFile<string>[]): Promise<string> {
  // Process each term to convert Markdown to HTML and format as a JSON property
  let rendered = terms.map(async (item) => {
    // Convert Markdown content to HTML
    let content = await marked.parse(item.content.trim());

    // Format as a JSON property with escaped values
    return `"${escapeForJSON(item.data.key)}":{"title":"${escapeForJSON(
      item.data.title,
    )}","text":"${escapeForJSON(content)}"}`;
  });

  // Combine all terms into a JSON object string with nice formatting
  return '{\n' + (await Promise.all(rendered)).join(',\n') + '\n}';
}

/**
 * Reads and parses all Markdown/MDX files in a directory
 *
 * This function:
 * 1. Reads all files in the specified directory
 * 2. Filters for only .md and .mdx files
 * 3. Parses frontmatter and content using gray-matter
 * 4. Sorts the terms alphabetically by the titleforSort frontmatter property
 *
 * @param {string} directory - Path to the directory containing glossary term files
 * @returns {Promise<GrayMatterFile<string>[]>} Array of parsed glossary terms
 */
async function readFilesInDirectory(directory: string): Promise<GrayMatterFile<string>[]> {
  let definitions: GrayMatterFile<string>[] = [];

  try {
    // Get all filenames in the specified directory
    const files = await fs.readdir(directory);

    // Process each file
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);

      // Only process markdown files (not directories or other file types)
      if (stats.isFile() && (filePath.endsWith('.md') || filePath.endsWith('.mdx'))) {
        // Read the file content
        const content = await fs.readFile(filePath, 'utf-8');

        // Parse frontmatter and content
        definitions.push(matter(content));
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }

  // Sort terms alphabetically based on titleforSort frontmatter property
  return definitions.sort((a, b) => a.data.titleforSort.localeCompare(b.data.titleforSort));
}

/**
 * Converts a term key to a valid React component name
 *
 * This function:
 * 1. Capitalizes the first letter (React components must start with uppercase)
 * 2. Removes hyphens to ensure valid JavaScript identifier syntax
 *
 * @param {string} key - The raw term key (usually kebab-case from filenames)
 * @returns {string} A PascalCase string suitable for use as a React component name
 */
function renderKey(key: string): string {
  // Capitalize the first letter
  let capitalized = String(key).charAt(0).toUpperCase() + String(key).slice(1);

  // Remove hyphens to create a valid JavaScript identifier
  return capitalized.replace(/[\-]/gi, '');
}

/**
 * Main function that orchestrates the glossary building process
 *
 * This function:
 * 1. Reads all glossary term files from the specified directory
 * 2. Generates import statements and component references (although unused in current implementation)
 * 3. Creates a consolidated Markdown partial file with all terms
 * 4. Generates a JSON file with all terms for client-side usage
 */
async function main(): Promise<void> {
  // Read and parse all glossary term files
  let terms = await readFilesInDirectory('../arbitrum-docs/partials/glossary/');

  // Generate import statements for each term (unused in current implementation)
  // This could be used if implementing a React component approach to term rendering
  let imports = terms
    .map((item) => `import ${renderKey(item.data.key)} from './glossary/${item.data.key}.mdx';`)
    .join('\n');

  // Generate component references for each term (unused in current implementation)
  let items = terms.map((item) => `<${renderKey(item.data.key)} />`).join('\n');

  // Generate and write the consolidated glossary partial MDX file
  // This creates a single file with all terms formatted as Markdown headings
  await fs.writeFile(
    '../arbitrum-docs/partials/_glossary-partial.mdx',
    terms
      .map((item) => `### ${item.data.title} {#${item.data.key}}\n${item.content.trim()}`)
      .join('\n\n'),
  );

  // Generate and write the JSON glossary file for client-side usage
  // This is used for search, tooltips, or other dynamic functionality
  const glossaryJSON = await renderGlossaryJSON(terms);
  await fs.writeFile('./static/glossary.json', glossaryJSON);
}

/**
 * Script entry point
 *
 * Run the main function and handle success/failure cases,
 * exiting with appropriate status codes
 */
main()
  .then(() => process.exit(0)) // Exit with success code when completed
  .catch((err) => {
    console.error(err); // Log any errors
    process.exit(1); // Exit with failure code on error
  });
