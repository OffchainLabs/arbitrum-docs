import type { DocsLink, Flow } from './model.ts';

const PGA_DOCS = '/how-arbitrum-works/priority-gas-auction/pga';

const docs = {
  lifecycle: {
    href: '/how-arbitrum-works/deep-dives/transaction-lifecycle',
    label: 'Transaction lifecycle',
  },
  pga: { href: PGA_DOCS, label: 'Priority Gas Auction' },
  fastFeed: { href: '/how-arbitrum-works/priority-gas-auction/fast-feed', label: 'Fast Feed' },
  finality: {
    href: '/how-arbitrum-works/reference/finality-and-reorgs',
    label: 'Finality and reorgs',
  },
  batchPoster: { href: '/how-arbitrum-works/deep-dives/batchposter', label: 'Batch poster' },
  assertions: { href: '/how-arbitrum-works/deep-dives/assertions', label: 'Assertions' },
  retryables: {
    href: '/how-arbitrum-works/deep-dives/l1-to-l2-messaging#retryable-tickets',
    label: 'Retryable tickets',
  },
  forced: {
    href: '/how-arbitrum-works/deep-dives/forced-transactions',
    label: 'Forced transactions',
  },
  delayedInbox: {
    href: '/how-arbitrum-works/deep-dives/l1-to-l2-messaging#transacting-via-the-delayed-inbox',
    label: 'Transacting through the Delayed Inbox',
  },
} satisfies Record<string, DocsLink>;

