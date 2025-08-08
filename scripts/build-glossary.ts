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

import matter from 'gray-matter'; // For parsing frontmatter in Markdown files
import { marked } from 'marked'; // For converting Markdown to HTML
import { GrayMatterFile } from 'gray-matter'; // TypeScript type for parsed frontmatter files
import * as fs from 'fs/promises'; // Async filesystem operations
import * as path from 'path'; // Path manipulation utilities

/**
 * Simple JSON escape function to avoid dependency on external packages
 * Escapes quotes, backslashes, and newlines for safe JSON string values
 */
function escapeForJSON(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Type definition for glossary term frontmatter
 */
interface GlossaryTermData {
  key: string;
  title: string;
  titleforSort: string;
}

/**
 * Type guard to check if frontmatter has required glossary properties
 */
function isValidGlossaryTerm(data: any): data is GlossaryTermData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.key === 'string' &&
    typeof data.title === 'string' &&
    typeof data.titleforSort === 'string'
  );
}

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
  // Process each term sequentially to avoid overwhelming the system
  const rendered: string[] = [];

  for (const item of terms) {
    if (!isValidGlossaryTerm(item.data)) {
      console.warn(`Skipping term with invalid frontmatter: ${JSON.stringify(item.data)}`);
      continue;
    }

    try {
      // Convert Markdown content to HTML
      const content = await marked.parse(item.content.trim());

      // Format as a JSON property with escaped values
      const jsonProperty = `"${escapeForJSON(item.data.key)}":{"title":"${escapeForJSON(
        item.data.title,
      )}","text":"${escapeForJSON(content)}"}`;

      rendered.push(jsonProperty);
    } catch (error) {
      console.error(`Error processing term '${item.data.key}':`, error);
      throw error;
    }
  }

  // Combine all terms into a JSON object string with nice formatting
  return '{\n' + rendered.join(',\n') + '\n}';
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
  const definitions: GrayMatterFile<string>[] = [];

  try {
    // Get all filenames in the specified directory
    const files = await fs.readdir(directory);

    // Process each file
    for (const file of files) {
      const filePath = path.join(directory, file);

      try {
        const stats = await fs.stat(filePath);

        // Only process markdown files (not directories or other file types)
        if (stats.isFile() && (filePath.endsWith('.md') || filePath.endsWith('.mdx'))) {
          // Read the file content
          const content = await fs.readFile(filePath, 'utf-8');

          // Parse frontmatter and content
          const parsed = matter(content);

          // Validate that required frontmatter exists
          if (!isValidGlossaryTerm(parsed.data)) {
            console.warn(
              `Skipping file ${file}: missing required frontmatter (key, title, titleforSort)`,
            );
            continue;
          }

          definitions.push(parsed);
        }
      } catch (fileError) {
        console.error(`Error processing file ${file}:`, fileError);
        // Continue processing other files instead of failing completely
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error; // Re-throw directory errors as they're more critical
  }

  // Sort terms alphabetically based on titleforSort frontmatter property
  // Safe to access titleforSort now due to validation above
  return definitions.sort((a, b) => {
    const aSort = (a.data as GlossaryTermData).titleforSort;
    const bSort = (b.data as GlossaryTermData).titleforSort;
    return aSort.localeCompare(bSort);
  });
}

/**
 * Main function that orchestrates the glossary building process
 *
 * This function:
 * 1. Reads all glossary term files from the specified directory
 * 2. Creates a consolidated Markdown partial file with all terms
 * 3. Generates a JSON file with all terms for client-side usage
 */
async function main(): Promise<void> {
  try {
    // Read and parse all glossary term files
    const terms = await readFilesInDirectory('docs/partials/glossary/');

    if (terms.length === 0) {
      console.warn('No valid glossary terms found');
      return;
    }

    console.log(`Processing ${terms.length} glossary terms`);

    // Generate and write the consolidated glossary partial MDX file
    // This creates a single file with all terms formatted as Markdown headings
    const partialContent = terms
      .map((item) => {
        const data = item.data as GlossaryTermData;
        return `### ${data.title} {#${data.key}}\n${item.content.trim()}`;
      })
      .join('\n\n');

    await fs.writeFile('docs/partials/_glossary-partial.mdx', partialContent);
    console.log('Generated glossary partial at docs/partials/_glossary-partial.mdx');

    // Generate and write the JSON glossary file for client-side usage
    // This is used for search, tooltips, or other dynamic functionality
    const glossaryJSON = await renderGlossaryJSON(terms);
    await fs.writeFile('static/glossary.json', glossaryJSON);
    console.log('Generated glossary JSON at static/glossary.json');
  } catch (error) {
    console.error('Failed to build glossary:', error);
    throw error;
  }
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
