---
title: 'SDK support for custom gas token Orbit chains'
sidebar_label: 'Custom gas token SDK'
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

The `orbit-custom-fee-token` SDK tag offers a range of custom gas token APIs. These are primarily used for **bridging** between the parent chain and a custom gas token orbit chain. If you're looking to bridge a native token or an ERC20 token from the parent chain to an orbit chain that uses a `custom gas token`, you'll need to first authorize the native token on the parent chain. Our APIs make this process easier by enabling token approval and providing a way to check the current approval status.

- `getApproveFeeTokenRequest` and `approveFeeToken` on [EthBridger](https://github.com/OffchainLabs/arbitrum-sdk/pull/310/files#diff-a977cd005aca51be6f05bc7e1c7c1bf6d734b62b2c45c84b05e2eb0c3c3c6fff)
- `getApproveFeeTokenRequest` and `approveFeeToken` on [Erc20Bridger](https://github.com/OffchainLabs/arbitrum-sdk/pull/310/files#diff-b1894b842df6f4794b6623dc57e9e14c2519fbe5fa5c5dd63403f1185f305cbb)

If you're using a custom gas token, you'll need to use each of these; on custom gas token chains, token approval is required when transferring ERC20 tokens (while Orbit chains that use ETH do not have this requirement).

**Note** that when native tokens are transferred to the custom gas token orbit chain, they function equivalently to ETH on EVM chains. This means that these tokens will exhibit behavior identical to that of ETH, which is the native currency on EVM chains. This similarity in functionality is a key feature to consider in transactions and operations within the orbit chain.

**Note** that everything else is under the hood, and the custom gas token code paths will be executed just if the `L2Network` object config has a `nativeToken` field.
