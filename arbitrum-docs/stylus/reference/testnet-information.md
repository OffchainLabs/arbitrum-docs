---
title: 'Stylus testnet information'
description: A reference providing details about the Stylus testnet and faucets for obtaining testnet ETH
author: amarrazza
sme: amarrazza
target_audience: Developers building on the Stylus testnet
sidebar_label: 'Testnet information'
sidebar_position: 9
---

import PublicPreviewBannerPartial from '../partials/_stylus-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

:::caution

Stylus is undergoing major upgrades, and some improvements are expected to require a chain reset. Prior to a reset, developers on the testnet are recommened to withdraw their testnet ETH (there is no 7-day delay since this is a testnet, withdrawals are processed in minutes) and redeploy their contracts on the new chain. There will be advanced warning of any resets. Stay up-to-date by joining the Stylus channel in [Discord](https://discord.com/invite/arbitrum).

:::

This table provides an overview of the available public RPC endpoints for the Stylus testnet and necessary details to interact with them.

| Name           | RPC URL                                | Chain ID | Block explorer                               | Underlying chain | Tech stack     | Sequencer feed URL                    | Sequencer endpoint<sup>⚠️</sup>                  |
| -------------- | -------------------------------------- | -------- | -------------------------------------------- | ---------------- | -------------- | ------------------------------------- | ------------------------------------------------ |
| Stylus testnet | https://stylus-testnet.arbitrum.io/rpc | 23011913 | https://stylus-testnet-explorer.arbitrum.io/ | Arbitrum Sepolia | Nitro (Rollup) | wss://stylus-sepolia.arbitrum.io/feed | https://stylus-testnet-sequencer.arbitrum.io/rpc |

:::caution

Unlike the RPC Url, the Sequencer endpoint only supports `eth_sendRawTransaction` and `eth_sendRawTransactionConditional` calls.

:::

For information on other mainnet and testnet Arbitrum chains, visit the Node Runners [section of the docs](https://docs.arbitrum.io/node-running/node-providers#rpc-endpoints)

## Faucets

Below you can find faucets for obtaining testnet ETH, which can be bridged to the Stylus testnet on the [Arbitrum Bridge](https://bridge.arbitrum.io/)

| Faucet Operator    | Faucet URL                                    | Chain            |
| ------------------ | --------------------------------------------- | ---------------- |
| QuickNode          | https://faucet.quicknode.com/arbitrum/sepolia | Arbitrum Sepolia |
| Alchemy            | https://sepoliafaucet.com/                    | Ethereum Sepolia |
| Infura             | https://www.infura.io/faucet/sepolia          | Ethereum Sepolia |
| Sepolia PoW Faucet | https://sepolia-faucet.pk910.de/              | Ethereum Sepolia |
