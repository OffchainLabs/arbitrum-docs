import type { AnimationStep, ComponentPosition, FlowPath, NodeId } from './types';

export const VIEWBOX = {
  width: 1000,
  height: 580,
};

export const COLORS = {
  blue: '#12aaff',
  darkBlue: '#1b4add',
  pink: '#e91e8c',
  orange: '#ff9800',
  white: '#ffffff',
  lightBlue: '#e0f4ff',
  gradientTop: '#152c4e',
  gradientMid: '#1b4add',
  gradientBottom: '#12aaff',
};

export const NODE_POSITIONS: Record<NodeId, ComponentPosition> = {
  userInbox: { x: 40, y: 80, width: 90, height: 200 },
  delayedInbox: { x: 40, y: 340, width: 110, height: 50 },
  sequencer: { x: 200, y: 150, width: 120, height: 55 },
  sequencerFeed: { x: 170, y: 55, width: 150, height: 45 },
  batchCompress: { x: 200, y: 240, width: 120, height: 55 },
  sequencedTxs: { x: 420, y: 80, width: 130, height: 200 },
  stf: { x: 620, y: 160, width: 180, height: 70 },
  state: { x: 750, y: 55, width: 80, height: 55 },
  l2Blocks: { x: 750, y: 290, width: 80, height: 130 },
  l1Chain: { x: 260, y: 420, width: 180, height: 55 },
};

export const NODE_COLORS: Record<NodeId, string> = {
  userInbox: COLORS.blue,
  delayedInbox: COLORS.orange,
  sequencer: COLORS.pink,
  sequencerFeed: COLORS.blue,
  batchCompress: COLORS.pink,
  sequencedTxs: COLORS.blue,
  stf: COLORS.pink,
  state: COLORS.blue,
  l2Blocks: COLORS.blue,
  l1Chain: COLORS.blue,
};

export const NODE_LABELS: Record<NodeId, string> = {
  userInbox: 'User Inbox',
  delayedInbox: 'Delayed Inbox',
  sequencer: 'Sequencer',
  sequencerFeed: 'Sequencer feed\n(soft guarantee)',
  batchCompress: 'Batch and\ncompress',
  sequencedTxs: 'Sequenced\nTxs',
  stf: 'State Transition\nFunction (STF)',
  state: 'State',
  l2Blocks: 'L2\nblock',
  l1Chain: 'L1 (parent) chain',
};

export const DEEP_DIVE_LINKS: Record<NodeId, string> = {
  userInbox: '/how-arbitrum-works/deep-dives/transaction-lifecycle',
  delayedInbox: '/how-arbitrum-works/deep-dives/transaction-lifecycle',
  sequencer: '/how-arbitrum-works/deep-dives/sequencer',
  sequencerFeed: '/how-arbitrum-works/deep-dives/sequencer',
  batchCompress: '/how-arbitrum-works/deep-dives/sequencer',
  sequencedTxs: '/how-arbitrum-works/deep-dives/transaction-lifecycle',
  stf: '/how-arbitrum-works/deep-dives/01-stf-gentle-intro',
  state: '/how-arbitrum-works/deep-dives/stf-inputs',
  l2Blocks: '/how-arbitrum-works/deep-dives/transaction-lifecycle',
  l1Chain: '/how-arbitrum-works/deep-dives/parent-chain-pricing',
};

