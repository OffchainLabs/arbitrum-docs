import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const CLEAN = path.join(path.dirname(fileURLToPath(import.meta.url)), 'clean.ts');

test('clean removes .next and .source and keeps everything else', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'clean-'));
  mkdirSync(path.join(root, '.next', 'dev'), { recursive: true });
  writeFileSync(path.join(root, '.next', 'dev', 'x'), '');
  mkdirSync(path.join(root, '.source'));
  writeFileSync(path.join(root, '.source', 'index.ts'), '');
  writeFileSync(path.join(root, 'package.json'), '{}');

  const output = execFileSync('node', [CLEAN], { cwd: root, encoding: 'utf8' });

  assert.equal(existsSync(path.join(root, '.next')), false);
  assert.equal(existsSync(path.join(root, '.source')), false);
  assert.equal(existsSync(path.join(root, 'package.json')), true);
  assert.match(output, /\.next/);
  assert.match(output, /\.source/);
});

test('clean succeeds when there is nothing to remove', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'clean-'));
  assert.equal(execFileSync('node', [CLEAN], { cwd: root, encoding: 'utf8' }), '');
});
