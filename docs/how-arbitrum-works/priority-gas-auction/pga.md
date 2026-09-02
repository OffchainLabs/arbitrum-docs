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

Bidding happens per transaction, just-in-time, using a standard EIP-1559 field. There is no separate auction to register for, no ahead-of-time forecast to make. Searchers and applications can participate through tips.

### PGA protects low-fee transactions from starvation

Different from Ethereum, a transaction doesn't need to pay tips to get included, and paying no priority fee does not mean waiting indefinitely. An anti-starvation boost raises the effective ordering position of transactions left waiting after each round, so ordinary transactions are included within a small number of blocks. The boost is virtual: it changes position in the queue, never the fee actually charged.

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

PGA is a _transaction ordering policy_: a set of rules the [Sequencer](https://docs.arbitrum.io/how-arbitrum-works/deep-dives/Sequencer) is trusted to follow when ordering transactions submitted by users.
As with FCFS and Timeboost, the Sequencer's job is unchanged:

1. Accept valid transactions
2. Place them in an order dictated by the policy
3. Publish the resulting sequence to a feed
4. Publish transactions in compressed batches to the chain's data availability layer

With PGA, the priority fee determines transactions' order, evaluated in short ordering rounds that run multiple times per block, or at block times of 100ms or 250ms. This is an ordering model that should be familiar to users of other EVM chains (Base, OP Mainnet, and Unichain)

PGA uses three components that work together:

    - **A two-stage mempool:** an unordered waiting list that includes arriving transactions, and a priority queue keyed on each transaction's priority fee.
    - **PGA rounds:** short, fixed-length ordering rounds that can run multiple times per block. Each round promotes the waiting list into the priority queue and transfers the queue into the block being built.
    - **An anti-starvation priority boost:** a virtual increase applied at the end of each round to whatever is still waiting, so low-fee and zero-fee transactions rise over time.

    On Arbitrum One, the block time `B` is 250ms and the proposed number of rounds per block `K` is 2, giving a nominal round length of **125ms**. Let's look at each component.

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

<ImageZoom src="/img/haw-pga-rekeying.svg" alt="A transaction's priority fee is the smaller of its max priority fee and its max fee minus the block base fee. When the base fee rises from 0.10 to 1.20 gwei, transaction A's priority fee falls from 2.0 to 1.3 gwei and transaction B overtakes it, so the queue order changes." className="img-900px" />

Transactions remain subject to the prevailing base fee, and the mempool remains private. PGA does not grant anyone the right to view or reorder other users' transactions, so the protections against harmful MEV that Arbitrum users rely on are unchanged.

## PGA rounds

PGA rounds are defined by the following parameters:

- the block time `B`
- the proposed number of rounds per block `K`

A new round begins every `B/K` , in the case of Arbitrum One, block times `B` is 250ms, and the number of rounds `K` is 2, meaning rounds are 125ms. Each round has two phases:

- The **intake phase** runs for the full round window, absorbing new arrivals into the waiting list. It overlaps with the previous round's execute phase.
- The **execute phase** begins as soon as intake closes. The waiting list is moved into the priority queue, and the Sequencer drains the queue into the block, highest priority first.

The drain loop ends when the queue is empty, the block is full, or the round's time is up. Anything still queued simply waits for the next round.

Blocks fill greedily until they reach one of the is reached:

- The **32 Mgas gas limittarget**limit
- The **95,000-byte calldata limit**limit
- The end of the round.

The block hard limit is 64 Mgas, and an individual transaction is capped at 32 Mgas.

If a block fills before its last round, the Sequencer finalizes it immediately and starts the first round of the next block rather than idling for the remainder of the window. This is what allows the chain to exceed its nominal block rate under load. Block production is capped at 8 blocks per second; keeping the spacing between rounds consistent makes the anti-starvation policy behave predictably, since building faster would give older transactions an unfair advantage over newer ones.

<!-- [pga-rounds-animation-brand.mp4](Tech%20docs%20PGA/pga-rounds-animation-brand.mp4) -->

## The anti-starvation priority boost

At the end of every round in which the priority queue is non-empty, each transaction still waiting receives a priority boost of `p / (2K)`, where `p` is the priority of the last transaction included in that round (or zero if the round included none) and `K` is the number of rounds per block.

Two properties are worth emphasizing:

- **The boost is virtual.** It shifts a transaction's position in the queue and nothing else. The fee charged on inclusion is unaffected.
- **It compounds across rounds.** A transaction paying no priority fee accumulates boost each round until it outranks the marginal paying transaction, which is what bounds its wait to a small number of blocks. The exact wait depends on the round parameters and on the priority fee the transaction expressed.

Set up Guidance

- **Launch status and key dates**
  - **Arbitrum Sepolia**: August X, 2026
  - **Arbitrum One**: Sept X 2026
- tldr
  # tldr;
  A Priority Gas Auction (PGA) is a transaction-ordering policy that can be optionally enabled on any Arbitrum chain. Under PGA, the Sequencer orders transactions by the priority fee attached to each, draining a priority queue during short ordering rounds that run several times per block.
  PGA can be activated by running the latest Sequencer (upcoming 3.12) and activating tip-collection in ArbOS with an on-chain owner action.via a Sequencer configuration change. There is no added operational overhead, which makes it viable for a much wider range of chains than Timeboost.
  The critical prerequisite is that your chain must actually collect priority fees (priority fee collection is available on ArbOs 61). PGA orders transactions by tips.
  As with all features on the Arbitrum stack, Arbitrum chains can adopt PGA at their own discretion and on their own timeline.
- **Recommended adoption path**
  PGA is worth considering for any chain with meaningful contention for block space, that is, where transactions actually compete for ordering. Some cases include:

  - **Chains with active DeFi, arbitrage, or liquidation activity** are good candidates. PGA converts latency competition into fee competition and routes the proceeds to your chain's fee collector.
  - **Chains with latency-sensitive applications,** such as proposer-based AMMs (propAMMs), benefit from per-transaction, just-in-time bidding, which suits workloads that require frequent priority-ordered inclusion.

- **Benefits**
  PGA enables a chain owner to capture a portion of the available MEV on their blockchain, while preserving the built-in protections and UX benefits that Arbitrum users have come to know and enjoy.
  ## Familiar mechanics and a low barrier to entry
  Participants bid by setting `maxPriorityFeePerGas` on a standard EIP-1559 type 2 transaction. There is no auction to register for, and no custom tooling to build. Anyone already running a searcher on another EVM chain should be able to participate on day one.
  ## Near-zero operational cost
  There is no additional infrastructure to run with PGA. PGA is a ArbOwner change (collect-tips)Sequencer flag plus a round-count parameter.
  ## Faster blocks under load
  Blocks are issued as soon as they fill rather than idling for the remainder of the block window. On a chain with `B=250ms` and `K=2`, this yields between 4 and 8 blocks per second: a minimum of `1/B` and a maximum of `K/B`. Under heavy load, your chain confirms faster than its nominal block time.
  ## Starvation protection built in
  Transactions paying no priority fee are not left behind indefinitely. An anti-starvation boost raises the effective ordering position of anything left waiting at the end of each round, so ordinary transactions are included within a small number of blocks. The boost is virtual; it moves a transaction's position in the queue without changing the fee charged on inclusion.
- **Tradeoffs**
  ## Costs
  Under FIFO, ordering is determined by arrival time; under PGA, it is determined by willingness to pay. Users who do not attach a priority fee will be ordered behind those who do whenever the chain is congested. The anti-starvation boost bounds how long they wait, but it does not restore parity.
  ## Revenue
  PGA revenue depends on there being MEV and contention to compete over. A chain with no congestion will collect little in priority fees.
- **Enabling PGA for your Arbitrum chain**
  For a conceptual introduction, see the gentle introduction to PGA.

  ## Prerequisites

  Before starting, ensure you have:

  1. **ArbOS 61 or newer.** This release supports priority fee collection. PGA orders by tips, so running it on an earlier ArbOS means ordering by fees the chain never collects.
  2. **Priority fee collection enabled.** Collection requires all three of: ArbOS 61+, the chain's collect-tips flag set, and the batch poster coinbase configured. On Arbitrum One, this is toggled via an `ArbOwner` precompile call to `setCollectTips`.
  3. **Timeboost disabled.** PGA and Timeboost are each guarded by an independent flag, and the Sequencer rejects any configuration that enables both.
  4. **A Nitro build that includes PGA. The Sequencer must be running 3.12.0.** Confirm the release you are running supports it.

  ## Overview

  Enabling PGA requires completing these two steps:

  1. Confirm priority fee collection is active on your chain
  2. Configure your Sequencer node to run the correct version (3.12)enable PGA and set the rounds-per-block parameter

  ## Step 1: Confirm priority fee collection

  Verify that your chain is on ArbOS 61 or newer and that tip collection is switched on. If your chain has a toggler contract for this, use it; otherwise, this is an `ArbOwner` precompile call to `setCollectTips`. Confirm that the batch poster coinbase is configured, since collection depends on it.
  Do not proceed to Step 2 until this is confirmed.

  ## Step 2: Configure your Sequencer node for PGA

  Add the following to your Sequencer's node configuration file:

  ```jsx
  {
    "execution": {
      "Sequencer": {
        "pga": {
          "enable": true,
          "rounds-per-block": 2
        },
        "timeboost": {
          "enable": false
        },
        "max-block-speed": "250ms"
      }
    }
  }
  ```

  `rounds-per-block` is the `K` parameter. With `max-block-speed` at `250ms` and `K=2`, ordering rounds are 125ms long.

  ## Configuring PGA Parameters

Guidance for Timeboost users

<aside>
⚠️

**Draft — not for publication.** Timeboost has not been decommissioned. The date is not fixed, and the AIP wording is still being amended. Do not publish this section until the onchain vote has executed and an activation date is confirmed.

</aside>

Arbitrum One has used Timeboost since April 2025. When Priority Gas Auctions (PGA) are activated on Arbitrum One, Timeboost is retired. This section explains what stops working, what you must do, and what happens to funds you have locked in the Timeboost Auction contract.

If you have never submitted a transaction through the Timeboost express lane and have no deposit in the Auction contract, no action is needed.
