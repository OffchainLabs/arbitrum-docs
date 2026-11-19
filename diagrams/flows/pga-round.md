---
title: 'Inside a PGA round'
showLanes: false
parts: [waiting, priority-queue, block]
edges:
  promote: 'waiting -> priority-queue "At round start"'
  fill: 'priority-queue -> block "Highest priority first"'
---

## Intake {#intake}

parts: waiting
code: nitro/execution/gethexec/sequencer.go
cites: nitro/execution/gethexec/sequencer.go:782, nitro/execution/gethexec/sequencer.go:614
lane: child
docs: [The two-stage mempool](/how-arbitrum-works/priority-gas-auction/pga#the-two-stage-mempool)

Each transaction that passes the pre-checks lands in the Sequencer's waiting list. Intake runs all the time, also while the previous round executes.

## Move to the priority queue {#promote}

parts: waiting, priority-queue
edges: promote
code: nitro/execution/gethexec/pga/heap.go
cites: nitro/execution/gethexec/pga_tx_orderer.go:90, nitro/execution/gethexec/pga_tx_orderer.go:156, nitro/execution/gethexec/pga_adapter.go:22, nitro/execution/gethexec/pga_adapter.go:24, nitro/execution/gethexec/pga/tx.go:45, nitro/execution/gethexec/pga/heap.go:21, nitro/execution/gethexec/pga/heap.go:23
lane: child
docs: [The two-stage mempool](/how-arbitrum-works/priority-gas-auction/pga#the-two-stage-mempool)

When a round starts, the Sequencer moves the waiting list into a priority queue. The queue key is the priority fee per gas, the smaller of maxPriorityFeePerGas and maxFeePerGas minus the base fee, plus any boost from earlier rounds. If two transactions have the same priority, the one that reached the Sequencer first goes first. A transaction whose maxFeePerGas is below the base fee is dropped here.

## Fill the block {#fill}

parts: priority-queue, block
edges: fill
code: nitro/execution/gethexec/pga_tx_orderer.go
cites: nitro/execution/gethexec/pga_tx_orderer.go:65, nitro/execution/gethexec/pga_tx_orderer.go:71, nitro/execution/gethexec/pga_tx_orderer.go:99, nitro/execution/gethexec/pga_tx_orderer.go:104
lane: child
docs: [PGA rounds](/how-arbitrum-works/priority-gas-auction/pga#pga-rounds)

The Sequencer takes transactions from the queue into the block, highest priority first. It stops when the queue is empty, the round ends, or the block reaches {var:arbOneBlockGasLimit} gas or {var:arbOneBlockCalldataLimitBytes} bytes of calldata. Anything left in the queue waits for the next round.

## Boost what is left {#boost}

parts: priority-queue
code: nitro/execution/gethexec/pga/mempool.go
cites: nitro/execution/gethexec/pga_tx_orderer.go:117, nitro/execution/gethexec/pga/mempool.go:34, nitro/execution/gethexec/pga/mempool.go:47, nitro/execution/gethexec/pga/mempool.go:48, nitro/execution/gethexec/pga/mempool.go:53, nitro/execution/gethexec/pga/tx.go:68
lane: child
docs: [The anti-starvation priority boost](/how-arbitrum-works/priority-gas-auction/pga#the-anti-starvation-priority-boost)

At the end of each round, every transaction still in the queue gets a priority boost of p / (2K). p is the priority of the last transaction the round included, or zero if it included none. K is the number of rounds per block, {var:arbOnePgaRoundsPerBlock} on Arbitrum One. The boost moves a transaction up the queue. It does not change the fee you pay.
