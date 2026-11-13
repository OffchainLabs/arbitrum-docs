import { type Flow, transactionLifecycle } from './model.ts';

export type FlowId = 'nitro-transaction-flow';

export const FLOWS: Record<FlowId, Flow> = {
  'nitro-transaction-flow': transactionLifecycle,
};
