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
  // SPIKE: an inner flow the reader opens by clicking `actor` on this step.
  detail?: StepDetail;
}

export interface StepDetail {
  actor: string;
  flow: Flow;
}

export interface Flow {
  id: string;
  title: string;
  // SPIKE: false for a detail flow inside one process, where the chain carries no information.
  showChains?: boolean;
  actors: Actor[];
  edges: FlowEdge[];
  steps: Step[];
}

const SPIKE_FAILURE: Failure = {
  symptoms: 'SPIKE placeholder.',
  impact: 'SPIKE placeholder.',
  recovery: 'SPIKE placeholder.',
};

// SPIKE: placeholder inner flow for the Sequencer on step 3. Content is not reviewed.
export const sequencerStep3: Flow = {
  id: 'sequencer-step-3',
  title: 'Inside the Sequencer',
  showChains: false,
  actors: [
    {
      id: 'prechecker',
      label: 'Transaction pre-checker',
      tech: 'tx_pre_checker.go',
      kind: 'process',
      chain: 'child',
    },
    {
      id: 'queue',
      label: 'Transaction queue',
      tech: 'sequencer.go',
      kind: 'process',
      chain: 'child',
    },
    {
      id: 'engine',
      label: 'Execution engine',
      tech: 'ArbOS on geth',
      kind: 'process',
      chain: 'child',
    },
    {
      id: 'streamer',
      label: 'Transaction streamer',
      tech: 'transaction_streamer.go',
      kind: 'process',
      chain: 'child',
    },
  ],
  edges: [
    { id: 'checked', source: 'prechecker', target: 'queue', label: 'Checked transaction' },
    { id: 'ordered', source: 'queue', target: 'engine', label: 'Ordered batch of transactions' },
    { id: 'block', source: 'engine', target: 'streamer', label: 'Block and message' },
  ],
  steps: [
    {
      id: 'pre-check',
      title: 'Pre-check',
      text: 'SPIKE: the pre-checker rejects a transaction that cannot pay or has a bad nonce.',
      actors: ['prechecker'],
      edges: [],
      failure: SPIKE_FAILURE,
      citations: [],
      txChain: 'child',
    },
    {
      id: 'queue',
      title: 'Queue',
      text: 'SPIKE: the transaction waits in the queue until the sequencer takes it.',
      actors: ['prechecker', 'queue'],
      edges: ['checked'],
      failure: SPIKE_FAILURE,
      citations: [],
      txChain: 'child',
    },
    {
      id: 'execute',
      title: 'Order and execute',
      text: 'SPIKE: the sequencer orders the queued transactions and ArbOS executes them into a block.',
      actors: ['queue', 'engine'],
      edges: ['ordered'],
      failure: SPIKE_FAILURE,
      citations: [],
      txChain: 'child',
    },
    {
      id: 'record',
      title: 'Record',
      text: 'SPIKE: the transaction streamer stores the message and hands it to the feed and the batch poster.',
      actors: ['engine', 'streamer'],
      edges: ['block'],
      failure: SPIKE_FAILURE,
      citations: [],
      txChain: 'child',
    },
  ],
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
      text:
        'A wallet sends the signed transaction to a full node. ' +
        'The full node checks the transaction against the state of its latest block. ' +
        'It rejects a transaction with too little gas, a fee cap below the base fee, or a nonce ' +
        'that is already used.',
      actors: ['wallet', 'fullnode'],
      edges: ['submit'],
      flag: '--execution.tx-pre-checker.strictness',
      code: { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go' },
      failure: {
        symptoms:
          'The wallet gets an error from the full node, for example a fee cap below the base ' +
          'fee or a nonce that is too low.',
        impact: 'The full node does not forward the transaction, so the sequencer never sees it.',
        recovery:
          '--execution.tx-pre-checker.strictness sets how much the full node checks. ' +
          'Below 10 the node skips these checks but still runs its filtered address check. ' +
          'The default is 20.',
      },
      citations: [
        { repo: 'nitro', path: 'execution/gethexec/arb_interface.go', line: 44 },
        { repo: 'nitro', path: 'execution/gethexec/node.go', line: 475 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 240 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 249 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 141 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 160 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 164 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 251 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 256 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 44 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 138 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 253 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 57 },
        { repo: 'nitro', path: 'cmd/nitro/config/config.go', line: 41 },
        { repo: 'nitro', path: 'execution/gethexec/node.go', line: 145 },
        { repo: 'nitro', path: 'execution/gethexec/tx_pre_checker.go', line: 49 },
      ],
      txChain: 'child',
    },
    {
      id: 'forward',
      title: 'Forward',
      text:
        'The full node forwards the transaction to the sequencer over JSON-RPC. ' +
        'It sends it to the URL in its forwarding target setting. ' +
        'A full node with the target null does not forward and returns an error.',
      actors: ['fullnode', 'seq'],
      edges: ['forward'],
      flag: '--execution.forwarding-target',
      code: { repo: 'nitro', path: 'execution/gethexec/forwarder.go' },
      failure: {
        symptoms:
          'The full node logs "error forwarding transaction" at warn level. ' +
          'If the error does not match its retry list, the node returns it at once. ' +
          'If every target fails with a matching error, the node logs ' +
          '"Failed to publish transaction to any of the forwarding targets".',
        impact:
          'The full node returns the error to the wallet, ' +
          'and the sequencer does not get the transaction.',
        recovery:
          'Add backup targets with --execution.secondary-forwarding-target. ' +
          'If the error matches its retry list, the node tries them in order.',
      },
      citations: [
        { repo: 'nitro', path: 'execution/gethexec/node.go', line: 463 },
        { repo: 'nitro', path: 'execution/gethexec/forwarder.go', line: 135 },
        { repo: 'nitro', path: 'execution/gethexec/node.go', line: 462 },
        { repo: 'nitro', path: 'execution/gethexec/node.go', line: 182 },
        { repo: 'nitro', path: 'execution/gethexec/node.go', line: 460 },
        { repo: 'nitro', path: 'execution/gethexec/forwarder.go', line: 296 },
        { repo: 'nitro', path: 'execution/gethexec/forwarder.go', line: 143 },
        { repo: 'nitro', path: 'execution/gethexec/forwarder.go', line: 148 },
        { repo: 'nitro', path: 'execution/gethexec/forwarder.go', line: 144 },
        { repo: 'nitro', path: 'execution/gethexec/forwarder.go', line: 149 },
        { repo: 'nitro', path: 'execution/gethexec/node.go', line: 149 },
        { repo: 'nitro', path: 'execution/gethexec/forwarder.go', line: 132 },
        { repo: 'nitro', path: 'execution/gethexec/forwarder.go', line: 142 },
        { repo: 'nitro', path: 'execution/gethexec/forwarder.go', line: 146 },
        { repo: 'nitro', path: 'cmd/nitro/config/config.go', line: 41 },
        { repo: 'nitro', path: 'execution/gethexec/node.go', line: 148 },
      ],
      txChain: 'child',
    },
    {
      id: 'sequence',
      detail: { actor: 'seq', flow: sequencerStep3 },
      title: 'Sequence',
      text:
        'The sequencer puts the transaction in its queue, orders it, and executes it into a ' +
        'child chain block. ' +
        'It writes the result to its message log as the next message.',
      actors: ['seq'],
      edges: [],
      flag: '--node.sequencer and --execution.sequencer.enable',
      code: { repo: 'nitro', path: 'execution/gethexec/sequencer.go' },
      failure: {
        symptoms:
          'The metric "arb/sequencer/transactions/dropped/queuetimeout" goes up. ' +
          'If --node.sequencer and --execution.sequencer.enable differ, the node logs ' +
          '"consensus and execution must agree if sequencing is enabled or not".',
        impact:
          'The sequencer drops a transaction that waits in its queue longer than ' +
          '--execution.sequencer.queue-timeout plus the Timeboost express lane advantage. ' +
          'The queue timeout is 12 seconds by default. ' +
          'The submitter gets the timeout error back.',
        recovery: 'TODO: Nitro engineer',
      },
      citations: [
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 629 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 1359 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1233 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1249 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 67 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 355 },
        { repo: 'nitro', path: 'cmd/nitro/nitro.go', line: 201 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 625 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 1159 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 218 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 641 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 100 },
        { repo: 'nitro', path: 'cmd/nitro/config/config.go', line: 40 },
        { repo: 'nitro', path: 'arbnode/node.go', line: 75 },
        { repo: 'nitro', path: 'cmd/nitro/config/config.go', line: 41 },
        { repo: 'nitro', path: 'execution/gethexec/node.go', line: 143 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 92 },
      ],
      txChain: 'child',
    },
    {
      id: 'feed',
      title: 'Feed',
      text:
        "Feed relays pass each new message on the sequencer's feed to full nodes over WebSocket. " +
        'Each full node that reads the feed adds the message to its message log as unconfirmed. ' +
        'A feed message never replaces a message the node already has from a batch.',
      actors: ['seq', 'relay', 'fullnode'],
      edges: ['publish', 'stream'],
      flag: '--node.feed.output.enable (sequencer), --node.feed.input.url (full node)',
      code: { repo: 'nitro', path: 'broadcaster/broadcaster.go' },
      finality: 'soft',
      failure: {
        symptoms:
          'The full node logs "failed connect to sequencer broadcast, waiting and retrying" or ' +
          '"Server connection timed out without receiving data".',
        impact:
          'The node reconnects with a backoff that doubles up to a maximum. ' +
          'Until then, it gets new transactions only from batches on the parent chain.',
        recovery:
          'Add backup feeds with --node.feed.input.secondary-url. ' +
          'The node starts one when its primary feeds send nothing for 5 seconds.',
      },
      citations: [
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1255 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1390 },
        { repo: 'nitro', path: 'broadcaster/broadcaster.go', line: 77 },
        { repo: 'nitro', path: 'relay/relay.go', line: 99 },
        { repo: 'nitro', path: 'broadcastclient/broadcastclient.go', line: 409 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 794 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 874 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1158 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1161 },
        { repo: 'nitro', path: 'broadcastclient/broadcastclient.go', line: 224 },
        { repo: 'nitro', path: 'broadcastclient/broadcastclient.go', line: 415 },
        { repo: 'nitro', path: 'broadcastclient/broadcastclient.go', line: 226 },
        { repo: 'nitro', path: 'broadcastclient/broadcastclient.go', line: 443 },
        { repo: 'nitro', path: 'arbnode/inbox_reader.go', line: 664 },
        { repo: 'nitro', path: 'broadcastclient/broadcastclient.go', line: 77 },
        { repo: 'nitro', path: 'broadcastclients/broadcastclients.go', line: 27 },
        { repo: 'nitro', path: 'broadcastclients/broadcastclients.go', line: 307 },
        { repo: 'nitro', path: 'cmd/nitro/config/config.go', line: 40 },
        { repo: 'nitro', path: 'arbnode/node.go', line: 84 },
        { repo: 'nitro', path: 'broadcastclient/broadcastclient.go', line: 46 },
        { repo: 'nitro', path: 'broadcastclient/broadcastclient.go', line: 76 },
        { repo: 'nitro', path: 'broadcastclient/broadcastclient.go', line: 45 },
        { repo: 'nitro', path: 'wsbroadcastserver/wsbroadcastserver.go', line: 54 },
      ],
      txChain: 'child',
    },
    {
      id: 'batch',
      title: 'Batch',
      text:
        "The batch poster reads new messages from the sequencer's message log. " +
        'It compresses them with Brotli into a batch, up to a size limit.',
      actors: ['seq', 'poster'],
      edges: ['share'],
      flag: '--node.batch-poster.enable',
      code: { repo: 'nitro', path: 'arbnode/batch_poster.go' },
      failure: {
        symptoms:
          'The batch poster logs "error getting message from streamer", or "error posting batch" ' +
          'with "error adding message to batch" in the error.',
        impact:
          'The batch poster drops the batch it was building and tries again after ' +
          '--node.batch-poster.error-delay, 10 seconds by default. ' +
          'The transaction stays out of a batch until an attempt succeeds.',
        recovery: 'TODO: Nitro engineer',
      },
      citations: [
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1621 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1009 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1010 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1659 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1623 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1657 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 2171 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 2158 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 2176 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 185 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 313 },
        { repo: 'nitro', path: 'cmd/nitro/config/config.go', line: 40 },
        { repo: 'nitro', path: 'arbnode/node.go', line: 79 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 168 },
      ],
      txChain: 'child',
    },
    {
      id: 'post',
      title: 'Post',
      text:
        'The batch poster sends the batch to SequencerInbox in a parent chain transaction. ' +
        'Only when blob posting is on and the parent chain supports blobs can it put the data ' +
        'in EIP-4844 blobs instead of calldata. ' +
        "SequencerInbox appends the batch to the Bridge's accumulator.",
      actors: ['poster', 'seqinbox', 'bridge'],
      edges: ['post', 'append'],
      flag: '--node.batch-poster.post-4844-blobs',
      code: { repo: 'nitro-contracts', path: 'src/bridge/SequencerInbox.sol' },
      finality: 'batch-posted',
      failure: {
        symptoms:
          'The batch poster logs "error posting batch". ' +
          'If posting keeps failing for more than a minute, the metric ' +
          '"arb/batchPoster/action/failure" goes up. ' +
          'For some known errors, that wait is 5 minutes.',
        impact:
          'SequencerInbox reverts with NotBatchPoster when the sender is not on its batch ' +
          'poster list. ' +
          'The batch does not reach the Bridge.',
        recovery: 'TODO: Nitro engineer',
      },
      citations: [
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1897 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 88 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 89 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1455 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1458 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1466 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1467 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1509 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1520 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1248 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1254 },
        { repo: 'nitro-contracts', path: 'src/bridge/SequencerInbox.sol', line: 733 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 2171 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 2105 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 2162 },
        { repo: 'nitro', path: 'util/log.go', line: 62 },
        { repo: 'nitro', path: 'util/log.go', line: 65 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 2173 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 2174 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 2106 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 2166 },
        { repo: 'nitro', path: 'util/log.go', line: 55 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 79 },
        { repo: 'nitro-contracts', path: 'src/bridge/SequencerInbox.sol', line: 352 },
        { repo: 'nitro-contracts', path: 'src/bridge/SequencerInbox.sol', line: 368 },
        { repo: 'nitro', path: 'cmd/nitro/config/config.go', line: 40 },
        { repo: 'nitro', path: 'arbnode/node.go', line: 79 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 197 },
      ],
      txChain: 'parent',
    },
    {
      id: 'read-back',
      title: 'Read back',
      text:
        'By default, every full node reads new batches from SequencerInbox in the latest parent ' +
        'chain blocks. ' +
        'If a batch message differs from the message the node stored from the feed, the node ' +
        'keeps the parent chain version. ' +
        'Parent chain finality comes later, when the parent chain finalizes the block that holds ' +
        'the batch.',
      actors: ['seqinbox', 'fullnode'],
      edges: ['read'],
      flag: '--node.inbox-reader.read-mode',
      code: { repo: 'nitro', path: 'arbnode/inbox_reader.go' },
      failure: {
        symptoms:
          'The node logs "TransactionStreamer: Reorg detected!" with confirmed set to true.',
        impact:
          'The node replaces its stored messages from that point with the parent chain version. ' +
          'The result of a transaction it showed from the feed can change.',
        recovery:
          'With --node.inbox-reader.read-mode set to safe or finalized, the node reads ' +
          'batches only up to the latest safe or finalized parent chain block. ' +
          'That setting turns off feed input and output, and a sequencer cannot use it.',
      },
      citations: [
        { repo: 'nitro', path: 'arbnode/inbox_reader.go', line: 495 },
        { repo: 'nitro', path: 'arbnode/inbox_reader.go', line: 664 },
        { repo: 'nitro', path: 'arbnode/inbox_tracker.go', line: 766 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1105 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1019 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1062 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1187 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1190 },
        { repo: 'nitro', path: 'arbnode/inbox_reader.go', line: 72 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1080 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1155 },
        { repo: 'nitro', path: 'arbnode/inbox_reader.go', line: 312 },
        { repo: 'nitro', path: 'arbnode/inbox_reader.go', line: 314 },
        { repo: 'nitro', path: 'arbnode/node.go', line: 116 },
        { repo: 'nitro', path: 'arbnode/node.go', line: 118 },
        { repo: 'nitro', path: 'arbnode/node.go', line: 119 },
        { repo: 'nitro', path: 'cmd/nitro/config/config.go', line: 40 },
        { repo: 'nitro', path: 'arbnode/node.go', line: 77 },
        { repo: 'nitro', path: 'arbnode/inbox_reader.go', line: 39 },
      ],
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
