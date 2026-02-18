#!/usr/bin/env tsx
/**
 * Generate Doc Manifest
 *
 * Scans all docs and produces a compact JSON manifest for agentic IA improvement.
 * Output: .audit/doc-manifest.json
 */

import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import type { CompactDoc } from './doc-manifest-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(PROJECT_ROOT, 'docs');
const SIDEBARS_FILE = path.join(PROJECT_ROOT, 'sidebars.js');
const AUDIT_DIR = path.join(PROJECT_ROOT, '.audit');

// --- Helpers ---

/** Strip numeric prefix from a path segment: "01-overview" -> "overview" */
function stripNumericPrefix(segment: string): string {
  return segment.replace(/^\d+-/, '');
}

/** Convert file path to Docusaurus doc ID */
function pathToDocId(relPath: string): string {
  return relPath
    .replace(/\.(mdx?|md)$/, '')
    .split('/')
    .map(stripNumericPrefix)
    .join('/');
}

/** Check if a file is a partial */
function isPartialPath(relPath: string): boolean {
  const fileName = path.basename(relPath);
  if (relPath.includes('/partials/')) return true;
  if (fileName.includes('-partial') || fileName.includes('_partial')) return true;
  if (fileName.startsWith('_')) return true;
  return false;
}

/** Check if path is in a generated directory */
function isGeneratedPath(relPath: string): boolean {
  return relPath.startsWith('sdk/') || relPath.startsWith('stylus-by-example/');
}

/** Check if any path segment has a numeric prefix */
function hasNumericPrefix(relPath: string): boolean {
  return relPath.split('/').some((seg) => /^\d+-/.test(seg));
}

/** Truncate string to max length */
function truncate(str: string, max: number): string {
  if (!str || str.length <= max) return str;
  return str.slice(0, max);
}

// --- Scanning ---

function scanDocs(dir: string, relBase = ''): string[] {
  const results: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.warn(`Warning: could not read directory ${dir}: ${err}`);
    return results;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...scanDocs(full, rel));
    } else if (/\.(mdx?|md)$/i.test(entry.name)) {
      results.push(rel);
    }
  }
  return results;
}

// --- Content parsing ---

function stripCodeBlocks(content: string): string {
  return content.replace(/```[\s\S]*?```/g, '');
}

function extractHeadings(content: string): [number, string][] {
  const headings: [number, string][] = [];
  const stripped = stripCodeBlocks(content);
  const regex = /^(#{1,3})\s+(.+?)(?:\s*\{#[\w-]+\})?$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(stripped)) !== null) {
    headings.push([match[1].length, match[2].trim()]);
  }
  return headings;
}

function countWords(content: string, relPath?: string): number {
  // Resolve imported partials and inline their content
  let fullContent = content;
  if (relPath) {
    const importRegex = /import\s+\w+\s+from\s+['"]([^'"]+\.mdx?)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const fromDir = path.dirname(relPath);
        const abs = path.resolve(DOCS_ROOT, fromDir, importPath);
        if (fs.existsSync(abs)) {
          fullContent += '\n' + fs.readFileSync(abs, 'utf8');
        }
      }
    }
  }
  // Strip frontmatter delimiter lines, imports, JSX, and HTML tags
  const cleaned = fullContent
    .replace(/^---[\s\S]*?---/gm, '')
    .replace(/import\s+.+from\s+['"].+['"]/g, '')
    .replace(/<[^>]+>/g, '');
  const stripped = stripCodeBlocks(cleaned);
  const words = stripped.match(/\b\w+\b/g);
  return words ? words.length : 0;
}

function extractInternalLinks(content: string, filePath: string): string[] {
  const links: string[] = [];
  const stripped = stripCodeBlocks(content);
  // Markdown links: [text](path)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(stripped)) !== null) {
    let href = match[2];
    // Skip external, anchors, special
    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('#') ||
      href.startsWith('@') ||
      href.startsWith('mailto:')
    )
      continue;
    // Skip image links that aren't mdx
    if (/\.(png|jpg|jpeg|gif|svg|webp|pdf)$/i.test(href)) continue;
    // Strip anchor
    href = href.split('#')[0];
    if (!href) continue;
    // Resolve relative paths
    const resolved = resolveLink(href, filePath);
    if (resolved && !links.includes(resolved)) {
      links.push(resolved);
    }
  }
  return links;
}

