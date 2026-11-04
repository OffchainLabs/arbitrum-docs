import { vars } from '@/content/vars';

export type Finality = 'soft' | 'batch-posted' | 'parent-chain';

export interface Actor {
  id: string;
  label: string;
  tech: string;
  chain: 'child' | 'parent' | 'offchain';
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface Step {
  title: string;
  text: string;
  actors: string[];
  edges: string[];
  flag?: string;
  code?: { label: string; url: string };
  finality?: Finality;
  // TODO: Nitro engineer review. Placeholder text for the spike.
  failure: { symptoms: string; impact: string; recovery: string };
}

const nitroBlob = (path: string) => ({
  label: path,
  url: `https://github.com/OffchainLabs/${vars.nitroRepositorySlug}/blob/${vars.nitroVersionTag}/${path}`,
});

// `contracts/` is a submodule in nitro; this is its commit at the pinned nitro tag (v3.12.2).
const contractsBlob = (path: string) => ({
  label: `nitro-contracts/${path}`,
  url: `https://github.com/OffchainLabs/nitro-contracts/blob/4341b132cfbdcc980ead03765ca5224ff6cb5d97/${path}`,
});

export const actors: Actor[] = [
  { id: 'wallet', label: 'User wallet', tech: 'Any EVM wallet', chain: 'offchain' },
  { id: 'fullnode', label: 'Full node', tech: 'Go, nitro', chain: 'child' },
  { id: 'seq', label: 'Sequencer', tech: 'Go, nitro', chain: 'child' },
  { id: 'relay', label: 'Feed relay', tech: 'Go, relay', chain: 'child' },
  { id: 'poster', label: 'Batch poster', tech: 'Go, nitro', chain: 'child' },
  { id: 'seqinbox', label: 'SequencerInbox', tech: 'Solidity', chain: 'parent' },
  { id: 'bridge', label: 'Bridge', tech: 'Solidity', chain: 'parent' },
];

export const edges: FlowEdge[] = [
  { id: 'submit', source: 'wallet', target: 'fullnode', label: 'eth_sendRawTransaction' },
  { id: 'forward', source: 'fullnode', target: 'seq', label: 'Forwards tx (JSON-RPC)' },
  { id: 'publish', source: 'seq', target: 'relay', label: 'Feed (WebSocket)' },
  { id: 'stream', source: 'relay', target: 'fullnode', label: 'Feed (WebSocket)' },
  { id: 'share', source: 'seq', target: 'poster', label: 'Message log' },
  { id: 'post', source: 'poster', target: 'seqinbox', label: 'Batch (parent chain tx)' },
  { id: 'append', source: 'seqinbox', target: 'bridge', label: 'Append to accumulator' },
  { id: 'read', source: 'seqinbox', target: 'fullnode', label: 'Batch events (JSON-RPC)' },
];

export const steps: Step[] = [
  {
    title: 'Submit',
    text: 'The wallet signs the transaction and sends it to a full node over JSON-RPC.',
    actors: ['wallet', 'fullnode'],
    edges: ['submit'],
    failure: {
      symptoms: 'RPC errors or timeouts in the node logs; rising request latency.',
      impact: 'The transaction never reaches the sequencer. The wallet shows an error.',
      recovery: 'Check the node is synced and its HTTP/WS ports are reachable.',
    },
  },
  {
    title: 'Forward',
    text: 'The full node does not order transactions. It forwards the transaction to the sequencer.',
    actors: ['fullnode', 'seq'],
    edges: ['forward'],
    code: nitroBlob('execution/gethexec/forwarder.go'),
    failure: {
      symptoms: 'Forwarding errors in the full node logs.',
      impact: 'The transaction is rejected or delayed.',
      recovery: 'Check the forwarding target URL and the network path to the sequencer.',
    },
  },
  {
    title: 'Sequence',
    text: 'The sequencer orders the transaction, executes it, and builds a child chain block.',
    actors: ['seq'],
    edges: [],
    flag: '--node.sequencer and --execution.sequencer.enable',
    code: nitroBlob('execution/gethexec/sequencer.go'),
    failure: {
      symptoms: 'Block production stops; the latest block number does not advance.',
      impact: 'New transactions wait in the queue.',
      recovery: 'Check sequencer health and the Redis lockout if a standby sequencer is set up.',
    },
  },
  {
    title: 'Feed',
    text: 'The sequencer publishes the ordered message on the feed. Feed relays fan it out, and full nodes apply it.',
    actors: ['seq', 'relay', 'fullnode'],
    edges: ['publish', 'stream'],
    flag: '--node.feed.output.enable (sequencer), --node.feed.input.url (full node)',
    code: nitroBlob('broadcaster/broadcaster.go'),
    finality: 'soft',
    failure: {
      symptoms: 'Feed disconnects in the full node logs; the node falls behind the sequencer.',
      impact: 'The node sees the transaction late, after it reads the batch from the parent chain.',
      recovery: 'Check the feed URL and the relay; add more feed URLs for redundancy.',
    },
  },
  {
    title: 'Batch',
    text: 'The batch poster reads the message log, groups messages into a batch, and compresses it.',
    actors: ['seq', 'poster'],
    edges: ['share'],
    flag: '--node.batch-poster.enable',
    code: nitroBlob('arbnode/batch_poster.go'),
    failure: {
      symptoms: 'Backlog of unposted messages grows; batch poster errors in the logs.',
      impact: 'Transactions stay soft-final longer.',
      recovery: 'Check the batch poster wallet balance and parent chain RPC.',
    },
  },
  {
    title: 'Post',
    text: 'The batch poster sends the batch to SequencerInbox on the parent chain. SequencerInbox appends it to the Bridge accumulator.',
    actors: ['poster', 'seqinbox', 'bridge'],
    edges: ['post', 'append'],
    code: contractsBlob('src/bridge/SequencerInbox.sol'),
    finality: 'batch-posted',
    failure: {
      symptoms: 'Parent chain transactions stuck or reverted; gas price alerts.',
      impact: 'The batch is not on the parent chain yet.',
      recovery: 'Check parent chain gas settings and the data poster nonce state.',
    },
  },
  {
    title: 'Read back',
    text: 'Every full node reads the batch events from the parent chain and checks them against what it got from the feed.',
    actors: ['seqinbox', 'fullnode'],
    edges: ['read'],
    code: nitroBlob('arbnode/inbox_reader.go'),
    finality: 'parent-chain',
    failure: {
      symptoms: 'Inbox reader errors; parent chain RPC rate limits.',
      impact: 'The node cannot confirm the transaction against the parent chain.',
      recovery: 'Check the parent chain RPC endpoint and its rate limits.',
    },
  },
];
