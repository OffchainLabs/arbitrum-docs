---
title: 'Stylus testnet information'
description: A reference providing details about the Stylus testnet and faucets for obtaining testnet ETH
author: amarrazza
sme: amarrazza
target_audience: Developers building on the Stylus testnet
sidebar_position: 9
---

import PublicPreviewBannerPartial from '../partials/_stylus-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

:::caution

Stylus is undergoing major upgrades, and some improvements are expected to require a chain reset. Prior to a reset, developers on the testnet are recommended to withdraw their testnet ETH (there is no 7-day delay since this is a testnet, withdrawals are processed in minutes) and redeploy their contracts on the new chain. There will be advanced warning of any resets. Stay up-to-date by joining the Stylus channel in [Discord](https://discord.com/invite/arbitrum).

:::

## RPC endpoints

This table provides an overview of the available public RPC endpoints for the Stylus testnet and necessary details to interact with them.

| Name           | RPC URL                                | Chain ID | Block explorer                               | Underlying chain | Tech stack     | Sequencer feed URL                    | Sequencer endpoint<sup>⚠️</sup>                  |
| -------------- | -------------------------------------- | -------- | -------------------------------------------- | ---------------- | -------------- | ------------------------------------- | ------------------------------------------------ |
| Stylus testnet | https://stylus-testnet.arbitrum.io/rpc | 23011913 | https://stylus-testnet-explorer.arbitrum.io/ | Arbitrum Sepolia | Nitro (Rollup) | wss://stylus-testnet.arbitrum.io/feed | https://stylus-testnet-sequencer.arbitrum.io/rpc |

:::caution

Unlike the RPC Url, the Sequencer endpoint only supports `eth_sendRawTransaction` and `eth_sendRawTransactionConditional` calls.

:::

For information on other mainnet and testnet Arbitrum chains, visit the Node Runners [section of the docs](/node-running/node-providers#rpc-endpoints).

## Faucets

Below you can find faucets for obtaining testnet ETH. If using a faucet on Ethereum Sepolia or Arbitrum Sepolia, your testnet ETH can be bridged to the Stylus testnet on the [Arbitrum Bridge](https://bridge.arbitrum.io/).

| Faucet Operator    | Faucet URL                                            | Chain            |
| ------------------ | ----------------------------------------------------- | ---------------- |
| Bware Labs         | https://bwarelabs.com/faucets/arbitrum-stylus-testnet | Stylus Testnet   |
| QuickNode          | https://faucet.quicknode.com/arbitrum/sepolia         | Arbitrum Sepolia |
| Alchemy            | https://sepoliafaucet.com/                            | Ethereum Sepolia |
| Sepolia PoW Faucet | https://sepolia-faucet.pk910.de/                      | Ethereum Sepolia |

## Useful smart contract addresses

import { AddressExplorerLink as AEL } from '@site/src/components/AddressExplorerLink';

:::caution

Stylus is undergoing major upgrades, and some improvements are expected to require a chain reset. Keep in mind that the following addresses may change during a chain reset.

:::

Here we list the addresses of the smart contracts related to the protocol, the token bridge and precompiles of the Stylus testnet. For the addresses of these contracts deployed on other Arbitrum chains, see our reference page [Smart contract addresses](/for-devs/useful-addresses).

### Protocol smart contracts

The following contracts are deployed on Arbitrum Sepolia (the parent chain of the Stylus testnet).

|                   | Address                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| Rollup            | <AEL address="0x94db9E36d9336cD6F9FfcAd399dDa6Cc05299898" chainID={421614} /> |
| Sequencer Inbox   | <AEL address="0x00A0F15b79d1D3e5991929FaAbCF2AA65623530c" chainID={421614} /> |
| Core ProxyAdmin   | <AEL address="0x86D3d0752557F74b0a287F174a5dE35707435e40" chainID={421614} /> |
| Delayed Inbox     | <AEL address="0xe1e3b1CBaCC870cb6e5F4Bdf246feB6eB5cD351B" chainID={421614} /> |
| Bridge            | <AEL address="0x35aa95ac4747D928E2Cd42FE4461F6D9d1826346" chainID={421614} /> |
| Outbox            | <AEL address="0x98fcA8bFF38a987B988E54273Fa228A52b62E43b" chainID={421614} /> |
| Challenge Manager | <AEL address="0xf398577501999f14E8a85B1A09816D4Cb0aE0DCf" chainID={421614} /> |

### Token bridge smart contracts

The following contracts are deployed on Arbitrum Sepolia (the parent chain of the Stylus testnet).

|                          | Address                                                                       |
| ------------------------ | ----------------------------------------------------------------------------- |
| L1 Gateway Router        | <AEL address="0xa72a2F3559Bb337309BCE13f18fae748C6A7D0fa" chainID={421614} /> |
| L1 ERC20 Gateway         | <AEL address="0x709C3Ad4447adA3c9d1eFDA4C4c5b72D4b22005F" chainID={421614} /> |
| L1 GenericCustom Gateway | <AEL address="0x99ED0b0934ff766adceA8A1C38566b2C62Dd319D" chainID={421614} /> |
| L1 WETH Gateway          | <AEL address="0x298f1539B240f7c2A1EA286AE83E6Fac0C33639b" chainID={421614} /> |
| L1 WETH                  | <AEL address="0xe39Ab88f8A4777030A534146A9Ca3B52bd5D43A3" chainID={421614} /> |
| L1 ProxyAdmin            | <AEL address="0xA428EfC5353E064f4c576c319836e13ae1157C41" chainID={421614} /> |

The following contracts are deployed on the Stylus testnet.

|                          | Address                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| L2 Gateway Router        | <AEL address="0xCDdbADaF4FfA77446aB664834AAdb91121DbdA6f" chainID={23011913} /> |
| L2 ERC20 Gateway         | <AEL address="0x82D5409C0CC3e1E6eaEdb5D1893Ca85b496Aa646" chainID={23011913} /> |
| L2 GenericCustom Gateway | <AEL address="0x8a787c6bEd27F90a7302832523f3c63Ef276f193" chainID={23011913} /> |
| L2 WETH Gateway          | <AEL address="0x024e80adBD08aF5240C7860AF2D44C3596EdB3Da" chainID={23011913} /> |
| L2 WETH                  | <AEL address="0xFFaB5a6E03d5099922BAD0B6E561E9129E0FEB4c" chainID={23011913} /> |
| L2 ProxyAdmin            | <AEL address="0xF113d2bF6c3974810802BE3989e3C1C1BAd0DE69" chainID={23011913} /> |

### Precompiles

The following precompiles are deployed on the Stylus testnet.

|                  | Address                                                                         |
| ---------------- | ------------------------------------------------------------------------------- |
| ArbAddressTable  | <AEL address="0x0000000000000000000000000000000000000066" chainID={23011913} /> |
| ArbAggregator    | <AEL address="0x000000000000000000000000000000000000006D" chainID={23011913} /> |
| ArbBLS           | <AEL address="0x0000000000000000000000000000000000000067" chainID={23011913} /> |
| ArbFunctionTable | <AEL address="0x0000000000000000000000000000000000000068" chainID={23011913} /> |
| ArbGasInfo       | <AEL address="0x000000000000000000000000000000000000006C" chainID={23011913} /> |
| ArbInfo          | <AEL address="0x0000000000000000000000000000000000000065" chainID={23011913} /> |
| ArbOwner         | <AEL address="0x0000000000000000000000000000000000000070" chainID={23011913} /> |
| ArbOwnerPublic   | <AEL address="0x000000000000000000000000000000000000006b" chainID={23011913} /> |
| ArbRetryableTx   | <AEL address="0x000000000000000000000000000000000000006E" chainID={23011913} /> |
| ArbStatistics    | <AEL address="0x000000000000000000000000000000000000006F" chainID={23011913} /> |
| ArbSys           | <AEL address="0x0000000000000000000000000000000000000064" chainID={23011913} /> |
| NodeInterface    | <AEL address="0x00000000000000000000000000000000000000C8" chainID={23011913} /> |

### Misc

The following contracts are deployed on the Stylus testnet.

|               | Address                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| ArbMulticall2 | <AEL address="0x42aaE78422EF3e8E6d0D88e58E25CA7C7Ecb9D5a" chainID={23011913} /> |
