import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('Vercel postinstall fills a shallow checkout before resolving document dates', () => {
  const root = mkdtempSync(join(tmpdir(), 'docs-history-'));
  const origin = join(root, 'origin');
  const checkout = join(root, 'checkout');
  const runGit = (cwd: string, args: string[], env?: Record<string, string>) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, ...env } }).trim();

  try {
    mkdirSync(origin);
    runGit(origin, ['init', '-b', 'main']);
    runGit(origin, ['config', 'user.name', 'Docs Test']);
    runGit(origin, ['config', 'user.email', 'docs@example.com']);
    runGit(origin, ['config', 'commit.gpgsign', 'false']);
    mkdirSync(join(origin, 'content'));
    writeFileSync(join(origin, 'content', 'page.mdx'), '# Page\n');
    runGit(origin, ['add', '.']);
    runGit(origin, ['commit', '-m', 'Add page'], {
      GIT_AUTHOR_DATE: '2024-01-02T12:00:00Z',
      GIT_COMMITTER_DATE: '2024-01-02T12:00:00Z',
    });
    writeFileSync(join(origin, 'other.txt'), 'later change\n');
    runGit(origin, ['add', '.']);
    runGit(origin, ['commit', '-m', 'Change another file'], {
      GIT_AUTHOR_DATE: '2025-03-04T12:00:00Z',
      GIT_COMMITTER_DATE: '2025-03-04T12:00:00Z',
    });

    runGit(root, ['clone', '--depth=1', `file://${origin}`, checkout]);
    assert.equal(runGit(checkout, ['rev-parse', '--is-shallow-repository']), 'true');

    execFileSync(
      process.execPath,
      [fileURLToPath(new URL('./ensure-docs-history.ts', import.meta.url))],
      {
        cwd: checkout,
        env: {
          ...process.env,
          VERCEL_ENV: 'preview',
          DOCS_HISTORY_REMOTE: `file://${origin}`,
        },
      },
    );

    assert.equal(runGit(checkout, ['rev-parse', '--is-shallow-repository']), 'false');
    assert.equal(
      runGit(checkout, ['log', '-1', '--format=%aI', '--', 'content/page.mdx']),
      '2024-01-02T12:00:00Z',
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
