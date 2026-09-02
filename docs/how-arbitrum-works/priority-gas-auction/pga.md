---
title: 'How PGA works'
sidebar_label: 'Introduction to PGA'
description: 'Learn how PGA works and how it can benefit your Arbitrum-based project.'
author: anegg0
sme:
user_story: As a current or prospective Arbitrum user, I want to understand how PGA works and how to use it.
content_type: gentle-introduction
---

## What is PGA (Priority Gas Auctions)?

PGA is an ordering policy in which users bid for ordering by attaching a priority fee to each transaction. Ordering becomes a continuous, permissionless, per-transaction competition.

PGA is set to replace Timeboost across Arbitrum chains.

## Why deprecate Timeboost?

Arbitrum One has used Timeboost since April 2025. Timeboost auctions off a 60-second "express lane" in a sealed-bid, second-price auction and falls back to first-come, first-served (FCFS) ordering for everything else.

This policy served to protect users from harmful MEV, such as front-running and sandwich attacks, reduce latency-race spam, and create the first sequencing revenue stream for the Arbitrum DAO.

However, some design limitations became clear:

### The barrier to entry is high:

Participating in an ahead-of-time auction requires building custom tooling and forecasting MEV for an entire upcoming round.

### It does not serve latency-sensitive applications well:

Emerging DeFi primitives such as proprietary AMMs (propAMMs) need cheap, frequent, priority-ordered inclusion to keep onchain parameters fresh. An express lane held by a single controller for 60 seconds at a time is incompatible with these new AMMs

## What are PGA’s benefits over Timeboost?

In short, these benefits are:

- Allowing latency-sensitive applications to integrate with Arbitrum chains
- Allowing more participants to compete in helpful MEV activity (arbitrageurs, Liquidators of undercollateralized positions, keepers)

### PGA opens the entry for ordering competition

Bidding happens per transaction, just-in-time, using a standard <a data-quicklook-from="eip-1559">EIP-1559</a> field. There is no separate auction to register for, no ahead-of-time forecast to make. Searchers and applications can participate through tips.

### PGA protects low-fee transactions from starvation

Different from Ethereum, a transaction doesn't need to pay tips to get included, and paying no priority fee does not mean waiting indefinitely. An anti-starvation boost raises the effective ordering position of transactions left waiting after each round, so ordinary transactions are included within a small number of blocks. The boost changes position in the queue, never the fee actually charged.

### PGA maintains a value accrual path for the chain owners

Chain owners may use PGA to capture a portion of the available MEV on their chain that would have otherwise gone entirely to searchers. Priority fees are collected by the chain owner rather than accruing entirely to whoever captures MEV.

<VanillaAdmonition type="note"  >

PGA doesn't alter popular Arbitrum properties:

- Short block time:
  The default block time for Arbitrum chains remains industry-leading at 250ms, and response times can be reduced further by adding PGA rounds of 125ms.

- Customizability:
  The nominal block time on Arbitrum One remains 250ms with the addition of PGA rounds, which are shared at 125ms increments. Arbitrum chains have the flexibility of selecting the number of rounds based on their preferences. In the case of Arbitrum One, there are only 2 PGA rounds, so under heavy load, blocks that fill early are issued immediately, allowing the chain to produce up to 8 blocks per second.

</VanillaAdmonition>

## How does it work?

