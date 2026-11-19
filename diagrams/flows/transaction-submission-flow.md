---
title: 'Transaction submission'
widget: transaction-submission-flow
parts: [wallet, dapp, rpc, seq, fastfeed, feed, retryable, poster, validator, inbox, bridge, seqinbox, rollup]
edges:
  send: 'wallet -> rpc "eth_sendRawTransaction"'
  forward: 'rpc -> seq "Forwards the transaction"'
  publish-fast: 'seq -> fastfeed "Each executed transaction"'
  publish: 'seq -> feed "Each stored block"'
  share: 'seq -> poster "Message log"'
  post: 'poster -> seqinbox "Batch (parent chain tx)"'
  append: 'seqinbox -> bridge "Append to accumulator"'
  assert: 'validator -> rollup "Assertion"'
  create: 'dapp -> inbox "createRetryableTicket"'
  enqueue: 'inbox -> bridge "Delayed message"'
  delayed: 'bridge -> seq "Delayed message"'
  ticket: 'seq -> retryable "Delayed message (ArbOS creates ticket)"'
paths:
  - id: direct
    label: 'Send to the Sequencer'
    steps: [submit, wait-round, execute, fast-feed, feed, batch, finalize, assert, settle]
  - id: retryable
    label: 'Send a retryable from the parent chain'
    steps: [create-ticket, wait-parent, sequence-delayed, ticket-created, auto-redeem, feed, batch, finalize, assert, settle]
card:
  detailsToggle: 'Show details'
  symptoms: 'What you see'
  impact: 'Impact on the transaction'
  recovery: 'What to do'
  showFlag: false
---

## Submit {#submit}

parts: wallet, rpc, seq
edges: send, forward
code: nitro/execution/gethexec/sequencer.go
cites: nitro/execution/gethexec/sequencer.go:614, nitro/execution/gethexec/sequencer.go:617, nitro/execution/gethexec/sequencer.go:782
lane: child
docs: [Transaction lifecycle](/how-arbitrum-works/deep-dives/transaction-lifecycle)

Your wallet sends the signed transaction to an RPC node with eth_sendRawTransaction or eth_sendRawTransactionSync. The RPC node forwards it to the Sequencer. Before the Sequencer admits the transaction to its queue, it runs pre-checks. A used nonce, too little balance, a fee cap error or a full queue returns an error at once. Otherwise, eth_sendRawTransaction returns the transaction hash when the transaction enters the queue.

### Failure

**Symptoms.** eth_sendRawTransaction returned the transaction hash, but no receipt appears.

**Impact.** A transaction that passes the pre-checks can still be dropped before it reaches a block, for example because of a nonce gap, a fee cap below the base fee, or a queue timeout. eth_sendRawTransaction does not return these errors, and a dropped transaction has no receipt.

**Recovery.** If you need these errors, send the transaction with eth_sendRawTransactionSync. It returns inclusion errors as well as pre-check errors.

## Wait for the round {#wait-round}

parts: seq
code: nitro/execution/gethexec/pga_tx_orderer.go
cites: nitro/execution/gethexec/sequencer.go:782, nitro/execution/gethexec/pga_tx_orderer.go:84, nitro/execution/gethexec/pga_tx_orderer.go:90, nitro/execution/gethexec/sequencer.go:125, nitro/execution/gethexec/sequencer.go:131, nitro/execution/gethexec/sequencer.go:1239
lane: child
docs: [Priority Gas Auction](/how-arbitrum-works/priority-gas-auction/pga)
detail: seq -> pga-round

The transaction waits in the Sequencer's unordered waiting list until the next Priority Gas Auction (PGA) round starts. On Arbitrum One, each block has {var:arbOnePgaRoundsPerBlock} rounds of {var:arbOnePgaRoundMs} ms.

## Order and execute {#execute}

parts: seq
code: nitro/execution/gethexec/full_sequencing_hooks.go
cites: nitro/execution/gethexec/pga_tx_orderer.go:92, nitro/execution/gethexec/pga_tx_orderer.go:104, nitro/execution/gethexec/full_sequencing_hooks.go:163, nitro/execution/gethexec/full_sequencing_hooks.go:168
lane: child
docs: [Priority Gas Auction](/how-arbitrum-works/priority-gas-auction/pga)

When the round's execute phase starts, the Sequencer takes transactions from the priority queue, highest priority first. ArbOS executes each one into the block the Sequencer is building. If you sent the transaction with eth_sendRawTransactionSync, the call returns here with a partial receipt. Its blockHash is 0x000…000, because the block is not sealed yet. If the block then fails, for example after a disk write error or a Sequencer crash, that receipt is retracted. To get the canonical receipt with its blockHash, poll eth_getTransactionReceipt.

## Fast Feed {#fast-feed}

