/**
 * var-links: expand `{var:name}` placeholders inside markdown link destinations.
 *
 * `<Var name="…" />` cannot be used in a link destination, and the failure is silent. CommonMark
 * reads an unbracketed destination as one raw token that may not contain a space, so
 * `[Interface](https://github.com/OffchainLabs/<Var name="nitroRepositorySlug" />/blob/…)` fails to
 * parse as a link at all: the reader is served the literal `[Interface](…)` brackets, with only the
 * bare URL prefix before the first `<Var>` autolinked by GFM. Nothing caught it: `vars:check` only
 * proves the key exists, `check-links` skips external destinations, and `content:lint` rule A6 reads
 * code fences and spans. Seventy-three links across five pages shipped that way (FS-2725).
 *
 * The placeholder form parses, because it holds no space:
 *
 *   [Interface](https://github.com/OffchainLabs/{var:nitroRepositorySlug}/blob/{var:nitroVersionTag}/x.go)
 *
 * The braces survive verbatim in the mdast `link` node's `url`, and this plugin substitutes them.
 * Several placeholders in one destination are fine, which is what the precompiles table needs. The
 * same placeholder works in a JSX `href`, `to` or `src` attribute, where a `<Var>` tag is broken for
 * a different reason: its own quotes close the attribute value early.
 *
 * The `var:` prefix is not decoration. Without it a placeholder is indistinguishable from a URL that
 * documents a path template (`…/{chainId}/…`), and `vars:check` would have to choose between letting
 * a mistyped name ship silently and failing on a legitimate template. With it, an unknown name is
 * unambiguously a mistake, so the gate can be strict.
 *
 * An unknown name is left in place rather than thrown on, matching what `<Var>` does with one: the
 * defect reaches the page as visible nonsense and `pnpm vars:check` is the gate that fails on it.
 * Throwing here would take the whole site down for one typo, in a module that runs before any page.
 *
 * Deliberately import-free apart from `node:fs`, so `scripts/lib/var-links.test.ts` can import it
 * under `node --test` and exercise the real module rather than a copy. `scripts/lib/doc-links.ts`
 * imports it for the same reason `scripts/lib/doc-anchors.ts` imports `lib/mdx-options.ts`: a
 * checker has to resolve the URL the reader gets, not the one written in the file.
 *
 * The node types below are local and structural rather than imported from `mdast` and
 * `mdast-util-mdx-jsx`, because neither type package is resolvable from the repo root (they are
 * transitive dependencies only) and the plugin reads four fields. Every real mdast node the plugin
 * touches fits them.
 */
import { readFileSync } from 'node:fs';

/** Variable values keyed by name, as `content/vars.json` holds them. */
export type VarValues = Readonly<Record<string, unknown>>;

/** The slice of a JSX attribute node this plugin reads or writes. */
export interface VarLinksAttribute {
  type: string;
  name?: string;
  value?: unknown;
}

/** The slice of an mdast node this plugin reads or writes. */
export interface VarLinksNode {
  type: string;
  url?: string;
  title?: string | null;
  attributes?: VarLinksAttribute[];
  children?: VarLinksNode[];
}

export interface RemarkVarLinksOptions {
  /** Values to substitute. Defaults to `content/vars.json`, read once when the plugin attaches. */
  vars?: VarValues;
}

/**
 * A `{var:name}` placeholder. The name matches a JavaScript identifier, which is the shape every
 * key in `content/vars.json` has; anything else is not a placeholder and is left alone, so a URL
 * that happens to contain braces is never touched.
 */
export const VAR_PLACEHOLDER: RegExp = /\{var:([A-Za-z_]\w*)\}/g;

/**
 * Something that opens like a placeholder but whose name is not an identifier (`{var:}`,
 * `{var:two words}`). Reported by the gate rather than substituted, because silently leaving it
 * would put literal braces in a URL.
 */
export const MALFORMED_VAR_PLACEHOLDER: RegExp = /\{var:(?![A-Za-z_]\w*\})[^}\n]*\}/g;

/** Every placeholder name in a string, in source order, with duplicates kept. */
export function varPlaceholderNames(source: unknown): string[] {
  return [...String(source).matchAll(VAR_PLACEHOLDER)].map((m) => m[1]);
}