PGA is a **transaction ordering policy**: a set of rules the [Sequencer](https://docs.arbitrum.io/how-arbitrum-works/deep-dives/Sequencer) is trusted to follow when ordering transactions submitted by users.
As with FCFS and Timeboost, the Sequencer's job is unchanged:

1. Accept valid transactions
2. Place them in an order dictated by the policy
3. Publish the resulting sequence to a feed
4. Publish transactions in compressed batches to the chain's data availability layer

With PGA, the priority fee determines transactions' order, evaluated in short ordering rounds that run multiple times per block. This is an ordering model that should be familiar to users of other EVM chains (Base, OP Mainnet, and Unichain).

PGA uses three components that work together:

    - **A two-stage mempool:** an unordered waiting list that includes arriving transactions, and a priority queue keyed on each transaction's priority fee.
    - **PGA rounds:** short, fixed-length ordering rounds that can run multiple times per block. Each round promotes the waiting list into the priority queue and transfers the queue into the block being built.
    - **An anti-starvation priority boost:** a position increase applied at the end of each round to transactions that are still waiting, so low-fee and zero-fee transactions rise over time.

    On Arbitrum One, the block time `B` is 250ms and the proposed number of rounds per block `K` is 2, giving a nominal round length of **125ms**. Let's look at each component.

<ImageZoom src="/img/haw-pga-three-components.svg" alt="PGA uses three components that work together. A two-stage mempool holds an unordered waiting list and a priority queue keyed on the priority fee. PGA rounds promote the waiting list into the queue every 125 ms, then transfer the queue into the block. An anti-starvation boost raises the queue position of transactions still waiting after each round, never the fee charged, and that feeds the next round. On Arbitrum One the block time is 250 ms with 2 rounds per block." className="img-900px" />

## The two-stage mempool

Transactions arriving at the Sequencer land first in an **unordered waiting list**. Intake runs continuously and independently of any ordering work.

At the start of each PGA round, the entire waiting list is transferred to the second stage: a **priority queue** keyed on the transaction's priority fee, computed per EIP-1559 as:

```shell
priority_fee_per_gas = min(
  transaction.max_priority_fee_per_gas,
  transaction.max_fee_per_gas - block.base_fee_per_gas
)
```

<ImageZoom src="/img/haw-pga-two-stage-mempool.svg" alt="Transactions arrive into an unordered waiting list. At the start of each PGA round, the Sequencer moves the whole waiting list into a priority queue keyed on each transaction's priority fee, highest first." className="img-900px" />

Ties are broken by the fine-grained arrival timestamp recorded when the transaction first reached the Sequencer, not when it entered the queue.

<ImageZoom src="/img/haw-pga-tie-breaking.svg" alt="Three transactions carry the same priority fee of 2 gwei. The Sequencer orders them by the arrival timestamp it recorded when each transaction first reached it, so the earliest arrival goes first." className="img-900px" />

Because the priority fee depends on the base fee, which changes between blocks, the queue is re-keyed against the new base fee at the start of every block.

The queue is re-keyed against the new base fee at the start of every block
Because the priority fee depends on the base fee, which changes between blocks.

Transactions remain subject to the prevailing base fee, and the mempool remains private. PGA does not grant anyone the right to view or reorder other users' transactions, so the protections against harmful MEV that Arbitrum users rely on are unchanged.

## PGA rounds

PGA rounds are defined by the following parameters:

- the block time `B`
- the proposed number of rounds per block `K`

A new round begins every `B/K` , in the case of Arbitrum One, block times `B` is 250ms, and the number of rounds `K` is 2, meaning rounds are 125ms. Each round has two phases:

- The **intake phase** runs for the full round window, absorbing new arrivals into the waiting list. It overlaps with the previous round's execute phase.
- The **execute phase** begins as soon as intake closes. The waiting list is moved into the priority queue, and the Sequencer transfers the queue into the block, highest priority first.

The transfer loop ends when the queue is empty, the block is full, or the round's time is up. Anything still queued simply waits for the next round.

Blocks fill greedily until they reach one of the is reached:

- The **32 Mgas gas limit target**
- The **95,000-byte calldata limit**
- The end of the round.

The block hard limit is 64 Mgas, and an individual transaction is capped at 32 Mgas.

If a block fills before its last round, the Sequencer finalizes it immediately and starts the first round of the next block rather than idling for the remainder of the window. This is what allows the chain to exceed its nominal block rate under load. Block production is capped at 8 blocks per second; keeping the spacing between rounds consistent makes the anti-starvation policy behave predictably, since building faster would give older transactions an unfair advantage over newer ones.

<!-- [pga-rounds-animation-brand.mp4](Tech%20docs%20PGA/pga-rounds-animation-brand.mp4) -->

## The anti-starvation priority boost

At the end of every round in which the priority queue is non-empty, each transaction still waiting receives a priority boost of `p / (2K)`, where `p` is the priority of the last transaction included in the previous round (or zero if that round included none) and `K` is the number of rounds per block.

Two properties are worth emphasizing:

- \*\*The boost shifts a transaction's position in the queue and nothing else. The fee charged on inclusion is unaffected.
- **It compounds across rounds.** A transaction paying no priority fee accumulates boost each round until it outranks the marginal paying transaction, which is what bounds its wait to a small number of blocks. The exact wait depends on the round parameters and on the priority fee the transaction expressed.
