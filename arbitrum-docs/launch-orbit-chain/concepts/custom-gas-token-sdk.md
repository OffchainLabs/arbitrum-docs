---
title: 'SDK support for custom gas token Orbit chains'
description: 'SDK support for custom gas token Orbit chains'
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 2
---

Arbitrum SDK is a TypeScript library for client-side interactions with Arbitrum. It provides common helper functionality as well as access to the underlying smart contract interfaces.

import PublicPreviewBannerPartial from '../partials/_orbit-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

### Custom gas token APIs

Custom gas token support in the Arbitrum SDK introduces a suite of APIs designed for the specific purpose of facilitating **bridging** operations. These APIs are tailored for use cases where there is a need to transfer a native token or an ERC-20 token from the parent chain to an orbit chain utilizing a `custom gas token`. The process involves an initial step of authorizing the native token on the parent chain. To streamline this, our APIs provide functionalities for token approval and offer a mechanism to verify the current status of this approval. Detailed below is a guide to how each of these APIs can be effectively utilized for distinct purposes:

1. **EthBridger Context:**

   - **APIs:** `getApproveGasTokenRequest` and `approveGasToken`.
   - **Purpose:** These APIs are essential for the bridging of native tokens to the Orbit chain. They facilitate the necessary approval for native tokens, allowing contracts to manage fund movements. This process includes escrowing a specified amount of the native token on the parent chain and subsequently bridging it to the Orbit chain.
   - **Note** that you should use `EthBridger` when bridging the native token between the parent chain and the orbit chain.

2. **Erc20Bridger Context:**
   - **APIs:** `getApproveGasTokenRequest` and `approveGasToken`.
   - **Purpose:** In the scenario of bridging ERC20 assets to an Orbit chain, these APIs play a crucial role. Token Bridging on Arbitrum Nitro stack uses Retryable tickets and needs specific amount of fees to be paid for creation and redemption of the ticket. For more information about retryable tickets please take a look at [this](/how-arbitrum-works/arbos/l1-l2-messaging.md#retryable-tickets) part of our docs. The Orbit chain operates as a custom gas token network, necessitating the payment of fees in native tokens for the creation of retryable tickets and their redemption on the Orbit chain. To cover the submission and execution fees associated with retryable tickets on the Orbit chain, an adequate amount of native tokens must be approved and allocated on the parent chain to cover the fees.
   - **Note** that you should use `Erc20Bridger` when bridging an ERC-20 token between the parent chain and the orbit chain.

**Note** that these APIs are just needed for `custom gas token` orbit chains and for ETH-powered rollup and anytrust orbit chains, you don't need to use them.

**Note** that when native tokens are transferred to the custom gas token orbit chain, they function equivalently to ETH on EVM chains. This means these tokens will exhibit behavior identical to that of ETH, the native currency on EVM chains. This similarity in functionality is a key feature to consider in transactions and operations within the orbit chain.

**Note** that everything else is under the hood, and the custom gas token code paths will be executed just if the `L2Network` object config has a `nativeToken` field.

### Registering a custom token in the Token Bridge

When [registering a custom token in the Token Bridge](/build-decentralized-apps/token-bridging/03-token-bridge-erc20.md#setting-up-your-token-with-the-generic-custom-gateway) of a custom-gas-token Orbit chain, there's an additional step to perform before calling `registerTokenToL2`.

Since the Token Bridge [router](https://github.com/OffchainLabs/token-bridge-contracts/blob/main/contracts/tokenbridge/ethereum/gateway/L1OrbitGatewayRouter.sol#L142-L144) and the [generic-custom gateway](https://github.com/OffchainLabs/token-bridge-contracts/blob/main/contracts/tokenbridge/ethereum/gateway/L1OrbitCustomGateway.sol#L203-L210) expect to have allowance to transfer the native token from the `msg.sender()` to the inbox contract, it's usually the token in the parent chain who handles those approvals. In the [TestCustomTokenL1](https://github.com/OffchainLabs/token-bridge-contracts/blob/main/contracts/tokenbridge/test/TestCustomTokenL1.sol#L158-L168), we offer as an example of implementation. We see that the contract transfers the native tokens to itself and then approves the router and gateway contracts. If we follow that implementation, we only need to send an approval transaction to the native token to allow the TestCustomTokenL1 to transfer the native token from the caller of the `registerTokenToL2` function to itself.

You can find a [tutorial that deploys two tokens and registers them in the Token Bridge of a custom-gas-token-based chain](https://github.com/OffchainLabs/arbitrum-tutorials/tree/master/packages/custom-token-bridging).
