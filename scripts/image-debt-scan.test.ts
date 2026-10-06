import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { type TestContext, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const SCANNER = fileURLToPath(
  new URL('../.agents/skills/image-debt-scan/scan.sh', import.meta.url),
);

function fixture(t: TestContext): string {
  const root = mkdtempSync(path.join(os.tmpdir(), 'image-debt-security-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet', root]);
  mkdirSync(path.join(root, 'public/img'), { recursive: true });
  mkdirSync(path.join(root, 'content'));
  return root;
}

test('image scan keeps newline filenames out of arithmetic and preserves size ordering', (t) => {
  const root = fixture(t);
  const attack = 'a.svg\narr[$(touch${IFS}INJECTION)] victim.svg';
  const marker = 'data:image/png;base64,fixture';
  writeFileSync(path.join(root, 'public/img', attack), marker);
  writeFileSync(path.join(root, 'victim.svg'), marker);
  writeFileSync(path.join(root, 'public/img/large.svg'), marker + ' '.repeat(3072));
  writeFileSync(path.join(root, 'public/img/space name.png'), Buffer.alloc(2048));
  const run = spawnSync('bash', [SCANNER], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, THRESHOLD_KB: '000001' },
  });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(existsSync(path.join(root, 'INJECTION')), false);
  assert.match(run.stdout, /large\.svg/);
  assert.ok(run.stdout.indexOf('large.svg') < run.stdout.indexOf('INJECTION'));
  assert.match(run.stdout, /embedded-raster/);
  assert.match(run.stdout, /space\\ name\.png/);
});

test('image scan rejects arithmetic payloads and overflowing thresholds before evaluation', (t) => {
  const root = fixture(t);
  for (const threshold of ['arr[$(touch${IFS}INJECTION)]', '99999999999999999999', '-1']) {
    const run = spawnSync('bash', [SCANNER], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, THRESHOLD_KB: threshold },
    });
    assert.equal(run.status, 1, run.stderr);
    assert.match(run.stderr, /THRESHOLD_KB must be/);
    assert.equal(existsSync(path.join(root, 'INJECTION')), false);
  }
});

test('image scan rejects nonnumeric stat output before arithmetic', (t) => {
  const root = fixture(t);
  const bin = path.join(root, 'bin');
  mkdirSync(bin);
  writeFileSync(
    path.join(bin, 'stat'),
    "#!/bin/sh\nprintf '%s\\n' 'arr[$(touch${IFS}INJECTION)]'\n",
    { mode: 0o755 },
  );
  writeFileSync(path.join(root, 'public/img/example.svg'), 'data:image/png;base64,fixture');
  const run = spawnSync('bash', [SCANNER], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
      THRESHOLD_KB: '300',
    },
  });
  assert.equal(run.status, 1, run.stderr);
  assert.match(run.stderr, /stat returned an invalid file size/);
  assert.equal(existsSync(path.join(root, 'INJECTION')), false);
});
