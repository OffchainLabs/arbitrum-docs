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

import { toPosix, walk } from './partials.mjs';

export const VARS_TS = path.join('content', 'vars.ts');
export const VARS_JSON = path.join('content', 'vars.json');
export const CONTENT_DIR = 'content';

const isMdx = (p) => /\.mdx?$/i.test(p);

/**
 * Extract the Zod schema keys from `content/vars.ts`.
 *
 * Regex-based because Node cannot import TypeScript. The schema is a flat object literal, so this is
 * reliable — but a silent zero-match would make the whole gate vacuous, so callers must treat an empty
 * result as a hard error (see `auditVars`).
 */
export function parseSchemaKeys(source) {
  const body = source.match(/z\.(?:strict)?[Oo]bject\(\{([\s\S]*?)\n\}\)/);
  if (!body) return [];
  return [...body[1].matchAll(/^\s*([A-Za-z_][\w]*)\s*:/gm)].map((m) => m[1]);
}

/** Every `<Var …>` occurrence in a source string, with 1-indexed line numbers. */
export function parseVarUsages(source) {
  const out = [];
  const lines = source.split('\n');
  for (const [i, line] of lines.entries()) {
    for (const m of line.matchAll(/<Var\b([^>]*)>/g)) {
      const attrs = m[1];
      const named = attrs.match(/\bname\s*=\s*["']([^"']+)["']/);
      out.push({ line: i + 1, name: named ? named[1] : null, raw: m[0].slice(0, 80) });
    }
  }
  return out;
}

export function auditVars(repoRoot) {
  const schemaSource = readFileSync(path.join(repoRoot, VARS_TS), 'utf8');
  const schemaKeys = parseSchemaKeys(schemaSource);
  const jsonValues = JSON.parse(readFileSync(path.join(repoRoot, VARS_JSON), 'utf8'));
  const jsonKeys = Object.keys(jsonValues);

  const strict = /z\.strictObject\(/.test(schemaSource);
  const schemaSet = new Set(schemaKeys);
  const jsonSet = new Set(jsonKeys);

  // What `vars` actually contains at render time.
  const effective = new Set(schemaKeys.filter((k) => jsonSet.has(k)));

  const usages = new Map();
  const dynamic = [];
  for (const abs of walk(path.join(repoRoot, CONTENT_DIR), isMdx)) {
    const rel = toPosix(path.relative(repoRoot, abs));
    for (const u of parseVarUsages(readFileSync(abs, 'utf8'))) {
      if (u.name === null) {
        dynamic.push({ rel, line: u.line, raw: u.raw });
        continue;
      }
      if (!usages.has(u.name)) usages.set(u.name, []);
      usages.get(u.name).push({ rel, line: u.line });
    }
  }

  const unresolved = [];
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
export function unresolvedSiteCount(audit) {
  return audit.findings.unresolved.reduce((n, u) => n + u.sites.length, 0);
}
