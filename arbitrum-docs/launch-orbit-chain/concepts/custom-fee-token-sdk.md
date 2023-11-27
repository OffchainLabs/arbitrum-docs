---
title: 'SDK support for custom fee token Orbit chains'
sidebar_label: 'Custom fee token SDK'
description: 'SDK support for custom fee token Orbit chains'
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 0
---

Arbitrum SDK is a TypeScript library for client-side interactions with Arbitrum. It provides common helper functionality as well as access to the underlying smart contract interfaces.

We've developed different versions of the SDK for different use cases. Orbit functionality can be found under the `orbit` and `orbit-custom-fee-token` tags of the [Arbitrum SDK package](https://www.npmjs.com/package/@arbitrum/sdk?activeTab=versions).

import PublicPreviewBannerPartial from '../partials/_orbit-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

### Custom fee token SDK

The following custom fee token APIs are available under the `orbit-custom-fee-token` SDK tag:

- `getApproveFeeTokenRequest` and `approveFeeToken` on [EthBridger](https://github.com/OffchainLabs/arbitrum-sdk/pull/310/files#diff-a977cd005aca51be6f05bc7e1c7c1bf6d734b62b2c45c84b05e2eb0c3c3c6fff)
- `getApproveFeeTokenRequest` and `approveFeeToken` on [Erc20Bridger](https://github.com/OffchainLabs/arbitrum-sdk/pull/310/files#diff-b1894b842df6f4794b6623dc57e9e14c2519fbe5fa5c5dd63403f1185f305cbb)

If you're using custom fee tokens, you'll need to use each of these; on custom fee token chains, token approval is required when transferring ERC20 tokens (while Orbit chains that use ETH do not have this requirement).

Note that everything else is under the hood, and the custom fee token code paths will be executed just if the `L2Network` object config has a `nativeToken` field.
