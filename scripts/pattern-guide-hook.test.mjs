import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

// `.claude/hooks/require-pattern-guide.sh` fails open: a missing guide exits 0 and
// nothing is reported. That is the right behaviour for a hook — it must never wedge
// an editing session — but it is why the guide going missing in the Docusaurus
// migration went unnoticed until 2026-09-18. These tests pin the coupling instead.

const HOOK = '.claude/hooks/require-pattern-guide.sh';
const GUIDE = 'content/docs/Offchain-pattern-guide.mdx';

test('the editorial pattern guide the hook enforces exists', () => {
  assert.ok(
    existsSync(GUIDE),
    `${GUIDE} is missing, so ${HOOK} silently enforces nothing. Restore the guide or ` +
      'update both this test and the hook together.',
  );
});

test('the hook points at the guide that exists', () => {
  const hook = readFileSync(HOOK, 'utf8');
  assert.match(
    hook,
    new RegExp(GUIDE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    `${HOOK} no longer references ${GUIDE}; the two must move together.`,
  );
});
