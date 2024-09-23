---
title: 'NodeInterface overview'
description: A high level description of what the NodeInterface is and how it works
user_story: As a developer, I want to understand what the NodeInterface is and how it works.
content_type: concept
---

<!-- todo: remove this doc, redirect to existing ref doc -->

import PublicPreviewBannerPartial from '../../partials/_public-preview-banner-partial.mdx';

<PublicPreviewBannerPartial />

The Arbitrum Nitro software includes a special `NodeInterface` contract available at address `0xc8` that is only accessible via RPCs (it's not actually deployed on-chain, and thus can't be called by smart contracts). The way it works is that the node uses Geth's [`InterceptRPCMessage`](https://github.com/OffchainLabs/go-ethereum/blob/@goEthereumCommit@/internal/ethapi/api.go#L1034) hook to detect messages sent to the address `0xc8`, and swaps out the message it's handling before deriving a transaction from it.

The [reference page](/build-decentralized-apps/nodeinterface/02-reference.md) contains information about all methods available in the NodeInterface.
