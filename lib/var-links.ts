/**
 * var-links: expand `{var:name}` placeholders in link destinations and JSX URL attributes.
 *
 * `<Var>` cannot be used in a link destination (a CommonMark destination may not hold a space, so
 * the link never parses) or in an `href`/`to`/`src` attribute (its quotes close the value early);
 * `content:lint` rule `var-in-link` reports the tag and names this placeholder as the fix. The
 * `var:` prefix keeps a placeholder distinct from a path template like `…/{chainId}/…`, so
 * `vars:check` can be strict about an unknown name; the plugin leaves one in place rather than
 * throwing, so a typo reaches the page visibly instead of taking the site down. Import-free apart
 * from `node:fs`, so scripts import it under `node --test`; node types are local because the
 * `mdast` type packages are transitive dependencies only.
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

/** A `{var:name}` placeholder; the name is an identifier, so plain braces in a URL stay put. */
export const VAR_PLACEHOLDER: RegExp = /\{var:([A-Za-z_]\w*)\}/g;

/** Opens like a placeholder but the name is not an identifier; `content:lint` reports it. */
export const MALFORMED_VAR_PLACEHOLDER: RegExp = /\{var:(?![A-Za-z_]\w*\})[^}\n]*\}/g;

/** Every placeholder name in a string, in source order, with duplicates kept. */
export function varPlaceholderNames(source: unknown): string[] {
  return [...String(source).matchAll(VAR_PLACEHOLDER)].map((m) => m[1]);
}

/** Substitute every placeholder `vars` holds; an unknown name and a non-string pass through. */
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

/** JSX attributes that carry a URL. */
const URL_ATTRIBUTES: ReadonlySet<string> = new Set(['href', 'to', 'src']);

/**
 * The remark plugin. Rewrites the url and title of a `link`, `image` or `definition` node and the
 * URL attributes of a JSX element. `image` only helps a remote src: Fumadocs runs remark-image
 * first, and a local src is already an import of the written path by the time this runs.
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
 * Read `content/vars.json` off disk, resolved from this file since `source.config.ts` and
 * `check-links` run from different places. `content/vars.ts`'s bare JSON import fails under Node.
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
