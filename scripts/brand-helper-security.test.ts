import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

for (const namespace of ['.agents', '.claude']) {
  test(`${namespace} brand helpers reject injected markup and redirected file writes`, () => {
    const script = fileURLToPath(
      new URL(
        `../${namespace}/skills/arbitrum-brand-svg-diagrams/tools/test_security.py`,
        import.meta.url,
      ),
    );
    const result = spawnSync('python3', [script], { encoding: 'utf8', timeout: 30_000 });
    assert.equal(result.status, 0, result.error?.message ?? result.stderr);
  });
}
