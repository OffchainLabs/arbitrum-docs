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
import { writeOrCheck, isCheckMode, runScript } from './lib/generated-partial';
// Local implementation of escapeForJSON utility
function escapeForJSON(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
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

  // Get all filenames in the specified directory. Errors propagate: a missing or
  // unreadable glossary directory should fail the build, not silently emit an
  // empty glossary.
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

  // Sort terms alphabetically based on titleforSort frontmatter property
  return definitions.sort((a, b) => a.data.titleforSort.localeCompare(b.data.titleforSort));
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
  // Read and parse all glossary term files
  let terms = await readFilesInDirectory('./docs/partials/glossary/');

  const check = isCheckMode();

  // Generate the consolidated glossary partial MDX file
  // This creates a single file with all terms formatted as Markdown headings.
  // Output is kept deterministic (no generation timestamp) so `--check` works.
  const frontmatter = `---
partial_type: glossary
title: "Arbitrum Glossary Definitions"
description: "Comprehensive glossary of Arbitrum terminology and definitions"
author: anegg0
---

`;

  const partial =
    frontmatter +
    terms
      .map((item) => `### ${item.data.title} {#${item.data.key}}\n\n${item.content.trim()}`)
      .join('\n\n') +
    '\n';
  await writeOrCheck('./docs/partials/_glossary-partial.mdx', partial, { check });

  // Generate the JSON glossary file for client-side usage
  // This is used for search, tooltips, or other dynamic functionality
  const glossaryJSON = await renderGlossaryJSON(terms);
  await writeOrCheck('./static/glossary.json', glossaryJSON, { check });
}

/** Script entry point with shared success/failure handling. */
runScript(main);
