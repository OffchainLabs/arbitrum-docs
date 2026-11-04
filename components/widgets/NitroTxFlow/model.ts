export type ActorKind = 'process' | 'contract' | 'user';
export type Chain = 'child' | 'parent' | 'off-chain';
export type Finality = 'soft' | 'batch-posted';

export interface Actor {
  id: string;
  label: string;
  tech: string;
  kind: ActorKind;
  chain: Chain;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface CodeRef {
  repo: 'nitro' | 'nitro-contracts';
  path: string;
  line?: number;
}

export interface Failure {
  symptoms: string;
  impact: string;
  recovery: string;
}

export interface Step {
  id: string;
  title: string;
  text: string;
  actors: string[];
  edges: string[];
  flag?: string;
  code?: CodeRef;
  finality?: Finality;
  failure: Failure;
  citations: CodeRef[];
  // Where the user's transaction is during this step; that chain's band is highlighted.
  txChain: 'child' | 'parent';
}

export interface Flow {
  id: string;
  title: string;
  actors: Actor[];
  edges: FlowEdge[];
  steps: Step[];
}

const placeholderFailure: Failure = {
  symptoms: 'Placeholder symptoms.',
  impact: 'Placeholder impact.',
  recovery: 'Placeholder recovery.',
};

export const transactionLifecycle: Flow = {
  id: 'transaction-lifecycle',
  title: 'Transaction lifecycle',
  actors: [
    {
      id: 'wallet',
      label: 'User wallet',
      tech: 'Any EVM wallet',
      kind: 'user',
      chain: 'off-chain',
    },
    { id: 'fullnode', label: 'Full node', tech: 'Go, nitro', kind: 'process', chain: 'child' },
    { id: 'seq', label: 'Sequencer', tech: 'Go, nitro', kind: 'process', chain: 'child' },
    { id: 'relay', label: 'Feed relay', tech: 'Go, relay', kind: 'process', chain: 'child' },
    { id: 'poster', label: 'Batch poster', tech: 'Go, nitro', kind: 'process', chain: 'child' },
    {
      id: 'seqinbox',
      label: 'SequencerInbox',
      tech: 'Solidity',
      kind: 'contract',
      chain: 'parent',
    },
    { id: 'bridge', label: 'Bridge', tech: 'Solidity', kind: 'contract', chain: 'parent' },
  ],
  edges: [
    { id: 'submit', source: 'wallet', target: 'fullnode', label: 'eth_sendRawTransaction' },
    { id: 'forward', source: 'fullnode', target: 'seq', label: 'Forwards tx (JSON-RPC)' },
    { id: 'publish', source: 'seq', target: 'relay', label: 'Feed (WebSocket)' },
    { id: 'stream', source: 'relay', target: 'fullnode', label: 'Feed (WebSocket)' },
    { id: 'share', source: 'seq', target: 'poster', label: 'Message log' },
    { id: 'post', source: 'poster', target: 'seqinbox', label: 'Batch (parent chain tx)' },
    { id: 'append', source: 'seqinbox', target: 'bridge', label: 'Append to accumulator' },
    { id: 'read', source: 'seqinbox', target: 'fullnode', label: 'Batch events (JSON-RPC)' },
  ],
  steps: [
    {
      id: 'submit',
      title: 'Submit',
      text: 'Placeholder: the wallet sends the signed transaction to a full node.',
      actors: ['wallet', 'fullnode'],
      edges: ['submit'],
      failure: placeholderFailure,
      citations: [],
      txChain: 'child',
    },
    {
      id: 'forward',
      title: 'Forward',
      text: 'Placeholder: the full node forwards the transaction to the sequencer.',
      actors: ['fullnode', 'seq'],
      edges: ['forward'],
      code: { repo: 'nitro', path: 'execution/gethexec/forwarder.go' },
      failure: placeholderFailure,
      citations: [],
      txChain: 'child',
    },
    {
      id: 'sequence',
      title: 'Sequence',
      text: 'Placeholder: the sequencer orders and executes the transaction.',
      actors: ['seq'],
      edges: [],
      code: { repo: 'nitro', path: 'execution/gethexec/sequencer.go' },
      failure: placeholderFailure,
      citations: [],
      txChain: 'child',
    },
    {
      id: 'feed',
      title: 'Feed',
      text: 'Placeholder: the sequencer publishes the ordered message on the feed.',
      actors: ['seq', 'relay', 'fullnode'],
      edges: ['publish', 'stream'],
      code: { repo: 'nitro', path: 'broadcaster/broadcaster.go' },
      finality: 'soft',
      failure: placeholderFailure,
      citations: [],
      txChain: 'child',
    },
    {
      id: 'batch',
      title: 'Batch',
      text: 'Placeholder: the batch poster groups messages into a batch.',
      actors: ['seq', 'poster'],
      edges: ['share'],
      code: { repo: 'nitro', path: 'arbnode/batch_poster.go' },
      failure: placeholderFailure,
      citations: [],
      txChain: 'child',
    },
    {
      id: 'post',
      title: 'Post',
      text: 'Placeholder: the batch poster sends the batch to SequencerInbox.',
      actors: ['poster', 'seqinbox', 'bridge'],
      edges: ['post', 'append'],
      code: { repo: 'nitro-contracts', path: 'src/bridge/SequencerInbox.sol' },
      finality: 'batch-posted',
      failure: placeholderFailure,
      citations: [],
      txChain: 'parent',
    },
    {
      id: 'read-back',
      title: 'Read back',
      text: 'Placeholder: full nodes read the batch from the parent chain.',
      actors: ['seqinbox', 'fullnode'],
      edges: ['read'],
      code: { repo: 'nitro', path: 'arbnode/inbox_reader.go' },
      failure: placeholderFailure,
      citations: [],
      txChain: 'parent',
    },
  ],
};

export function codeRefs(flow: Flow): CodeRef[] {
  const seen = new Map<string, CodeRef>();
  for (const step of flow.steps) {
    for (const ref of [...(step.code ? [step.code] : []), ...step.citations]) {
      const key = `${ref.repo}:${ref.path}`;
      if (!seen.has(key)) seen.set(key, ref);
    }
  }
  return [...seen.values()];
}
