import { test } from 'node:test';
import assert from 'node:assert/strict';

import { stripMarkers } from './strip-sme-markers';

test('drops marker-only lines, keeps content between', () => {
  const input = [
    'before',
    '{/* sme:start team=stylus-sme */}',
    'technical content',
    '{/* sme:end */}',
    'after',
  ].join('\n');
  assert.equal(stripMarkers(input), ['before', 'technical content', 'after'].join('\n'));
});

test('keeps non-marker content on a shared line', () => {
  assert.equal(stripMarkers('text {/* sme:end */}'), 'text');
});

test('strips a start marker that has a reason attribute', () => {
  const input = '{/* sme:start team=stylus-sme reason="gas costs" */}\nx\n{/* sme:end */}';
  assert.equal(stripMarkers(input), 'x');
});

test('handles multiple regions in one file', () => {
  const input = [
    '{/* sme:start team=protocol-sme */}',
    'a',
    '{/* sme:end */}',
    'mid',
    '{/* sme:start team=chain-sme */}',
    'b',
    '{/* sme:end */}',
  ].join('\n');
  assert.equal(stripMarkers(input), ['a', 'mid', 'b'].join('\n'));
});

test('no markers is a no-op (preserves trailing newline)', () => {
  const input = 'line one\nline two\n';
  assert.equal(stripMarkers(input), input);
});

test('removes unbalanced markers line-wise', () => {
  assert.equal(stripMarkers('{/* sme:start team=stylus-sme */}\norphan'), 'orphan');
});
