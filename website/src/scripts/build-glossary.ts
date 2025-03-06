import matter = require('gray-matter');
import { marked } from 'marked';
import { GrayMatterFile } from 'gray-matter';
import * as fs from 'fs/promises';
import * as path from 'path';
import { escapeForJSON } from '@offchainlabs/notion-docs-generator';

async function renderGlossaryJSON(terms: GrayMatterFile<string>[]) {
  let rendered = terms.map(async (item) => {
    let content = await marked.parse(item.content.trim());
    return `"${escapeForJSON(item.data.key)}":{"title":"${escapeForJSON(
      item.data.title,
    )}","text":"${escapeForJSON(content)}"}`;
  });
  return '{\n' + (await Promise.all(rendered)).join(',\n') + '\n}';
}

async function readFilesInDirectory(directory: string): Promise<GrayMatterFile<string>[]> {
  let definitions: GrayMatterFile<string>[] = [];
  try {
    const files = await fs.readdir(directory); // Get file names in the directory

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile() && (filePath.endsWith('.md') || filePath.endsWith('.mdx'))) {
        // Ensure it's a file, not a directory
        const content = await fs.readFile(filePath, 'utf-8');
        definitions.push(matter(content));
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }
  return definitions.sort((a, b) => a.data.titleforSort.localeCompare(b.data.titleforSort));
}

function renderKey(key: string) {
  let capitalized = String(key).charAt(0).toUpperCase() + String(key).slice(1);
  return capitalized.replace(/[\-]/gi, '');
}

async function main() {
  let terms = await readFilesInDirectory('../arbitrum-docs/partials/glossary/');

  let imports = terms
    .map((item) => `import ${renderKey(item.data.key)} from './glossary/${item.data.key}.mdx';`)
    .join('\n');
  let items = terms.map((item) => `<${renderKey(item.data.key)} />`).join('\n');
  await fs.writeFile(
    '../arbitrum-docs/partials/_glossary-partial.mdx',
    terms
      .map((item) => `### ${item.data.title} {#${item.data.key}}\n${item.content.trim()}`)
      .join('\n\n'),
  );

  const glossaryJSON = await renderGlossaryJSON(terms);
  await fs.writeFile('./static/glossary.json', glossaryJSON);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
