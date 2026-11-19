---
title: 'Transaction lifecycle'
widget: nitro-transaction-flow
parts: [wallet, fullnode, seq, relay, poster, seqinbox, bridge]
edges:
  submit: 'wallet -> fullnode "eth_sendRawTransaction"'
  forward: 'fullnode -> seq "Forwards tx (JSON-RPC)"'
  publish: 'seq -> relay "Feed (WebSocket)"'
  stream: 'relay -> fullnode "Feed (WebSocket)"'
  share: 'seq -> poster "Message log"'
  post: 'poster -> seqinbox "Batch (parent chain tx)"'
  append: 'seqinbox -> bridge "Append to accumulator"'
  read: 'seqinbox -> fullnode "Batch events (JSON-RPC)"'
---

## Submit {#submit}

parts: wallet, fullnode
edges: submit
flag: --execution.tx-pre-checker.strictness
code: nitro/execution/gethexec/tx_pre_checker.go
cites: nitro/execution/gethexec/arb_interface.go:44, nitro/execution/gethexec/node.go:475, nitro/execution/gethexec/tx_pre_checker.go:240, nitro/execution/gethexec/tx_pre_checker.go:249, nitro/execution/gethexec/tx_pre_checker.go:141, nitro/execution/gethexec/tx_pre_checker.go:160, nitro/execution/gethexec/tx_pre_checker.go:164, nitro/execution/gethexec/tx_pre_checker.go:251, nitro/execution/gethexec/tx_pre_checker.go:256, nitro/execution/gethexec/tx_pre_checker.go:44, nitro/execution/gethexec/tx_pre_checker.go:138, nitro/execution/gethexec/tx_pre_checker.go:253, nitro/execution/gethexec/tx_pre_checker.go:57, nitro/cmd/nitro/config/config.go:41, nitro/execution/gethexec/node.go:145, nitro/execution/gethexec/tx_pre_checker.go:49
lane: child

A wallet sends the signed transaction to a full node. The full node checks the transaction against the state of its latest block. It rejects a transaction with too little gas, a fee cap below the base fee, or a nonce that is already used.

### Failure

**Symptoms.** The wallet gets an error from the full node, for example a fee cap below the base fee or a nonce that is too low.

**Impact.** The full node does not forward the transaction, so the sequencer never sees it.

**Recovery.** --execution.tx-pre-checker.strictness sets how much the full node checks. Below 10 the node skips these checks but still runs its filtered address check. The default is 20.

## Forward {#forward}

parts: fullnode, seq
edges: forward
flag: --execution.forwarding-target
code: nitro/execution/gethexec/forwarder.go
cites: nitro/execution/gethexec/node.go:463, nitro/execution/gethexec/forwarder.go:135, nitro/execution/gethexec/node.go:462, nitro/execution/gethexec/node.go:182, nitro/execution/gethexec/node.go:460, nitro/execution/gethexec/forwarder.go:296, nitro/execution/gethexec/forwarder.go:143, nitro/execution/gethexec/forwarder.go:148, nitro/execution/gethexec/forwarder.go:144, nitro/execution/gethexec/forwarder.go:149, nitro/execution/gethexec/node.go:149, nitro/execution/gethexec/forwarder.go:132, nitro/execution/gethexec/forwarder.go:142, nitro/execution/gethexec/forwarder.go:146, nitro/cmd/nitro/config/config.go:41, nitro/execution/gethexec/node.go:148
lane: child

The full node forwards the transaction to the sequencer over JSON-RPC. It sends it to the URL in its forwarding target setting. A full node with the target null does not forward and returns an error.

### Failure

**Symptoms.** The full node logs "error forwarding transaction" at warn level. If the error does not match its retry list, the node returns it at once. If every target fails with a matching error, the node logs "Failed to publish transaction to any of the forwarding targets".

**Impact.** The full node returns the error to the wallet, and the sequencer does not get the transaction.

**Recovery.** Add backup targets with --execution.secondary-forwarding-target. If the error matches its retry list, the node tries them in order.

## Sequence {#sequence}

