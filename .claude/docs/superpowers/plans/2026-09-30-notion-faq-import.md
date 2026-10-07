# Notion FAQ Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the six FAQ and troubleshooting partials back under Notion ownership with a fetch-to-snapshot step, an offline generator with a CI check, a weekly refresh workflow, and FAQPage JSON-LD on the six pages.

**Architecture:** `pnpm faq:fetch` reads the Notion FAQ database and writes one JSON snapshot per page under `content/faq/`. `pnpm faq:generate` turns the snapshots into the six partials offline, and `pnpm faq:check` is the CI gate. `lib/faq.ts` reads the same snapshots to emit JSON-LD from the docs page renderer. Pure rendering and grouping logic lives in `scripts/lib/`, tested with fixtures; the two runners are I/O wiring.

**Tech Stack:** Node 22 running `.ts` directly, `@notionhq/client` 5.27.0 (pinned exact), Prettier via `scripts/lib/generated-partial.ts`, `node --test`, GitHub Actions with `peter-evans/create-pull-request`.

**Spec:** `.claude/docs/superpowers/specs/2026-09-30-notion-faq-import-design.md`

**One deviation from the spec, decided while planning:** the page mapping lives in `lib/faq-pages.ts`, not `scripts/data/faq.data.ts`. The JSON-LD module under `lib/` needs it, and `scripts/` already imports from `lib/` (`scripts/lib/doc-links.ts:12` imports `lib/var-links.ts`) while nothing under `lib/` imports from `scripts/`. The content of the mapping is unchanged.

## Global Constraints

- Node `>=22.18.0 <23.0.0`, pnpm 10. Every script is `.ts` run by `node`; relative imports carry the `.ts` extension.
- `@notionhq/client` pinned exact at `5.27.0`, devDependency. No `@offchainlabs/notion-docs-generator`, no `dotenv` (Node 22 has `process.loadEnvFile`).
- No `<Var>` or `{var:}` in generated FAQ content. Values stay literal.
- Generated partials open with `generatedMarker('pnpm faq:generate', 'a faq:fetch')` and are written through `writeOrCheck` with `MDX_FORMAT = { parser: 'mdx', printWidth: 9999, proseWrap: 'preserve', plugins: [] }`.
- `faq:check` runs offline. `faq:fetch` never runs in CI. `NOTION_TOKEN` is read from the environment or `.env`, and in Actions only from `secrets` in `faq-refresh.yml`.
- Generated MDX must pass `content:lint`, `check-links`, `format:check`, and must not contain `<Term>` (rule R3 of `references:check` forbids it in partials).
- Commit as the repo's git user. No Co-Authored-By line (user rule).
- Never `git push` without an explicit go from Gael.

## Review Focus

1. \*_Plain text containing `{`, `}`, `<`, `_`, `\_`, `` ` ``, `[`, `]`: a Notion answer that says "set `<chainName>`" in prose or "block_number" must render as literal text, not as a JSX tag, expression, or emphasis. Test: Task 2, `escapes MDX-significant characters in plain text`.
2. **A question mapped to two slugs**: it must appear in both snapshots, in each page's order, with the same id. Test: Task 4, `emits a row under every mapped slug`.
3. **Question text with doubled or trailing spaces** ("How to verify …" exists in Notion today): the heading and the JSON-LD name must carry single spaces. Test: Task 4, `normalizes whitespace in the question`.
4. **An empty paragraph block** (a blank line typed in Notion): it must produce no output, not a stray blank paragraph or an extra blank line pair. Test: Task 3, `skips an empty paragraph`.
5. **Two consecutive list items**: they must stay one tight list (no blank line between items), and a bulleted list followed by a numbered list must be separated by one blank line. Test: Task 3, `keeps list items tight and separates adjacent lists`.

---

### Task 1: Dependency, mapping, and package scripts

**Files:**

- Create: `lib/faq-pages.ts`
- Modify: `package.json` (scripts block and devDependencies)
- Test: `scripts/lib/faq-pages.test.ts`

**Interfaces:**

- Produces: `faqDatabaseId: string`, `faqDataSourceId: string`, `faqPages: readonly FaqPage[]` where `FaqPage = { key: FaqKey; notionSlug: string; page: string }`, `FaqKey` union type, `partialPathFor(key): string`, `snapshotPathFor(key): string`.

- [ ] **Step 1: Add the dependency, pinned exact**

```bash
pnpm add -D -E @notionhq/client@5.27.0
```

Expected: `package.json` devDependencies gains `"@notionhq/client": "5.27.0"` and `pnpm-lock.yaml` updates. Run `pnpm audit --audit-level=moderate` and confirm no new advisory.

- [ ] **Step 2: Add the three scripts to `package.json`**

In the `"scripts"` block, keep alphabetical order within the two existing groups. Add after `"edge-challenge:fetch"`:

```json
    "faq:check": "node scripts/generate-faq.ts --check",
    "faq:fetch": "node scripts/faq-fetch.ts",
    "faq:generate": "node scripts/generate-faq.ts",
```

- [ ] **Step 3: Write the failing test**

Create `scripts/lib/faq-pages.test.ts`:

```ts
/**
 * The FAQ page mapping is the single place Notion slugs meet page paths. These tests pin the
 * invariants the fetch, the generator and the JSON-LD renderer all rely on.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { faqPages, partialPathFor, snapshotPathFor } from '../../lib/faq-pages.ts';

describe('faqPages', () => {
  it('has six entries with unique keys, slugs and pages', () => {
    assert.equal(faqPages.length, 6);
    for (const field of ['key', 'notionSlug', 'page'] as const) {
      const values = faqPages.map((p) => p[field]);
      assert.equal(new Set(values).size, values.length, `${field} values are unique`);
    }
  });

  it('derives the partial and snapshot paths from the key', () => {
    assert.equal(partialPathFor('nodes'), 'content/partials/_troubleshooting-nodes-partial.mdx');
    assert.equal(snapshotPathFor('nodes'), 'content/faq/nodes.json');
  });

  it('maps every page to a file that exists under content/docs', async () => {
    const fs = await import('node:fs');
    for (const p of faqPages) {
      assert.ok(fs.existsSync(`content/docs/${p.page}.mdx`), `${p.page}.mdx exists`);
    }
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `node --test scripts/lib/faq-pages.test.ts`
Expected: FAIL, cannot find module `lib/faq-pages.ts`.

- [ ] **Step 5: Write the mapping**

Create `lib/faq-pages.ts`:

```ts
/**
 * The six FAQ and troubleshooting pages whose body comes from the Notion "FAQ CMS" database.
 *
 * This is the only place the Notion slugs and the page paths are written. `scripts/faq-fetch.ts`
 * groups Notion rows by `notionSlug`, `scripts/generate-faq.ts` writes the partial for each `key`,
 * and `lib/faq.ts` looks a rendered page up by `page` to emit its FAQPage JSON-LD.
 */

/** The database that holds the "FAQs [Database]" inline table on the "FAQ CMS" page. */
export const faqDatabaseId = 'a8a9af20f33d4cc1b32bbd2be8459733';
/** The database's single data source; `dataSources.query` takes this id, not the database id. */
export const faqDataSourceId = 'a2a87b1e-7077-4e85-86e4-b67df34307d4';

export type FaqKey = 'users' | 'nodes' | 'building' | 'bridging' | 'arbitrum-chain' | 'stylus';

export interface FaqPage {
  key: FaqKey;
  /** The value of the Notion `Target document slugs` multi-select that routes a row here. */
  notionSlug: string;
  /** The docs page path under `content/docs/`, without extension, that includes the partial. */
  page: string;
}

export const faqPages: readonly FaqPage[] = [
  { key: 'users', notionSlug: 'troubleshooting-using-arbitrum', page: 'get-started/faq' },
  { key: 'nodes', notionSlug: 'troubleshooting-running-nodes', page: 'run-a-node/faq' },
  {
    key: 'building',
    notionSlug: 'troubleshooting-building',
    page: 'build-decentralized-apps/troubleshooting-building',
  },
  { key: 'bridging', notionSlug: 'troubleshooting-bridging', page: 'arbitrum-bridge/troubleshooting' },
  {
    key: 'arbitrum-chain',
    notionSlug: 'troubleshooting-building-orbit',
    page: 'launch-arbitrum-chain/overview/faq',
  },
  {
    key: 'stylus',
    notionSlug: 'troubleshooting-building-stylus',
    page: 'stylus/troubleshooting-building-stylus',
  },
];

export const partialPathFor = (key: FaqKey): string => `content/partials/_troubleshooting-${key}-partial.mdx`;

