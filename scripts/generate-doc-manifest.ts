#!/usr/bin/env tsx
/**
 * Generate Doc Manifest
 *
 * Scans all docs and produces a compact JSON manifest for agentic IA improvement.
 * Output: .audit/doc-manifest.json + .audit/doc-summary.md
 */

import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(PROJECT_ROOT, 'docs');
const SIDEBARS_FILE = path.join(PROJECT_ROOT, 'sidebars.js');
const AUDIT_DIR = path.join(PROJECT_ROOT, '.audit');

// --- Types ---

interface DocEntry {
  path: string; // relative from docs/
  id: string; // Docusaurus doc ID
  section: string; // top-level directory
  fm: {
    title?: string;
    description?: string;
    content_type?: string;
    author?: string;
    sme?: string;
  };
  headings: [number, string][]; // [level, text] tuples
  words: number;
  links: string[]; // internal link targets as doc IDs
  extLinks: number;
  imports: string[]; // imported partials as doc IDs
  codeLangs: string[];
  sidebars: string[];
  flags: {
    isPartial?: boolean;
    isGenerated?: boolean;
    hasNumericPrefix?: boolean;
  };
}

interface Manifest {
  generated: string;
  docsRoot: string;
  stats: {
    totalFiles: number;
    partials: number;
    generated: number;
    frontmatter: {
      withTitle: number;
      withDescription: number;
      withContentType: number;
      withAuthor: number;
    };
    contentTypeDistribution: Record<string, number>;
    sidebarCoverage: {
      inSidebar: number;
      orphaned: number;
    };
    sections: Record<
      string,
      {
        files: number;
        avgWords: number;
        partials: number;
      }
    >;
  };
  docs: DocEntry[];
}

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
function isPartial(relPath: string): boolean {
  const fileName = path.basename(relPath);
  if (relPath.includes('/partials/')) return true;
  if (fileName.includes('-partial') || fileName.includes('_partial')) return true;
  if (fileName.startsWith('_')) return true;
  return false;
}

