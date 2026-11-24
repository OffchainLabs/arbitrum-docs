---
title: 'Transaction submission'
widget: transaction-submission-flow
# Sub-lines say what each node does here. The overrides keep the shared parts unchanged for the
# Nitro flow and the static SVG.
parts:
  - wallet
  - dapp
  - rpc: { tech: 'Forwards to the Sequencer' }
  - seq: { tech: 'Orders and executes' }
  - fastfeed: { tech: 'Paid, streams each transaction' }
  - feed: { tech: 'Free, streams each block' }
  - retryable
  - poster: { tech: 'Posts batches' }
  - proposer: { tech: 'Posts assertions' }
  - inbox
  - bridge
  - bridge-late
  - seqinbox
  - rollup
  - outbox
# Each label names what travels along the edge, read without the caption.
edges:
  send: 'wallet -> rpc "Signed transaction"'
  forward: 'rpc -> seq "Forwarded transaction"'
  publish-fast: 'seq -> fastfeed "Each executed transaction"'
  publish: 'seq -> feed "Each stored block"'
  share: 'seq -> poster "Sequenced messages"'
  post: 'poster -> seqinbox "Compressed batch"'
  append: 'seqinbox -> bridge-late "Accumulator entry"'
  assert: 'proposer -> rollup "Assertion"'
  confirm: 'rollup -> outbox "Send root"'
  create: 'dapp -> inbox "createRetryableTicket"'
  enqueue: 'inbox -> bridge "Delayed message"'
  delayed: 'bridge -> seq "Delayed message"'
  ticket: 'seq -> retryable "Delayed message (ArbOS creates ticket)"'
paths:
  - id: direct
    label: 'Transaction sent to the Sequencer'
    steps: [submit, wait-round, execute, fast-feed, feed, batch, finalize, assert, settle]
  - id: retryable
    label: 'Retryable ticket sent from the parent chain'
    steps: [create-ticket, wait-parent, sequence-delayed, ticket-created, auto-redeem, feed, batch, finalize, assert, settle]
card:
  overviewTab: 'What happens'
  failureTab: 'If it fails'
  symptoms: 'What you see'
  impact: 'Impact on the transaction'
  recovery: 'What to do'
  showFlag: false
---

## Submit {#submit}

