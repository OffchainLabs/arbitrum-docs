#!/usr/bin/env tsx
/**
 * Audit Docs
 *
 * Consumes the doc manifest and generates focused, actionable audit reports.
 * Output: .audit/reports/01-05 markdown files
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  pct,
  isPartial,
  isGenerated,
  type CompactDoc,
  type ManifestData,
} from './doc-manifest-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const AUDIT_DIR = path.join(PROJECT_ROOT, '.audit');
const REPORTS_DIR = path.join(AUDIT_DIR, 'reports');
const MANIFEST_PATH = path.join(AUDIT_DIR, 'doc-manifest.json');

// Canonical content types from CONTRIBUTE.md
const CANONICAL_CONTENT_TYPES = [
  'gentle-introduction',
  'quickstart',
  'how-to',
  'concept',
  'faq',
  'troubleshooting',
  'reference',
];

// --- Shared computation ---

interface AuditContext {
  docs: CompactDoc[];
  nonPartials: CompactDoc[];
  linkedIds: Set<string>;
  importedIds: Set<string>;
  orphaned: CompactDoc[];
  missingTitle: CompactDoc[];
  nonStandardCt: CompactDoc[];
}

function buildAuditContext(docs: CompactDoc[]): AuditContext {
  const nonPartials = docs.filter((d) => !isPartial(d) && !isGenerated(d));
  const linkedIds = new Set<string>();
  const importedIds = new Set<string>();
  for (const d of docs) {
    if (d.l) d.l.forEach((id) => linkedIds.add(id));
    if (d.im) d.im.forEach((id) => importedIds.add(id));
  }
  const orphaned = nonPartials.filter(
    (d) => (!d.sb || d.sb.length === 0) && !linkedIds.has(d.id) && !importedIds.has(d.id),
  );
  const missingTitle = nonPartials.filter((d) => !d.fm?.t);
  const nonStandardCt = nonPartials.filter(
    (d) => d.fm?.ct && !CANONICAL_CONTENT_TYPES.includes(d.fm.ct.toLowerCase()),
  );
  return { docs, nonPartials, linkedIds, importedIds, orphaned, missingTitle, nonStandardCt };
}

// --- Report generators ---

function generateFrontmatterAudit(ctx: AuditContext): string {
  const { nonPartials, missingTitle, nonStandardCt } = ctx;

  // P0: Non-partials with no frontmatter at all (no title AND no description)
  const p0 = nonPartials.filter((d) => !d.fm?.t && !d.fm?.d && !d.fm?.ct);

  // P1: Missing title or description
  const missingDesc = nonPartials.filter((d) => !d.fm?.d);

  // P2: Missing or non-standard content_type
  const missingCt = nonPartials.filter((d) => !d.fm?.ct);

  // P3: Missing author/sme
  const missingAuthor = nonPartials.filter((d) => !d.fm?.a);
  const missingSme = nonPartials.filter((d) => !d.fm?.sme);

  const lines: string[] = [
    '# Frontmatter Audit',
    '',
    `*Generated from manifest. Partials and generated docs excluded.*`,
    `*Scope: ${nonPartials.length} non-partial, non-generated docs.*`,
    '',
    '## P0: No Frontmatter (Critical)',
    '',
    `${p0.length} docs have essentially no frontmatter (no title, description, or content_type).`,
    '',
  ];

  if (p0.length > 0) {
    lines.push('| File | Section |', '|------|---------|');
    for (const d of p0) {
      lines.push(`| \`${d.p}\` | ${d.s} |`);
    }
    lines.push('');
  }

  lines.push(
    '## P1: Missing Title or Description',
    '',
    `- Missing title: ${missingTitle.length} (${pct(missingTitle.length, nonPartials.length)})`,
    `- Missing description: ${missingDesc.length} (${pct(missingDesc.length, nonPartials.length)})`,
    '',
  );

  if (missingTitle.length > 0) {
    lines.push('### Missing Title', '', '| File |', '|------|');
    for (const d of missingTitle) {
      lines.push(`| \`${d.p}\` |`);
    }
    lines.push('');
  }

  if (missingDesc.length > 0 && missingDesc.length <= 50) {
    lines.push('### Missing Description', '', '| File |', '|------|');
    for (const d of missingDesc) {
      lines.push(`| \`${d.p}\` |`);
    }
    lines.push('');
  } else if (missingDesc.length > 50) {
    lines.push(
      `### Missing Description`,
      '',
      `${missingDesc.length} files -- too many to list. Top sections:`,
      '',
      '| Section | Missing |',
      '|---------|---------|',
    );
    const bySec: Record<string, number> = {};
    for (const d of missingDesc) {
      bySec[d.s] = (bySec[d.s] || 0) + 1;
    }
    for (const [sec, count] of Object.entries(bySec).sort((a, b) => b[1] - a[1])) {
      lines.push(`| ${sec} | ${count} |`);
    }
    lines.push('');
  }

  lines.push(
    '## P2: Missing or Non-Standard content_type',
    '',
    `- Missing content_type: ${missingCt.length} (${pct(missingCt.length, nonPartials.length)})`,
    `- Non-standard content_type: ${nonStandardCt.length}`,
    '',
    `Canonical types: ${CANONICAL_CONTENT_TYPES.map((t) => `\`${t}\``).join(', ')}`,
    '',
  );

  if (nonStandardCt.length > 0) {
    lines.push('### Non-Standard Values', '', '| File | Value |', '|------|-------|');
    for (const d of nonStandardCt) {
      lines.push(`| \`${d.p}\` | \`${d.fm?.ct}\` |`);
    }
    lines.push('');
  }

  lines.push(
    '## P3: Missing Author or SME',
    '',
    `- Missing author: ${missingAuthor.length} (${pct(missingAuthor.length, nonPartials.length)})`,
    `- Missing sme: ${missingSme.length} (${pct(missingSme.length, nonPartials.length)})`,
    '',
  );

  return lines.join('\n');
}

function generateNavigationAudit(ctx: AuditContext): string {
  const { nonPartials, orphaned } = ctx;

  // Docs in multiple sidebars
  const multiSidebar = nonPartials.filter((d) => d.sb && d.sb.length > 1);

  // Section sidebar coverage
  const sectionCoverage: Record<string, { total: number; inSidebar: number }> = {};
  for (const d of nonPartials) {
    if (!sectionCoverage[d.s]) sectionCoverage[d.s] = { total: 0, inSidebar: 0 };
    sectionCoverage[d.s].total++;
    if (d.sb && d.sb.length > 0) sectionCoverage[d.s].inSidebar++;
  }

  const lines: string[] = [
    '# Navigation Audit',
    '',
    `*Scope: ${nonPartials.length} non-partial, non-generated docs.*`,
    '',
    '## Orphaned Pages',
    '',
    `${orphaned.length} pages are not in any sidebar, not linked from other docs, and not imported.`,
    '',
  ];

  if (orphaned.length > 0) {
    lines.push('| File | Section |', '|------|---------|');
    for (const d of orphaned.sort((a, b) => a.s.localeCompare(b.s) || a.p.localeCompare(b.p))) {
      lines.push(`| \`${d.p}\` | ${d.s} |`);
    }
    lines.push('');
  }

  lines.push(
    '## Docs in Multiple Sidebars',
    '',
    `${multiSidebar.length} docs appear in >1 sidebar.`,
    '',
  );

  if (multiSidebar.length > 0) {
    lines.push('| File | Sidebars |', '|------|----------|');
    for (const d of multiSidebar) {
      lines.push(`| \`${d.p}\` | ${d.sb?.join(', ') ?? ''} |`);
    }
    lines.push('');
  }

  lines.push(
    '## Section Sidebar Coverage',
    '',
    '| Section | Total | In Sidebar | Coverage |',
    '|---------|-------|------------|----------|',
  );
  for (const [sec, stat] of Object.entries(sectionCoverage).sort(
    (a, b) => a[1].inSidebar / a[1].total - b[1].inSidebar / b[1].total,
  )) {
    lines.push(
      `| ${sec} | ${stat.total} | ${stat.inSidebar} | ${pct(stat.inSidebar, stat.total)} |`,
    );
  }
  lines.push('');

  return lines.join('\n');
}

function generateContentMetrics(ctx: AuditContext): string {
  const { nonPartials } = ctx;

  const veryShort = nonPartials.filter((d) => d.w < 100);
  const veryLong = nonPartials.filter((d) => d.w > 3000);
  const noLinks = nonPartials.filter((d) => !d.l || d.l.length === 0);
  const noHeadings = nonPartials.filter((d) => !d.h || d.h.length === 0);

  // Heading level issues: H1 in body (should only be title), skipped levels
  const headingIssues: { file: string; issue: string }[] = [];
  for (const d of nonPartials) {
    if (!d.h || d.h.length === 0) continue;
    const h1Count = d.h.filter(([level]) => level === 1).length;
    if (h1Count > 0) {
      headingIssues.push({ file: d.p, issue: `${h1Count} H1 heading(s) in body` });
    }
    // Check for skipped levels
    let prevLevel = 1; // assume title is H1
    for (const [level] of d.h) {
      if (level > prevLevel + 1) {
        headingIssues.push({ file: d.p, issue: `Heading jump from H${prevLevel} to H${level}` });
        break;
      }
      prevLevel = level;
    }
  }

  const lines: string[] = [
    '# Content Metrics',
    '',
    `*Scope: ${nonPartials.length} non-partial, non-generated docs.*`,
    '',
    '## Very Short Docs (<100 words)',
    '',
    `${veryShort.length} docs are under 100 words.`,
    '',
  ];

  if (veryShort.length > 0) {
    lines.push('| File | Words | Section |', '|------|-------|---------|');
    for (const d of veryShort.sort((a, b) => a.w - b.w)) {
      lines.push(`| \`${d.p}\` | ${d.w} | ${d.s} |`);
    }
    lines.push('');
  }

  lines.push(
    '## Very Long Docs (>3000 words)',
    '',
    `${veryLong.length} docs exceed 3000 words.`,
    '',
  );

  if (veryLong.length > 0) {
    lines.push('| File | Words | Section |', '|------|-------|---------|');
    for (const d of veryLong.sort((a, b) => b.w - a.w)) {
      lines.push(`| \`${d.p}\` | ${d.w} | ${d.s} |`);
    }
    lines.push('');
  }

  lines.push(
    '## Docs with No Internal Links',
    '',
    `${noLinks.length} docs have zero internal links (potential isolation).`,
    '',
    '| Section | Count |',
    '|---------|-------|',
  );
  const noLinksBySec: Record<string, number> = {};
  for (const d of noLinks) {
    noLinksBySec[d.s] = (noLinksBySec[d.s] || 0) + 1;
  }
  for (const [sec, count] of Object.entries(noLinksBySec).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${sec} | ${count} |`);
  }
  lines.push('');

  lines.push(
    '## Docs with No Headings',
    '',
    `${noHeadings.length} docs have no H1-H3 headings.`,
    '',
  );

  if (noHeadings.length > 0 && noHeadings.length <= 30) {
    lines.push('| File | Words |', '|------|-------|');
    for (const d of noHeadings) {
      lines.push(`| \`${d.p}\` | ${d.w} |`);
    }
    lines.push('');
  }

  lines.push('## Heading Level Issues', '', `${headingIssues.length} issues found.`, '');

  if (headingIssues.length > 0) {
    lines.push('| File | Issue |', '|------|-------|');
    for (const issue of headingIssues.slice(0, 50)) {
      lines.push(`| \`${issue.file}\` | ${issue.issue} |`);
    }
    if (headingIssues.length > 50) {
      lines.push(`| ... | ${headingIssues.length - 50} more |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function generateSectionSummaries(ctx: AuditContext): string {
  const nonGenerated = ctx.docs.filter((d) => !isGenerated(d));
  const sections = new Map<string, CompactDoc[]>();
  for (const d of nonGenerated) {
    if (!sections.has(d.s)) sections.set(d.s, []);
    sections.get(d.s)!.push(d);
  }

  const lines: string[] = [
    '# Section Summaries',
    '',
    `*Per-directory breakdown of documentation quality metrics.*`,
    '',
  ];

  for (const [section, sectionDocs] of [...sections.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  )) {
    const nonPartials = sectionDocs.filter((d) => !isPartial(d));
    const partials = sectionDocs.filter((d) => isPartial(d));
    const totalWords = sectionDocs.reduce((sum, d) => sum + d.w, 0);
    const avgWords = sectionDocs.length > 0 ? Math.round(totalWords / sectionDocs.length) : 0;

    // Content type distribution
    const ctDist: Record<string, number> = {};
    for (const d of nonPartials) {
      const ct = d.fm?.ct || '(none)';
      ctDist[ct] = (ctDist[ct] || 0) + 1;
    }

    // Frontmatter completeness
    const withTitle = nonPartials.filter((d) => d.fm?.t).length;
    const withDesc = nonPartials.filter((d) => d.fm?.d).length;
    const withCt = nonPartials.filter((d) => d.fm?.ct).length;
    const withAuthor = nonPartials.filter((d) => d.fm?.a).length;
    const inSidebar = nonPartials.filter((d) => d.sb && d.sb.length > 0).length;

    // Link density
    const totalInternalLinks = sectionDocs.reduce((sum, d) => sum + (d.l?.length || 0), 0);
    const avgLinks =
      sectionDocs.length > 0 ? (totalInternalLinks / sectionDocs.length).toFixed(1) : '0';

    lines.push(
      `## ${section}`,
      '',
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total files | ${sectionDocs.length} |`,
      `| Non-partials | ${nonPartials.length} |`,
      `| Partials | ${partials.length} |`,
      `| Avg words | ${avgWords} |`,
      `| In sidebar | ${inSidebar}/${nonPartials.length} (${pct(inSidebar, nonPartials.length)}) |`,
      `| Avg internal links | ${avgLinks} |`,
      '',
      '**Frontmatter:**',
      `- Title: ${withTitle}/${nonPartials.length} (${pct(withTitle, nonPartials.length)})`,
      `- Description: ${withDesc}/${nonPartials.length} (${pct(withDesc, nonPartials.length)})`,
      `- content_type: ${withCt}/${nonPartials.length} (${pct(withCt, nonPartials.length)})`,
      `- Author: ${withAuthor}/${nonPartials.length} (${pct(withAuthor, nonPartials.length)})`,
      '',
      '**content_type distribution:**',
      ...Object.entries(ctDist)
        .sort((a, b) => b[1] - a[1])
        .map(([ct, count]) => `- \`${ct}\`: ${count}`),
      '',
    );
  }

  return lines.join('\n');
}

function generateActionablePriorities(ctx: AuditContext): string {
  const { nonPartials, orphaned, missingTitle, nonStandardCt } = ctx;

  // SEO impact: missing description on pages that are in a sidebar
  const missingDescInSidebar = nonPartials.filter((d) => !d.fm?.d && d.sb && d.sb.length > 0);

  // Content quality: very short docs in sidebar
  const shortInSidebar = nonPartials.filter((d) => d.w < 100 && d.sb && d.sb.length > 0);

  // Isolated docs: in sidebar but no internal links
  const isolatedInSidebar = nonPartials.filter(
    (d) => d.sb && d.sb.length > 0 && (!d.l || d.l.length === 0),
  );

  const lines: string[] = [
    '# Actionable Priorities',
    '',
    '*Synthesized from all audit reports. Grouped by effort and impact.*',
    '',
    '## Quick Wins',
    '',
    `### Add missing titles (${missingTitle.length} files)`,
    '',
  ];

  if (missingTitle.length > 0) {
    for (const d of missingTitle.slice(0, 20)) {
      lines.push(`- \`${d.p}\``);
    }
    if (missingTitle.length > 20) lines.push(`- ... and ${missingTitle.length - 20} more`);
    lines.push('');
  }

  lines.push(
    `### Normalize non-standard content_type values (${nonStandardCt.length} files)`,
    '',
    `Map to canonical types: ${CANONICAL_CONTENT_TYPES.map((t) => `\`${t}\``).join(', ')}`,
    '',
  );

  if (nonStandardCt.length > 0) {
    lines.push('| File | Current | Suggested |', '|------|---------|-----------|');
    for (const d of nonStandardCt) {
      const ct = d.fm?.ct ?? '';
      let suggested = '?';
      const lower = ct.toLowerCase();
      if (lower === 'get-started') suggested = 'quickstart';
      else if (lower === 'overview') suggested = 'concept';
      else if (lower === 'notice') suggested = 'reference';
      else if (lower === 'glossary') suggested = 'reference';
      else if (lower === 'how-to') suggested = 'how-to';
      else if (lower === 'concept') suggested = 'concept';
      lines.push(`| \`${d.p}\` | \`${ct}\` | \`${suggested}\` |`);
    }
    lines.push('');
  }

  lines.push(
    '## SEO Impact',
    '',
    `### Add descriptions to sidebar pages (${missingDescInSidebar.length} files)`,
    '',
    'These pages are discoverable via navigation but lack meta descriptions.',
    '',
  );

  if (missingDescInSidebar.length > 0) {
    for (const d of missingDescInSidebar.slice(0, 30)) {
      lines.push(`- \`${d.p}\``);
    }
    if (missingDescInSidebar.length > 30)
      lines.push(`- ... and ${missingDescInSidebar.length - 30} more`);
    lines.push('');
  }

  lines.push(
    '## Navigation Fixes',
    '',
    `### Resolve orphaned pages (${orphaned.length} files)`,
    '',
    'Pages not in any sidebar, not linked, and not imported. Either add to a sidebar or remove.',
    '',
  );

  if (orphaned.length > 0) {
    for (const d of orphaned.slice(0, 20)) {
      lines.push(`- \`${d.p}\` (section: ${d.s})`);
    }
    if (orphaned.length > 20) lines.push(`- ... and ${orphaned.length - 20} more`);
    lines.push('');
  }

  lines.push(
    '## Content Quality',
    '',
    `### Expand very short sidebar pages (${shortInSidebar.length} files)`,
    '',
    'Pages in the sidebar with <100 words may need more content or should be merged.',
    '',
  );

  if (shortInSidebar.length > 0) {
    lines.push('| File | Words |', '|------|-------|');
    for (const d of shortInSidebar) {
      lines.push(`| \`${d.p}\` | ${d.w} |`);
    }
    lines.push('');
  }

  lines.push(
    `### Add internal links to isolated pages (${isolatedInSidebar.length} files)`,
    '',
    'Pages in the sidebar with no internal links reduce discoverability.',
    '',
  );

  if (isolatedInSidebar.length > 0 && isolatedInSidebar.length <= 30) {
    for (const d of isolatedInSidebar) {
      lines.push(`- \`${d.p}\``);
    }
    lines.push('');
  } else if (isolatedInSidebar.length > 30) {
    lines.push(`${isolatedInSidebar.length} files -- top sections:`);
    const bySec: Record<string, number> = {};
    for (const d of isolatedInSidebar) {
      bySec[d.s] = (bySec[d.s] || 0) + 1;
    }
    lines.push('', '| Section | Count |', '|---------|-------|');
    for (const [sec, count] of Object.entries(bySec).sort((a, b) => b[1] - a[1])) {
      lines.push(`| ${sec} | ${count} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// --- Main ---

async function main() {
  console.log('Generating audit reports...\n');

  // Load manifest
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifest not found at ${MANIFEST_PATH}. Run generate-doc-manifest first.`);
    process.exit(1);
  }

  const manifest: ManifestData = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`Loaded manifest: ${manifest.docs.length} docs`);

  const ctx = buildAuditContext(manifest.docs);
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  // Generate reports
  const reports: [string, string][] = [
    ['01-frontmatter-audit.md', generateFrontmatterAudit(ctx)],
    ['02-navigation-audit.md', generateNavigationAudit(ctx)],
    ['03-content-metrics.md', generateContentMetrics(ctx)],
    ['04-section-summaries.md', generateSectionSummaries(ctx)],
    ['05-actionable-priorities.md', generateActionablePriorities(ctx)],
  ];

  for (const [filename, content] of reports) {
    const filepath = path.join(REPORTS_DIR, filename);
    fs.writeFileSync(filepath, content);
    console.log(`  Wrote ${filepath}`);
  }

  console.log('\nDone! Reports generated in .audit/reports/');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
