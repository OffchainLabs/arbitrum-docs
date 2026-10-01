/**
 * Summary counts and the human-readable report.md for a parity run.
 */
import { SCORE_NAMES, runHealth, sectionHealth } from './health.ts';
import type {
  PageReport,
  ParityRun,
  ResolutionCategory,
  RunManifest,
  RunManifestEntry,
  RunSummary,
  WordOp,
} from './schema.ts';
import { SCHEMA_VERSION } from './schema.ts';

export const CATEGORIES: ResolutionCategory[] = [
  'direct',
  'same-slug',
  'changed-slug',
  'unrelated',
  'not-found',
  'loop',
];

export function buildSummary(
  pages: PageReport[],
  newOnlyPages: string[],
  threshold: number,
): RunSummary {
  const categories = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<
    ResolutionCategory,
    number
  >;
  for (const page of pages) categories[page.category]++;
  return {
    checked: pages.length,
    health: runHealth(pages),
    triage: pages.filter((page) => page.triage).length,
    threshold,
    categories,
    sections: sectionHealth(pages),
    newOnly: newOnlyPages.length,
    brokenLinksTargetOnly: pages.reduce((sum, page) => sum + page.brokenLinks.targetOnly.length, 0),
    brokenLinksAlsoProd: pages.reduce(
      (sum, page) => sum + page.brokenLinks.alsoBrokenOnProd.length,
      0,
    ),
  };
}

/** Add or replace a run in the manifest, newest first. */
export function updateManifest(
  manifest: RunManifest | undefined,
  entry: RunManifestEntry,
): RunManifest {
  const runs = (manifest?.runs ?? []).filter((run) => run.label !== entry.label);
  runs.push(entry);
  runs.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  return { schemaVersion: SCHEMA_VERSION, runs };
}

const oneLine = (text: string): string => text.replace(/\s*\n\s*/g, ' \\n ');

const clip = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max - 3)}...` : text;

/** A word diff as one compact line: long unchanged runs are elided, edits are `[-old-]{+new+}`. */
export function compactOps(ops: WordOp[], context = 40): string {
  return ops
    .map((op, index) => {
      const text = oneLine(op.text);
      if (op.op === 'delete') return `[-${text}-]`;
      if (op.op === 'insert') return `{+${text}+}`;
      const first = index === 0;
      const last = index === ops.length - 1;
      if (first && text.length > context) return `...${text.slice(-context)}`;
      if (last && text.length > context) return `${text.slice(0, context)}...`;
      if (!first && !last && text.length > context * 2) {
        return `${text.slice(0, context)} ... ${text.slice(-context)}`;
      }
      return text;
    })
    .join('');
}

const table = (header: string[], rows: string[][]): string[] => [
  `| ${header.join(' | ')} |`,
  `| ${header.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${row.map((cell) => cell.replace(/\|/g, '\\|')).join(' | ')} |`),
];

function details(page: PageReport, lines: string[], maxItems: number): void {
  lines.push(`### \`${page.oldPath}\``, '');
  lines.push(`Target \`${page.finalPath ?? 'none'}\` (${page.category}).`, '');
  for (const note of page.notes) lines.push(`- ${note}`);
  if (page.notes.length) lines.push('');
  const out: string[] = [];
  for (const heading of page.items.headings) out.push(`missing heading: ${clip(heading, 200)}`);
  for (const code of page.items.code) out.push(`missing code: ${clip(oneLine(code), 200)}`);
  for (const image of page.items.images) out.push(`missing image: ${image}`);
  for (const link of page.items.links) out.push(`${link.reason} link: ${link.href}`);
  for (const text of page.items.text) {
    out.push(
      text.new === null
        ? `dropped ${text.kind}: ${clip(oneLine(text.old), 240)}`
        : `changed ${text.kind}: ${clip(compactOps(text.ops ?? []), 400)}`,
    );
  }
  if (out.length === 0) return;
  lines.push('~~~text', ...out.slice(0, maxItems));
  if (out.length > maxItems) lines.push(`... ${out.length - maxItems} more in report.json`);
  lines.push('~~~', '');
}

export function renderMarkdown(run: ParityRun, maxItems = 40): string {
  const { summary } = run;
  const lines: string[] = [];
  lines.push(`# Content parity: ${run.label}`, '');
  lines.push(
    `Production ${run.prodUrl} against target ${run.targetUrl}. Commit ${run.commit ?? 'unknown'}` +
      (run.prs.length ? `, PRs ${run.prs.map((n) => `#${n}`).join(', ')}` : '') +
      `. Generated ${run.generatedAt}.`,
    '',
  );
  lines.push(
    `**Health ${summary.health} / 100.** ${summary.triage} of ${summary.checked} pages need triage ` +
      `(a parameter below ${summary.threshold}).`,
    '',
  );

  lines.push('## Summary', '');
  lines.push(
    ...table(
      ['Measure', 'Count'],
      [
        ['Production URLs checked', String(summary.checked)],
        ['Pages to triage', String(summary.triage)],
        ...CATEGORIES.map((c) => [`Resolution: ${c}`, String(summary.categories[c])]),
        ['Links broken only on target', String(summary.brokenLinksTargetOnly)],
        ['Links also broken on production', String(summary.brokenLinksAlsoProd)],
        ['Pages only on target', String(summary.newOnly)],
      ],
    ),
    '',
  );

  lines.push('## Sections', '');
  lines.push(
    ...table(
      ['Section', 'Health', 'Pages', 'Triage'],
      Object.entries(summary.sections).map(([section, h]) => [
        section,
        String(h.score),
        String(h.pages),
        String(h.triage),
      ]),
    ),
    '',
  );

  const triage = run.pages
    .filter((page) => page.triage)
    .sort((a, b) => a.scores.overall - b.scores.overall);
  lines.push(
    `## Triage (${triage.length})`,
    '',
    'Lowest score first. Overall is the weighted mean of the content parameters (0 if the page does not resolve); a page is here when any parameter is below the threshold.',
    '',
  );
  lines.push(
    ...table(
      ['Page', 'Overall', ...SCORE_NAMES],
      triage.map((page) => [
        `\`${page.oldPath}\``,
        String(page.scores.overall),
        ...SCORE_NAMES.map((name) => String(page.scores[name])),
      ]),
    ),
    '',
  );

  lines.push('## Details', '');
  for (const page of triage) details(page, lines, maxItems);

  lines.push('## Broken links', '');
  const rows = (key: 'targetOnly' | 'alsoBrokenOnProd'): string[][] =>
    run.pages.flatMap((page) =>
      page.brokenLinks[key].map((link) => [
        page.finalPath ?? page.oldPath,
        link.href,
        String(link.status ?? 'error'),
        link.prodHref ? `${link.prodHref} (${link.prodStatus ?? 'error'})` : '',
      ]),
    );
  const targetOnly = rows('targetOnly');
  const alsoProd = rows('alsoBrokenOnProd');
  lines.push(`### Broken only on target (${targetOnly.length})`, '');
  if (targetOnly.length)
    lines.push(...table(['Page', 'Link', 'Status', 'Production link'], targetOnly), '');
  lines.push(`### Also broken on production (${alsoProd.length})`, '');
  if (alsoProd.length)
    lines.push(...table(['Page', 'Link', 'Status', 'Production link'], alsoProd), '');

  lines.push(`## Only on target (${run.newOnlyPages.length})`, '');
  for (const path of run.newOnlyPages) lines.push(`- \`${path}\``);
  lines.push('');
  return lines.join('\n');
}
