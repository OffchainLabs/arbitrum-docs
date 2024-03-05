---
title: 'SDK support for custom gas token Orbit chains'
description: 'SDK support for custom gas token Orbit chains'
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 2
---

Arbitrum SDK is a TypeScript library for client-side interactions with Arbitrum. It provides common helper functionality as well as access to the underlying smart contract interfaces.

We've developed different versions of the SDK for different use cases. Orbit functionality can be found under the `orbit` and `orbit-custom-fee-token` tags of the [Arbitrum SDK package](https://www.npmjs.com/package/@arbitrum/sdk?activeTab=versions).

import PublicPreviewBannerPartial from '../partials/_orbit-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

### Custom gas token SDK

The `orbit-custom-fee-token` SDK feature introduces a suite of APIs designed for the specific purpose of facilitating **bridging** operations. These APIs are tailored for use cases where there is a need to transfer a native token or an ERC20 token from the parent chain to an orbit chain utilizing a `custom gas token`. The process involves an initial step of authorizing the native token on the parent chain. To streamline this, our APIs provide functionalities for token approval and offer a mechanism to verify the current status of this approval. Detailed below is a guide to how each of these APIs can be effectively utilized for distinct purposes:

1. **EthBridger Context:**

   - **APIs:** `getApproveFeeTokenRequest` and `approveFeeToken`.
   - **Purpose:** These APIs are essential for the bridging of native tokens to the Orbit chain. They facilitate the necessary approval for native tokens, allowing contracts to manage fund movements. This process includes escrowing a specified amount of the native token on the parent chain and subsequently bridging it to the Orbit chain.

2. **Erc20Bridger Context:**
   - **APIs:** `getApproveFeeTokenRequest` and `approveFeeToken`.
   - **Purpose:** In the scenario of bridging ERC20 assets to an Orbit chain, these APIs play a crucial role. Token Bridging on Arbitrum Nitro stack uses Retryable tickets and needs specific amount of fees to be paid for creation and redemption of the ticket. For more information about retryable tickets please take a look at [this](https://docs.arbitrum.io/arbos/l1-to-l2-messaging#retryable-tickets) part of our docs. The Orbit chain operates as a custom gas token network, necessitating the payment of fees in native tokens for the creation of retryable tickets and their redemption on the Orbit chain. To cover the submission and execution fees associated with retryable tickets on the Orbit chain, an adequate amount of native tokens must be approved and allocated on the parent chain to cover the fees.

**Note** that these APIs are just needed for `custom gas token` orbit chains and for ETH-powered rollup and anytrust orbit chains, you don't need to use them.

**Note** that when native tokens are transferred to the custom gas token orbit chain, they function equivalently to ETH on EVM chains. This means that these tokens will exhibit behavior identical to that of ETH, which is the native currency on EVM chains. This similarity in functionality is a key feature to consider in transactions and operations within the orbit chain.

**Note** that everything else is under the hood, and the custom gas token code paths will be executed just if the `L2Network` object config has a `nativeToken` field.
