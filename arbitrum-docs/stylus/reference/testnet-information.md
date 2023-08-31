---
title: 'Stylus testnet information'
description: A reference providing details about the Stylus testnet and faucets for obtaining testnet ETH
author: amarrazza
sme: amarrazza
target_audience: Developers building on the Stylus testnet
sidebar_label: 'Testnet information'
---


## Stylus testnet information

This table provides an overview of the available public RPC endpoints for the Stylus testnet and necessary details to interact with them.


| Name                       | RPC URL                             | Chain ID | Block explorer                        | Underlying chain | Tech stack | Sequencer feed URL                    | Sequencer endpoint<sup>⚠️</sup>                  |
| -------------------------- | -------------------------------------- | -------- | ------------------------------------- | -------------- | ---------- | ------------------------------------- | ------------------------------------------------- |
| Stylus testnet              | https://stylus-testnet.arbitrum.io/rpc                 | 23011913        | https://stylus-testnet-explorer.arbitrum.io/           | Arbitrum Sepolia     | Nitro (Rollup) | wss://stylus-sepolia.arbitrum.io/feed | https://stylus-testnet-sequencer.arbitrum.io/rpc            |

⚠️ Unlike `https://arb1.arbitrum.io/rpc`, the Sequencer endpoint only supports `eth_sendRawTransaction` and `eth_sendRawTransactionConditional` calls.

For information on other mainnet and testnet Arbitrum chains, visit the Node Runners [section of the docs](https://docs.arbitrum.io/node-running/node-providers#rpc-endpoints)

## Faucets

Below you can find faucets for obtaining testnet ETH, which can be bridged to the Stylus testnet on the [Arbitrum Bridge](https://bridge.arbitrum.io/)

| Faucet Operator            | Faucet URL                             | Chain     |
| -------------------------- | -------------------------------------- | --------- |
| QuickNode                  | https://faucet.quicknode.com/arbitrum/sepolia             | Arbitrum Sepolia|
| Alchemy                    | https://sepoliafaucet.com/               | Ethereum Sepolia    |
| Infura                     | https://www.infura.io/faucet/sepolia                 | Ethereum Sepolia    |
| Sepolia PoW Faucet         | https://sepolia-faucet.pk910.de/              | Ethereum Sepolia  |