parts: seq, fastfeed
edges: publish-fast
code: nitro/transactionfeed/message.go
cites: nitro/arbos/block_processor.go:421, nitro/execution/gethexec/full_sequencing_hooks.go:143, nitro/execution/gethexec/full_sequencing_hooks.go:150, nitro/execution/gethexec/full_sequencing_hooks.go:158, nitro/transactionfeed/message.go:30, nitro/transactionfeed/message.go:35, nitro/transactionfeed/message.go:42
lane: child
docs: [Fast Feed](/how-arbitrum-works/priority-gas-auction/fast-feed)

As soon as the Sequencer executes the transaction, it publishes it on the Fast Feed, inside the PGA round and before the block closes. Each message carries the PGA round, a tentative block number and a partial receipt with no block hash. The Fast Feed is a paid, authenticated stream. It is an early signal, not a confirmation level.

## Sequencer feed {#feed}

parts: seq, feed
edges: publish
code: nitro/broadcaster/broadcaster.go
cites: nitro/arbnode/transaction_streamer.go:1249, nitro/arbnode/transaction_streamer.go:1255, nitro/broadcaster/broadcaster.go:77
finality: soft-confirmation
lane: child
docs: [Finality and reorgs](/how-arbitrum-works/reference/finality-and-reorgs)

The block closes. The Sequencer stores the block, then sends it to nodes on the Sequencer feed. Nodes serve it under the latest block tag. This is a soft confirmation. It is a promise from the Sequencer that the parent chain does not back yet.

## Batch and post {#batch}

parts: seq, poster, seqinbox, bridge
edges: share, post, append
code: nitro/arbnode/batch_poster.go
cites: nitro/arbnode/batch_poster.go:1621, nitro/arbnode/batch_poster.go:1212, nitro/arbnode/batch_poster.go:88, nitro/arbnode/batch_poster.go:89, nitro-contracts/src/bridge/SequencerInbox.sol:343, nitro-contracts/src/bridge/SequencerInbox.sol:733
lane: parent
docs: [Batch poster](/how-arbitrum-works/deep-dives/batchposter)

The batch poster reads new messages from the Sequencer and compresses them with Brotli into a batch. It posts the batch to SequencerInbox on the parent chain, as calldata or in EIP-4844 blobs. SequencerInbox appends the batch to the Bridge's accumulator.

## Parent chain finalizes {#finalize}

parts: seqinbox
code: nitro/arbnode/inbox_reader.go
cites: nitro/arbnode/inbox_reader.go:213, nitro/arbnode/inbox_reader.go:230, nitro/arbnode/inbox_reader.go:236, nitro/arbnode/inbox_reader.go:244, nitro/arbnode/consensus_execution_syncer.go:126, nitro/arbnode/consensus_execution_syncer.go:155
finality: hard
lane: parent
docs: [Finality and reorgs](/how-arbitrum-works/reference/finality-and-reorgs)

The parent chain block that holds the batch becomes safe, then finalized. Nodes then serve the child chain block under the safe and finalized block tags. This is hard finality. Only a deep parent chain reorg can revert a safe block. A finalized block reverts only if the parent chain reverts a finalized block.

## Assert {#assert}

parts: validator, rollup
edges: assert
code: nitro/bold/assertions/poster.go
cites: nitro/bold/assertions/poster.go:211, nitro/bold/assertions/poster.go:228, nitro/bold/assertions/poster.go:261, nitro-contracts/src/rollup/RollupUserLogic.sol:164, nitro-contracts/src/rollup/RollupCore.sol:412
lane: parent
docs: [Assertions](/how-arbitrum-works/deep-dives/assertions)

A validator computes the child chain state after the posted batches. It posts that state as an assertion to the Rollup contract on the parent chain.

## Settle {#settle}

