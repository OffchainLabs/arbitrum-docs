import type { FlowStep } from './types';

export const FLOW_STEPS: FlowStep[] = [
  {
    id: 'create',
    title: 'Create LayerZero Edge',
    desc: 'EdgeAdded (layerzero)',
  },
  {
    id: 'bisect1',
    title: 'Bisect Edge',
    desc: 'EdgeBisected',
  },
  {
    id: 'layerzeroChild',
    title: 'LayerZero Child Edge',
    desc: 'EdgeAdded (child layerzero)',
  },
  {
    id: 'bisect2',
    title: 'Further Bisect',
    desc: 'EdgeBisected (deeper)',
  },
  {
    id: 'osp',
    title: 'One Step Proof',
    desc: 'EdgeConfirmedByOneStepProof',
  },
];

export const SPEED_OPTIONS = [
  { value: 1800, label: '0.5x' },
  { value: 1200, label: '1x' },
  { value: 800, label: '1.5x' },
  { value: 500, label: '2x' },
];

export const DEFAULT_INTERVAL_MS = 1200;

export const ARBISCAN_BASE_URL = 'https://sepolia.arbiscan.io';

/**
 * Decoded challenge logs, served as a static asset from `public/data/`. `/data/` is on `proxy.ts`'s
 * bypass list, so the request is served verbatim. No rewrite pattern reaches it today either, but
 * that anchoring is an implementation detail rather than a promise, and the bypass list is where a
 * path that must be served verbatim costs one line and cannot be broken from a distance.
 */
export const DATA_URL = '/data/edge-challenge-flow.json';
