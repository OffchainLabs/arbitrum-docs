import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { FINALITY_TERM } from '../../components/widgets/NitroTxFlow/brand.ts';
import { type ResolvedPath, flowPaths } from '../../components/widgets/NitroTxFlow/model.ts';
import {
  transactionSubmission as flow,
  pgaRound,
} from '../../components/widgets/NitroTxFlow/submissionFlow.ts';
import { createAnchorCompiler } from '../lib/doc-anchors.ts';
import { buildIndex } from '../lib/doc-links.ts';
import { checkFlowShape } from './flow-shape.ts';

const repoRoot = process.cwd();
const allSteps = [...flow.steps, ...pgaRound.steps];

test('the submission flow and the PGA round flow have a valid shape', () => {
  checkFlowShape(flow);
  checkFlowShape(pgaRound);
});

test('paths have 9 and 10 steps and share the last five', () => {
  const [direct, retryable] = flowPaths(flow);
  assert.equal(direct!.steps.length, 9);
  assert.equal(retryable!.steps.length, 10);
  const tail = (p: ResolvedPath) => p.steps.slice(-5).map((s) => s.id);
  assert.deepEqual(tail(direct!), ['feed', 'batch', 'finalize', 'assert', 'settle']);
  assert.deepEqual(tail(retryable!), tail(direct!));
});

test('each finality marker appears once, on its step', () => {
  const marked = flow.steps.filter((s) => s.finality).map((s) => [s.id, s.finality]);
  assert.deepEqual(marked, [
    ['feed', 'soft-confirmation'],
    ['finalize', 'hard'],
    ['settle', 'settled'],
  ]);
});

test('only submit and auto-redeem carry failure notes', () => {
  assert.deepEqual(
    flow.steps
      .filter((s) => s.failure)
      .map((s) => s.id)
      .sort(),
    ['auto-redeem', 'submit'],
  );
});

test('the PGA round opens from the wait-round step on the Sequencer', () => {
  const step = flow.steps.find((s) => s.id === 'wait-round')!;
  assert.equal(step.detail?.actor, 'seq');
  assert.equal(step.detail?.flow, pgaRound);
  assert.equal(pgaRound.showChains, false);
});

test('every docs href resolves to a page and, with a fragment, to an id on it', async () => {
  const index = buildIndex(repoRoot);
  const compile = await createAnchorCompiler(repoRoot);
  for (const step of allSteps) {
    assert.ok(step.docs, `${step.id} has no docs link`);
    assert.ok(step.docs.label.trim(), `${step.id} docs label`);
    const [pagePath, fragment] = step.docs.href.split('#');
    const file = index.byUrl.get(pagePath!);
    assert.ok(file, `${step.id}: ${pagePath} is not a docs page`);
    if (fragment !== undefined) {
      const { ids } = await compile(file);
      assert.ok(ids.has(fragment), `${step.id}: #${fragment} is not an id on ${pagePath}`);
    }
  }
});

test('every var token names a vars.json key, and only step text holds them', () => {
  const vars: Record<string, unknown> = JSON.parse(
    readFileSync(path.join(repoRoot, 'content/vars.json'), 'utf8'),
  );
  const token = /\{var:([A-Za-z0-9]+)\}/g;
  const used = new Set<string>();
  for (const step of allSteps) {
    for (const [, name] of step.text.matchAll(token)) {
      assert.ok(name! in vars, `${step.id}: unknown var ${name}`);
      used.add(name!);
    }
    const other = [
      step.title,
      step.failure?.symptoms,
      step.failure?.impact,
      step.failure?.recovery,
    ];
    for (const field of other)
      assert.doesNotMatch(field ?? '', token, `${step.id}: var outside text`);
  }
  const required = [
    'arbOneDisputeWindowDays',
    'arbOnePgaRoundsPerBlock',
    'arbOnePgaRoundMs',
    'arbOneBlockGasLimit',
    'arbOneBlockCalldataLimitBytes',
  ];
  for (const name of required) {
    assert.ok(used.has(name), `no step uses ${name}`);
  }
});

test('every finality term has a glossary entry with that id', () => {
  for (const step of flow.steps.filter((s) => s.finality)) {
    const term = FINALITY_TERM[step.finality!];
    assert.ok(term, `${step.id}: no glossary term for ${step.finality}`);
    const file = path.join(repoRoot, 'content/glossary', `${term}.mdx`);
    assert.ok(existsSync(file), `${step.id}: missing ${file}`);
    assert.match(readFileSync(file, 'utf8'), new RegExp(`^id: ${term}$`, 'm'));
  }
});

test('no step text calls settlement hard finality', () => {
  const settle = flow.steps.find((s) => s.id === 'settle')!;
  assert.doesNotMatch(settle.text, /hard finality/i);
});
