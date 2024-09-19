---
title: 'Stylus testnet information'
description: A reference providing details about the Stylus testnet and faucets for obtaining testnet ETH
author: amarrazza
sme: amarrazza
target_audience: Developers building on the Stylus testnet
sidebar_position: 9
---

import PublicPreviewBannerPartial from '../../partials/_public-preview-banner-partial.md';

import StylusFaucets from './partials/_stylus-faucets.mdx';

import StylusSmartContractsAddresses from './partials/_stylus-smart-contract-addresses.mdx';

<PublicPreviewBannerPartial />


## Arbitrum public RPC endpoints

:::caution

- Unlike the RPC Urls, the Sequencer endpoints only support `eth_sendRawTransaction` and `eth_sendRawTransactionConditional` calls.
- Arbitrum public RPCs do not provide Websocket support.
- Stylus testnets v1 and v2 have been spun down and are not accessible anymore.
- Visit [Quicknode's Arbitrum Sepolia faucet](https://faucet.quicknode.com/arbitrum/sepolia) or [Alchemy's Arbitrum sepolia faucet](https://www.alchemy.com/faucets/arbitrum-sepolia) for testnet Sepolia tokens on L2.

:::

This section provides an overview of the available public RPC endpoints for different Arbitrum chains that have Stylus enabled, and the necessary details to interact with them.

| Name                       | RPC Url(s)                             | Chain ID | Block explorer              | Underlying chain | Tech stack     | Sequencer feed URL                    | Sequencer endpoint<sup>⚠️</sup>                  |
| -------------------------- | -------------------------------------- | -------- | --------------------------- | ---------------- | -------------- | ------------------------------------- | ------------------------------------------------ |
| Arbitrum Sepolia (Testnet) | https://sepolia-rollup.arbitrum.io/rpc | 421614   | https://sepolia.arbiscan.io | Sepolia          | Nitro (Rollup) | wss://sepolia-rollup.arbitrum.io/feed | https://sepolia-rollup-sequencer.arbitrum.io/rpc |

<StylusFaucets />

<StylusSmartContractsAddresses />
