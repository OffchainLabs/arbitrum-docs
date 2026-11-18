/**
 * vars-check: fail when the announcement banner is misconfigured in `content/vars.json`.
 *
 * - `announcementId` is a valid HTML id, because the banner uses it as an element id and as its
 *   dismissal key.
 * - `announcementLinkHref` points at a real page, a `public/` file or an https URL. `check-links`
 *   walks MDX only, and this value lives in JSON.
 *
 * That every `<Var name="…">` and `{var:name}` under `content/` names a key is ESLint rule
 * `docs/unknown-var` (`eslint/rules/unknown-var.ts`), run by `pnpm lint`.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { checkAnnouncementLink } from './lib/announcement-link.ts';
import { buildIndex } from './lib/doc-links.ts';

const repoRoot = process.cwd();
const vars: Record<string, unknown> = JSON.parse(
  readFileSync(path.join(repoRoot, 'content', 'vars.json'), 'utf8'),
);
const errors: string[] = [];

if ('announcementId' in vars && (vars.announcementEnabled || vars.announcementId !== null)) {
  const id = vars.announcementId;
  if (typeof id !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) {
    errors.push(
      `announcementId ${JSON.stringify(id)} must start with a letter and hold only letters, digits, "-" or "_"`,
    );
  }
}

if (
  'announcementLinkHref' in vars &&
  (vars.announcementEnabled || vars.announcementLinkHref !== null)
) {
  const result = checkAnnouncementLink(vars.announcementLinkHref, buildIndex(repoRoot), repoRoot);
  if (!result.ok) {
    errors.push(
      `announcementLinkHref ${result.reason}: ${JSON.stringify(vars.announcementLinkHref)}`,
    );
  }
}

if (errors.length) {
  console.error(`vars-check: ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log('vars-check: the banner keys are valid.');
