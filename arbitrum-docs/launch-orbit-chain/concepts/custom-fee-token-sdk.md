---
title: 'SDK support for custom fee token Orbit chains'
sidebar_label: 'Custom fee token SDK'
description: 'SDK support for custom fee token Orbit chains'
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 0
---

Arbitrum SDK is a typescript library for client-side interactions with Arbitrum. It provides common helper functionality as well as access to the underlying smart contract interfaces.

We've developed different versions of SDK for different use cases. For Orbit chains, orbit support is under the **orbit** tag of Arbitrum SDK package. For custom fee token support for Orbit chains, you need to use **orbit-custom-fee-token**.

You can find the package and descriptions about different tags of SDK in this [link](https://www.npmjs.com/package/@arbitrum/sdk?activeTab=versions)


import PublicPreviewBannerPartial from '../partials/_orbit-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

### Custom Fee Token SDK 

To read more about what is Arbitrum SDK and how to use it on development please visit **SDK** page on our docs. Here we discuss the main differences between **orbit-custom-fee-token** SDK tag with the main SDK tag.

We've introduced new APIs in the arbitrum-sdk related to custom fee token:

- **getApproveFeeTokenRequest** and **approveFeeToken** on [EthBridger](https://github.com/OffchainLabs/arbitrum-sdk/pull/310/files#diff-a977cd005aca51be6f05bc7e1c7c1bf6d734b62b2c45c84b05e2eb0c3c3c6fff)
- **getApproveFeeTokenRequest** and **approveFeeToken** on [Erc20Bridger](https://github.com/OffchainLabs/arbitrum-sdk/pull/310/files#diff-b1894b842df6f4794b6623dc57e9e14c2519fbe5fa5c5dd63403f1185f305cbb)

As you may guessed, both of these new APIs are needed because on custom fee token chains, for transferring ERC20 tokens, token approval is required, but in the regular versions which is working with ETH, approval is not the case.

Note that everything else is under the hood, and the custom fee token code paths will be executed just if the L2Network object config has a nativeToken field. So a developer you don't need to be concerned about it.