parts: wallet, rpc, seq
edges: send, forward
code: nitro/execution/gethexec/sequencer.go
cites: sequencer.go:614, 617, 782
lane: child
docs: [How transactions reach the Sequencer](/how-arbitrum-works/deep-dives/sequencer-transaction-flow#how-transactions-reach-the-sequencer)

Your wallet sends the signed transaction to an RPC node with `eth_sendRawTransaction` or `eth_sendRawTransactionSync`. The RPC node forwards it to the Sequencer. Before the Sequencer admits the transaction to its queue, it runs pre-checks. A used nonce, too little balance, a fee cap error or a full queue returns an error at once. Otherwise, `eth_sendRawTransaction` returns the transaction hash when the transaction enters the queue.

### Failure

**Symptoms.** `eth_sendRawTransaction` returned the transaction hash, but no receipt appears.

**Impact.** A transaction that passes the pre-checks can still be dropped before it reaches a block, for example because of a nonce gap, a fee cap below the base fee, or a queue timeout. `eth_sendRawTransaction` does not return these errors, and a dropped transaction has no receipt.

**Recovery.** If you need these errors, send the transaction with `eth_sendRawTransactionSync`. It returns inclusion errors as well as pre-check errors.

## Wait for the round {#wait-round}

parts: seq
code: nitro/execution/gethexec/pga_tx_orderer.go
cites: sequencer.go:782, pga_tx_orderer.go:84, 90, sequencer.go:125, 131, 1239
lane: child
docs: [Priority Gas Auction](/how-arbitrum-works/priority-gas-auction/pga)
detail: seq -> pga-round -> fast-feed

The transaction waits in the Sequencer's unordered waiting list until the next Priority Gas Auction (PGA) round starts. On Arbitrum One, each block has {var:arbOnePgaRoundsPerBlock} rounds of {var:arbOnePgaRoundMs} ms.

## Order and execute {#execute}

parts: seq
code: nitro/execution/gethexec/full_sequencing_hooks.go
cites: pga_tx_orderer.go:92, 104, full_sequencing_hooks.go:163, 168
lane: child
docs: [Priority Gas Auction](/how-arbitrum-works/priority-gas-auction/pga)

When the round's execute phase starts, the Sequencer takes transactions from the priority queue, highest priority first. ArbOS executes each one into the block the Sequencer is building. If you sent the transaction with `eth_sendRawTransactionSync`, the call returns here with a partial receipt. Its `blockHash` is `0x000…000`, because the block is not sealed yet. If the block then fails, for example after a disk write error or a Sequencer crash, that receipt is retracted. To get the canonical receipt with its `blockHash`, poll `eth_getTransactionReceipt`.

## Publish on the Fast Feed {#fast-feed}

parts: seq, fastfeed
edges: publish-fast
code: nitro/transactionfeed/message.go
cites: nitro/arbos/block_processor.go:421, nitro/execution/gethexec/full_sequencing_hooks.go:143, 150, 158, message.go:30, 35, 42
lane: child
docs: [Fast Feed](/how-arbitrum-works/priority-gas-auction/fast-feed)

As soon as the Sequencer executes the transaction, it publishes it on the Fast Feed, inside the PGA round and before the block closes. Each message carries the PGA round, a tentative block number and a partial receipt with no block hash. The Fast Feed is a paid, authenticated stream. It is an early signal, not a confirmation level.

## Publish the block {#feed}

parts: seq, feed
edges: publish
code: nitro/broadcaster/broadcaster.go
cites: nitro/arbnode/transaction_streamer.go:1249, 1255, broadcaster.go:77
finality: soft-confirmation
lane: child
docs: [Finality and reorgs](/how-arbitrum-works/reference/finality-and-reorgs)

The block closes. The Sequencer stores the block, then sends it to nodes on the Sequencer feed. Nodes serve it under the `latest` block tag. This is a soft confirmation. It is a promise from the Sequencer that the parent chain does not back yet.

## Batch and post {#batch}

parts: seq, poster, seqinbox, bridge-late
edges: share, post, append
code: nitro/arbnode/batch_poster.go
cites: batch_poster.go:1621, 1212, 88, 89, nitro-contracts/src/bridge/SequencerInbox.sol:343, 733
lane: parent
docs: [Batch poster](/how-arbitrum-works/deep-dives/batchposter)

The batch poster reads new messages from the Sequencer and compresses them with Brotli into a batch. It posts the batch to SequencerInbox on the parent chain, as calldata or in EIP-4844 blobs. SequencerInbox appends the batch to the Bridge's accumulator.

## Finalize on the parent chain {#finalize}

parts: seqinbox
code: nitro/arbnode/inbox_reader.go
cites: inbox_reader.go:213, 230, 236, 244, consensus_execution_syncer.go:126, 155
finality: hard
lane: parent
docs: [Finality and reorgs](/how-arbitrum-works/reference/finality-and-reorgs)

The parent chain block that holds the batch becomes safe, then finalized. Nodes then serve the child chain block under the `safe` and `finalized` block tags. This is hard finality. Only a deep parent chain reorg can revert a safe block. A finalized block reverts only if the parent chain reverts a finalized block.

## Assert {#assert}

parts: proposer, rollup
edges: assert
code: nitro/bold/assertions/poster.go
cites: poster.go:211, 228, 261, nitro-contracts/src/rollup/RollupUserLogic.sol:164, nitro-contracts/src/rollup/RollupCore.sol:412
lane: parent
docs: [Assertions](/how-arbitrum-works/deep-dives/assertions)

A proposer computes the child chain state after the posted batches. It posts that state as an assertion to the Rollup contract on the parent chain.

## Settle {#settle}

parts: rollup, outbox
edges: confirm
code: nitro-contracts/src/rollup/RollupUserLogic.sol
cites: RollupUserLogic.sol:75, 82, 104, 111, RollupCore.sol:297, 300
finality: settled
lane: parent
docs: [Child to parent chain messaging](/how-arbitrum-works/deep-dives/l2-to-l1-messaging)

On Arbitrum One, the challenge period is {var:arbOneDisputeWindowDays} days. After it ends, a validator confirms the assertion on the Rollup contract. If another assertion competes with it, only the winner of the challenge can be confirmed. Confirmation sends the assertion's send root to the Outbox, so withdrawals from the blocks it covers can run. An assertion never reorgs the child chain. A rejected assertion only keeps an invalid state from being confirmed.

## Create the ticket {#create-ticket}

parts: dapp, inbox, bridge
edges: create, enqueue
code: nitro-contracts/src/bridge/Inbox.sol
cites: Inbox.sol:261, AbsInbox.sol:234, 298, 331, Inbox.sol:323, AbsBridge.sol:187
lane: parent
docs: [Retryable tickets](/how-arbitrum-works/deep-dives/l1-to-l2-messaging#retryable-tickets)

Your app calls `createRetryableTicket` on the Inbox contract on the parent chain. The ETH you send must cover `maxSubmissionCost + l2CallValue + gasLimit × maxFeePerGas`, or the call reverts. `maxSubmissionCost` must also cover the submission fee for your calldata. Inbox passes the message to the Bridge, which adds it to the delayed inbox.

## Wait for the parent chain {#wait-parent}

parts: bridge
code: nitro/arbnode/delayed_sequencer.go
cites: delayed_sequencer.go:120, 124, 126, 69, 70, 164, nitro-contracts/src/bridge/SequencerInbox.sol:273, 300
lane: parent
docs: [Forced transactions](/how-arbitrum-works/deep-dives/forced-transactions)

The Sequencer does not read the message at once. By default, it waits until the parent chain block that holds the message is safe. An operator can make it wait for finalized instead. If the Sequencer does not include the message, anyone can force-include it once the force-inclusion window ends, at most {var:arbOneForceIncludePeriodHours} hours on Arbitrum One.

## Sequence the message {#sequence-delayed}

parts: bridge, seq
edges: delayed
code: nitro/execution/gethexec/executionengine.go
cites: nitro/arbnode/delayed_sequencer.go:183, sequencer.go:1871, executionengine.go:937, 1075, 1085
lane: child
docs: [Transacting through the Delayed Inbox](/how-arbitrum-works/deep-dives/l1-to-l2-messaging#transacting-via-the-delayed-inbox)

The Sequencer reads the message from the delayed inbox and builds a child chain block from it. It takes delayed messages in the order the Bridge recorded them. The message does not go through the PGA rounds.

## Ticket created {#ticket-created}

parts: seq, retryable
edges: ticket
code: nitro/arbos/tx_processor.go
cites: tx_processor.go:276, 404, 407, 427, nitro/arbos/retryables/retryable.go:24, nitro-contracts/src/bridge/Inbox.sol:324, nitro/arbnode/delayed.go:232, parse_l2.go:364, nitro-contracts/src/bridge/AbsInbox.sol:243, 246
lane: child
docs: [Retryable tickets](/how-arbitrum-works/deep-dives/l1-to-l2-messaging#retryable-tickets)

ArbOS creates the ticket with a lifetime of one week. The ArbRetryableTx precompile emits `TicketCreated` with the ticket ID. The ticket's sender on the child chain is an alias, the parent chain address plus `0x1111000000000000000000000000000000001111`. If a contract sent the message, call `AddressAliasHelper.undoL1ToL2Alias` to get the contract's address back. Inbox also aliases a refund address that is a contract.

## Auto-redeem {#auto-redeem}

parts: retryable
code: nitro/precompiles/ArbRetryableTx.go
cites: nitro/arbos/tx_processor.go:322, 439, 484, 514, nitro/arbos/block_processor.go:434, 719, ArbRetryableTx.go:50, 184, nitro/arbos/retryables/retryable.go:269, 173, nitro/arbos/parse_l2.go:371
lane: child
docs: [Retryable tickets](/how-arbitrum-works/deep-dives/l1-to-l2-messaging#retryable-tickets)

ArbOS checks the sender's child chain balance, which includes the ETH you deposited. If it covers `gasLimit × maxFeePerGas`, `maxFeePerGas` is at least the base fee, and `gasLimit` is at least 21,000, ArbOS schedules a redeem. The redeem runs in the same block, right after the ticket. ArbOS refunds the unused fees to `excessFeeRefundAddress`.

### Failure

**Symptoms.** `TicketCreated` appears, but no successful redeem of the ticket follows.

**Impact.** The ticket's call has not run. The ticket waits in the retryable buffer and expires one week after it was created, unless someone keeps it alive.

**Recovery.** Anyone can call `ArbRetryableTx.redeem` with the ticket ID to try again with more gas. `ArbRetryableTx.keepalive` adds one more week to the lifetime. If the ticket expires, ArbOS sends the call value to `callValueRefundAddress`.