export const pgaRound: Flow = {
  id: 'pga-round',
  title: 'Inside a PGA round',
  showChains: false,
  actors: [
    {
      id: 'waiting',
      label: 'Waiting list',
      tech: 'Sequencer queue',
      kind: 'process',
      chain: 'child',
    },
    {
      id: 'priority-queue',
      label: 'Priority queue',
      tech: 'PGA mempool',
      kind: 'process',
      chain: 'child',
    },
    {
      id: 'block',
      label: 'Block in progress',
      tech: 'ArbOS on geth',
      kind: 'process',
      chain: 'child',
    },
  ],
  edges: [
    { id: 'promote', source: 'waiting', target: 'priority-queue', label: 'At round start' },
    { id: 'fill', source: 'priority-queue', target: 'block', label: 'Highest priority first' },
  ],
  steps: [
    {
      id: 'intake',
      title: 'Intake',
      text:
        "Each transaction that passes the pre-checks lands in the Sequencer's waiting list. " +
        'Intake runs all the time, also while the previous round executes.',
      actors: ['waiting'],
      edges: [],
      code: { repo: 'nitro', path: 'execution/gethexec/sequencer.go' },
      docs: { href: `${PGA_DOCS}#the-two-stage-mempool`, label: 'The two-stage mempool' },
      citations: [
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 782 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 614 },
      ],
      txChain: 'child',
    },
    {
      id: 'promote',
      title: 'Move to the priority queue',
      text:
        'When a round starts, the Sequencer moves the waiting list into a priority queue. ' +
        'The queue key is the priority fee per gas, the smaller of maxPriorityFeePerGas and ' +
        'maxFeePerGas minus the base fee, plus any boost from earlier rounds. ' +
        'If two transactions have the same priority, the one that reached the Sequencer first ' +
        'goes first. ' +
        'A transaction whose maxFeePerGas is below the base fee is dropped here.',
      actors: ['waiting', 'priority-queue'],
      edges: ['promote'],
      code: { repo: 'nitro', path: 'execution/gethexec/pga/heap.go' },
      docs: { href: `${PGA_DOCS}#the-two-stage-mempool`, label: 'The two-stage mempool' },
      citations: [
        { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go', line: 90 },
        { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go', line: 156 },
        { repo: 'nitro', path: 'execution/gethexec/pga_adapter.go', line: 22 },
        { repo: 'nitro', path: 'execution/gethexec/pga_adapter.go', line: 24 },
        { repo: 'nitro', path: 'execution/gethexec/pga/tx.go', line: 45 },
        { repo: 'nitro', path: 'execution/gethexec/pga/heap.go', line: 21 },
        { repo: 'nitro', path: 'execution/gethexec/pga/heap.go', line: 23 },
      ],
      txChain: 'child',
    },
    {
      id: 'fill',
      title: 'Fill the block',
      text:
        'The Sequencer takes transactions from the queue into the block, highest priority first. ' +
        'It stops when the queue is empty, the round ends, or the block reaches ' +
        '{var:arbOneBlockGasLimit} gas or {var:arbOneBlockCalldataLimitBytes} bytes of calldata. ' +
        'Anything left in the queue waits for the next round.',
      actors: ['priority-queue', 'block'],
      edges: ['fill'],
      code: { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go' },
      docs: { href: `${PGA_DOCS}#pga-rounds`, label: 'PGA rounds' },
      citations: [
        { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go', line: 65 },
        { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go', line: 71 },
        { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go', line: 99 },
        { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go', line: 104 },
      ],
      txChain: 'child',
    },
    {
      id: 'boost',
      title: 'Boost what is left',
      text:
        'At the end of each round, every transaction still in the queue gets a priority boost ' +
        'of p / (2K). ' +
        'p is the priority of the last transaction the round included, or zero if it included ' +
        'none. ' +
        'K is the number of rounds per block, {var:arbOnePgaRoundsPerBlock} on Arbitrum One. ' +
        'The boost moves a transaction up the queue. It does not change the fee you pay.',
      actors: ['priority-queue'],
      edges: [],
      code: { repo: 'nitro', path: 'execution/gethexec/pga/mempool.go' },
      docs: {
        href: `${PGA_DOCS}#the-anti-starvation-priority-boost`,
        label: 'The anti-starvation priority boost',
      },
      citations: [
        { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go', line: 117 },
        { repo: 'nitro', path: 'execution/gethexec/pga/mempool.go', line: 34 },
        { repo: 'nitro', path: 'execution/gethexec/pga/mempool.go', line: 47 },
        { repo: 'nitro', path: 'execution/gethexec/pga/mempool.go', line: 48 },
        { repo: 'nitro', path: 'execution/gethexec/pga/mempool.go', line: 53 },
        { repo: 'nitro', path: 'execution/gethexec/pga/tx.go', line: 68 },
      ],
      txChain: 'child',
    },
  ],
};

export const transactionSubmission: Flow = {
  id: 'transaction-submission-flow',
  title: 'Transaction submission',
  card: {
    detailsToggle: 'Show details',
    symptoms: 'What you see',
    impact: 'Impact on the transaction',
    recovery: 'What to do',
    showFlag: false,
  },
  paths: [
    {
      id: 'direct',
      label: 'Send to the Sequencer',
      steps: [
        'submit',
        'wait-round',
        'execute',
        'fast-feed',
        'feed',
        'batch',
        'finalize',
        'assert',
        'settle',
      ],
    },
    {
      id: 'retryable',
      label: 'Send a retryable from the parent chain',
      steps: [
        'create-ticket',
        'wait-parent',
        'sequence-delayed',
        'ticket-created',
        'auto-redeem',
        'feed',
        'batch',
        'finalize',
        'assert',
        'settle',
      ],
    },
  ],
  actors: [
    {
      id: 'wallet',
      label: 'User wallet',
      tech: 'Any EVM wallet',
      kind: 'user',
      chain: 'off-chain',
    },
    { id: 'dapp', label: 'Dapp', tech: 'Parent chain account', kind: 'user', chain: 'parent' },
    { id: 'rpc', label: 'RPC node', tech: 'Go, nitro', kind: 'process', chain: 'child' },
    { id: 'seq', label: 'Sequencer', tech: 'Go, nitro', kind: 'process', chain: 'child' },
    { id: 'fastfeed', label: 'Fast Feed', tech: 'WebSocket', kind: 'process', chain: 'child' },
    { id: 'feed', label: 'Sequencer feed', tech: 'WebSocket', kind: 'process', chain: 'child' },
    {
      id: 'retryable',
      label: 'ArbRetryableTx',
      tech: 'Precompile',
      kind: 'contract',
      chain: 'child',
    },
    { id: 'poster', label: 'Batch poster', tech: 'Go, nitro', kind: 'process', chain: 'child' },
    { id: 'validator', label: 'Validator', tech: 'Go, nitro', kind: 'process', chain: 'child' },
    { id: 'inbox', label: 'Inbox', tech: 'Solidity', kind: 'contract', chain: 'parent' },
    { id: 'bridge', label: 'Bridge', tech: 'Solidity', kind: 'contract', chain: 'parent' },
    {
      id: 'seqinbox',
      label: 'SequencerInbox',
      tech: 'Solidity',
      kind: 'contract',
      chain: 'parent',
    },
    { id: 'rollup', label: 'Rollup', tech: 'Solidity', kind: 'contract', chain: 'parent' },
  ],
  edges: [
    { id: 'send', source: 'wallet', target: 'rpc', label: 'eth_sendRawTransaction' },
    { id: 'forward', source: 'rpc', target: 'seq', label: 'Forwards the transaction' },
    { id: 'publish-fast', source: 'seq', target: 'fastfeed', label: 'Each executed transaction' },
    { id: 'publish', source: 'seq', target: 'feed', label: 'Each stored block' },
    { id: 'share', source: 'seq', target: 'poster', label: 'Message log' },
    { id: 'post', source: 'poster', target: 'seqinbox', label: 'Batch (parent chain tx)' },
    { id: 'append', source: 'seqinbox', target: 'bridge', label: 'Append to accumulator' },
    { id: 'assert', source: 'validator', target: 'rollup', label: 'Assertion' },
    { id: 'create', source: 'dapp', target: 'inbox', label: 'createRetryableTicket' },
    { id: 'enqueue', source: 'inbox', target: 'bridge', label: 'Delayed message' },
    { id: 'delayed', source: 'bridge', target: 'seq', label: 'Delayed message' },
    {
      id: 'ticket',
      source: 'seq',
      target: 'retryable',
      label: 'Delayed message (ArbOS creates ticket)',
    },
  ],
  steps: [
    {
      id: 'submit',
      title: 'Submit',
      text:
        'Your wallet sends the signed transaction to an RPC node with eth_sendRawTransaction or ' +
        'eth_sendRawTransactionSync. ' +
        'The RPC node forwards it to the Sequencer. ' +
        'Before the Sequencer admits the transaction to its queue, it runs pre-checks. ' +
        'A used nonce, too little balance, a fee cap error or a full queue returns an error at ' +
        'once. ' +
        'Otherwise, eth_sendRawTransaction returns the transaction hash when the transaction ' +
        'enters the queue.',
      actors: ['wallet', 'rpc', 'seq'],
      edges: ['send', 'forward'],
      code: { repo: 'nitro', path: 'execution/gethexec/sequencer.go' },
      docs: docs.lifecycle,
      failure: {
        symptoms: 'eth_sendRawTransaction returned the transaction hash, but no receipt appears.',
        impact:
          'A transaction that passes the pre-checks can still be dropped before it reaches a ' +
          'block, for example because of a nonce gap, a fee cap below the base fee, or a queue ' +
          'timeout. ' +
          'eth_sendRawTransaction does not return these errors, and a dropped transaction has ' +
          'no receipt.',
        recovery:
          'If you need these errors, send the transaction with eth_sendRawTransactionSync. ' +
          'It returns inclusion errors as well as pre-check errors.',
      },
      citations: [
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 614 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 617 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 782 },
      ],
      txChain: 'child',
    },
    {
      id: 'wait-round',
      title: 'Wait for the round',
      text:
        "The transaction waits in the Sequencer's unordered waiting list until the next " +
        'Priority Gas Auction (PGA) round starts. ' +
        'On Arbitrum One, each block has {var:arbOnePgaRoundsPerBlock} rounds of ' +
        '{var:arbOnePgaRoundMs} ms.',
      actors: ['seq'],
      edges: [],
      detail: { actor: 'seq', flow: pgaRound },
      code: { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go' },
      docs: docs.pga,
      citations: [
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 782 },
        { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go', line: 84 },
        { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go', line: 90 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 125 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 131 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 1239 },
      ],
      txChain: 'child',
    },
    {
      id: 'execute',
      title: 'Order and execute',
      text:
        "When the round's execute phase starts, the Sequencer takes transactions from the " +
        'priority queue, highest priority first. ' +
        'ArbOS executes each one into the block the Sequencer is building. ' +
        'If you sent the transaction with eth_sendRawTransactionSync, the call returns here with ' +
        'a partial receipt. ' +
        'Its blockHash is 0x000…000, because the block is not sealed yet. ' +
        'If the block then fails, for example after a disk write error or a Sequencer crash, ' +
        'that receipt is retracted. ' +
        'To get the canonical receipt with its blockHash, poll eth_getTransactionReceipt.',
      actors: ['seq'],
      edges: [],
      code: { repo: 'nitro', path: 'execution/gethexec/full_sequencing_hooks.go' },
      docs: docs.pga,
      citations: [
        { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go', line: 92 },
        { repo: 'nitro', path: 'execution/gethexec/pga_tx_orderer.go', line: 104 },
        { repo: 'nitro', path: 'execution/gethexec/full_sequencing_hooks.go', line: 163 },
        { repo: 'nitro', path: 'execution/gethexec/full_sequencing_hooks.go', line: 168 },
      ],
      txChain: 'child',
    },
    {
      id: 'fast-feed',
      title: 'Fast Feed',
      text:
        'As soon as the Sequencer executes the transaction, it publishes it on the Fast Feed, ' +
        'inside the PGA round and before the block closes. ' +
        'Each message carries the PGA round, a tentative block number and a partial receipt ' +
        'with no block hash. ' +
        'The Fast Feed is a paid, authenticated stream. ' +
        'It is an early signal, not a confirmation level.',
      actors: ['seq', 'fastfeed'],
      edges: ['publish-fast'],
      code: { repo: 'nitro', path: 'transactionfeed/message.go' },
      docs: docs.fastFeed,
      citations: [
        { repo: 'nitro', path: 'arbos/block_processor.go', line: 421 },
        { repo: 'nitro', path: 'execution/gethexec/full_sequencing_hooks.go', line: 143 },
        { repo: 'nitro', path: 'execution/gethexec/full_sequencing_hooks.go', line: 150 },
        { repo: 'nitro', path: 'execution/gethexec/full_sequencing_hooks.go', line: 158 },
        { repo: 'nitro', path: 'transactionfeed/message.go', line: 30 },
        { repo: 'nitro', path: 'transactionfeed/message.go', line: 35 },
        { repo: 'nitro', path: 'transactionfeed/message.go', line: 42 },
      ],
      txChain: 'child',
    },
    {
      id: 'feed',
      title: 'Sequencer feed',
      text:
        'The block closes. ' +
        'The Sequencer stores the block, then sends it to nodes on the Sequencer feed. ' +
        'Nodes serve it under the latest block tag. ' +
        'This is a soft confirmation. ' +
        'It is a promise from the Sequencer that the parent chain does not back yet.',
      actors: ['seq', 'feed'],
      edges: ['publish'],
      code: { repo: 'nitro', path: 'broadcaster/broadcaster.go' },
      finality: 'soft-confirmation',
      docs: docs.finality,
      citations: [
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1249 },
        { repo: 'nitro', path: 'arbnode/transaction_streamer.go', line: 1255 },
        { repo: 'nitro', path: 'broadcaster/broadcaster.go', line: 77 },
      ],
      txChain: 'child',
    },
    {
      id: 'batch',
      title: 'Batch and post',
      text:
        'The batch poster reads new messages from the Sequencer and compresses them with ' +
        'Brotli into a batch. ' +
        'It posts the batch to SequencerInbox on the parent chain, as calldata or in EIP-4844 ' +
        'blobs. ' +
        "SequencerInbox appends the batch to the Bridge's accumulator.",
      actors: ['seq', 'poster', 'seqinbox', 'bridge'],
      edges: ['share', 'post', 'append'],
      code: { repo: 'nitro', path: 'arbnode/batch_poster.go' },
      docs: docs.batchPoster,
      citations: [
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1621 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 1212 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 88 },
        { repo: 'nitro', path: 'arbnode/batch_poster.go', line: 89 },
        { repo: 'nitro-contracts', path: 'src/bridge/SequencerInbox.sol', line: 343 },
        { repo: 'nitro-contracts', path: 'src/bridge/SequencerInbox.sol', line: 733 },
      ],
      txChain: 'parent',
    },
    {
      id: 'finalize',
      title: 'Parent chain finalizes',
      text:
        'The parent chain block that holds the batch becomes safe, then finalized. ' +
        'Nodes then serve the child chain block under the safe and finalized block tags. ' +
        'This is hard finality. ' +
        'Only a deep parent chain reorg can revert a safe block. ' +
        'A finalized block reverts only if the parent chain reverts a finalized block.',
      actors: ['seqinbox'],
      edges: [],
      code: { repo: 'nitro', path: 'arbnode/inbox_reader.go' },
      finality: 'hard',
      docs: docs.finality,
      citations: [
        { repo: 'nitro', path: 'arbnode/inbox_reader.go', line: 213 },
        { repo: 'nitro', path: 'arbnode/inbox_reader.go', line: 230 },
        { repo: 'nitro', path: 'arbnode/inbox_reader.go', line: 236 },
        { repo: 'nitro', path: 'arbnode/inbox_reader.go', line: 244 },
        { repo: 'nitro', path: 'arbnode/consensus_execution_syncer.go', line: 126 },
        { repo: 'nitro', path: 'arbnode/consensus_execution_syncer.go', line: 155 },
      ],
      txChain: 'parent',
    },
    {
      id: 'assert',
      title: 'Assert',
      text:
        'A validator computes the child chain state after the posted batches. ' +
        'It posts that state as an assertion to the Rollup contract on the parent chain.',
      actors: ['validator', 'rollup'],
      edges: ['assert'],
      code: { repo: 'nitro', path: 'bold/assertions/poster.go' },
      docs: docs.assertions,
      citations: [
        { repo: 'nitro', path: 'bold/assertions/poster.go', line: 211 },
        { repo: 'nitro', path: 'bold/assertions/poster.go', line: 228 },
        { repo: 'nitro', path: 'bold/assertions/poster.go', line: 261 },
        { repo: 'nitro-contracts', path: 'src/rollup/RollupUserLogic.sol', line: 164 },
        { repo: 'nitro-contracts', path: 'src/rollup/RollupCore.sol', line: 412 },
      ],
      txChain: 'parent',
    },
    {
      id: 'settle',
      title: 'Settle',
      text:
        'On Arbitrum One, the challenge period is {var:arbOneDisputeWindowDays} days. ' +
        'After it ends, a validator confirms the assertion on the Rollup contract. ' +
        'If another assertion competes with it, only the winner of the challenge can be ' +
        'confirmed. ' +
        "Confirmation sends the assertion's send root to the Outbox, so withdrawals from " +
        'the blocks it covers can run. ' +
        'An assertion never reorgs the child chain. ' +
        'A rejected assertion only keeps an invalid state from being confirmed.',
      actors: ['rollup'],
      edges: [],
      code: { repo: 'nitro-contracts', path: 'src/rollup/RollupUserLogic.sol' },
      finality: 'settled',
      docs: {
        href: '/how-arbitrum-works/reference/finality-and-reorgs#the-reorg-model',
        label: 'The reorg model',
      },
      citations: [
        { repo: 'nitro-contracts', path: 'src/rollup/RollupUserLogic.sol', line: 75 },
        { repo: 'nitro-contracts', path: 'src/rollup/RollupUserLogic.sol', line: 82 },
        { repo: 'nitro-contracts', path: 'src/rollup/RollupUserLogic.sol', line: 104 },
        { repo: 'nitro-contracts', path: 'src/rollup/RollupUserLogic.sol', line: 111 },
        { repo: 'nitro-contracts', path: 'src/rollup/RollupCore.sol', line: 297 },
        { repo: 'nitro-contracts', path: 'src/rollup/RollupCore.sol', line: 300 },
      ],
      txChain: 'parent',
    },
    {
      id: 'create-ticket',
      title: 'Create the ticket',
      text:
        'Your app calls createRetryableTicket on the Inbox contract on the parent chain. ' +
        'The ETH you send must cover maxSubmissionCost + l2CallValue + gasLimit × maxFeePerGas, ' +
        'or the call reverts. ' +
        'maxSubmissionCost must also cover the submission fee for your calldata. ' +
        'Inbox passes the message to the Bridge, which adds it to the delayed inbox.',
      actors: ['dapp', 'inbox', 'bridge'],
      edges: ['create', 'enqueue'],
      code: { repo: 'nitro-contracts', path: 'src/bridge/Inbox.sol' },
      docs: docs.retryables,
      citations: [
        { repo: 'nitro-contracts', path: 'src/bridge/Inbox.sol', line: 261 },
        { repo: 'nitro-contracts', path: 'src/bridge/AbsInbox.sol', line: 234 },
        { repo: 'nitro-contracts', path: 'src/bridge/AbsInbox.sol', line: 298 },
        { repo: 'nitro-contracts', path: 'src/bridge/AbsInbox.sol', line: 331 },
        { repo: 'nitro-contracts', path: 'src/bridge/Inbox.sol', line: 323 },
        { repo: 'nitro-contracts', path: 'src/bridge/AbsBridge.sol', line: 187 },
      ],
      txChain: 'parent',
    },
    {
      id: 'wait-parent',
      title: 'Wait for the parent chain',
      text:
        'The Sequencer does not read the message at once. ' +
        'By default, it waits until the parent chain block that holds the message is safe. ' +
        'An operator can make it wait for finalized instead. ' +
        'If the Sequencer does not include the message, anyone can force-include it once the ' +
        'force-inclusion window ends, at most {var:arbOneForceIncludePeriodHours} hours on ' +
        'Arbitrum One.',
      actors: ['bridge'],
      edges: [],
      code: { repo: 'nitro', path: 'arbnode/delayed_sequencer.go' },
      docs: docs.forced,
      citations: [
        { repo: 'nitro', path: 'arbnode/delayed_sequencer.go', line: 120 },
        { repo: 'nitro', path: 'arbnode/delayed_sequencer.go', line: 124 },
        { repo: 'nitro', path: 'arbnode/delayed_sequencer.go', line: 126 },
        { repo: 'nitro', path: 'arbnode/delayed_sequencer.go', line: 69 },
        { repo: 'nitro', path: 'arbnode/delayed_sequencer.go', line: 70 },
        { repo: 'nitro', path: 'arbnode/delayed_sequencer.go', line: 164 },
        { repo: 'nitro-contracts', path: 'src/bridge/SequencerInbox.sol', line: 273 },
        { repo: 'nitro-contracts', path: 'src/bridge/SequencerInbox.sol', line: 300 },
      ],
      txChain: 'parent',
    },
    {
      id: 'sequence-delayed',
      title: 'Sequence the message',
      text:
        'The Sequencer reads the message from the delayed inbox and builds a child chain block ' +
        'from it. ' +
        'It takes delayed messages in the order the Bridge recorded them. ' +
        'The message does not go through the PGA rounds.',
      actors: ['bridge', 'seq'],
      edges: ['delayed'],
      code: { repo: 'nitro', path: 'execution/gethexec/executionengine.go' },
      docs: docs.delayedInbox,
      citations: [
        { repo: 'nitro', path: 'arbnode/delayed_sequencer.go', line: 183 },
        { repo: 'nitro', path: 'execution/gethexec/sequencer.go', line: 1871 },
        { repo: 'nitro', path: 'execution/gethexec/executionengine.go', line: 937 },
        { repo: 'nitro', path: 'execution/gethexec/executionengine.go', line: 1075 },
        { repo: 'nitro', path: 'execution/gethexec/executionengine.go', line: 1085 },
      ],
      txChain: 'child',
    },
    {
      id: 'ticket-created',
      title: 'Ticket created',
      text:
        'ArbOS creates the ticket with a lifetime of one week. ' +
        'The ArbRetryableTx precompile emits TicketCreated with the ticket ID. ' +
        "The ticket's sender on the child chain is an alias, the parent chain address plus " +
        '0x1111000000000000000000000000000000001111. ' +
        'If a contract sent the message, call AddressAliasHelper.undoL1ToL2Alias to get the ' +
        "contract's address back. " +
        'Inbox also aliases a refund address that is a contract.',
      actors: ['seq', 'retryable'],
      edges: ['ticket'],
      code: { repo: 'nitro', path: 'arbos/tx_processor.go' },
      docs: docs.retryables,
      citations: [
        { repo: 'nitro', path: 'arbos/tx_processor.go', line: 276 },
        { repo: 'nitro', path: 'arbos/tx_processor.go', line: 404 },
        { repo: 'nitro', path: 'arbos/tx_processor.go', line: 407 },
        { repo: 'nitro', path: 'arbos/tx_processor.go', line: 427 },
        { repo: 'nitro', path: 'arbos/retryables/retryable.go', line: 24 },
        { repo: 'nitro-contracts', path: 'src/bridge/Inbox.sol', line: 324 },
        { repo: 'nitro', path: 'arbnode/delayed.go', line: 232 },
        { repo: 'nitro', path: 'arbos/parse_l2.go', line: 364 },
        { repo: 'nitro-contracts', path: 'src/bridge/AbsInbox.sol', line: 243 },
        { repo: 'nitro-contracts', path: 'src/bridge/AbsInbox.sol', line: 246 },
      ],
      txChain: 'child',
    },
    {
      id: 'auto-redeem',
      title: 'Auto-redeem',
      text:
        "ArbOS checks the sender's child chain balance, which includes the ETH you deposited. " +
        'If it covers gasLimit × maxFeePerGas, maxFeePerGas is at least the base fee, and ' +
        'gasLimit is at least 21,000, ArbOS schedules a redeem. ' +
        'The redeem runs in the same block, right after the ticket. ' +
        'ArbOS refunds the unused fees to excessFeeRefundAddress.',
      actors: ['retryable'],
      edges: [],
      code: { repo: 'nitro', path: 'precompiles/ArbRetryableTx.go' },
      docs: docs.retryables,
      failure: {
        symptoms: 'TicketCreated appears, but no successful redeem of the ticket follows.',
        impact:
          "The ticket's call has not run. " +
          'The ticket waits in the retryable buffer and expires one week after it was created, ' +
          'unless someone keeps it alive.',
        recovery:
          'Anyone can call ArbRetryableTx.redeem with the ticket ID to try again with more gas. ' +
          'ArbRetryableTx.keepalive adds one more week to the lifetime. ' +
          'If the ticket expires, ArbOS sends the call value to callValueRefundAddress.',
      },
      citations: [
        { repo: 'nitro', path: 'arbos/tx_processor.go', line: 322 },
        { repo: 'nitro', path: 'arbos/tx_processor.go', line: 439 },
        { repo: 'nitro', path: 'arbos/tx_processor.go', line: 484 },
        { repo: 'nitro', path: 'arbos/tx_processor.go', line: 514 },
        { repo: 'nitro', path: 'arbos/block_processor.go', line: 434 },
        { repo: 'nitro', path: 'arbos/block_processor.go', line: 719 },
        { repo: 'nitro', path: 'precompiles/ArbRetryableTx.go', line: 50 },
        { repo: 'nitro', path: 'precompiles/ArbRetryableTx.go', line: 184 },
        { repo: 'nitro', path: 'arbos/retryables/retryable.go', line: 269 },
        { repo: 'nitro', path: 'arbos/retryables/retryable.go', line: 173 },
        { repo: 'nitro', path: 'arbos/parse_l2.go', line: 371 },
      ],
      txChain: 'child',
    },
  ],
};
