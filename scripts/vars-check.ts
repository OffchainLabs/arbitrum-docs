/**
 * vars-check: fail when a variable reference in content has no value, or when the announcement
 * banner is misconfigured.
 *
 * - Every `<Var name="…">` and `{var:name}` under `content/` names a key in `content/vars.json`.
 *   A missing key renders the literal string `undefined`, and nothing else sees it, since MDX is
 *   not type-checked.
 * - `announcementId` is a valid HTML id, because the banner uses it as an element id and as its
 *   dismissal key.
 * - `announcementLinkHref` points at a real page, a `public/` file or an https URL. `check-links`
 *   walks MDX only, and this value lives in JSON.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { checkAnnouncementLink } from './lib/announcement-link.ts';
import { buildIndex } from './lib/doc-links.ts';
import { toPosix, walk } from './lib/partials.ts';
import { checkVarReferences } from './lib/vars-check.ts';

const repoRoot = process.cwd();
const vars: Record<string, unknown> = JSON.parse(
  readFileSync(path.join(repoRoot, 'content', 'vars.json'), 'utf8'),
);
const errors: string[] = [];

for (const abs of walk(path.join(repoRoot, 'content'), (p) => /\.mdx?$/i.test(p))) {
  const rel = toPosix(path.relative(repoRoot, abs));
  errors.push(...checkVarReferences(rel, readFileSync(abs, 'utf8'), vars));
}

if ('announcementId' in vars) {
  const id = vars.announcementId;
  if (typeof id !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) {
    errors.push(
      `announcementId ${JSON.stringify(id)} must start with a letter and hold only letters, digits, "-" or "_"`,
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

if (errors.length) {
  console.error(`vars-check: ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log('vars-check: every variable resolves.');
