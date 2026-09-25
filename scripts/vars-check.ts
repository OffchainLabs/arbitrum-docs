/**
 * vars-check — fail when a `<Var name="…">` in MDX cannot resolve to a real value.
 *
 * Usage:
 *   pnpm vars:check           # human report; exits 1 if any variable is unresolvable
 *   pnpm vars:check --json    # JSON audit to stdout; exits 0 (for tooling/diffs)
 *
 * Also validates `announcementLinkHref`, the banner target in `vars.json`. `check-links` walks MDX
 * only and that value appears in no `.mdx` file, so without this the site's most visible link is
 * the one nothing checks.
 *
 * `content/vars.ts` validates `vars.json` with `z.object`, which strips unknown keys instead of
 * rejecting them, and `components/mdx/Var` renders `String(vars[name])`. So any name outside
 * `schemaKeys ∩ jsonKeys` renders the literal string `undefined` into the page. MDX is never
 * type-checked, so nothing else catches this — `pnpm types:check` exits 0 on a tree full of them.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { checkAnnouncementLink } from './lib/announcement-link.ts';
import { buildIndex } from './lib/doc-links.ts';
import { auditVars, unresolvedSiteCount } from './lib/vars-audit.ts';

/**
 * Read `announcementLinkHref` and assert it points somewhere real.
 *
 * Absent key: silent. The banner is optional, and the schema in `content/vars.ts` is what makes it
 * required once adopted; this gate only judges a value that exists.
 *
 * Read with `fs` rather than imported with `with { type: 'json' }`, so that a missing or malformed
 * file is reported by the audit instead of failing this module's load.
 *
 * @returns an error message, or null when there is nothing to report.
 */
function announcementLinkError(repoRoot: string): string | null {
  let vars: unknown;
  try {
    vars = JSON.parse(readFileSync(path.join(repoRoot, 'content', 'vars.json'), 'utf8'));
  } catch {
    return null; // Malformed or missing vars.json is already the audit's problem, not this check's.
  }

  // Valid JSON that is not an object is malformed too, and so equally the audit's problem.
  if (typeof vars !== 'object' || vars === null) return null;
  if (!('announcementLinkHref' in vars)) return null;

  const result = checkAnnouncementLink(vars.announcementLinkHref, buildIndex(repoRoot), repoRoot);
  if (result.ok) return null;

  return `announcementLinkHref ${result.reason}: ${JSON.stringify(vars.announcementLinkHref)}`;
}

function main(): void {
  const json = process.argv.slice(2).includes('--json');
  const audit = auditVars(process.cwd());

  if (json) {
    console.log(JSON.stringify(audit, (_k, v) => (v instanceof Map ? undefined : v), 2));
    return;
  }

  // A parser that silently matches nothing would make this gate vacuous — the same class of bug it
  // exists to catch. Fail loudly instead.
  if (audit.schemaKeys.length === 0) {
    console.error(
      'vars-check: could not parse any keys from content/vars.ts — the gate cannot run.',
    );
    process.exit(2);
  }

  const { unresolved, strippedJsonKeys, missingJsonKeys, unusedKeys } = audit.findings;
  const siteCount = unresolvedSiteCount(audit);
  let failed = false;

  if (unresolved.length > 0) {
    failed = true;
    console.error(
      `vars-check: ${unresolved.length} unresolvable variable(s) across ${siteCount} site(s) — each renders the literal string "undefined":`,
    );
    for (const u of unresolved) {
      const why = [
        u.missingFromJson ? 'not in vars.json' : null,
        u.missingFromSchema ? 'not in vars.ts schema' : null,
      ]
        .filter(Boolean)
        .join(', ');
      console.error(`  ${u.name}  (${u.sites.length} site(s); ${why})`);
      for (const s of u.sites.slice(0, 4)) console.error(`      ${s.rel}:${s.line}`);
      if (u.sites.length > 4) console.error(`      … ${u.sites.length - 4} more`);
    }
  }

  if (missingJsonKeys.length > 0) {
    failed = true;
    console.error(
      `vars-check: ${missingJsonKeys.length} schema key(s) absent from vars.json — parse() throws at module load:`,
    );
    for (const k of missingJsonKeys) console.error(`  ${k}`);
  }

  if (strippedJsonKeys.length > 0) {
    failed = true;
    console.error(
      `vars-check: ${strippedJsonKeys.length} vars.json key(s) absent from the vars.ts schema — silently stripped by z.object, so they look configured but are not:`,
    );
    for (const k of strippedJsonKeys) console.error(`  ${k}`);
  }

  const linkError = announcementLinkError(process.cwd());
  if (linkError) {
    failed = true;
    console.error(`vars-check: the announcement banner link is broken. ${linkError}`);
  }

  if (audit.dynamic.length > 0) {
    console.error(
      `vars-check: ${audit.dynamic.length} <Var> usage(s) without a static name attribute — not checkable:`,
    );
    for (const d of audit.dynamic) console.error(`  ${d.rel}:${d.line}  ${d.raw}`);
  }

  if (!audit.strict) {
    console.error(
      'vars-check: content/vars.ts uses z.object — unknown vars.json keys are stripped silently. Switch to z.strictObject once every schema key has a value.',
    );
  }

  if (unusedKeys.length > 0) {
    console.log(
      `vars-check: ${unusedKeys.length} configured but unreferenced key(s): ${unusedKeys.join(', ')}`,
    );
  }

  if (failed) process.exit(1);

  console.log(
    `vars-check: ${audit.effectiveKeys.length} variable(s) resolve; ${audit.usages.size} referenced in MDX.`,
  );
}

main();
