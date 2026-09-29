/**
 * llms-index: reshape Fumadocs' `llms(source).index()` into the `/llms.txt` master published.
 *
 * Master's index opened with `# Arbitrum Documentation` and a `>` summary, and linked each page's
 * markdown mirror. Fumadocs names the root "Documentation", has no summary, links the HTML pages,
 * and lists a page once per sidebar entry, so a page linked from two sections appears twice.
 *
 * Import-free, so scripts import it under `node --test`.
 */

export const LLMS_TITLE = 'Arbitrum Documentation';

/** Master's summary line, word for word. */
export const LLMS_SUMMARY =
  'Official documentation for the Arbitrum ecosystem: building apps, bridging tokens, running ' +
  'nodes, launching Arbitrum chains, and developing with Stylus.';

/** `](/docs/x)` or `](/docs)`, optionally with a fragment. */
const DOCS_LINK = /\]\((\/docs(?:\/[^)#\s]*)?)(#[^)\s]*)?\)/g;

/** A list line that links a page: `- [Title](/docs/x.md)…`, any indent. */
const PAGE_ITEM = /^\s*- \[[^\]]*\]\(([^)]+)\)/;

export function formatLlmsIndex(raw: string): string {
  const lines = raw.split('\n');
  const body = lines[0]?.startsWith('# ') ? lines.slice(1) : lines;
  // Drop a summary Fumadocs may have written, so there is exactly one.
  while (body[0] !== undefined && (body[0].trim() === '' || body[0].startsWith('> '))) body.shift();

  const seen = new Set<string>();
  const kept: string[] = [];
  for (const line of body) {
    const linked = line.replace(
      DOCS_LINK,
      (_whole, path: string) => `](${path.replace(/\/+$/, '')}.md)`,
    );
    const url = PAGE_ITEM.exec(linked)?.[1];
    if (url !== undefined) {
      if (seen.has(url)) continue;
      seen.add(url);
    }
    kept.push(linked);
  }
  return [`# ${LLMS_TITLE}`, '', `> ${LLMS_SUMMARY}`, '', ...kept].join('\n');
}