parts: seq
flag: --node.sequencer and --execution.sequencer.enable
code: nitro/execution/gethexec/sequencer.go
cites: nitro/execution/gethexec/sequencer.go:629, nitro/execution/gethexec/sequencer.go:1359, nitro/arbnode/transaction_streamer.go:1233, nitro/arbnode/transaction_streamer.go:1249, nitro/execution/gethexec/sequencer.go:67, nitro/execution/gethexec/sequencer.go:355, nitro/cmd/nitro/nitro.go:201, nitro/execution/gethexec/sequencer.go:625, nitro/execution/gethexec/sequencer.go:1159, nitro/execution/gethexec/sequencer.go:218, nitro/execution/gethexec/sequencer.go:641, nitro/execution/gethexec/sequencer.go:100, nitro/cmd/nitro/config/config.go:40, nitro/arbnode/node.go:75, nitro/cmd/nitro/config/config.go:41, nitro/execution/gethexec/node.go:143, nitro/execution/gethexec/sequencer.go:92
lane: child
detail: seq -> sequencer-step-3

The sequencer puts the transaction in its queue, orders it, and executes it into a child chain block. It writes the result to its message log as the next message.

### Failure

**Symptoms.** The metric "arb/sequencer/transactions/dropped/queuetimeout" goes up. If --node.sequencer and --execution.sequencer.enable differ, the node logs "consensus and execution must agree if sequencing is enabled or not".

**Impact.** The sequencer drops a transaction that waits in its queue longer than --execution.sequencer.queue-timeout plus the Timeboost express lane advantage. The queue timeout is 12 seconds by default. The submitter gets the timeout error back.

**Recovery.** TODO: Nitro engineer

## Feed {#feed}

parts: seq, relay, fullnode
edges: publish, stream
flag: --node.feed.output.enable (sequencer), --node.feed.input.url (full node)
code: nitro/broadcaster/broadcaster.go
cites: nitro/arbnode/transaction_streamer.go:1255, nitro/arbnode/transaction_streamer.go:1390, nitro/broadcaster/broadcaster.go:77, nitro/relay/relay.go:99, nitro/broadcastclient/broadcastclient.go:409, nitro/arbnode/transaction_streamer.go:794, nitro/arbnode/transaction_streamer.go:874, nitro/arbnode/transaction_streamer.go:1158, nitro/arbnode/transaction_streamer.go:1161, nitro/broadcastclient/broadcastclient.go:224, nitro/broadcastclient/broadcastclient.go:415, nitro/broadcastclient/broadcastclient.go:226, nitro/broadcastclient/broadcastclient.go:443, nitro/arbnode/inbox_reader.go:664, nitro/broadcastclient/broadcastclient.go:77, nitro/broadcastclients/broadcastclients.go:27, nitro/broadcastclients/broadcastclients.go:307, nitro/cmd/nitro/config/config.go:40, nitro/arbnode/node.go:84, nitro/broadcastclient/broadcastclient.go:46, nitro/broadcastclient/broadcastclient.go:76, nitro/broadcastclient/broadcastclient.go:45, nitro/wsbroadcastserver/wsbroadcastserver.go:54
finality: soft
lane: child

Feed relays pass each new message on the sequencer's feed to full nodes over WebSocket. Each full node that reads the feed adds the message to its message log as unconfirmed. A feed message never replaces a message the node already has from a batch.

### Failure

**Symptoms.** The full node logs "failed connect to sequencer broadcast, waiting and retrying" or "Server connection timed out without receiving data".

**Impact.** The node reconnects with a backoff that doubles up to a maximum. Until then, it gets new transactions only from batches on the parent chain.

**Recovery.** Add backup feeds with --node.feed.input.secondary-url. The node starts one when its primary feeds send nothing for 5 seconds.

## Batch {#batch}

parts: seq, poster
edges: share
flag: --node.batch-poster.enable
code: nitro/arbnode/batch_poster.go
cites: nitro/arbnode/batch_poster.go:1621, nitro/arbnode/batch_poster.go:1009, nitro/arbnode/batch_poster.go:1010, nitro/arbnode/batch_poster.go:1659, nitro/arbnode/batch_poster.go:1623, nitro/arbnode/batch_poster.go:1657, nitro/arbnode/batch_poster.go:2171, nitro/arbnode/batch_poster.go:2158, nitro/arbnode/batch_poster.go:2176, nitro/arbnode/batch_poster.go:185, nitro/arbnode/batch_poster.go:313, nitro/cmd/nitro/config/config.go:40, nitro/arbnode/node.go:79, nitro/arbnode/batch_poster.go:168
lane: child

The batch poster reads new messages from the sequencer's message log. It compresses them with Brotli into a batch, up to a size limit.

### Failure

