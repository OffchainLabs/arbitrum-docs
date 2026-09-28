/**
 * vars-audit: reconcile `<Var name="…">` and `{var:…}` usage in MDX against `content/vars.json`.
 *
 * `components/mdx/Var` renders `String(vars[name])`, so a name with no key in `vars.json` renders the
 * literal string `undefined` into the page. MDX is never type-checked, so `VarKey` constrains
 * nothing for the only call site that matters.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { MALFORMED_VAR_PLACEHOLDER, VAR_PLACEHOLDER } from '../../lib/var-links.ts';
import { toPosix, walk } from './partials.ts';

export const VARS_JSON: string = path.join('content', 'vars.json');
export const CONTENT_DIR = 'content';

/** One variable reference. `name` is `null` when it cannot be read statically. */
export interface VarUsage {
  line: number;
  name: string | null;
  /** The matched text, cut to 80 characters, for the report. */
  raw: string;
}

/** Where a named variable is used: repo-root-relative POSIX path and 1-indexed line. */
export interface UsageSite {
  rel: string;
  line: number;
}

/** A usage whose name could not be read statically. */
export interface DynamicUsage extends UsageSite {
  raw: string;
}

/** A name used in MDX that `vars` will not hold at render time. */
export interface UnresolvedVar {
  name: string;
  sites: UsageSite[];
}

export interface VarsAudit {
  jsonKeys: string[];
  usages: Map<string, UsageSite[]>;
  dynamic: DynamicUsage[];
  findings: {
    unresolved: UnresolvedVar[];
    unusedKeys: string[];
  };
}

const isMdx = (p: string): boolean => /\.mdx?$/i.test(p);

/**
 * Every variable reference in a source string, with 1-indexed line numbers.
 *
 * Two syntaxes, one audit. `<Var name="…" />` is the component. `{var:…}` is the placeholder a link
 * destination needs, because a `<Var>` tag holds a space and a space ends an unbracketed CommonMark
 * destination, so that form never parses as a link at all (`lib/var-links.ts` expands the
 * placeholder and `content:lint` rule A11 blocks the broken form). Both name a key that has to
 * resolve, and a placeholder naming a key that does not exist leaves literal braces in a URL, so
 * both belong here or the newer syntax would be the one thing this gate cannot see.
 *
 * A `{var:…}` whose name is not an identifier is reported as a dynamic (uncheckable) usage rather
 * than ignored: it is a placeholder that can never expand.
 */
export function parseVarUsages(source: string): VarUsage[] {
  const out: VarUsage[] = [];
  const lines = source.split('\n');
  for (const [i, line] of lines.entries()) {
    for (const m of line.matchAll(/<Var\b([^>]*)>/g)) {
      const attrs = m[1];
      const named = attrs.match(/\bname\s*=\s*["']([^"']+)["']/);
      out.push({ line: i + 1, name: named ? named[1] : null, raw: m[0].slice(0, 80) });
    }
    for (const m of line.matchAll(VAR_PLACEHOLDER)) {
      out.push({ line: i + 1, name: m[1], raw: m[0].slice(0, 80) });
    }
    for (const m of line.matchAll(MALFORMED_VAR_PLACEHOLDER)) {
      out.push({ line: i + 1, name: null, raw: m[0].slice(0, 80) });
    }
  }
  return out;
}

export function auditVars(repoRoot: string): VarsAudit {
  // Only the keys are read, so `JSON.parse`'s untyped result goes straight into `Object.keys`.
  const jsonKeys: string[] = Object.keys(
    JSON.parse(readFileSync(path.join(repoRoot, VARS_JSON), 'utf8')),
  );
  const jsonSet = new Set(jsonKeys);

  const usages = new Map<string, UsageSite[]>();
  const dynamic: DynamicUsage[] = [];
  for (const abs of walk(path.join(repoRoot, CONTENT_DIR), isMdx)) {
    const rel: string = toPosix(path.relative(repoRoot, abs));
    for (const u of parseVarUsages(readFileSync(abs, 'utf8'))) {
      if (u.name === null) {
        dynamic.push({ rel, line: u.line, raw: u.raw });
        continue;
      }
      const sites = usages.get(u.name);
      if (sites) sites.push({ rel, line: u.line });
      else usages.set(u.name, [{ rel, line: u.line }]);
    }
  }

  const unresolved: UnresolvedVar[] = [];
  for (const [name, sites] of usages) {
    if (!jsonSet.has(name)) unresolved.push({ name, sites });
  }
  unresolved.sort((a, b) => b.sites.length - a.sites.length || a.name.localeCompare(b.name));

  return {
    jsonKeys,
    usages,
    dynamic,
    findings: {
      // Renders the literal string "undefined" to readers. The reason this gate exists.
      unresolved,
      // Configured but never referenced. Informational only.
      unusedKeys: jsonKeys.filter((k) => !usages.has(k)),
    },
  };
}

/** Count of render-visible `undefined` strings this audit predicts. */
export function unresolvedSiteCount(audit: VarsAudit): number {
  return audit.findings.unresolved.reduce((n, u) => n + u.sites.length, 0);
}