/** Check if path is in a generated directory */
function isGenerated(relPath: string): boolean {
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
  } catch {
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

function extractHeadings(content: string): [number, string][] {
  const headings: [number, string][] = [];
  const regex = /^(#{1,3})\s+(.+?)(?:\s*\{#[\w-]+\})?$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    headings.push([match[1].length, match[2].trim()]);
  }
  return headings;
}

function countWords(content: string): number {
  // Strip frontmatter delimiter lines, imports, JSX, and HTML tags
  const cleaned = content
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/import\s+.+from\s+['"].+['"]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/```[\s\S]*?```/g, '');
  const words = cleaned.match(/\b\w+\b/g);
  return words ? words.length : 0;
}

function extractInternalLinks(content: string, filePath: string): string[] {
  const links: string[] = [];
  // Markdown links: [text](path)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(content)) !== null) {
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

  function walk(item: unknown, sidebarName: string) {
    if (!item || typeof item !== 'object') return;
    const obj = item as Record<string, unknown>;
    if (obj.type === 'doc' && typeof obj.id === 'string') {
      if (!docMap[obj.id]) docMap[obj.id] = [];
      if (!docMap[obj.id].includes(sidebarName)) {
        docMap[obj.id].push(sidebarName);
      }
    }
    if (obj.type === 'category') {
      if (obj.link && typeof obj.link === 'object') {
        const link = obj.link as Record<string, unknown>;
        if (link.type === 'doc' && typeof link.id === 'string') {
          if (!docMap[link.id]) docMap[link.id] = [];
          if (!docMap[link.id].includes(sidebarName)) {
            docMap[link.id].push(sidebarName);
          }
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

// --- Compact output ---

function compactEntry(entry: DocEntry): Record<string, unknown> {
  const out: Record<string, unknown> = {
    p: entry.path,
    id: entry.id,
    s: entry.section,
  };

  // Frontmatter - omit empty values
  const fm: Record<string, string> = {};
  if (entry.fm.title) fm.t = entry.fm.title;
  if (entry.fm.description) fm.d = truncate(entry.fm.description, 120);
  if (entry.fm.content_type) fm.ct = entry.fm.content_type;
  if (entry.fm.author) fm.a = entry.fm.author;
  if (entry.fm.sme) fm.sme = entry.fm.sme;
  if (Object.keys(fm).length > 0) out.fm = fm;

  if (entry.headings.length > 0) out.h = entry.headings;
  out.w = entry.words;
  if (entry.links.length > 0) out.l = entry.links;
  if (entry.extLinks > 0) out.el = entry.extLinks;
  if (entry.imports.length > 0) out.im = entry.imports;
  if (entry.codeLangs.length > 0) out.cl = entry.codeLangs;
  if (entry.sidebars.length > 0) out.sb = entry.sidebars;

  // Flags - only include truthy
  const flags: Record<string, boolean> = {};
  if (entry.flags.isPartial) flags.par = true;
  if (entry.flags.isGenerated) flags.gen = true;
  if (entry.flags.hasNumericPrefix) flags.num = true;
  if (Object.keys(flags).length > 0) out.f = flags;

  return out;
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
    `  Found ${Object.keys(docMap).length} docs in sidebars, ${autogeneratedDirs.length} autogenerated dirs`,
  );

  // Scan docs
  console.log('Scanning docs directory...');
  const files = scanDocs(DOCS_ROOT);
  console.log(`  Found ${files.length} files\n`);

  // Process each file
  console.log('Processing files...');
  const entries: DocEntry[] = [];
  for (const relPath of files) {
    const fullPath = path.join(DOCS_ROOT, relPath);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data: frontmatter, content } = matter(raw);

    const docId = pathToDocId(relPath);
    const section = relPath.split('/')[0];
    const fileSidebars = findSidebarsForDoc(docId, relPath, docMap, autogeneratedDirs);

    entries.push({
      path: relPath,
      id: docId,
      section,
      fm: {
        title: frontmatter.title || undefined,
        description: frontmatter.description || undefined,
        content_type: frontmatter.content_type || undefined,
        author: frontmatter.author || undefined,
        sme: frontmatter.sme || undefined,
      },
      headings: extractHeadings(content),
      words: countWords(content),
      links: extractInternalLinks(content, relPath),
      extLinks: countExternalLinks(content),
      imports: extractImports(content, relPath),
      codeLangs: extractCodeLangs(content),
      sidebars: fileSidebars,
      flags: {
        isPartial: isPartial(relPath) || undefined,
        isGenerated: isGenerated(relPath) || undefined,
        hasNumericPrefix: hasNumericPrefix(relPath) || undefined,
      },
    });
  }

  // Compute stats
  const nonPartials = entries.filter((e) => !e.flags.isPartial);
  const partials = entries.filter((e) => e.flags.isPartial);
  const generated = entries.filter((e) => e.flags.isGenerated);
  const inSidebar = nonPartials.filter((e) => e.sidebars.length > 0);

  const contentTypeDist: Record<string, number> = {};
  for (const e of entries) {
    if (e.fm.content_type) {
      contentTypeDist[e.fm.content_type] = (contentTypeDist[e.fm.content_type] || 0) + 1;
    }
  }

  const sectionStats: Record<string, { files: number; totalWords: number; partials: number }> = {};
  for (const e of entries) {
    if (!sectionStats[e.section]) {
      sectionStats[e.section] = { files: 0, totalWords: 0, partials: 0 };
    }
    sectionStats[e.section].files++;
    sectionStats[e.section].totalWords += e.words;
    if (e.flags.isPartial) sectionStats[e.section].partials++;
  }

  const sections: Record<string, { files: number; avgWords: number; partials: number }> = {};
  for (const [sec, stat] of Object.entries(sectionStats)) {
    sections[sec] = {
      files: stat.files,
      avgWords: Math.round(stat.totalWords / stat.files),
      partials: stat.partials,
    };
  }

  const manifest: Manifest = {
    generated: new Date().toISOString(),
    docsRoot: 'docs/',
    stats: {
      totalFiles: entries.length,
      partials: partials.length,
      generated: generated.length,
      frontmatter: {
        withTitle: entries.filter((e) => e.fm.title).length,
        withDescription: entries.filter((e) => e.fm.description).length,
        withContentType: entries.filter((e) => e.fm.content_type).length,
        withAuthor: entries.filter((e) => e.fm.author).length,
      },
      contentTypeDistribution: contentTypeDist,
      sidebarCoverage: {
        inSidebar: inSidebar.length,
        orphaned: nonPartials.length - inSidebar.length,
      },
      sections,
    },
    docs: entries,
  };

  // Write output
  fs.mkdirSync(AUDIT_DIR, { recursive: true });

  // Compact JSON
  const compactDocs = entries.map(compactEntry);
  const compactManifest = {
    generated: manifest.generated,
    docsRoot: manifest.docsRoot,
    stats: manifest.stats,
    docs: compactDocs,
  };
  const jsonPath = path.join(AUDIT_DIR, 'doc-manifest.json');
  // Stats section is pretty-printed for readability; docs array is compact
  const statsJson = JSON.stringify({ generated: compactManifest.generated, docsRoot: compactManifest.docsRoot, stats: compactManifest.stats }, null, 2);
  // Insert docs array with one entry per line for reasonable readability + compactness
  const docsLines = compactDocs.map((d) => JSON.stringify(d));
  const output = statsJson.slice(0, -2) + ',\n  "docs": [\n    ' + docsLines.join(',\n    ') + '\n  ]\n}';
  fs.writeFileSync(jsonPath, output);
  const jsonSize = fs.statSync(jsonPath).size;
  console.log(`\nWrote ${jsonPath} (${(jsonSize / 1024).toFixed(1)}KB, ${entries.length} entries)`);

  // Summary markdown
  const summaryLines: string[] = [
    '# Doc Manifest Summary',
    '',
    `Generated: ${manifest.generated}`,
    '',
    '## Overview',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total files | ${manifest.stats.totalFiles} |`,
    `| Partials | ${manifest.stats.partials} |`,
    `| Generated | ${manifest.stats.generated} |`,
    `| In sidebar | ${manifest.stats.sidebarCoverage.inSidebar} |`,
    `| Orphaned (non-partial, not in sidebar) | ${manifest.stats.sidebarCoverage.orphaned} |`,
    '',
    '## Frontmatter Completeness',
    '',
    `| Field | Count | % |`,
    `|-------|-------|---|`,
    `| title | ${manifest.stats.frontmatter.withTitle} | ${pct(manifest.stats.frontmatter.withTitle, manifest.stats.totalFiles)} |`,
    `| description | ${manifest.stats.frontmatter.withDescription} | ${pct(manifest.stats.frontmatter.withDescription, manifest.stats.totalFiles)} |`,
    `| content_type | ${manifest.stats.frontmatter.withContentType} | ${pct(manifest.stats.frontmatter.withContentType, manifest.stats.totalFiles)} |`,
    `| author | ${manifest.stats.frontmatter.withAuthor} | ${pct(manifest.stats.frontmatter.withAuthor, manifest.stats.totalFiles)} |`,
    '',
    '## content_type Distribution',
    '',
    `| Type | Count |`,
    `|------|-------|`,
    ...Object.entries(manifest.stats.contentTypeDistribution)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `| ${type} | ${count} |`),
    '',
    '## Sections',
    '',
    `| Section | Files | Avg Words | Partials |`,
    `|---------|-------|-----------|----------|`,
    ...Object.entries(manifest.stats.sections)
      .sort((a, b) => b[1].files - a[1].files)
      .map(([sec, s]) => `| ${sec} | ${s.files} | ${s.avgWords} | ${s.partials} |`),
    '',
  ];

  const summaryPath = path.join(AUDIT_DIR, 'doc-summary.md');
  fs.writeFileSync(summaryPath, summaryLines.join('\n'));
  console.log(`Wrote ${summaryPath}`);

  console.log('\nDone!');
}

function pct(n: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((n / total) * 100)}%`;
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