**Symptoms.** The batch poster logs "error getting message from streamer", or "error posting batch" with "error adding message to batch" in the error.

**Impact.** The batch poster drops the batch it was building and tries again after --node.batch-poster.error-delay, 10 seconds by default. The transaction stays out of a batch until an attempt succeeds.

**Recovery.** TODO: Nitro engineer

## Post {#post}

parts: poster, seqinbox, bridge
edges: post, append
flag: --node.batch-poster.post-4844-blobs
code: nitro-contracts/src/bridge/SequencerInbox.sol
cites: nitro/arbnode/batch_poster.go:1897, nitro/arbnode/batch_poster.go:88, nitro/arbnode/batch_poster.go:89, nitro/arbnode/batch_poster.go:1455, nitro/arbnode/batch_poster.go:1458, nitro/arbnode/batch_poster.go:1466, nitro/arbnode/batch_poster.go:1467, nitro/arbnode/batch_poster.go:1509, nitro/arbnode/batch_poster.go:1520, nitro/arbnode/batch_poster.go:1248, nitro/arbnode/batch_poster.go:1254, nitro-contracts/src/bridge/SequencerInbox.sol:733, nitro/arbnode/batch_poster.go:2171, nitro/arbnode/batch_poster.go:2105, nitro/arbnode/batch_poster.go:2162, nitro/util/log.go:62, nitro/util/log.go:65, nitro/arbnode/batch_poster.go:2173, nitro/arbnode/batch_poster.go:2174, nitro/arbnode/batch_poster.go:2106, nitro/arbnode/batch_poster.go:2166, nitro/util/log.go:55, nitro/arbnode/batch_poster.go:79, nitro-contracts/src/bridge/SequencerInbox.sol:352, nitro-contracts/src/bridge/SequencerInbox.sol:368, nitro/cmd/nitro/config/config.go:40, nitro/arbnode/node.go:79, nitro/arbnode/batch_poster.go:197
finality: batch-posted
lane: parent

The batch poster sends the batch to SequencerInbox in a parent chain transaction. Only when blob posting is on and the parent chain supports blobs can it put the data in EIP-4844 blobs instead of calldata. SequencerInbox appends the batch to the Bridge's accumulator.

### Failure

**Symptoms.** The batch poster logs "error posting batch". If posting keeps failing for more than a minute, the metric "arb/batchPoster/action/failure" goes up. For some known errors, that wait is 5 minutes.

**Impact.** SequencerInbox reverts with NotBatchPoster when the sender is not on its batch poster list. The batch does not reach the Bridge.

**Recovery.** TODO: Nitro engineer

## Read back {#read-back}

parts: seqinbox, fullnode
edges: read
flag: --node.inbox-reader.read-mode
code: nitro/arbnode/inbox_reader.go
cites: nitro/arbnode/inbox_reader.go:495, nitro/arbnode/inbox_reader.go:664, nitro/arbnode/inbox_tracker.go:766, nitro/arbnode/transaction_streamer.go:1105, nitro/arbnode/transaction_streamer.go:1019, nitro/arbnode/transaction_streamer.go:1062, nitro/arbnode/transaction_streamer.go:1187, nitro/arbnode/transaction_streamer.go:1190, nitro/arbnode/inbox_reader.go:72, nitro/arbnode/transaction_streamer.go:1080, nitro/arbnode/transaction_streamer.go:1155, nitro/arbnode/inbox_reader.go:312, nitro/arbnode/inbox_reader.go:314, nitro/arbnode/node.go:116, nitro/arbnode/node.go:118, nitro/arbnode/node.go:119, nitro/cmd/nitro/config/config.go:40, nitro/arbnode/node.go:77, nitro/arbnode/inbox_reader.go:39
lane: parent

By default, every full node reads new batches from SequencerInbox in the latest parent chain blocks. If a batch message differs from the message the node stored from the feed, the node keeps the parent chain version. Parent chain finality comes later, when the parent chain finalizes the block that holds the batch.

### Failure

**Symptoms.** The node logs "TransactionStreamer: Reorg detected!" with confirmed set to true.

**Impact.** The node replaces its stored messages from that point with the parent chain version. The result of a transaction it showed from the feed can change.

**Recovery.** With --node.inbox-reader.read-mode set to safe or finalized, the node reads batches only up to the latest safe or finalized parent chain block. That setting turns off feed input and output, and a sequencer cannot use it.
