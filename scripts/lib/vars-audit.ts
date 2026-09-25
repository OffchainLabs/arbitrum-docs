/**
 * vars-audit — reconcile `<Var name="…">` usage in MDX against the `content/vars.ts` schema and
 * `content/vars.json` values.
 *
 * Why this exists: `content/vars.ts` validates with `z.object`, which **strips** unknown keys rather
 * than rejecting them. So `vars` at runtime is `schemaKeys ∩ jsonKeys`, and `components/mdx/Var`
 * renders `String(vars[name])` — any name outside that intersection renders the literal string
 * `undefined` into the page. MDX is compiled by fumadocs-mdx and never type-checked, so `VarKey`
 * constrains nothing for the only call site that matters.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { MALFORMED_VAR_PLACEHOLDER, VAR_PLACEHOLDER } from '../../lib/var-links.ts';
import { toPosix, walk } from './partials.ts';

export const VARS_TS: string = path.join('content', 'vars.ts');
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
  missingFromSchema: boolean;
  missingFromJson: boolean;
}

export interface VarsAudit {
  /** True when the schema is a `z.strictObject`. */
  strict: boolean;
  schemaKeys: string[];
  jsonKeys: string[];
  effectiveKeys: string[];
  usages: Map<string, UsageSite[]>;
  dynamic: DynamicUsage[];
  findings: {
    unresolved: UnresolvedVar[];
    strippedJsonKeys: string[];
    missingJsonKeys: string[];
    unusedKeys: string[];
  };
}

const isMdx = (p: string): boolean => /\.mdx?$/i.test(p);

/**
 * Extract the Zod schema keys from `content/vars.ts`.
 *
 * Regex-based rather than an import of the module. This file is TypeScript run by Node directly
 * now, but `content/vars.ts` imports `vars.json` without the `with { type: 'json' }` attribute Node
 * requires (Next's bundler does not), and it runs `varsSchema.parse` at module load, so a bad value
 * would throw before this audit could report anything. The schema is a flat object literal, so this is
 * reliable — but a silent zero-match would make the whole gate vacuous, so callers must treat an empty
 * result as a hard error (see `auditVars`).
 */
export function parseSchemaKeys(source: string): string[] {
  const body = source.match(/z\.(?:strict)?[Oo]bject\(\{([\s\S]*?)\n\}\)/);
  if (!body) return [];
  return [...body[1].matchAll(/^\s*([A-Za-z_][\w]*)\s*:/gm)].map((m) => m[1]);
}

/**
 * Every variable reference in a source string, with 1-indexed line numbers.
 *
 * Two syntaxes, one audit. `<Var name="…" />` is the component. `{var:…}` is the placeholder a link
 * destination needs, because a `<Var>` tag holds a space and a space ends an unbracketed CommonMark
 * destination, so that form never parses as a link at all (FS-2725; `lib/var-links.ts` expands the
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
  const schemaSource = readFileSync(path.join(repoRoot, VARS_TS), 'utf8');
  const schemaKeys = parseSchemaKeys(schemaSource);
  // Only the keys are read, so `JSON.parse`'s untyped result goes straight into `Object.keys`.
  const jsonKeys: string[] = Object.keys(
    JSON.parse(readFileSync(path.join(repoRoot, VARS_JSON), 'utf8')),
  );

  const strict = /z\.strictObject\(/.test(schemaSource);
  const schemaSet = new Set(schemaKeys);
  const jsonSet = new Set(jsonKeys);

  // What `vars` actually contains at render time.
  const effective = new Set(schemaKeys.filter((k) => jsonSet.has(k)));

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
    if (effective.has(name)) continue;
    unresolved.push({
      name,
      sites,
      missingFromSchema: !schemaSet.has(name),
      missingFromJson: !jsonSet.has(name),
    });
  }
  unresolved.sort((a, b) => b.sites.length - a.sites.length || a.name.localeCompare(b.name));

  return {
    strict,
    schemaKeys,
    jsonKeys,
    effectiveKeys: [...effective],
    usages,
    dynamic,
    findings: {
      // Renders the literal string "undefined" to readers. The reason this gate exists.
      unresolved,
      // Present in JSON, absent from the schema: silently dropped by z.object, so it looks configured
      // but is not. Becomes a hard module-load error once the schema is z.strictObject.
      strippedJsonKeys: jsonKeys.filter((k) => !schemaSet.has(k)),
      // Present in the schema, absent from JSON: `parse()` throws at module load — site-wide outage.
      missingJsonKeys: schemaKeys.filter((k) => !jsonSet.has(k)),
      // Configured and validated but never referenced. Informational only.
      unusedKeys: [...effective].filter((k) => !usages.has(k)),
    },
  };
}

/** Count of render-visible `undefined` strings this audit predicts. */
export function unresolvedSiteCount(audit: VarsAudit): number {
  return audit.findings.unresolved.reduce((n, u) => n + u.sites.length, 0);
}
