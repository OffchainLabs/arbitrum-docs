import { type Flow, transactionLifecycle } from './model.ts';
import { transactionSubmission } from './submissionFlow.ts';

export type FlowId = 'nitro-transaction-flow' | 'transaction-submission-flow';

export const FLOWS: Record<FlowId, Flow> = {
  'nitro-transaction-flow': transactionLifecycle,
  'transaction-submission-flow': transactionSubmission,
};
