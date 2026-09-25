import type { Root } from 'mdast';
import type { VFile } from 'vfile';

import { type VarKey, vars } from '@/content/vars';

/**
 * Resolve `@@varName@@` tokens inside Markdown link destinations against `content/vars.json`.
 *
 * Why a plugin and not `<Var>`: a Markdown link destination admits neither whitespace nor JSX, so
 * `[Interface](https://…/<Var name="nitroVersionTag" />/ArbSys.sol)` never parses as a link at all.
 * MDX renders the `[Interface](` as literal text and GFM autolinks the bare URL prefix, so the
 * reader sees a link followed by a raw URL in parentheses. Nothing caught this: `vars:check` saw a
 * resolvable `<Var>` name, and `check-links` only walks internal links.
 *
 * This restores what Docusaurus's `markdown-preprocessor.js` did with the same `@@varName@@` token —
 * plain-text substitution, except performed on the parsed URL rather than on the raw file, so a
 * token can never change how the document is parsed.
 *
 * Scope is deliberately narrow: link destinations only. `<Var>` stays the single way to render a
 * value in prose, so there is exactly one right answer for each job.
 */

/** Matches `@@name@@` and the legacy upstream `@@name=value@@`, keeping the name. */
const TOKEN = /@@([A-Za-z0-9_]+)(?:=[^@]*)?@@/g;

/**
 * mdast nodes carrying a URL we substitute into: inline `[x](url)` and `[label]: url` definitions.
 *
 * `image` is excluded on purpose. Doc images are repo-local paths under `/img/`, never var-driven,
 * and fumadocs' `remarkImage` reads every image URL at build time — giving it a token to resolve
 * before this plugin runs would be an ordering hazard for no benefit.
 */
const URL_NODES = new Set(['link', 'definition']);

function resolve(url: string, file: VFile): string {
  return url.replace(TOKEN, (_token, name: string) => {
    // A missing name would otherwise ship `undefined` into an href — a silently broken link on a
    // live page. Fail the render instead, the way `content/vars.ts` fails at module load.
    if (!(name in vars)) {
      throw new Error(
        `remark-var-urls: ${file.path ?? 'unknown file'}: no value in content/vars.json for ` +
          `"@@${name}@@" (in ${url}). Add the key, or fix the spelling.`,
      );
    }
    return String(vars[name as VarKey]);
  });
}

export function remarkVarUrls() {
  return (tree: Root, file: VFile) => {
    // A local walk rather than `unist-util-visit`, which is only a transitive dependency here and
    // would have to be promoted in package.json to be imported honestly.
    const walk = (node: unknown): void => {
      if (node === null || typeof node !== 'object') return;
      const n = node as { type?: string; url?: string; children?: unknown[] };
      if (typeof n.type === 'string' && URL_NODES.has(n.type) && typeof n.url === 'string') {
        n.url = resolve(n.url, file);
      }
      if (Array.isArray(n.children)) for (const child of n.children) walk(child);
    };
    walk(tree);
  };
}
