---
title: 'Nitro transaction lifecycle'
svg: haw-transaction-lifecycle
alt: >-
  A signed transaction reaches the Sequencer over JSON-RPC. A retryable ticket enters the delayed
  inbox on the parent chain, and the Sequencer reads delayed messages from it. The Sequencer orders
  transactions and publishes them in its feed as soft confirmations. The state transition function
  runs the ordered transactions, reads and writes the chain state, and produces child chain blocks.
  The batch poster compresses the ordered transactions and posts them to the sequencer inbox as
  blobs or calldata. The proposer asserts the resulting state to the Rollup contract. The Rollup
  contract reads a batch commitment from the sequencer inbox and binds each assertion to it. If the
  Sequencer does not include a delayed message, anyone can force-include it into the sequencer
  inbox after the delay.
parts:
  - json-rpc
  - retryable-ticket
  - sequencer-feed
  - { seq: { tech: 'orders transactions' } }
  - ordered
  - { poster: { tech: 'compresses batches' } }
  - state
  - stf
  - child-block
  - proposer
  - delayed-inbox
  - { seqinbox: { label: 'Sequencer inbox', tech: ~ } }
  - { rollup: { label: 'Rollup contract', tech: ~ } }
edges:
  submit: 'json-rpc -> seq'
  retry: 'retryable-ticket -> delayed-inbox'
  read-delayed: 'delayed-inbox -> seq'
  publish: 'seq -> sequencer-feed'
  order: 'seq -> ordered'
  execute: 'ordered -> stf'
  batch: 'ordered -> poster'
  post: 'poster -> seqinbox "blob or calldata"'
  write-state: 'stf -> state dashed'
  read-state: 'state -> stf dashed'
  produce: 'stf -> child-block'
  propose: 'child-block -> proposer'
  assert: 'proposer -> rollup "assertion"'
  force: 'delayed-inbox -> seqinbox "force inclusion" dotted'
  commit: 'seqinbox -> rollup "batch commitment" dashed'
static:
  json-rpc: [0, 1]
  retryable-ticket: [0, 2]
  sequencer-feed: [1, 0]
  seq: [1, 1]
  ordered: [2, 1]
  poster: [2, 2]
  state: [3, 0]
  stf: [3, 1]
  child-block: [4, 1]
  proposer: [4, 2]
  delayed-inbox: [0, 3]
  seqinbox: [2, 3]
  rollup: [4, 3]
---
