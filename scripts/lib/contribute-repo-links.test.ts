/**
 * Tripwire for the content tree's links back into this repository (FS-2733).
 *
 * `scripts/check-links.ts` skips every external destination before resolving it, so a link that
 * spells this repository's own GitHub URL out in full is invisible to every gate. When the
 * contribute guide hardcoded six such URLs, a rename would have left six dead links on
 * `/docs/contribute` with nothing turning red, and the only thing standing between the reader and
 * that was a comment asking a human to retarget them by hand.
 *
 * The URLs now read `{var:docsRepositoryUrl}/blob/{var:docsRepositoryBranch}/…`, and `gitConfig` in
 * `lib/shared.ts` reads the same two keys, so one edit to `content/vars.json` moves the content and
 * the code together. This file is what holds that, in four assertions:
 *
 * 1. `gitConfig` and `content/vars.json` agree, with no server running.
 * 2. Every GitHub link the contribute guide renders belongs to the repository `gitConfig` names.
 * 3. No `.mdx` file anywhere under `content/` writes a docs-repository URL out in full.
 * 4. GitHub file links in the PR template agree with the configured repository and branch.
 *
 * The third one is deliberately repository-wide rather than pinned to the contribute guide. The
 * argument for the check is that `check-links` skips external destinations, and that argument holds
 * for every content file, not one: the round 1 review of FS-2733 found a second reader-facing issue
 * link, in `_know-more-tools-box-partial.mdx`, that a single-file check could never have seen.
 *
 * It judges the configured repository's URL without exceptions, including the fork link. Other
 * `OffchainLabs/*` repositories are separate projects and are not checked. The PR template is
 * rendered by GitHub, so its URLs stay literal and the fourth assertion checks them separately.
 *
 * `lib/shared.ts` is imported as `.ts` for the reason `scripts/lib/shared.test.ts` gives: Node 22
 * strips types natively, so this asserts against the exact constant the pages render rather than a
 * copy of it. `lib/var-links.ts` supplies the expansion for the same reason, since a checker has
 * to judge the URL the reader gets, not the one written in the file.
 *
 * The HTTP half lives in `scripts/static-docs-http.test.ts`, which proves the placeholders really
 * expanded in the rendered page rather than shipping as literal braces. This half needs no running
 * site, so it runs in `pnpm test` and therefore in CI's blocking `Gates` job.
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
