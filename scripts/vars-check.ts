/**
 * vars-check: fail when a `<Var name="…">` in MDX cannot resolve to a real value.
 *
 * Usage:
 *   pnpm vars:check           # human report; exits 1 if any variable is unresolvable
 *   pnpm vars:check --json    # JSON audit to stdout; exits 0 (for tooling/diffs)
 *
 * `components/mdx/Var` renders `String(vars[name])`, so a name with no key in `vars.json` renders
 * the literal string `undefined` into the page. MDX is never type-checked, so nothing else catches
 * this.
 *
 * Also validates the two banner values in `vars.json` that no other gate sees. `announcementId` is
 * used verbatim as an HTML id and a CSS `#id` selector, so it must start with a letter and hold only
 * letters, digits, hyphens and underscores. `announcementLinkHref` must point somewhere real.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { checkAnnouncementLink } from './lib/announcement-link.ts';
import { buildIndex } from './lib/doc-links.ts';
import { auditVars, unresolvedSiteCount } from './lib/vars-audit.ts';

const ANNOUNCEMENT_ID = /^[A-Za-z][A-Za-z0-9_-]*$/;

/**
 * Check `announcementId` and `announcementLinkHref`. An absent key is silent: the banner is
 * optional, and this gate only judges a value that exists.
 *
 * @returns error messages, empty when there is nothing to report.
 */
function announcementErrors(repoRoot: string): string[] {
  let vars: unknown;
  try {
    vars = JSON.parse(readFileSync(path.join(repoRoot, 'content', 'vars.json'), 'utf8'));
  } catch {
    return []; // Malformed or missing vars.json is already the audit's problem, not this check's.
  }
  if (typeof vars !== 'object' || vars === null) return [];

  const errors: string[] = [];
  if ('announcementId' in vars) {
    const id = vars.announcementId;
    if (typeof id !== 'string' || !ANNOUNCEMENT_ID.test(id)) {
      errors.push(
        `announcementId must start with a letter and contain only letters, digits, hyphens and underscores: ${JSON.stringify(id)}`,
      );
    }
  }
  if ('announcementLinkHref' in vars) {
    const result = checkAnnouncementLink(vars.announcementLinkHref, buildIndex(repoRoot), repoRoot);
    if (!result.ok) {
      errors.push(
        `announcementLinkHref ${result.reason}: ${JSON.stringify(vars.announcementLinkHref)}`,
      );
    }
  }
  return errors;
}

function main(): void {
  const json = process.argv.slice(2).includes('--json');
  const audit = auditVars(process.cwd());

  if (json) {
    console.log(JSON.stringify(audit, (_k, v) => (v instanceof Map ? undefined : v), 2));
    return;
  }

  const { unresolved, unusedKeys } = audit.findings;
  const siteCount = unresolvedSiteCount(audit);
  let failed = false;

  if (unresolved.length > 0) {
    failed = true;
    console.error(
      `vars-check: ${unresolved.length} unresolvable variable(s) across ${siteCount} site(s), each not in vars.json and rendering the literal string "undefined":`,
    );
    for (const u of unresolved) {
      console.error(`  ${u.name}  (${u.sites.length} site(s))`);
      for (const s of u.sites.slice(0, 4)) console.error(`      ${s.rel}:${s.line}`);
      if (u.sites.length > 4) console.error(`      … ${u.sites.length - 4} more`);
    }
  }

  for (const error of announcementErrors(process.cwd())) {
    failed = true;
    console.error(`vars-check: the announcement banner is misconfigured. ${error}`);
  }

  if (audit.dynamic.length > 0) {
    console.error(
      `vars-check: ${audit.dynamic.length} <Var> usage(s) without a static name attribute, not checkable:`,
    );
    for (const d of audit.dynamic) console.error(`  ${d.rel}:${d.line}  ${d.raw}`);
  }

  if (unusedKeys.length > 0) {
    console.log(
      `vars-check: ${unusedKeys.length} configured but unreferenced key(s): ${unusedKeys.join(', ')}`,
    );
  }

  if (failed) process.exit(1);

  console.log(
    `vars-check: ${audit.jsonKeys.length} variable(s) resolve; ${audit.usages.size} referenced in MDX.`,
  );
}

main();
