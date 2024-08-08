---
title: 'Cross-chain messaging overview'
description: Learn about cross-chain messaging in Arbitrum
user_story: As a developer, I want to understand how cross-chain messaging works in Arbitrum.
content_type: concept
---

The Arbitrum protocol and related tooling makes it easy for developers to build cross-chain applications; i.e., applications that involve sending messages from Ethereum to an Arbitrum chain, and/or from an Arbitrum chain to Ethereum.

## Ethereum-to-Arbitrum messaging

Arbitrary L1 to L2 contract calls can be created via the `Inbox`'s `createRetryableTicket` method; upon publishing the L1 transaction, the L2 side will typically get included within minutes. Happily / commonly, the L2 execution will automatically succeed, but if reverts, and it can be rexecuted via a call to the `redeem` method of the [ArbRetryableTx](/build-decentralized-apps/precompiles/02-reference.md#arbretryabletx) precompile.

For details and protocol specification, see [L1 to L2 Messages](/how-arbitrum-works/arbos/l1-l2-messaging.md).

For an example of retryable tickets in action, see the [Greeter](https://github.com/OffchainLabs/arbitrum-tutorials/tree/master/packages/greeter) tutorial, which uses the [Arbitrum SDK](../sdk/1-introduction.mdx).

## Arbitrum-to-Ethereum messaging

Similarly, L2 contracts can send Arbitrary messages for execution on L1. These are initiated via calls to the [ArbSys](/build-decentralized-apps/precompiles/02-reference.md#arbsys) precompile contract's `sendTxToL1` method. Upon confirmation (about 1 week later), they can executed by retrieving the relevant data via a call to `NodeInterface` contract's `constructOutboxProof` method, and then executing them via the `Outbox`'s `executeTransaction` method.

For details and protocol specification, see [L2 to L1 Messages](/how-arbitrum-works/arbos/l2-l1-messaging.md).

For a demo, see the [Outbox Tutorial](https://github.com/OffchainLabs/arbitrum-tutorials/tree/master/packages/outbox-execute).