function resolveLink(href: string, fromFile: string): string {
  let resolved: string;
  if (href.startsWith('./') || href.startsWith('../')) {
    const fromDir = path.dirname(fromFile);
    const abs = path.resolve(DOCS_ROOT, fromDir, href);
    resolved = path.relative(DOCS_ROOT, abs);
  } else if (href.startsWith('/')) {
    resolved = href.slice(1);
  } else {
    resolved = href;
  }
  // Strip extension
  resolved = resolved.replace(/\.(mdx?|md)$/, '');
  return pathToDocId(resolved);
}

function extractImports(content: string, filePath: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+\w+\s+from\s+['"]([^'"]+\.mdx?)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const resolved = resolveLink(match[1], filePath);
    if (resolved && !imports.includes(resolved)) {
      imports.push(resolved);
    }
  }
  return imports;
}

function countExternalLinks(content: string): number {
  const extRegex = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  let count = 0;
  let match: RegExpExecArray | null;
  while ((match = extRegex.exec(content)) !== null) {
    count++;
  }
  return count;
}

function extractCodeLangs(content: string): string[] {
  const langs = new Set<string>();
  const codeRegex = /^```(\w+)/gm;
  let match: RegExpExecArray | null;
  while ((match = codeRegex.exec(content)) !== null) {
    langs.add(match[1].toLowerCase());
  }
  return [...langs].sort();
}

// --- Sidebar extraction ---

interface SidebarDocMap {
  [docId: string]: string[];
}

function extractSidebarDocs(sidebars: Record<string, unknown>): {
  docMap: SidebarDocMap;
  autogeneratedDirs: { dir: string; sidebar: string }[];
} {
  const docMap: SidebarDocMap = {};
  const autogeneratedDirs: { dir: string; sidebar: string }[] = [];

  function addDocToSidebar(docId: string, sidebarName: string) {
    if (!docMap[docId]) docMap[docId] = [];
    if (!docMap[docId].includes(sidebarName)) {
      docMap[docId].push(sidebarName);
    }
  }

  function walk(item: unknown, sidebarName: string) {
    if (!item || typeof item !== 'object') return;
    const obj = item as Record<string, unknown>;
    if (obj.type === 'doc' && typeof obj.id === 'string') {
      addDocToSidebar(obj.id, sidebarName);
    }
    if (obj.type === 'category') {
      if (obj.link && typeof obj.link === 'object') {
        const link = obj.link as Record<string, unknown>;
        if (link.type === 'doc' && typeof link.id === 'string') {
          addDocToSidebar(link.id, sidebarName);
        }
      }
      if (Array.isArray(obj.items)) {
        obj.items.forEach((child: unknown) => walk(child, sidebarName));
      }
    }
    if (obj.type === 'autogenerated' && typeof obj.dirName === 'string') {
      autogeneratedDirs.push({ dir: obj.dirName, sidebar: sidebarName });
    }
  }

  for (const [name, config] of Object.entries(sidebars)) {
    if (Array.isArray(config)) {
      config.forEach((item: unknown) => walk(item, name));
    } else if (typeof config === 'object' && config !== null) {
      // Handle nested sidebar objects like sdkSidebar: { sdkSidebar: [...] }
      for (const [, value] of Object.entries(config as Record<string, unknown>)) {
        if (Array.isArray(value)) {
          value.forEach((item: unknown) => walk(item, name));
        }
      }
    }
  }

  return { docMap, autogeneratedDirs };
}

function findSidebarsForDoc(
  docId: string,
  relPath: string,
  docMap: SidebarDocMap,
  autogeneratedDirs: { dir: string; sidebar: string }[],
): string[] {
  const sidebars = new Set<string>();

  // Direct match
  if (docMap[docId]) {
    docMap[docId].forEach((s) => sidebars.add(s));
  }

  // Autogenerated directory match
  for (const { dir, sidebar } of autogeneratedDirs) {
    const pathNoExt = relPath.replace(/\.(mdx?|md)$/, '');
    if (pathNoExt.startsWith(dir + '/') || relPath.startsWith(dir + '/')) {
      sidebars.add(sidebar);
    }
  }

  return [...sidebars];
}

// --- Build compact doc ---

function buildCompactDoc(
  relPath: string,
  content: string,
  frontmatter: Record<string, unknown>,
  docMap: SidebarDocMap,
  autogeneratedDirs: { dir: string; sidebar: string }[],
): CompactDoc {
  // Resolve doc ID
  let docId = pathToDocId(relPath);
  if (frontmatter.id) {
    const dir = path.dirname(relPath);
    const dirParts = dir.split('/').map(stripNumericPrefix);
    docId = dirParts.join('/') + '/' + frontmatter.id;
  }

  const sidebars = findSidebarsForDoc(docId, relPath, docMap, autogeneratedDirs);
  const headings = extractHeadings(content);
  const links = extractInternalLinks(content, relPath);
  const imports = extractImports(content, relPath);
  const extLinks = countExternalLinks(content);
  const codeLangs = extractCodeLangs(content);

  // Build frontmatter object, omitting empty values
  const fm: Record<string, string> = {};
  if (frontmatter.title) fm.t = String(frontmatter.title);
  if (frontmatter.description) fm.d = truncate(String(frontmatter.description), 120);
  if (frontmatter.content_type) fm.ct = String(frontmatter.content_type);
  if (frontmatter.author) fm.a = String(frontmatter.author);
  if (frontmatter.sme) fm.sme = String(frontmatter.sme);

  // Build flags, omitting falsy
  const flags: Record<string, boolean> = {};
  if (isPartialPath(relPath)) flags.par = true;
  if (isGeneratedPath(relPath)) flags.gen = true;
  if (hasNumericPrefix(relPath)) flags.num = true;

  const doc: Record<string, unknown> = {
    p: relPath,
    id: docId,
    s: relPath.split('/')[0],
    w: countWords(content, relPath),
  };

  if (Object.keys(fm).length > 0) doc.fm = fm;
  if (headings.length > 0) doc.h = headings;
  if (links.length > 0) doc.l = links;
  if (extLinks > 0) doc.el = extLinks;
  if (imports.length > 0) doc.im = imports;
  if (codeLangs.length > 0) doc.cl = codeLangs;
  if (sidebars.length > 0) doc.sb = sidebars;
  if (Object.keys(flags).length > 0) doc.f = flags;

  return doc as CompactDoc;
}

// --- Main ---

async function main() {
  console.log('Generating doc manifest...\n');

  // Load sidebars
  console.log('Loading sidebars...');
  let sidebars: Record<string, unknown>;
  try {
    const sidebarsModule = await import(`file://${SIDEBARS_FILE}?update=${Date.now()}`);
    sidebars = sidebarsModule.default || sidebarsModule;
  } catch (err) {
    console.error('Error loading sidebars:', err);
    process.exit(1);
  }
  const { docMap, autogeneratedDirs } = extractSidebarDocs(sidebars);
  console.log(
    `  Found ${Object.keys(docMap).length} docs in sidebars, ${
      autogeneratedDirs.length
    } autogenerated dirs`,
  );

  // Scan docs
  console.log('Scanning docs directory...');
  const files = scanDocs(DOCS_ROOT);
  console.log(`  Found ${files.length} files\n`);

  // Process each file
  console.log('Processing files...');
  const docs: CompactDoc[] = [];
  for (const relPath of files) {
    const fullPath = path.join(DOCS_ROOT, relPath);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data: frontmatter, content } = matter(raw);
    docs.push(buildCompactDoc(relPath, content, frontmatter, docMap, autogeneratedDirs));
  }

  // Write output
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  const jsonPath = path.join(AUDIT_DIR, 'doc-manifest.json');
  const header = JSON.stringify({ generated: new Date().toISOString(), docsRoot: 'docs/' }, null, 2);
  // One doc per line for reasonable readability + compactness
  const docsLines = docs.map((d) => JSON.stringify(d));
  const output =
    header.slice(0, -2) + ',\n  "docs": [\n    ' + docsLines.join(',\n    ') + '\n  ]\n}';
  fs.writeFileSync(jsonPath, output);
  const jsonSize = fs.statSync(jsonPath).size;
  console.log(`\nWrote ${jsonPath} (${(jsonSize / 1024).toFixed(1)}KB, ${docs.length} entries)`);
  console.log('Done!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