parts: rollup
code: nitro-contracts/src/rollup/RollupUserLogic.sol
cites: nitro-contracts/src/rollup/RollupUserLogic.sol:75, nitro-contracts/src/rollup/RollupUserLogic.sol:82, nitro-contracts/src/rollup/RollupUserLogic.sol:104, nitro-contracts/src/rollup/RollupUserLogic.sol:111, nitro-contracts/src/rollup/RollupCore.sol:297, nitro-contracts/src/rollup/RollupCore.sol:300
finality: settled
lane: parent
docs: [The reorg model](/how-arbitrum-works/reference/finality-and-reorgs#the-reorg-model)

On Arbitrum One, the challenge period is {var:arbOneDisputeWindowDays} days. After it ends, a validator confirms the assertion on the Rollup contract. If another assertion competes with it, only the winner of the challenge can be confirmed. Confirmation sends the assertion's send root to the Outbox, so withdrawals from the blocks it covers can run. An assertion never reorgs the child chain. A rejected assertion only keeps an invalid state from being confirmed.

## Create the ticket {#create-ticket}

parts: dapp, inbox, bridge
edges: create, enqueue
code: nitro-contracts/src/bridge/Inbox.sol
cites: nitro-contracts/src/bridge/Inbox.sol:261, nitro-contracts/src/bridge/AbsInbox.sol:234, nitro-contracts/src/bridge/AbsInbox.sol:298, nitro-contracts/src/bridge/AbsInbox.sol:331, nitro-contracts/src/bridge/Inbox.sol:323, nitro-contracts/src/bridge/AbsBridge.sol:187
lane: parent
docs: [Retryable tickets](/how-arbitrum-works/deep-dives/l1-to-l2-messaging#retryable-tickets)

Your app calls createRetryableTicket on the Inbox contract on the parent chain. The ETH you send must cover maxSubmissionCost + l2CallValue + gasLimit × maxFeePerGas, or the call reverts. maxSubmissionCost must also cover the submission fee for your calldata. Inbox passes the message to the Bridge, which adds it to the delayed inbox.

## Wait for the parent chain {#wait-parent}

parts: bridge
code: nitro/arbnode/delayed_sequencer.go
cites: nitro/arbnode/delayed_sequencer.go:120, nitro/arbnode/delayed_sequencer.go:124, nitro/arbnode/delayed_sequencer.go:126, nitro/arbnode/delayed_sequencer.go:69, nitro/arbnode/delayed_sequencer.go:70, nitro/arbnode/delayed_sequencer.go:164, nitro-contracts/src/bridge/SequencerInbox.sol:273, nitro-contracts/src/bridge/SequencerInbox.sol:300
lane: parent
docs: [Forced transactions](/how-arbitrum-works/deep-dives/forced-transactions)

The Sequencer does not read the message at once. By default, it waits until the parent chain block that holds the message is safe. An operator can make it wait for finalized instead. If the Sequencer does not include the message, anyone can force-include it once the force-inclusion window ends, at most {var:arbOneForceIncludePeriodHours} hours on Arbitrum One.

## Sequence the message {#sequence-delayed}

parts: bridge, seq
edges: delayed
code: nitro/execution/gethexec/executionengine.go
cites: nitro/arbnode/delayed_sequencer.go:183, nitro/execution/gethexec/sequencer.go:1871, nitro/execution/gethexec/executionengine.go:937, nitro/execution/gethexec/executionengine.go:1075, nitro/execution/gethexec/executionengine.go:1085
lane: child
docs: [Transacting through the Delayed Inbox](/how-arbitrum-works/deep-dives/l1-to-l2-messaging#transacting-via-the-delayed-inbox)

The Sequencer reads the message from the delayed inbox and builds a child chain block from it. It takes delayed messages in the order the Bridge recorded them. The message does not go through the PGA rounds.

## Ticket created {#ticket-created}

parts: seq, retryable
edges: ticket
code: nitro/arbos/tx_processor.go
cites: nitro/arbos/tx_processor.go:276, nitro/arbos/tx_processor.go:404, nitro/arbos/tx_processor.go:407, nitro/arbos/tx_processor.go:427, nitro/arbos/retryables/retryable.go:24, nitro-contracts/src/bridge/Inbox.sol:324, nitro/arbnode/delayed.go:232, nitro/arbos/parse_l2.go:364, nitro-contracts/src/bridge/AbsInbox.sol:243, nitro-contracts/src/bridge/AbsInbox.sol:246
lane: child
docs: [Retryable tickets](/how-arbitrum-works/deep-dives/l1-to-l2-messaging#retryable-tickets)

ArbOS creates the ticket with a lifetime of one week. The ArbRetryableTx precompile emits TicketCreated with the ticket ID. The ticket's sender on the child chain is an alias, the parent chain address plus 0x1111000000000000000000000000000000001111. If a contract sent the message, call AddressAliasHelper.undoL1ToL2Alias to get the contract's address back. Inbox also aliases a refund address that is a contract.

## Auto-redeem {#auto-redeem}

parts: retryable
code: nitro/precompiles/ArbRetryableTx.go
cites: nitro/arbos/tx_processor.go:322, nitro/arbos/tx_processor.go:439, nitro/arbos/tx_processor.go:484, nitro/arbos/tx_processor.go:514, nitro/arbos/block_processor.go:434, nitro/arbos/block_processor.go:719, nitro/precompiles/ArbRetryableTx.go:50, nitro/precompiles/ArbRetryableTx.go:184, nitro/arbos/retryables/retryable.go:269, nitro/arbos/retryables/retryable.go:173, nitro/arbos/parse_l2.go:371
lane: child
docs: [Retryable tickets](/how-arbitrum-works/deep-dives/l1-to-l2-messaging#retryable-tickets)

ArbOS checks the sender's child chain balance, which includes the ETH you deposited. If it covers gasLimit × maxFeePerGas, maxFeePerGas is at least the base fee, and gasLimit is at least 21,000, ArbOS schedules a redeem. The redeem runs in the same block, right after the ticket. ArbOS refunds the unused fees to excessFeeRefundAddress.

### Failure

**Symptoms.** TicketCreated appears, but no successful redeem of the ticket follows.

**Impact.** The ticket's call has not run. The ticket waits in the retryable buffer and expires one week after it was created, unless someone keeps it alive.

**Recovery.** Anyone can call ArbRetryableTx.redeem with the ticket ID to try again with more gas. ArbRetryableTx.keepalive adds one more week to the lifetime. If the ticket expires, ArbOS sends the call value to callValueRefundAddress.