export const snapshotPathFor = (key: FaqKey): string => `content/faq/${key}.json`;
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `node --test scripts/lib/faq-pages.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 7: Type-check and commit**

Run: `pnpm types:check`
Expected: exit 0.

```bash
git add package.json pnpm-lock.yaml lib/faq-pages.ts scripts/lib/faq-pages.test.ts
git commit -m "Add the FAQ page mapping and the Notion client dependency"
```

---

### Task 2: Rich text to MDX, with link rewriting

**Files:**

- Create: `scripts/lib/notion-mdx.ts`
- Test: `scripts/lib/notion-mdx.test.ts`

**Interfaces:**

- Produces: `class RenderError extends Error`, `interface NotionRichText`, `escapeMdxText(s: string): string`, `rewriteLink(url: string): string`, `renderRichText(items: NotionRichText[], opts?: { allowLinks?: boolean }): string`.
- Later tasks add `NotionBlock` and `renderBlocks` to the same module.

- [ ] **Step 1: Write the failing tests**

Create `scripts/lib/notion-mdx.test.ts`:

```ts
/**
 * Fixture-driven tests for the Notion block renderer. Each fixture mirrors the JSON the Notion API
 * returns for one block or rich-text item, so the tests pin the MDX shape without the network.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type NotionRichText, RenderError, escapeMdxText, renderRichText, rewriteLink } from './notion-mdx.ts';

const plain = (content: string, extra: Partial<NotionRichText['annotations']> = {}): NotionRichText => ({
  type: 'text',
  plain_text: content,
  href: null,
  annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default', ...extra },
  text: { content, link: null },
});

const linked = (content: string, url: string): NotionRichText => ({
  ...plain(content),
  href: url,
  text: { content, link: { url } },
});

describe('escapeMdxText', () => {
  it('escapes MDX-significant characters in plain text', () => {
    assert.equal(escapeMdxText('set <chainName> in {config}'), 'set \\<chainName> in \\{config\\}');
    assert.equal(escapeMdxText('block_number * 2 [x] `y` ~z~ \\'), 'block\\_number \\* 2 \\[x\\] \\`y\\` \\~z\\~ \\\\');
  });
});

describe('rewriteLink', () => {
  it('turns a docs.arbitrum.io URL into a site-relative /docs path', () => {
    assert.equal(rewriteLink('https://docs.arbitrum.io/run-a-node/faq'), '/docs/run-a-node/faq');
    assert.equal(rewriteLink('https://docs.arbitrum.io/docs/run-a-node/faq#x'), '/docs/run-a-node/faq#x');
    assert.equal(rewriteLink('https://docs.arbitrum.io/'), '/docs');
  });

  it('rejects a Notion URL', () => {
    assert.throws(() => rewriteLink('https://www.notion.so/abc'), RenderError);
    assert.throws(() => rewriteLink('https://app.notion.com/p/abc'), RenderError);
  });

  it('passes any other https URL through unchanged', () => {
    assert.equal(rewriteLink('https://arbiscan.io/tx/0x1'), 'https://arbiscan.io/tx/0x1');
  });
});

describe('renderRichText', () => {
  it('applies bold, italic, strikethrough and code', () => {
    const items = [plain('a ', {}), plain('b', { bold: true }), plain(' c', { italic: true }), plain(' d', { strikethrough: true }), plain(' e<f>', { code: true })];
    assert.equal(renderRichText(items), 'a **b** _ c_ ~~ d~~ ` e<f>`');
  });

  it('renders a link and rewrites its destination', () => {
    assert.equal(renderRichText([plain('see '), linked('the FAQ', 'https://docs.arbitrum.io/run-a-node/faq')]), 'see [the FAQ](/docs/run-a-node/faq)');
  });

  it('straightens curly quotes and drops underline and color', () => {
    assert.equal(renderRichText([plain('“x” ‘y’', { underline: true, color: 'red' })]), '"x" \'y\'');
  });

  it('rejects a mention and a link when links are not allowed', () => {
    const mention = { ...plain('@someone'), type: 'mention' as const, text: undefined };
    assert.throws(() => renderRichText([mention]), /mention/);
    assert.throws(() => renderRichText([linked('x', 'https://a.b')], { allowLinks: false }), /link/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test scripts/lib/notion-mdx.test.ts`
Expected: FAIL, cannot find module `./notion-mdx.ts`.

- [ ] **Step 3: Write the rich-text renderer**

Create `scripts/lib/notion-mdx.ts`:

```ts
/**
 * notion-mdx: pure functions from Notion API block JSON to the MDX the FAQ partials carry.
 *
 * The input types mirror the JSON shapes `@notionhq/client` returns, narrowed to the fields read
 * here, so tests can use plain fixture objects and the fetch script can pass API responses as-is.
 * Anything this module cannot render throws {@link RenderError}; the fetch script collects those
 * per question and reports them with the Notion page URL. Nothing here touches the network or
 * the filesystem.
 */

/** A block or rich-text item that has no faithful MDX rendering. */
export class RenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RenderError';
  }
}

export interface NotionRichText {
  type: 'text' | 'mention' | 'equation';
  plain_text: string;
  href: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  text?: { content: string; link: { url: string } | null };
}

/**
 * Escape every character that MDX or CommonMark would otherwise interpret inside prose: JSX and
 * expression delimiters, emphasis and code markers, link brackets, and the backslash itself.
 */