export const FLOW_PATHS: FlowPath[] = [
  // Normal flow: User Inbox → Sequencer
  {
    id: 'userInbox-sequencer',
    from: 'userInbox',
    to: 'sequencer',
    points: [
      { x: 130, y: 180 },
      { x: 200, y: 180 },
    ],
    color: COLORS.white,
  },
  // Sequencer → Sequencer Feed (soft finality)
  {
    id: 'sequencer-feed',
    from: 'sequencer',
    to: 'sequencerFeed',
    points: [
      { x: 260, y: 150 },
      { x: 260, y: 100 },
    ],
    color: COLORS.white,
  },
  // Sequencer → Batch and compress
  {
    id: 'sequencer-batch',
    from: 'sequencer',
    to: 'batchCompress',
    points: [
      { x: 260, y: 205 },
      { x: 260, y: 240 },
    ],
    color: COLORS.white,
  },
  // Batch and compress → Sequenced Txs
  {
    id: 'batch-sequencedTxs',
    from: 'batchCompress',
    to: 'sequencedTxs',
    points: [
      { x: 320, y: 268 },
      { x: 370, y: 268 },
      { x: 370, y: 180 },
      { x: 420, y: 180 },
    ],
    color: COLORS.white,
  },
  // Batch and compress → L1 Chain
  {
    id: 'batch-l1',
    from: 'batchCompress',
    to: 'l1Chain',
    points: [
      { x: 260, y: 295 },
      { x: 260, y: 350 },
      { x: 350, y: 350 },
      { x: 350, y: 420 },
    ],
    color: COLORS.white,
  },
  // Sequenced Txs → STF
  {
    id: 'sequencedTxs-stf',
    from: 'sequencedTxs',
    to: 'stf',
    points: [
      { x: 550, y: 180 },
      { x: 620, y: 195 },
    ],
    color: COLORS.white,
  },
  // STF → State (dashed)
  {
    id: 'stf-state',
    from: 'stf',
    to: 'state',
    points: [
      { x: 760, y: 160 },
      { x: 760, y: 110 },
    ],
    color: COLORS.white,
    dashed: true,
  },
  // STF → L2 Blocks
  {
    id: 'stf-l2blocks',
    from: 'stf',
    to: 'l2Blocks',
    points: [
      { x: 760, y: 230 },
      { x: 760, y: 290 },
    ],
    color: COLORS.white,
  },
  // Delayed Inbox → L1 Chain
  {
    id: 'delayedInbox-l1',
    from: 'delayedInbox',
    to: 'l1Chain',
    points: [
      { x: 95, y: 390 },
      { x: 95, y: 448 },
      { x: 260, y: 448 },
    ],
    color: COLORS.white,
  },
  // L1 Chain → Sequenced Txs (censorship-resistant path)
  {
    id: 'l1-sequencedTxs',
    from: 'l1Chain',
    to: 'sequencedTxs',
    points: [
      { x: 440, y: 448 },
      { x: 485, y: 448 },
      { x: 485, y: 280 },
    ],
    color: COLORS.white,
  },
];

export const ANIMATION_STEPS: AnimationStep[] = [
  {
    id: 0,
    label: 'Ready',
    activeNodes: [],
  },
  {
    id: 1,
    label: 'Transaction submitted',
    activeNodes: ['userInbox'],
    flowPaths: [],
  },
  {
    id: 2,
    label: 'Sequencer receives transaction',
    activeNodes: ['sequencer'],
    flowPaths: ['userInbox-sequencer'],
  },
  {
    id: 3,
    label: 'Soft finality (Sequencer feed)',
    activeNodes: ['sequencer', 'sequencerFeed'],
    flowPaths: ['sequencer-feed'],
  },
  {
    id: 4,
    label: 'Batching & compression',
    activeNodes: ['batchCompress'],
    flowPaths: ['sequencer-batch'],
  },
  {
    id: 5,
    label: 'Transactions ordered',
    activeNodes: ['sequencedTxs'],
    flowPaths: ['batch-sequencedTxs'],
  },
  {
    id: 6,
    label: 'STF execution',
    activeNodes: ['stf'],
    flowPaths: ['sequencedTxs-stf'],
  },
  {
    id: 7,
    label: 'State updated & L2 blocks produced',
    activeNodes: ['state', 'l2Blocks'],
    flowPaths: ['stf-state', 'stf-l2blocks'],
  },
  {
    id: 8,
    label: 'Posted to L1 (hard finality)',
    activeNodes: ['l1Chain'],
    flowPaths: ['batch-l1'],
  },
];

export const STEP_DURATION_MS = 2000;
