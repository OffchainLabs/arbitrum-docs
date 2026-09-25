/**
 * Render the Nitro CLI flags reference page and splice it into the file on disk.
 *
 * The page is generated between two markers rather than written whole. Its frontmatter carries
 * the five fields `source.config.ts` requires plus `user_story`, all of them editorial, and a
 * writer may want a paragraph of their own above or below the tables. Anything outside the markers
 * survives a regeneration untouched; anything inside is replaced. The scaffold sets no
 * `sidebar_label`: the field is optional, and one identical to the title has no effect (FS-2745).
 *
 * Ported from arbitrum-docs `scripts/generate-cli-reference.ts`, which rewrote the whole file
 * and so had no way to keep a local edit.
 */
import type { CliFlag } from './nitro-cli-flags.ts';

/** A link to a curated guide: the text the page shows and the site-relative href. */
export interface GuideLink {
  label: string;
  href: string;
}

/** Editorial inputs to {@link renderGeneratedRegion}. */
export interface RenderOptions {
  /** Guides the admonition lists. */
  introLinks: readonly GuideLink[];
  /** Top-level namespace to the guide that explains it. */
  namespaceLinks: Readonly<Record<string, GuideLink>>;
  /** The guide for a namespace with no entry in `namespaceLinks`. */
  defaultNamespaceLink: GuideLink;
  nitroVersionTag: string;
}

export const START_MARKER = '{/* GENERATED:START */}';
export const END_MARKER = '{/* GENERATED:END */}';

const DO_NOT_EDIT =
  '{/* The region between the GENERATED markers below is written by ' +
  '`pnpm cli:generate` from the Nitro source at the tag pinned as `nitroVersionTag` in ' +
  'content/vars.json. Do not edit it by hand. Prose outside the markers is preserved. */}';

/** Frontmatter used only when the page does not exist yet. */
const SCAFFOLD_FRONTMATTER = `---
title: 'CLI flags reference'
description: 'Complete reference of all Nitro node command-line flags with types, defaults, and descriptions'
user_story: 'As a node operator, I want a single page where I can look up any Nitro CLI flag'
content_type: 'reference'
author: gzeoneth
sme: gzeoneth
---
`;

/** Split a leading YAML frontmatter block off an MDX file. */
export function splitFrontmatter(source: string): { frontmatter: string; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(source);
  if (!match) return { frontmatter: '', body: source };
  return { frontmatter: match[0], body: source.slice(match[0].length) };
}

/** Escape the characters that would break out of a markdown table cell or an MDX expression. */
export function escapeCell(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

/**
 * Wrap a value in a code span, escaping only what a code span needs.
 *
 * `escapeCell` is for the prose columns and would be wrong here: inside a code span a backslash
 * escape and an HTML entity are both literal text, so a default of `<?INVALID-URL?>` would reach
 * the reader spelled `&lt;?INVALID-URL?&gt;`. A pipe is the exception and still needs its
 * backslash, because GFM splits a table row on unescaped pipes before any inline parsing happens.
 * The fence widens past any backtick run in the value, and a value that starts or ends with a
 * backtick gets the padding space CommonMark strips back off.
 */
export function codeCell(text: string): string {
  const longest = (text.match(/`+/g) ?? []).reduce((n, run) => Math.max(n, run.length), 0);
  const fence = '`'.repeat(longest + 1);
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
  return `${fence}${pad}${text.replace(/\|/g, '\\|')}${pad}${fence}`;
}

/** An empty default renders as a dash: pflag omits zero-value defaults, and so does the page. */
function formatDefault(value: string): string {
  return value === '' ? '-' : codeCell(value);
}

/** Group flags by their first dotted segment, namespaces in alphabetical order. */
export function groupByNamespace(
  flags: readonly CliFlag[],
): Array<{ namespace: string; flags: CliFlag[] }> {
  const groups = new Map<string, CliFlag[]>();
  for (const flag of flags) {
    const dot = flag.flag.indexOf('.');
    const namespace = dot === -1 ? flag.flag : flag.flag.slice(0, dot);
    const group = groups.get(namespace);
    if (group) group.push(flag);
    else groups.set(namespace, [flag]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([namespace, nsFlags]) => ({ namespace, flags: nsFlags }));
}

/**
 * The generated region: the intro admonition, the usage examples, and one collapsible table per
 * namespace. `flags` arrive already filtered and sorted.
 */
export function renderGeneratedRegion(
  flags: readonly CliFlag[],
  { introLinks, namespaceLinks, defaultNamespaceLink, nitroVersionTag }: RenderOptions,
): string {
  const groups = groupByNamespace(flags);
  const lines: string[] = [];
  const intro = introLinks.map((link) => `- [${link.label}](${link.href})`).join('\n');

  lines.push(`<VanillaAdmonition type="info" title="Auto-generated reference">

This page lists every CLI flag accepted by the Nitro node binary. For explanations, examples, and recommended configurations, see the curated guides:

${intro}

**Total flags:** ${flags.length} across ${groups.length} namespaces, read from Nitro \`${nitroVersionTag}\`.

</VanillaAdmonition>

Pass flags on the command line with \`--\` prefix:

\`\`\`shell
nitro --http.addr=0.0.0.0 --http.port=8547 --node.feed.input.url=wss://arb1.arbitrum.io/feed
\`\`\`

Or set them in a JSON configuration file:

\`\`\`shell
nitro --conf.file=/path/to/config.json
\`\`\`
`);

  for (const group of groups) {
    const link = namespaceLinks[group.namespace] ?? defaultNamespaceLink;
    lines.push(`## ${group.namespace}`);
    lines.push('');
    lines.push(`Related guide: [${link.label}](${link.href})`);
    lines.push('');
    lines.push('<Accordions>');
    lines.push(`<Accordion title="${group.namespace} flags (${group.flags.length})">`);
    lines.push('');
    lines.push('| Flag | Type | Default | Description |');
    lines.push('| ---- | ---- | ------- | ----------- |');
    for (const flag of group.flags) {
      lines.push(
        `| ${codeCell(flag.flag)} | ${escapeCell(flag.type)} | ${formatDefault(flag.default)} | ${escapeCell(flag.description)} |`,
      );
    }
    lines.push('');
    lines.push('</Accordion>');
    lines.push('</Accordions>');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Produce the full file content, keeping the existing frontmatter and any prose outside the
 * markers. `existing` is '' when the page does not exist yet.
 *
 * A page that exists but has no usable marker pair is an error, not a scaffold. Rewriting it
 * would mean returning the frontmatter and a fresh region with the body dropped, which silently
 * deletes whatever prose a writer had put around the tables -- the one thing this whole splice
 * exists to protect.
 */
export function splicePage(existing: string, generated: string): string {
  const { frontmatter, body } = splitFrontmatter(existing);
  const region = `${START_MARKER}\n\n${generated.trim()}\n\n${END_MARKER}`;

  if (existing.trim() === '') {
    return `${SCAFFOLD_FRONTMATTER}\n${DO_NOT_EDIT}\n\n${region}\n`;
  }

  const start = body.indexOf(START_MARKER);
  const end = body.indexOf(END_MARKER);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `the CLI flags reference page has no usable ${START_MARKER} ... ${END_MARKER} pair, so the ` +
        `generated region cannot be placed. Restore both markers in the right order; refusing to ` +
        `rewrite the page and lose the prose around them. To start the page over instead, ` +
        `delete the file and re-run the generator.`,
    );
  }

  const head = body.slice(0, start);
  const tail = body.slice(end + END_MARKER.length);
  return `${frontmatter || SCAFFOLD_FRONTMATTER}${head}${region}${tail}`;
}
