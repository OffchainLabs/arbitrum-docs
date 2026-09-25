/**
 * migrate-glossary — one-shot: port Docusaurus glossary term files into the Fumadocs reference
 * collection at content/glossary/.
 *
 * Each source file (docs/partials/glossary/_*.mdx) has frontmatter `key`, `title`, `titleforSort`.
 * We reshape to the reference schema (`id`, `title`, `sortAs`) and name the output by `id` (the
 * Docusaurus `key`), not the source filename — the source names don't always match their keys.
 *
 *   node scripts/migrate-glossary.mjs [sourceGlossaryDir]
 *
 * Default source: ../arbitrum-docs_migration-to-fumadocs/docs/partials/glossary
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const srcDir =
  process.argv[2] ??
  path.resolve(repoRoot, '../arbitrum-docs_migration-to-fumadocs/docs/partials/glossary');
const outDir = path.join(repoRoot, 'content', 'glossary');

/** Parse a leading `---` frontmatter block into a flat key→value map + the remaining body. */
function parseFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (kv) data[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return { data, body: text.slice(m[0].length) };
}

/** Single-quote a YAML scalar, escaping embedded single quotes. */
function yamlQuote(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function main() {
  mkdirSync(outDir, { recursive: true });
  const files = readdirSync(srcDir).filter((f) => /\.mdx?$/i.test(f));
  const seen = new Map();
  let written = 0;

  for (const file of files) {
    const { data, body } = parseFrontmatter(readFileSync(path.join(srcDir, file), 'utf8'));
    const id = data.key;
    if (!id) {
      console.warn(`skip ${file}: no \`key\` frontmatter`);
      continue;
    }
    if (seen.has(id)) {
      console.warn(`duplicate id "${id}" in ${file} (already from ${seen.get(id)})`);
      continue;
    }
    seen.set(id, file);

    const title = data.title ?? id;
    const sortAs = data.titleforSort ?? title;
    const frontmatter =
      `---\nid: ${id}\ntitle: ${yamlQuote(title)}` +
      (sortAs !== title ? `\nsortAs: ${yamlQuote(sortAs)}` : '') +
      `\n---\n\n`;
    writeFileSync(path.join(outDir, `${id}.mdx`), frontmatter + body.trim() + '\n');
    written++;
  }

  console.log(
    `migrate-glossary: wrote ${written} terms to content/glossary/ (from ${path.relative(repoRoot, srcDir)}).`,
  );
}

main();