export function escapeMdxText(s: string): string {
  return s.replace(/[\\`*_{}[\]<~]/g, (c) => `\\${c}`);
}

const CURLY_QUOTES: Record<string, string> = { '“': '"', '”': '"', '‘': "'", '’': "'" };

const straightenQuotes = (s: string): string => s.replace(/[“”‘’]/g, (c) => CURLY_QUOTES[c] ?? c);

/**
 * A `docs.arbitrum.io` URL becomes site-relative so `check-links` validates it. A Notion URL is
 * rejected because readers cannot open it. Every other URL passes through.
 */
export function rewriteLink(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new RenderError(`link is not an absolute URL: ${url}`);
  }
  const host = parsed.hostname.toLowerCase();
  if (host === 'www.notion.so' || host === 'notion.so' || host === 'app.notion.com') {
    throw new RenderError(`link points at Notion, which readers cannot open: ${url}`);
  }
  if (host !== 'docs.arbitrum.io') return url;

  const pathname = parsed.pathname.replace(/^\/docs(?=\/|$)/, '').replace(/\/$/, '');
  return `/docs${pathname}${parsed.search}${parsed.hash}`;
}

/** Render a rich-text array to inline MDX. */
export function renderRichText(items: NotionRichText[], { allowLinks = true }: { allowLinks?: boolean } = {}): string {
  return items
    .map((item) => {
      if (item.type !== 'text') {
        throw new RenderError(`unsupported rich text: ${item.type} "${item.plain_text}"`);
      }
      const { bold, italic, strikethrough, code } = item.annotations;
      const content = straightenQuotes(item.plain_text);
      let out = code ? `\`${content}\`` : escapeMdxText(content);
      if (bold) out = `**${out}**`;
      if (italic) out = `_${out}_`;
      if (strikethrough) out = `~~${out}~~`;

      const url = item.text?.link?.url ?? item.href;
      if (url) {
        if (!allowLinks) throw new RenderError(`link not allowed here: ${url}`);
        out = `[${out}](${rewriteLink(url)})`;
      }
      return out;
    })
    .join('');
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test scripts/lib/notion-mdx.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/notion-mdx.ts scripts/lib/notion-mdx.test.ts
git commit -m "Render Notion rich text to MDX with link rewriting"
```

---

### Task 3: Blocks to MDX

**Files:**

- Modify: `scripts/lib/notion-mdx.ts` (append)
- Test: `scripts/lib/notion-mdx.test.ts` (append)

**Interfaces:**

- Consumes: `renderRichText`, `RenderError`, `NotionRichText` from Task 2.
- Produces: `interface NotionBlock { id: string; type: string; has_children?: boolean; children?: NotionBlock[]; [payload: string]: unknown }`, `renderBlocks(blocks: NotionBlock[]): string`, `renderAnswer(blocks: NotionBlock[], shortAnswer: NotionRichText[]): string`.

- [ ] **Step 1: Write the failing tests**

Append to `scripts/lib/notion-mdx.test.ts` (extend the import line with `type NotionBlock, renderAnswer, renderBlocks`):

````ts
const rt = (content: string): NotionRichText[] => [plain(content)];

const block = (type: string, payload: Record<string, unknown>, children?: NotionBlock[]): NotionBlock => ({
  id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  has_children: Boolean(children?.length),
  ...(children ? { children } : {}),
  [type]: payload,
});

const para = (text: string, children?: NotionBlock[]) => block('paragraph', { rich_text: rt(text), color: 'default' }, children);

describe('renderBlocks', () => {
  it('renders paragraphs separated by one blank line', () => {
    assert.equal(renderBlocks([para('one'), para('two')]), 'one\n\ntwo');
  });

  it('skips an empty paragraph', () => {
    const empty = block('paragraph', { rich_text: [], color: 'default' });
    assert.equal(renderBlocks([para('one'), empty, para('two')]), 'one\n\ntwo');
  });

  it('demotes every heading level to h4', () => {
    const h = (level: 1 | 2 | 3, text: string) => block(`heading_${level}`, { rich_text: rt(text), color: 'default', is_toggleable: false });
    assert.equal(renderBlocks([h(1, 'A'), h(2, 'B'), h(3, 'C')]), '#### A\n\n#### B\n\n#### C');
  });

  it('rejects a link inside a heading', () => {
    const h = block('heading_2', {
      rich_text: [linked('x', 'https://a.b')],
      color: 'default',
      is_toggleable: false,
    });
    assert.throws(() => renderBlocks([h]), /link not allowed/);
  });

  it('keeps list items tight and separates adjacent lists', () => {
    const li = (text: string, children?: NotionBlock[]) => block('bulleted_list_item', { rich_text: rt(text), color: 'default' }, children);
    const ni = (text: string) => block('numbered_list_item', { rich_text: rt(text), color: 'default' });
    assert.equal(renderBlocks([li('a'), li('b', [li('b1')]), ni('c'), ni('d')]), '- a\n- b\n  - b1\n\n1. c\n2. d');
  });

  it('renders code with the Notion language as the fence info', () => {
    const code = block('code', { rich_text: rt('echo "<x>"'), caption: [], language: 'bash' });
    assert.equal(renderBlocks([code]), '```bash\necho "<x>"\n```');
  });

  it('renders quote, callout and divider', () => {
    const quote = block('quote', { rich_text: rt('q'), color: 'default' });
    const callout = block('callout', { rich_text: rt('note'), color: 'gray_background', icon: null });
    const divider = block('divider', {});
    assert.equal(renderBlocks([quote, callout, divider]), '> q\n\n<Callout type="info">\n\nnote\n\n</Callout>\n\n---');
  });

  it('renders a table with a header row and escaped pipes', () => {
    const row = (cells: string[]) => block('table_row', { cells: cells.map((c) => rt(c)) });
    const table = block('table', { has_column_header: true, has_row_header: false, table_width: 2 }, [row(['Flag', 'Meaning']), row(['--a', 'x | y'])]);
    assert.equal(renderBlocks([table]), '| Flag | Meaning |\n| --- | --- |\n| --a | x \\| y |');
  });

  it('rejects media and structural blocks by type with the block id', () => {
    for (const type of ['image', 'video', 'file', 'embed', 'bookmark', 'link_to_page', 'child_page', 'synced_block', 'toggle', 'column_list']) {
      const b = block(type, {});
      assert.throws(() => renderBlocks([b]), new RegExp(`${type}.*${b.id}`));
    }
  });
});

describe('renderAnswer', () => {
  it('uses the body when present and the short answer otherwise', () => {
    assert.equal(renderAnswer([para('body')], rt('short')), 'body');
    assert.equal(renderAnswer([], rt('short')), 'short');
  });

  it('rejects an answer with neither', () => {
    assert.throws(() => renderAnswer([], []), /empty/);
  });
});
````

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test scripts/lib/notion-mdx.test.ts`
Expected: FAIL, `renderBlocks` is not exported.

- [ ] **Step 3: Write the block renderer**

Append to `scripts/lib/notion-mdx.ts`:

```ts
/**
 * A block as the API returns it, with `children` attached by the fetch step for every block whose
 * `has_children` is true. The payload sits under the key named by `type`.
 */
export interface NotionBlock {
  id: string;
  type: string;
  has_children?: boolean;
  children?: NotionBlock[];
  [payload: string]: unknown;
}

const FAIL_BY_TYPE = new Set(['image', 'video', 'file', 'pdf', 'audio', 'embed', 'bookmark', 'link_preview', 'link_to_page', 'child_page', 'child_database', 'synced_block', 'toggle', 'column_list', 'column', 'template', 'breadcrumb', 'table_of_contents', 'equation', 'to_do', 'unsupported']);

type Payload = { rich_text?: NotionRichText[]; language?: string; cells?: NotionRichText[][]; has_column_header?: boolean };

const payloadOf = (b: NotionBlock): Payload => (b[b.type] as Payload | undefined) ?? {};
const textOf = (b: NotionBlock, opts?: { allowLinks?: boolean }): string => renderRichText(payloadOf(b).rich_text ?? [], opts);
const indent = (s: string, by: string): string => s.replace(/^(?!$)/gm, by);

/** Blocks that print one line each and chain without blank lines between siblings of a kind. */
const LIST_TYPES = new Set(['bulleted_list_item', 'numbered_list_item']);

function renderOne(b: NotionBlock, ordinal: number): string | null {
  if (FAIL_BY_TYPE.has(b.type)) {
    throw new RenderError(`unsupported block ${b.type} (${b.id})`);
  }
  const children = b.children ?? [];
  switch (b.type) {
    case 'paragraph': {
      const text = textOf(b);
      if (text === '' && children.length === 0) return null;
      return [text, ...children.map((c) => renderBlocks([c]))].filter(Boolean).join('\n\n');
    }
    case 'heading_1':
    case 'heading_2':
    case 'heading_3':
      return `#### ${textOf(b, { allowLinks: false })}`;
    case 'bulleted_list_item':
    case 'numbered_list_item': {
      const marker = b.type === 'bulleted_list_item' ? '- ' : `${ordinal}. `;
      const body = textOf(b);
      const nested = children.length ? '\n' + indent(renderBlocks(children), ' '.repeat(marker.length)) : '';
      return `${marker}${body}${nested}`;
    }
    case 'code': {
      const { language = '', rich_text = [] } = payloadOf(b);
      const raw = rich_text.map((r) => r.plain_text).join('');
      return `\`\`\`${language}\n${raw}\n\`\`\``;
    }
    case 'quote':
      return indent([textOf(b), ...children.map((c) => renderBlocks([c]))].filter(Boolean).join('\n\n'), '> ');
    case 'callout': {
      const inner = [textOf(b), ...children.map((c) => renderBlocks([c]))].filter(Boolean).join('\n\n');
      return `<Callout type="info">\n\n${inner}\n\n</Callout>`;
    }
    case 'divider':
      return '---';
    case 'table': {
      const rows = children.filter((c) => c.type === 'table_row');
      const cells = rows.map((r) => (payloadOf(r).cells ?? []).map((c) => renderRichText(c).replace(/\|/g, '\\|')));
      if (cells.length === 0) return null;
      const width = Math.max(...cells.map((r) => r.length));
      const header = payloadOf(b).has_column_header ? cells.shift()! : Array<string>(width).fill('');
      const line = (r: string[]) => `| ${r.join(' | ')} |`;
      return [line(header), line(Array<string>(width).fill('---')), ...cells.map(line)].join('\n');
    }
    default:
      throw new RenderError(`unsupported block ${b.type} (${b.id})`);
  }
}

/** Render a sequence of sibling blocks to MDX, one blank line between non-list neighbours. */
export function renderBlocks(blocks: NotionBlock[]): string {
  const parts: string[] = [];
  let ordinal = 0;
  let previousType: string | null = null;
  for (const b of blocks) {
    ordinal = b.type === 'numbered_list_item' && previousType === 'numbered_list_item' ? ordinal + 1 : 1;
    const rendered = renderOne(b, ordinal);
    if (rendered === null) continue;
    const tight = LIST_TYPES.has(b.type) && previousType === b.type;
    parts.push((parts.length ? (tight ? '\n' : '\n\n') : '') + rendered);
    previousType = b.type;
  }
  return parts.join('');
}

