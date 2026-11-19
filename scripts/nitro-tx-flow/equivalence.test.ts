import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';

import {
  sequencerStep3,
  transactionLifecycle,
} from '../../components/widgets/NitroTxFlow/model.ts';
import {
  pgaRound,
  transactionSubmission,
} from '../../components/widgets/NitroTxFlow/submissionFlow.ts';
import { loadProject } from '../diagrams/load.ts';
import { toFlow } from '../generate-diagrams.ts';

const loaded = await loadProject(path.join(import.meta.dirname, '../../diagrams'));

const pairs = [
  [transactionLifecycle, 'transaction-lifecycle'],
  [transactionSubmission, 'transaction-submission-flow'],
  [sequencerStep3, 'sequencer-step-3'],
  [pgaRound, 'pga-round'],
] as const;

for (const [tsFlow, id] of pairs) {
  test(`the Markdown source of ${id} produces today's TypeScript flow`, () => {
    const source = loaded.flows.get(id);
    assert.ok(source, `diagrams/flows/${id}.md was not loaded`);
    assert.deepStrictEqual(toFlow(source, loaded.flows), tsFlow);
  });
}
