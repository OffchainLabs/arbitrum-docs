---
title: 'Inside the Sequencer'
showLanes: false
parts: [prechecker, tx-queue, engine, streamer]
edges:
  checked: 'prechecker -> tx-queue "Checked transaction"'
  ordered: 'tx-queue -> engine "Ordered batch of transactions"'
  block: 'engine -> streamer "Block and message"'
---

## Pre-check {#pre-check}

parts: prechecker
lane: child

SPIKE: the pre-checker rejects a transaction that cannot pay or has a bad nonce.

### Failure

**Symptoms.** SPIKE placeholder.

**Impact.** SPIKE placeholder.

**Recovery.** SPIKE placeholder.

## Queue {#queue}

parts: prechecker, tx-queue
edges: checked
lane: child

SPIKE: the transaction waits in the queue until the sequencer takes it.

### Failure

**Symptoms.** SPIKE placeholder.

**Impact.** SPIKE placeholder.

**Recovery.** SPIKE placeholder.

## Order and execute {#execute}

parts: tx-queue, engine
edges: ordered
lane: child

SPIKE: the sequencer orders the queued transactions and ArbOS executes them into a block.

### Failure

**Symptoms.** SPIKE placeholder.

**Impact.** SPIKE placeholder.

**Recovery.** SPIKE placeholder.

## Record {#record}

parts: engine, streamer
edges: block
lane: child

SPIKE: the transaction streamer stores the message and hands it to the feed and the batch poster.

### Failure

**Symptoms.** SPIKE placeholder.

**Impact.** SPIKE placeholder.

**Recovery.** SPIKE placeholder.