/** The page body, or the `Short answer (HTML)` property when the body is empty. */
export function renderAnswer(blocks: NotionBlock[], shortAnswer: NotionRichText[]): string {
  const body = renderBlocks(blocks);
  if (body !== '') return body;
  const short = renderRichText(shortAnswer);
  if (short !== '') return short;
  throw new RenderError('answer is empty: no body blocks and no short answer');
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test scripts/lib/notion-mdx.test.ts`
Expected: PASS, 19 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/notion-mdx.ts scripts/lib/notion-mdx.test.ts
git commit -m "Render Notion blocks to MDX for the FAQ partials"
```

---

### Task 4: Rows to snapshots

**Files:**

- Create: `scripts/lib/faq-snapshot.ts`
- Test: `scripts/lib/faq-snapshot.test.ts`

**Interfaces:**

- Consumes: `faqPages`, `FaqKey`, `faqDatabaseId` from `lib/faq-pages.ts`; `NotionRichText` from Task 2.
- Produces:
  - `interface FaqRow { id: string; url: string; question: string; slugs: string[]; order: number | null; shortAnswer: NotionRichText[] }`
  - `interface FaqItem { id: string; question: string; answer: string }`
  - `interface FaqSnapshot { source: string; items: FaqItem[] }`
  - `rowFromPage(page: unknown): FaqRow` (reads the Notion property names)
  - `groupRows(rows: FaqRow[]): Map<FaqKey, FaqRow[]>` (filters to mapped slugs, orders, throws on a missing index, a tie, or a duplicate question)
  - `buildSnapshot(rows: FaqRow[], answers: Map<string, string>): FaqSnapshot`
  - `normalizeQuestion(s: string): string`

- [ ] **Step 1: Write the failing tests**

Create `scripts/lib/faq-snapshot.test.ts`:

```ts
/**
 * Grouping and ordering of Notion rows into per-page snapshots. Fixture rows stand in for the
 * query result; `rowFromPage` is tested against a page object shaped like the API response.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type FaqRow, buildSnapshot, groupRows, normalizeQuestion, rowFromPage } from './faq-snapshot.ts';

const row = (over: Partial<FaqRow>): FaqRow => ({
  id: 'id-1',
  url: 'https://www.notion.so/id-1',
  question: 'Q?',
  slugs: ['troubleshooting-running-nodes'],
  order: 10,
  shortAnswer: [],
  ...over,
});

describe('normalizeQuestion', () => {
  it('normalizes whitespace in the question', () => {
    assert.equal(normalizeQuestion('  How  to verify\tthe   DB? '), 'How to verify the DB?');
  });
});

describe('groupRows', () => {
  it('groups by mapped slug in ascending order index', () => {
    const g = groupRows([row({ id: 'b', order: 20, question: 'B' }), row({ id: 'a', order: 10, question: 'A' })]);
    assert.deepEqual(
      g.get('nodes')?.map((r) => r.id),
      ['a', 'b'],
    );
  });

  it('emits a row under every mapped slug', () => {
    const g = groupRows([row({ id: 'x', slugs: ['troubleshooting-running-nodes', 'troubleshooting-building'] })]);
    assert.equal(g.get('nodes')?.[0]?.id, 'x');
    assert.equal(g.get('building')?.[0]?.id, 'x');
  });

  it('ignores rows whose slugs are not mapped', () => {
    const g = groupRows([row({ slugs: ['dao-faq'] })]);
    assert.equal([...g.values()].flat().length, 0);
  });

  it('rejects a missing order index, a tie, and a duplicate question', () => {
    assert.throws(() => groupRows([row({ order: null })]), /order index/);
    assert.throws(() => groupRows([row({ id: 'a', order: 10 }), row({ id: 'b', order: 10, question: 'B' })]), /same order index/);
    assert.throws(() => groupRows([row({ id: 'a', order: 10, question: 'Same' }), row({ id: 'b', order: 20, question: 'Same ' })]), /duplicate question/);
  });
});

describe('buildSnapshot', () => {
  it('pairs rows with their rendered answers and normalizes questions', () => {
    const rows = [row({ id: 'a', question: 'A  question?' })];
    const snap = buildSnapshot(rows, new Map([['a', 'answer']]));
    assert.deepEqual(snap, {
      source: 'https://www.notion.so/a8a9af20f33d4cc1b32bbd2be8459733',
      items: [{ id: 'a', question: 'A question?', answer: 'answer' }],
    });
  });
});

describe('rowFromPage', () => {
  it('reads the Notion property names', () => {
    const page = {
      object: 'page',
      id: 'p1',
      url: 'https://www.notion.so/p1',
      properties: {
        'Question': { type: 'title', title: [{ type: 'text', plain_text: 'How?', href: null, annotations: {}, text: { content: 'How?', link: null } }] },
        'Target document slugs': { type: 'multi_select', multi_select: [{ id: 'x', name: 'troubleshooting-bridging', color: 'green' }] },
        'FAQ order index': { type: 'number', number: 30 },
        'Short answer (HTML)': { type: 'rich_text', rich_text: [] },
      },
    };
    assert.deepEqual(rowFromPage(page), {
      id: 'p1',
      url: 'https://www.notion.so/p1',
      question: 'How?',
      slugs: ['troubleshooting-bridging'],
      order: 30,
      shortAnswer: [],
    });
  });

  it('rejects a page without the Question property, and a link in the question', () => {
    assert.throws(() => rowFromPage({ object: 'page', id: 'p', url: 'u', properties: {} }), /Question/);
    const linkedTitle = {
      object: 'page',
      id: 'p',
      url: 'u',
      properties: { Question: { type: 'title', title: [{ type: 'text', plain_text: 'x', href: 'https://a.b', annotations: {}, text: { content: 'x', link: { url: 'https://a.b' } } }] } },
    };
    assert.throws(() => rowFromPage(linkedTitle), /link in its title/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test scripts/lib/faq-snapshot.test.ts`
Expected: FAIL, cannot find module `./faq-snapshot.ts`.

- [ ] **Step 3: Write the module**

Create `scripts/lib/faq-snapshot.ts`:

```ts
/**
 * faq-snapshot: turn Notion FAQ rows into the per-page snapshots `content/faq/<key>.json` holds.
 *
 * Pure. The fetch script reads pages and blocks from the API, calls `rowFromPage` on each page,
 * `groupRows` once, renders each answer, then `buildSnapshot` per key. Every failure here names
 * the question so the person fixing it can find the row in Notion.
 */
import { type FaqKey, faqDatabaseId, faqPages } from '../../lib/faq-pages.ts';
import type { NotionRichText } from './notion-mdx.ts';

export interface FaqRow {
  id: string;
  url: string;
  question: string;
  slugs: string[];
  order: number | null;
  shortAnswer: NotionRichText[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSnapshot {
  source: string;
  items: FaqItem[];
}

export const normalizeQuestion = (s: string): string => s.replace(/\s+/g, ' ').trim();

const keyBySlug = new Map(faqPages.map((p) => [p.notionSlug, p.key]));

/** Group mapped rows by page key, ordered by `FAQ order index`. Throws on anything ambiguous. */
export function groupRows(rows: FaqRow[]): Map<FaqKey, FaqRow[]> {
  const groups = new Map<FaqKey, FaqRow[]>();
  for (const row of rows) {
    for (const slug of row.slugs) {
      const key = keyBySlug.get(slug);
      if (!key) continue;
      if (row.order === null) {
        throw new Error(`"${row.question}" (${row.url}) has no FAQ order index`);
      }
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(row);
    }
  }
  for (const [key, group] of groups) {
    group.sort((a, b) => (a.order as number) - (b.order as number));
    const seenQuestions = new Set<string>();
    for (let i = 0; i < group.length; i++) {
      const row = group[i]!;
      const next = group[i + 1];
      if (next && next.order === row.order) {
        throw new Error(`"${row.question}" and "${next.question}" have the same order index ${row.order} on ${key}`);
      }
      const q = normalizeQuestion(row.question);
      if (seenQuestions.has(q)) throw new Error(`duplicate question on ${key}: "${q}" (${row.url})`);
      seenQuestions.add(q);
    }
  }
  return groups;
}

export function buildSnapshot(rows: FaqRow[], answers: Map<string, string>): FaqSnapshot {
  return {
    source: `https://www.notion.so/${faqDatabaseId}`,
    items: rows.map((row) => {
      const answer = answers.get(row.id);
      if (answer === undefined) throw new Error(`no rendered answer for "${row.question}" (${row.url})`);
      return { id: row.id, question: normalizeQuestion(row.question), answer };
    }),
  };
}

