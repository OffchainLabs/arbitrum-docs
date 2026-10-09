/**
 * Tripwire for the content tree's links back into this repository.
 *
 * `scripts/check-links.ts` skips every external destination, so a link that spells this
 * repository's own GitHub URL out in full is invisible to every gate, and a rename would leave it
 * dead with nothing turning red. The contribute guide therefore writes
 * `{var:docsRepositoryUrl}/blob/{var:docsRepositoryBranch}/…`, and `gitConfig` in `lib/shared.ts`
 * reads the same two keys, so one edit to `content/vars.json` moves content and code together.
 * Four assertions hold that:
 *
 * 1. `gitConfig` and `content/vars.json` agree, with no server running.
 * 2. Every GitHub link the contribute guide renders belongs to the repository `gitConfig` names.
 * 3. No `.mdx` file anywhere under `content/` writes a docs-repository URL out in full.
 * 4. GitHub file links in the PR template agree with the configured repository and branch.
 *
 * The third is repository-wide rather than pinned to the contribute guide, because the argument
 * for it (that `check-links` skips external destinations) holds for every content file.
 *
 * It judges the configured repository's URL without exceptions, including the fork link. Other
 * `OffchainLabs/*` repositories are separate projects and are not checked. The PR template is
 * rendered by GitHub, so its URLs stay literal and the fourth assertion checks them separately.
 *
 * `lib/shared.ts` and `lib/var-links.ts` are imported as `.ts` so this asserts against the exact
 * constant the pages render and the expansion the reader gets. The HTTP half lives in
 * `scripts/static-docs-http.test.ts`; this half needs no running site, so it runs in `pnpm test`.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { gitConfig } from '../../lib/shared.ts';
import { expandVarPlaceholders, readVars } from '../../lib/var-links.ts';
import { walk } from './partials.ts';
import { stripCode } from './strip-code.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const contentDir = path.join(repoRoot, 'content');
const partialPath = path.join(repoRoot, 'content/partials/_contribute-docs-partial.mdx');

/**
 * GitHub URLs the contribute guide may name that are not this repository.
 *
 * The `handle` URL is the placeholder profile in the community-contribution banner example,
 * so it is an illustration rather than a link anyone is meant to follow.
 */
const ALLOWED = new Set(['https://github.com/handle']);

/** Whether `url` addresses the repository at `base`, rather than one whose name merely starts alike. */
function isUnder(url: string, base: string): boolean {
  return url === base || url.startsWith(`${base}/`);
}

/** Every GitHub URL in `source`, outside code, with trailing sentence punctuation dropped. */
function githubUrls(source: string): string[] {
  return [...stripCode(source).matchAll(/https:\/\/github\.com\/[^\s)"'`<>\]]+/g)].map((m) =>
    m[0].replace(/[.,;:]+$/, ''),
  );
}

test('gitConfig holds exactly what content/vars.json holds', () => {
  const vars = readVars();
  assert.equal(gitConfig.url, vars.docsRepositoryUrl);
  assert.equal(gitConfig.branch, vars.docsRepositoryBranch);
});

test('every GitHub link in the contribute guide names the repository gitConfig names', () => {
  const urls = githubUrls(expandVarPlaceholders(readFileSync(partialPath, 'utf8'), readVars()));
  const own = urls.filter((url) => isUnder(url, gitConfig.url));
  // Without this the test would still pass on a file whose links had all been deleted.
  assert.ok(own.length > 0, 'no link back into this repository survived');

  const offenders = urls.filter((url) => !own.includes(url) && !ALLOWED.has(url));
  assert.deepEqual(offenders, []);
});

test('no content file writes a docs-repository URL out in full', () => {
  const files = walk(contentDir, (p) => p.endsWith('.mdx'));
  assert.ok(files.length > 0, 'no .mdx files found under content/, so this test proved nothing');

  const offenders: string[] = [];
  let placeholderUses = 0;
  for (const abs of files) {
    const rel = path.relative(repoRoot, abs);
    const source = readFileSync(abs, 'utf8');
    if (source.includes('{var:docsRepositoryUrl}')) placeholderUses += 1;
    for (const url of githubUrls(source)) {
      if (!isUnder(url, gitConfig.url)) continue;
      offenders.push(`${rel}: ${url}`);
    }
  }

  // Without this the test would still pass on a tree where every placeholder had been deleted.
  assert.ok(placeholderUses > 0, 'no content file uses {var:docsRepositoryUrl}');
  assert.deepEqual(
    offenders,
    [],
    'write {var:docsRepositoryUrl} so one edit to content/vars.json moves every link home',
  );
});

test('PR template file links match the configured repository and branch', () => {
  const template = readFileSync(path.join(repoRoot, '.github/pull_request_template.md'), 'utf8');
  const urls = githubUrls(template);
  assert.ok(urls.length > 0, 'the PR template contains no GitHub links');
  const prefix = `${gitConfig.url}/blob/${gitConfig.branch}/`;
  assert.deepEqual(
    urls.filter((url) => !url.startsWith(prefix)),
    [],
    'update PR template links to match docsRepositoryUrl and docsRepositoryBranch',
  );
});