/**
 * Substitute every resolvable placeholder in `url`. `vars` is any object keyed by variable name;
 * a name it does not hold is left as written. Anything that is not a string passes straight through,
 * so a node's absent `title` stays absent.
 */
export function expandVarPlaceholders<T>(url: T, vars: VarValues): T | string {
  if (typeof url !== 'string' || !url.includes('{var:')) return url;
  return url.replace(VAR_PLACEHOLDER, (whole: string, name: string) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : whole,
  );
}

/** Depth-first walk over an mdast tree, visiting every node. */
function walkTree(node: VarLinksNode, visit: (node: VarLinksNode) => void): void {
  visit(node);
  for (const child of node?.children ?? []) walkTree(child, visit);
}

/**
 * JSX attributes that carry a URL. A `<Var>` inside one of these is broken for a second reason: the
 * tag's own `name="…"` quotes close the attribute value early and truncate the URL. So the
 * placeholder has to work here too, or `content:lint` rule A11 would have no fix to name for that
 * shape.
 */
const URL_ATTRIBUTES: ReadonlySet<string> = new Set(['href', 'to', 'src']);

/**
 * The remark plugin. Rewrites the url and the title of a `link`, `image` or `definition` node, and
 * the URL attributes of a JSX element.
 *
 * `definition` is included because a reference-style link (`[text][ref]`) keeps its destination in a
 * definition node, and a writer who reaches for one should not find the mechanism missing. The
 * `title` is the tooltip in `[text](url "title")`, where a `<Var>` tag is plain text and never
 * substitutes, so everything written inside one link's parentheses now behaves the same way.
 *
 * `image` covers the destination of `![alt](url)`, which otherwise reaches the reader as literal
 * `%7Bvar:name%7D`. It only helps a remote src. Fumadocs inserts this plugin after its own
 * remark-image, and for a *local* src that plugin has already turned the node into an import of the
 * written path, so a placeholder there fails the build on a file that does not exist rather than
 * expanding. Nothing silent survives either way, and a markdown image with a remote src is blocked
 * by `pnpm images:presence` regardless (see INTERNALS.md "Remote images are never fetched at
 * build").
 */
export function remarkVarLinks({ vars }: RemarkVarLinksOptions = {}): (tree: VarLinksNode) => void {
  const values = vars ?? readVars();
  return (tree) => {
    walkTree(tree, (node) => {
      if (node?.type === 'link' || node?.type === 'definition' || node?.type === 'image') {
        node.url = expandVarPlaceholders(node.url, values);
        node.title = expandVarPlaceholders(node.title, values);
        return;
      }
      if (node?.type !== 'mdxJsxFlowElement' && node?.type !== 'mdxJsxTextElement') return;
      for (const attr of node.attributes ?? []) {
        // Only a literal string value. An expression attribute (`href={…}`) is JavaScript the MDX
        // compiler owns, and rewriting inside it would be rewriting code.
        if (attr?.type !== 'mdxJsxAttribute' || typeof attr.value !== 'string') continue;
        if (attr.name === undefined || !URL_ATTRIBUTES.has(attr.name)) continue;
        attr.value = expandVarPlaceholders(attr.value, values);
      }
    });
  };
}

/**
 * Read `content/vars.json` off disk, resolved from this file rather than from the working
 * directory: the plugin is loaded by `source.config.ts` during a build and by `check-links`, which
 * run from different places.
 *
 * The JSON is read rather than `content/vars.ts` imported. This module is now TypeScript that Node
 * runs directly with its own type stripping, but the schema module still cannot be loaded that way:
 * it imports `./vars.json` with no `with { type: 'json' }` attribute, which Node rejects with
 * `ERR_IMPORT_ATTRIBUTE_MISSING`. The two cannot drift in the direction that matters: `varsSchema`
 * is a `z.strictObject`, so a JSON key absent from the schema throws at module load long before
 * anything renders.
 */
export function readVars(): Record<string, unknown> {
  const parsed: unknown = JSON.parse(
    readFileSync(new URL('../content/vars.json', import.meta.url), 'utf8'),
  );
  if (!isRecord(parsed)) throw new TypeError('content/vars.json is not a JSON object.');
  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