type Props = Record<string, { type: string } & Record<string, unknown>>;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** Read the fields the pipeline needs from a page object as `dataSources.query` returns it. */
export function rowFromPage(page: unknown): FaqRow {
  if (!isRecord(page) || !isRecord(page.properties) || typeof page.id !== 'string' || typeof page.url !== 'string') {
    throw new Error('not a full page object');
  }
  const props = page.properties as Props;
  const title = props['Question'];
  if (!title || !Array.isArray(title.title)) throw new Error(`page ${page.url} has no Question title property`);
  const titleItems = title.title as NotionRichText[];
  if (titleItems.some((t) => t.href)) throw new Error(`question has a link in its title: ${page.url}`);
  const question = titleItems.map((t) => t.plain_text).join('');

  const slugsProp = props['Target document slugs'];
  const slugs = Array.isArray(slugsProp?.multi_select) ? (slugsProp.multi_select as { name: string }[]).map((o) => o.name) : [];

  const orderProp = props['FAQ order index'];
  const order = typeof orderProp?.number === 'number' ? orderProp.number : null;

  const shortProp = props['Short answer (HTML)'];
  const shortAnswer = Array.isArray(shortProp?.rich_text) ? (shortProp.rich_text as NotionRichText[]) : [];

  return { id: page.id, url: page.url, question, slugs, order, shortAnswer };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test scripts/lib/faq-snapshot.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/faq-snapshot.ts scripts/lib/faq-snapshot.test.ts
git commit -m "Group Notion FAQ rows into per-page snapshots"
```

---

### Task 5: Partial builder and the offline generator

**Files:**

- Create: `scripts/lib/faq-partial.ts`, `scripts/generate-faq.ts`
- Test: `scripts/lib/faq-partial.test.ts`

**Interfaces:**

- Consumes: `FaqSnapshot` from Task 4; `faqPages`, `partialPathFor`, `snapshotPathFor` from Task 1; `generatedMarker`, `writeOrCheck`, `StaleFileError`, `isCheckMode`, `runScript` from `scripts/lib/generated-partial.ts`; `diffSummary` from `scripts/lib/line-diff.ts`.
- Produces: `FAQ_MARKER: string`, `MDX_FORMAT: PrettierOptions`, `buildPartial(snapshot: FaqSnapshot): string`, `readSnapshot(path: string): FaqSnapshot`, `generateFaq(opts: { check: boolean; root: string; pages?: readonly FaqPage[] }): Promise<void>`.

- [ ] **Step 1: Write the failing tests**

Create `scripts/lib/faq-partial.test.ts`:

```ts
/**
 * The partial builder and the generator's write/check paths. The generator runs against a
 * temporary root so the test never touches the committed partials.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';

import { FAQ_MARKER, buildPartial, generateFaq, readSnapshot } from './faq-partial.ts';
import type { FaqSnapshot } from './faq-snapshot.ts';
import { StaleFileError } from './generated-partial.ts';

const snapshot: FaqSnapshot = {
  source: 'https://www.notion.so/db',
  items: [
    { id: 'a', question: 'First?', answer: 'One.' },
    { id: 'b', question: 'Second?', answer: '- x\n- y' },
  ],
};

describe('buildPartial', () => {
  it('opens with the marker and renders each item as a level-3 heading', () => {
    assert.equal(buildPartial(snapshot), `${FAQ_MARKER}\n\n### First?\n\nOne.\n\n### Second?\n\n- x\n- y\n`);
  });

  it('escapes MDX-significant characters in the question', () => {
    const s: FaqSnapshot = { source: '', items: [{ id: 'a', question: 'Use <x> or {y}?', answer: 'z' }] };
    assert.match(buildPartial(s), /### Use \\<x\\> or \\{y\\}\?/);
  });
});

describe('generateFaq', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'faq-gen-'));
  after(() => fs.rmSync(root, { recursive: true, force: true }));
  const pages = [{ key: 'nodes', notionSlug: 'troubleshooting-running-nodes', page: 'run-a-node/faq' }] as const;

  it('writes the partial from the snapshot, then reports it current in check mode', async () => {
    fs.mkdirSync(path.join(root, 'content/faq'), { recursive: true });
    fs.writeFileSync(path.join(root, 'content/faq/nodes.json'), JSON.stringify(snapshot));
    await generateFaq({ check: false, root, pages });
    const written = fs.readFileSync(path.join(root, 'content/partials/_troubleshooting-nodes-partial.mdx'), 'utf8');
    assert.ok(written.startsWith(FAQ_MARKER));
    await generateFaq({ check: true, root, pages });
  });

  it('fails check mode when the partial was edited by hand', async () => {
    fs.appendFileSync(path.join(root, 'content/partials/_troubleshooting-nodes-partial.mdx'), '\nhand edit\n');
    await assert.rejects(generateFaq({ check: true, root, pages }), StaleFileError);
  });

  it('names the fetch command when a snapshot is missing', async () => {
    const other = [{ key: 'stylus', notionSlug: 's', page: 'p' }] as const;
    await assert.rejects(generateFaq({ check: false, root, pages: other }), /pnpm faq:fetch/);
  });

  it('readSnapshot rejects a file without items', () => {
    const bad = path.join(root, 'bad.json');
    fs.writeFileSync(bad, '{"source":"x"}');
    assert.throws(() => readSnapshot(bad), /items/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test scripts/lib/faq-partial.test.ts`
Expected: FAIL, cannot find module `./faq-partial.ts`.

- [ ] **Step 3: Write the builder and generator core**

Create `scripts/lib/faq-partial.ts`:

```ts
/**
 * faq-partial: build a troubleshooting partial from a FAQ snapshot, and the generator core that
 * `scripts/generate-faq.ts` wraps. Reads snapshots and writes partials; no network.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Options as PrettierOptions } from 'prettier';

import { type FaqPage, faqPages, partialPathFor, snapshotPathFor } from '../../lib/faq-pages.ts';
import type { FaqSnapshot } from './faq-snapshot.ts';
import { StaleFileError, generatedMarker, writeOrCheck } from './generated-partial.ts';
import { diffSummary } from './line-diff.ts';
import { escapeMdxText } from './notion-mdx.ts';

export const FAQ_MARKER = generatedMarker('pnpm faq:generate', 'a faq:fetch');

/** Same options as the other MDX generators: Prettier must not rewrap the answers. */
export const MDX_FORMAT: PrettierOptions = {
  parser: 'mdx',
  printWidth: 9999,
  proseWrap: 'preserve',
  plugins: [],
};

export function buildPartial(snapshot: FaqSnapshot): string {
  const sections = snapshot.items.map((item) => `### ${escapeMdxText(item.question)}\n\n${item.answer.trim()}\n`);
  return [`${FAQ_MARKER}\n`, ...sections].join('\n');
}

export function readSnapshot(filePath: string): FaqSnapshot {
  const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (typeof parsed !== 'object' || parsed === null || !Array.isArray((parsed as { items?: unknown }).items)) {
    throw new Error(`${filePath}: not a FAQ snapshot (no items array)`);
  }
  return parsed as FaqSnapshot;
}

export async function generateFaq({ check, root, pages = faqPages }: { check: boolean; root: string; pages?: readonly FaqPage[] }): Promise<void> {
  for (const page of pages) {
    const snapshotPath = path.join(root, snapshotPathFor(page.key));
    if (!fs.existsSync(snapshotPath)) {
      throw new Error(`${snapshotPathFor(page.key)} is missing. Run \`pnpm faq:fetch\` first.`);
    }
    const partialPath = path.join(root, partialPathFor(page.key));
    const content = buildPartial(readSnapshot(snapshotPath));
    try {
      await writeOrCheck(partialPath, content, { check, overrides: MDX_FORMAT });
    } catch (error) {
      if (error instanceof StaleFileError && error.formatted !== undefined) {
        const current = fs.existsSync(partialPath) ? fs.readFileSync(partialPath, 'utf-8') : '';
        console.error(diffSummary(current, error.formatted));
      }
      throw error;
    }
  }
}
```

- [ ] **Step 4: Write the runner**

Create `scripts/generate-faq.ts`:

```ts
/**
 * generate-faq: write the six FAQ partials from the committed Notion snapshots.
 *
 * Usage:
 *   pnpm faq:generate          # write content/partials/_troubleshooting-*-partial.mdx
 *   pnpm faq:check             # exit 1, with a diff summary, when a partial is stale
 *
 * Offline. The snapshots under content/faq/ are written by `pnpm faq:fetch`, which is the only
 * step that talks to Notion. This runner is wiring over `scripts/lib/faq-partial.ts`.
 */
import { generateFaq } from './lib/faq-partial.ts';
import { isCheckMode, runScript } from './lib/generated-partial.ts';

async function main(): Promise<void> {
  const check = isCheckMode();
  await generateFaq({ check, root: process.cwd() });
  console.log(check ? 'faq partials: up to date.' : 'faq partials: generated.');
}

runScript(main);
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test scripts/lib/faq-partial.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 6: Confirm the runner fails cleanly without snapshots, then commit**

Run: `pnpm faq:check`
Expected: exit 1 with `content/faq/users.json is missing. Run \`pnpm faq:fetch\` first.`

```bash
git add scripts/lib/faq-partial.ts scripts/lib/faq-partial.test.ts scripts/generate-faq.ts
git commit -m "Add the offline FAQ partial generator with a check mode"
```

---

### Task 6: Link validation and the fetch runner

**Files:**

- Create: `scripts/lib/faq-links.ts`, `scripts/faq-fetch.ts`
- Test: `scripts/lib/faq-links.test.ts`

**Interfaces:**

- Consumes: `extractRefs`, `resolveRefToFile`, `resolvesToPublicAsset`, `splitSuffix`, `buildIndex`, `RefResolutionIndex` from `scripts/lib/doc-links.ts`; `rowFromPage`, `groupRows`, `buildSnapshot`, `FaqRow` from Task 4; `renderAnswer`, `RenderError`, `NotionBlock` from Task 3; `faqDataSourceId`, `snapshotPathFor` from Task 1; `writeOrCheck`, `runScript` from `scripts/lib/generated-partial.ts`.
- Produces: `findUnresolvedLinks(answer: string, index: RefResolutionIndex, repoRoot: string): string[]`.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/faq-links.test.ts`:

````ts
/**
 * Site-relative links in a rendered answer must point at a real page. A fake index stands in for
 * `buildIndex`, so the test is offline and independent of the content tree.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { findUnresolvedLinks } from './faq-links.ts';

const index = {
  byAbs: new Set<string>(),
  urlByAbs: new Map<string, string>(),
  byUrl: new Map([['/docs/run-a-node/faq', '/repo/content/docs/run-a-node/faq.mdx']]),
};

describe('findUnresolvedLinks', () => {
  it('returns only the site-relative links that do not resolve', () => {
    const answer = 'See [a](/docs/run-a-node/faq), [b](/docs/missing#x), [c](https://x.y), [d](/docs/run-a-node/faq#frag).';
    assert.deepEqual(findUnresolvedLinks(answer, index, '/repo'), ['/docs/missing#x']);
  });

  it('ignores links inside code', () => {
    const answer = 'Run `curl /docs/nope` and:\n\n```bash\ncurl /docs/nope\n```';
    assert.deepEqual(findUnresolvedLinks(answer, index, '/repo'), []);
  });
});
````

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/lib/faq-links.test.ts`
Expected: FAIL, cannot find module `./faq-links.ts`.

- [ ] **Step 3: Write the link checker**

Create `scripts/lib/faq-links.ts`:

```ts
/**
 * faq-links: find site-relative links in a rendered FAQ answer that resolve to no page.
 *
 * `check-links` only runs over `content/docs`, and a broken link in a snapshot would otherwise
 * surface one PR later. This reuses the same extraction and resolution so the two agree.
 */
import { type RefResolutionIndex, extractRefs, resolveRefToFile, resolvesToPublicAsset, splitSuffix } from './doc-links.ts';

export function findUnresolvedLinks(answer: string, index: RefResolutionIndex, repoRoot: string): string[] {
  const unresolved: string[] = [];
  for (const ref of extractRefs(answer)) {
    const { pathPart } = splitSuffix(ref.rawUrl);
    if (!pathPart.startsWith('/')) continue;
    if (resolveRefToFile(ref.rawUrl, null, index)) continue;
    if (resolvesToPublicAsset(pathPart, repoRoot)) continue;
    unresolved.push(ref.rawUrl);
  }
  return unresolved;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test scripts/lib/faq-links.test.ts`
Expected: PASS, 2 tests. If `extractRefs` reports links inside fenced code, read `scripts/lib/doc-links.ts:225` and confirm it masks code with `maskRegions` before matching; it does on this branch.

- [ ] **Step 5: Write the fetch runner**

Create `scripts/faq-fetch.ts`:

```ts
/**
 * faq-fetch: read the publishable FAQ rows from the Notion "FAQ CMS" database and write one
 * snapshot per docs page to content/faq/<key>.json.
 *
 * Usage:
 *   pnpm faq:fetch             # needs NOTION_TOKEN in the environment or in .env
 *
 * This is the only step that talks to Notion. It never writes a partial; run `pnpm faq:generate`
 * afterwards. Every question that cannot be rendered is reported with its Notion URL, and the
 * run exits 1 after reporting all of them. A run with no content change writes nothing.
 */
import { Client, collectPaginatedAPI, isFullBlock, isFullPage } from '@notionhq/client';
import fs from 'node:fs';
import path from 'node:path';

import { faqDataSourceId, snapshotPathFor } from '../lib/faq-pages.ts';
import { buildIndex } from './lib/doc-links.ts';
import { findUnresolvedLinks } from './lib/faq-links.ts';
import { type FaqRow, buildSnapshot, groupRows, rowFromPage } from './lib/faq-snapshot.ts';
import { runScript, writeOrCheck } from './lib/generated-partial.ts';
import { type NotionBlock, RenderError, renderAnswer } from './lib/notion-mdx.ts';

function loadToken(): string {
  if (!process.env.NOTION_TOKEN && fs.existsSync('.env')) process.loadEnvFile('.env');
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN is not set. Put it in the environment or in .env.');
  return token;
}

async function queryRows(client: Client): Promise<FaqRow[]> {
  const rows: FaqRow[] = [];
  let cursor: string | undefined;
  do {
    const page = await client.dataSources.query({
      data_source_id: faqDataSourceId,
      ...(cursor ? { start_cursor: cursor } : {}),
      filter: {
        and: [
          { property: 'Publishable?', select: { equals: 'Publishable' } },
          { property: 'Status', status: { equals: '4 - Continuously publishing' } },
        ],
      },
    });
    if (page.request_status?.type === 'incomplete') {
      throw new Error(`Notion returned an incomplete result: ${page.request_status.incomplete_reason}`);
    }
    for (const result of page.results) {
      if (isFullPage(result)) rows.push(rowFromPage(result));
    }
    cursor = page.has_more && page.next_cursor ? page.next_cursor : undefined;
  } while (cursor);
  return rows;
}

async function fetchBlocks(client: Client, blockId: string): Promise<NotionBlock[]> {
  const blocks = await collectPaginatedAPI(client.blocks.children.list, { block_id: blockId });
  const out: NotionBlock[] = [];
  for (const b of blocks) {
    if (!isFullBlock(b)) continue;
    const node = b as unknown as NotionBlock;
    if (b.has_children) node.children = await fetchBlocks(client, b.id);
    out.push(node);
  }
  return out;
}

async function main(): Promise<void> {
  const client = new Client({ auth: loadToken(), maxRetries: 3 });
  const index = buildIndex(process.cwd());

  const groups = groupRows(await queryRows(client));
  const answers = new Map<string, string>();
  const errors: string[] = [];

  const uniqueRows = new Map<string, FaqRow>();
  for (const group of groups.values()) for (const row of group) uniqueRows.set(row.id, row);

  for (const row of uniqueRows.values()) {
    try {
      const answer = renderAnswer(await fetchBlocks(client, row.id), row.shortAnswer);
      for (const url of findUnresolvedLinks(answer, index, process.cwd())) {
        errors.push(`${row.url}  "${row.question}": link does not resolve: ${url}`);
      }
      answers.set(row.id, answer);
    } catch (error) {
      if (!(error instanceof RenderError)) throw error;
      errors.push(`${row.url}  "${row.question}": ${error.message}`);
    }
  }

  if (errors.length > 0) {
    console.error(`faq-fetch: ${errors.length} question(s) cannot be published:`);
    for (const line of errors) console.error(`  ${line}`);
    process.exit(1);
  }

  let written = 0;
  for (const [key, rows] of groups) {
    const snapshot = buildSnapshot(rows, answers);
    const changed = await writeOrCheck(path.join(process.cwd(), snapshotPathFor(key)), JSON.stringify(snapshot, null, 2) + '\n', { check: false });
    if (changed) written++;
  }
  console.log(`faq-fetch: ${uniqueRows.size} question(s) across ${groups.size} page(s); ${written} snapshot(s) changed.`);
}

runScript(main);
```

- [ ] **Step 6: Type-check, then run the fetch for real**

Run: `pnpm types:check`
Expected: exit 0. If `tsc` rejects `client.dataSources.query` or `isFullPage`, read `node_modules/@notionhq/client/build/src/Client.d.ts` and `helpers.d.ts` for the exact names; both exist in 5.27.0.

Run: `pnpm faq:fetch`
Expected: either six `wrote content/faq/<key>.json` lines and a summary, or a list of questions that cannot be published. A link failure here is the signal for the migration in Task 7, not a bug in the script. Do not commit yet.

- [ ] **Step 7: Commit the code only**

```bash
git add scripts/lib/faq-links.ts scripts/lib/faq-links.test.ts scripts/faq-fetch.ts
git commit -m "Fetch publishable FAQ rows from Notion into per-page snapshots"
```

---

### Task 7: Migrate the six partials to generated output

This task has a person in the loop. The executor prepares the classified diff; Gael edits Notion; the executor finishes.

**Files:**

- Create: `content/faq/*.json` (six)
- Modify: `content/partials/_troubleshooting-*-partial.mdx` (six, overwritten)

- [ ] **Step 1: Fetch and generate without committing**

```bash
pnpm faq:fetch && pnpm faq:generate
git diff --stat content/partials/
```

If `faq:fetch` reports questions that cannot be published, record each line in the report below. The two usual reasons are a Notion URL in an answer and a link to an old Docusaurus path. Both are fixed in Notion.

- [ ] **Step 2: Produce the classified diff report**

For each of the six partials, run `git diff content/partials/_troubleshooting-<key>-partial.mdx` and sort every hunk into one of four kinds:

1. Link prefix only (`/x` became `/docs/x`): no action.
2. Variable placeholder resolved to a literal (`@@l2BlockTimeMs=250@@` became `250`): no action.
3. Prose differs: list the question, which side is newer (compare the `Last edited` of the Notion row with `git log -1 --format=%ad -- <partial>`), and the repo text if the repo is newer.
4. Question present in the repo and absent from Notion: list it with its full answer.

Also diff the bridging and users partials against master:

```bash
git diff origin/master:docs/partials/_troubleshooting-bridging-partial.mdx -- content/partials/_troubleshooting-bridging-partial.mdx
git diff origin/master:docs/partials/_troubleshooting-users-partial.mdx -- content/partials/_troubleshooting-users-partial.mdx
```

Known in advance: the bridging partial has one kind-4 item, "What's the difference between USDC and USDC.e on Arbitrum One?". Write the report to `.claude/docs/superpowers/plans/2026-09-30-faq-migration-report.md` and stop. Hand the report to Gael.

- [ ] **Step 3: Gael edits Notion**

For every kind-3 item where the repo is newer, paste the repo wording into the Notion page body. For the kind-4 item, create a page in the FAQ database with the repo answer as the body and these properties: `Publishable? = Publishable`, `Status = 4 - Continuously publishing`, `Target document slugs = troubleshooting-bridging`, `FAQ order index = 55`.

- [ ] **Step 4: Re-run until only kinds 1 and 2 remain**

```bash
pnpm faq:fetch && pnpm faq:generate && git diff content/partials/
```

Expected: every remaining hunk is a link prefix or a resolved literal.

- [ ] **Step 5: Run the gates that read the partials**

```bash
pnpm faq:check && pnpm content:lint && pnpm check-links && pnpm vars:check && pnpm references:check && pnpm format:check
```

Expected: all exit 0. A `format:check` failure on `content/faq/*.json` means Prettier disagrees with `JSON.stringify` output; fix by running `pnpm format` once and confirming `pnpm faq:fetch` then writes nothing (the generator compares formatted text).

- [ ] **Step 6: Commit the migration**

```bash
git add content/faq/ content/partials/_troubleshooting-*-partial.mdx
git commit -m "Generate the six FAQ partials from Notion snapshots"
```

---

### Task 8: The CI gate

**Files:**

- Modify: `.github/workflows/ci.yml` (after the `contracts:check` step)

- [ ] **Step 1: Add the step**

In `.github/workflows/ci.yml`, after the step named `Contract address reference is current`, add:

```yaml
- name: FAQ partials match their Notion snapshots
  run: pnpm faq:check
```

- [ ] **Step 2: Lint the workflow and run the gate locally**

```bash
actionlint .github/workflows/ci.yml && zizmor .github/workflows/ci.yml && pnpm faq:check
```

Expected: actionlint and zizmor print nothing new; `faq:check` prints `faq partials: up to date.`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "Gate CI on the FAQ partials matching their snapshots"
```

---

### Task 9: The weekly refresh workflow

**Files:**

- Create: `.github/workflows/faq-refresh.yml`

- [ ] **Step 1: Write the workflow**

Copy the action pins from `.github/workflows/upstream-refresh.yml` verbatim. Create `.github/workflows/faq-refresh.yml`:

```yaml
name: FAQ refresh

# Re-reads the publishable FAQ rows from the Notion "FAQ CMS" database and opens a PR when a
# snapshot or a generated partial changed. Nothing is opened when the tree is clean. The PR
# gets no CI run of its own (it is opened with GITHUB_TOKEN), so the reviewer runs the gates
# locally. NOTION_TOKEN reaches only this workflow; the CI gates and the build never see it.

on:
  schedule:
    - cron: '0 8 * * 1' # Mondays, 08:00 UTC
  workflow_dispatch:

concurrency:
  group: faq-refresh
  cancel-in-progress: false

permissions:
  contents: read # default for any job that does not narrow it

jobs:
  refresh:
    name: Refresh the FAQ snapshots and partials
    runs-on: ubuntu-latest
    permissions:
      contents: write # push the automated/faq-refresh branch; never writes to main
      pull-requests: write # open the PR for that branch
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false

      - uses: pnpm/action-setup@0977fd99725f1db4007ccb2928dbb4e90d06cc86 # v6.0.10

      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Fetch the publishable FAQ rows from Notion
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
        run: pnpm faq:fetch

      - name: Regenerate the FAQ partials
        run: pnpm faq:generate

      # zizmor: ignore[superfluous-actions]
      # zizmor suggests `gh pr create`, which would mean hand-rolling the branch/commit/push
      # plumbing and a "did anything change?" check. create-pull-request does all of that and
      # no-ops when the tree is clean, which is the normal outcome of a weekly run.
      - name: Open a pull request
        uses: peter-evans/create-pull-request@5f6978faf089d4d20b00c7766989d076bb2fc7f1 # v8.1.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          branch: automated/faq-refresh
          delete-branch: true
          commit-message: 'Refresh the FAQ partials from Notion'
          title: 'Refresh the FAQ partials from Notion'
          body: |
            Automated refresh of the six FAQ and troubleshooting partials from the Notion
            "FAQ CMS" database.

            What can change here:

            - `content/faq/*.json`: the snapshots, one per page; review these for content
            - `content/partials/_troubleshooting-*-partial.mdx`: regenerated from the snapshots

            This PR gets no CI run of its own. Before merging, run the gates locally:
            `pnpm faq:check && pnpm content:lint && pnpm check-links && pnpm format:check`.

            Generated by the `faq-refresh` workflow. Reproduce locally with
            `pnpm faq:fetch && pnpm faq:generate`.
```

- [ ] **Step 2: Lint**

```bash
actionlint .github/workflows/faq-refresh.yml && zizmor .github/workflows/faq-refresh.yml
```

Expected: no findings beyond the one ignored `superfluous-actions`.

- [ ] **Step 3: Commit, and note the admin step**

```bash
git add .github/workflows/faq-refresh.yml
git commit -m "Add the weekly FAQ refresh workflow"
```

The repository secret `NOTION_TOKEN` must exist before the first run. That is an admin action outside this plan; the PR description names it.

---

### Task 10: FAQPage JSON-LD

**Files:**

- Create: `lib/faq.ts`
- Modify: `app/docs/[[...slug]]/page.tsx` (the `Page` component)
- Test: `scripts/lib/faq-jsonld.test.ts`

**Interfaces:**

- Consumes: `faqPages` from Task 1; the six `content/faq/*.json` files from Task 7.
- Produces: `stripMarkdown(md: string): string`, `faqJsonLd(slugs: readonly string[] | undefined): FaqPageJsonLd | undefined`.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/faq-jsonld.test.ts`:

````ts
/**
 * The FAQPage structured data emitted on the six FAQ pages. `stripMarkdown` is pinned on the
 * constructs the renderer produces; `faqJsonLd` is checked against the committed snapshots.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { faqJsonLd, stripMarkdown } from '../../lib/faq.ts';

describe('stripMarkdown', () => {
  it('keeps text, drops markup', () => {
    const md = ['#### Head', '', 'Use **bold**, _it_, `code`, [label](/docs/x) and \\<esc>.', '', '- a', '1. b', '', '```bash', 'run me', '```', '', '<Callout type="info">', '', 'note', '', '</Callout>', '', '| h |', '| --- |', '| c |'].join('\n');
    assert.equal(stripMarkdown(md), 'Head Use bold, it, code, label and <esc>. a b run me note h c');
  });
});

describe('faqJsonLd', () => {
  it('returns FAQPage data for a mapped page and nothing for any other', () => {
    const data = faqJsonLd(['run-a-node', 'faq']);
    assert.equal(data?.['@type'], 'FAQPage');
    assert.ok((data?.mainEntity.length ?? 0) > 0);
    assert.equal(data?.mainEntity[0]?.['@type'], 'Question');
    assert.equal(data?.mainEntity[0]?.acceptedAnswer['@type'], 'Answer');
    assert.equal(faqJsonLd(['run-a-node', 'overview']), undefined);
    assert.equal(faqJsonLd(undefined), undefined);
  });
});
````

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/lib/faq-jsonld.test.ts`
Expected: FAIL, cannot find module `lib/faq.ts`.

- [ ] **Step 3: Write the module**

Create `lib/faq.ts`:

````ts
/**
 * FAQPage structured data for the six pages whose body comes from Notion.
 *
 * Reads the same snapshots the partials are generated from, so the visible Q&A and the JSON-LD
 * cannot disagree. Imported by the docs page renderer; imports nothing from `lib/source`.
 */
import arbitrumChain from '../content/faq/arbitrum-chain.json' with { type: 'json' };
import bridging from '../content/faq/bridging.json' with { type: 'json' };
import building from '../content/faq/building.json' with { type: 'json' };
import nodes from '../content/faq/nodes.json' with { type: 'json' };
import stylus from '../content/faq/stylus.json' with { type: 'json' };
import users from '../content/faq/users.json' with { type: 'json' };
import { type FaqKey, faqPages } from './faq-pages.ts';

interface Snapshot {
  items: { id: string; question: string; answer: string }[];
}

const snapshots: Record<FaqKey, Snapshot> = {
  'arbitrum-chain': arbitrumChain,
  bridging,
  building,
  nodes,
  stylus,
  users,
};

export interface FaqPageJsonLd {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  'mainEntity': {
    '@type': 'Question';
    'name': string;
    'acceptedAnswer': { '@type': 'Answer'; 'text': string };
  }[];
}

/** Markdown and the MDX the renderer emits, reduced to one line of plain text. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/^```[^\n]*\n([\s\S]*?)^```\s*$/gm, '$1')
    .replace(/<\/?Callout[^>]*>/g, '')
    .replace(/^\|\s*-{3,}(\s*\|\s*-{3,})*\s*\|\s*$/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*(?:[-*]|\d+\.)\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|~~)(.*?)\1/g, '$2')
    .replace(/(^|[^\\])[*_](.*?)[*_]/g, '$1$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\\([\\`*_{}[\]<~|])/g, '$1')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const keyByPage = new Map(faqPages.map((p) => [p.page, p.key]));

export function faqJsonLd(slugs: readonly string[] | undefined): FaqPageJsonLd | undefined {
  if (!slugs) return undefined;
  const key = keyByPage.get(slugs.join('/'));
  if (!key) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': snapshots[key].items.map((item) => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': { '@type': 'Answer', 'text': stripMarkdown(item.answer) },
    })),
  };
}
````

- [ ] **Step 4: Run the test, then adjust `stripMarkdown` only if an assertion names a construct it missed**

Run: `node --test scripts/lib/faq-jsonld.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Emit the script from the page**

In `app/docs/[[...slug]]/page.tsx`, add the import beside the other `@/lib` imports:

```ts
import { faqJsonLd } from '@/lib/faq';
```

In `Page`, after `const markdownUrl = …;`, add:

```ts
const jsonLd = faqJsonLd(page.slugs);
```

Inside the returned `<DocsPage …>`, before `<DocsTitle …>`, add:

```tsx
{
  jsonLd ? (
    <script
      type="application/ld+json"
      // `<` is escaped so a `</script>` inside an answer cannot end the element early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  ) : null;
}
```

- [ ] **Step 6: Verify in the real app**

```bash
pnpm types:check
```

Expected: exit 0. Then start the dev server and read one page:

```bash
pnpm dev &
sleep 15
curl -s http://localhost:3000/docs/run-a-node/faq | grep -o '<script type="application/ld+json">[^<]*' | head -c 300
curl -s http://localhost:3000/docs/run-a-node/overview | grep -c 'application/ld+json'
kill %1
```

Expected: the first prints the start of a `FAQPage` object; the second prints `0`.

- [ ] **Step 7: Commit**

```bash
git add lib/faq.ts scripts/lib/faq-jsonld.test.ts 'app/docs/[[...slug]]/page.tsx'
git commit -m "Emit FAQPage JSON-LD on the six Notion-backed FAQ pages"
```

---

### Task 11: Documentation

**Files:**

- Modify: `INTERNALS.md`, `CLAUDE.md`, `README.md`

- [ ] **Step 1: INTERNALS.md, the gates table**

Under `## The gates`, after the `contracts:check` row, add:

```markdown
| `faq:check` | The six FAQ partials match their `content/faq/*.json` snapshots |
```

- [ ] **Step 2: INTERNALS.md, the hand-run tools table**

Under `### Hand-run tools`, after the `contracts:generate` row, add:

```markdown
| `pnpm faq:fetch` | The FAQ snapshots in `content/faq/` from the Notion "FAQ CMS" database (needs `NOTION_TOKEN`) |
| `pnpm faq:generate` / `:check` | The six `_troubleshooting-*-partial.mdx` partials from the snapshots; offline |
```

- [ ] **Step 3: INTERNALS.md, the workflows paragraph**

After the sentence ending `run the gates locally.` in the paragraph that describes `upstream-refresh.yml` and `nitro-bump.yml`, append a new paragraph:

```markdown
`faq-refresh.yml` runs `faq:fetch` and `faq:generate` every Monday at 08:00 UTC with the
`NOTION_TOKEN` repository secret, and opens `automated/faq-refresh` as a PR when a snapshot or a
partial changed. It is the only place the token is used; `faq:check` in CI is offline.
```

- [ ] **Step 4: INTERNALS.md, the generated pages list**

Under `### Generated pages`, add a third bullet after the Stylus one:

```markdown
- **`content/partials/_troubleshooting-{users,nodes,building,bridging,arbitrum-chain,stylus}-partial.mdx`**
  are written by `pnpm faq:generate` from `content/faq/<key>.json`, which `pnpm faq:fetch` reads
  from the Notion "FAQ CMS" database: rows that are `Publishable` and `4 - Continuously
publishing`, routed by `Target document slugs` and ordered by `FAQ order index`. The mapping is
  `lib/faq-pages.ts`. Edit a question in Notion, never in the partial; `faq:check` fails on a hand
  edit. Answers carry literal values, no `<Var>`, and no `<Term>`. A block the renderer does not
  support, a Notion link, or a link to no page fails the fetch and names the Notion page. The same
  snapshots feed the `FAQPage` JSON-LD that `lib/faq.ts` emits on those six pages.
```

- [ ] **Step 5: CLAUDE.md**

In the `## Commands` block, after the `pnpm contracts:check` line, add:

```bash
pnpm faq:check         # the six FAQ partials match content/faq/*.json
```

In the `# By hand only` group, after `pnpm edge-challenge:fetch`, add:

```bash
pnpm faq:fetch                         # FAQ snapshots from Notion (NOTION_TOKEN); then faq:generate
pnpm faq:generate                      # the six FAQ partials from the snapshots (:check compares)
```

In the sentence that begins `CI (`.github/workflows/ci.yml`) runs the gates`, after the `upstream-refresh.yml` sentence, add: `` `faq-refresh.yml` does the same on Mondays for the Notion FAQ snapshots. ``

In `## Where things live`, the **Generated pages** bullet, append: ``The six `content/partials/_troubleshooting-*-partial.mdx` come from `content/faq/*.json`; edit them in Notion.``

- [ ] **Step 6: README.md**

In the `## Before you push` block, after `pnpm content:lint`, add:

```bash
pnpm faq:check     # the FAQ partials match their Notion snapshots
```

In the full command list near line 270, after `pnpm contracts:check`, add:

```bash
pnpm faq:check           # the six FAQ partials match content/faq/*.json
```

- [ ] **Step 7: Format and commit**

```bash
pnpm exec prettier --write INTERNALS.md CLAUDE.md README.md && pnpm format:check
git add INTERNALS.md CLAUDE.md README.md
git commit -m "Document the Notion FAQ import"
```

---

### Task 12: Whole-branch verification

- [ ] **Step 1: Run every gate**

```bash
pnpm types:check && pnpm test && pnpm vars:check && pnpm references:check && pnpm contracts:check && pnpm faq:check && pnpm check-links && pnpm content:lint && pnpm format:check
```

Expected: every command exits 0.

- [ ] **Step 2: Production build**

The shell exports `NODE_ENV=development`, which breaks `next build` locally, and a production build needs the site URL:

```bash
NODE_ENV=production NEXT_PUBLIC_SITE_URL=https://docs.arbitrum.io pnpm build
```

Expected: exit 0.

- [ ] **Step 3: Open the six pages**

Start `pnpm dev` and open each on `http://localhost:3000` (not `127.0.0.1`): `/docs/get-started/faq`, `/docs/run-a-node/faq`, `/docs/build-decentralized-apps/troubleshooting-building`, `/docs/arbitrum-bridge/troubleshooting`, `/docs/launch-arbitrum-chain/overview/faq`, `/docs/stylus/troubleshooting-building-stylus`. Each must show its questions as headings in the table of contents and render every code block and callout.

- [ ] **Step 4: Hand off**

Do not push. Report the commit list, the migration report path, and the one admin prerequisite (`NOTION_TOKEN` secret) to Gael, who decides on the push and the PR.
