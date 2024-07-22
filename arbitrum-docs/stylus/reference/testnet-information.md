---
title: 'Stylus testnet information'
description: A reference providing details about the Stylus testnet and faucets for obtaining testnet ETH
author: amarrazza
sme: amarrazza
target_audience: Developers building on the Stylus testnet
sidebar_position: 9
---

import PublicPreviewBannerPartial from '../partials/_stylus-public-preview-banner-partial.mdx';

<PublicPreviewBannerPartial />

:::caution

Stylus is undergoing major upgrades, and some improvements are expected to require a chain reset. Prior to a reset, developers on the testnet are recommended to withdraw their testnet ETH (there is no 7-day delay since this is a testnet, withdrawals are processed in minutes) and redeploy their contracts on the new chain. There will be advanced warning of any resets. Stay up-to-date by joining the Stylus channel in [Discord](https://discord.com/invite/arbitrum).

:::

## RPC endpoints

This table provides an overview of the available public RPC endpoints for the Stylus testnet and necessary details to interact with them.

| Name                           | RPC URL                                | Chain ID | Block explorer                               | Underlying chain | Sequencer feed URL                    | Sequencer endpoint<sup>⚠️</sup>                  |
| ------------------------------ | -------------------------------------- | -------- | -------------------------------------------- | ---------------- | ------------------------------------- | ------------------------------------------------ |
| Arbitrum Sepolia               | https://sepolia-rollup.arbitrum.io/rpc | 421614   | https://sepolia.arbiscan.io                  | Sepolia          | wss://sepolia-rollup.arbitrum.io/feed | https://sepolia-rollup-sequencer.arbitrum.io/rpc |
| Stylus testnet (v2-deprecated) | https://stylusv2.arbitrum.io/rpc       | 13331371 | https://stylusv2-explorer.arbitrum.io/       | Arbitrum Sepolia | wss://stylusv2.arbitrum.io/feed       | https://stylusv2-sequencer.arbitrum.io/rpc       |
| Stylus testnet (v1-deprecated) | https://stylus-testnet.arbitrum.io/rpc | 23011913 | https://stylus-testnet-explorer.arbitrum.io/ | Arbitrum Sepolia | wss://stylus-testnet.arbitrum.io/feed | https://stylus-testnet-sequencer.arbitrum.io/rpc |

:::caution

- Unlike the RPC Url, the Sequencer endpoint only supports `eth_sendRawTransaction` and `eth_sendRawTransactionConditional` calls.
- Stylus testnet (v1) has been deprecated.
- Stylus testnet (v2) has been deprecated.

:::

For information on other mainnet and testnet Arbitrum chains, visit the [Node Runners](/build-decentralized-apps/reference/01-node-providers.md#rpc-endpoints) section of the docs.

## Faucets

Below you can find faucets for obtaining testnet ETH. If using a faucet on Ethereum Sepolia or Arbitrum Sepolia, your testnet ETH can be bridged to the Stylus testnet on the [Arbitrum Bridge](https://bridge.arbitrum.io/).

| Faucet Operator    | Faucet URL                                    | Chain            |
| ------------------ | --------------------------------------------- | ---------------- |
| QuickNode          | https://faucet.quicknode.com/arbitrum/sepolia | Arbitrum Sepolia |
| Alchemy            | https://sepoliafaucet.com/                    | Ethereum Sepolia |
| Sepolia PoW Faucet | https://sepolia-faucet.pk910.de/              | Ethereum Sepolia |

## Useful smart contract addresses

import { AddressExplorerLink as AEL } from '@site/src/components/AddressExplorerLink';

:::caution

Stylus is undergoing major upgrades, and some improvements are expected to require a chain reset. Keep in mind that the following addresses may change during a chain reset.

:::

Here we list the addresses of the smart contracts related to the protocol, the token bridge and precompiles of the Stylus testnet. For the addresses of these contracts deployed on other Arbitrum chains, see our reference page [Smart contract addresses](/build-decentralized-apps/reference/02-useful-addresses.md).

### Protocol smart contracts

The following contracts are deployed on Arbitrum Sepolia (the parent chain of the Stylus testnet).

|                   | Stylus testnet v2                                                             | Stylus Testnet v1 (deprecated)                                                |
| ----------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Rollup            | <AEL address="0x01a8a2b32aa5328466Be47A1808a03aC6c35d94f" chainID={421614} /> | <AEL address="0x94db9E36d9336cD6F9FfcAd399dDa6Cc05299898" chainID={421614} /> |
| Sequencer Inbox   | <AEL address="0x1Ea8B3853355604673e1301A501766EbB2987a09" chainID={421614} /> | <AEL address="0x00A0F15b79d1D3e5991929FaAbCF2AA65623530c" chainID={421614} /> |
| Core ProxyAdmin   | <AEL address="0xBD76fd3fB5F3CD7165fB6e0DB895FFE1d81463e3" chainID={421614} /> | <AEL address="0x86D3d0752557F74b0a287F174a5dE35707435e40" chainID={421614} /> |
| Delayed Inbox     | <AEL address="0xcdCF1F59f5d4A65a3c67E1341f8b85Cba50E0a7C" chainID={421614} /> | <AEL address="0xe1e3b1CBaCC870cb6e5F4Bdf246feB6eB5cD351B" chainID={421614} /> |
| Bridge            | <AEL address="0x024a10506f8a27E4CfEDeB18fd30AA1529A2960E" chainID={421614} /> | <AEL address="0x35aa95ac4747D928E2Cd42FE4461F6D9d1826346" chainID={421614} /> |
| Outbox            | <AEL address="0xf731Fc4F7B70A0a6F9915f452d88Dc405a59D8b1" chainID={421614} /> | <AEL address="0x98fcA8bFF38a987B988E54273Fa228A52b62E43b" chainID={421614} /> |
| Challenge Manager | <AEL address="0xC3ED756Ee6AF0C7D1C3D58Df720ba18bB8a4ae76" chainID={421614} /> | <AEL address="0xf398577501999f14E8a85B1A09816D4Cb0aE0DCf" chainID={421614} /> |

### Token bridge smart contracts

The following contracts are deployed on Arbitrum Sepolia (the parent chain of the Stylus testnet).

|                          | Stylus testnet v2                                                             | Stylus Testnet v1 (deprecated)                                                |
| ------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| L1 Gateway Router        | <AEL address="0xAC4F454320A253267C6Ae95e4784b9A4f9F78359" chainID={421614} /> | <AEL address="0xa72a2F3559Bb337309BCE13f18fae748C6A7D0fa" chainID={421614} /> |
| L1 ERC20 Gateway         | <AEL address="0xD2C4693Dd8d44703af5CF9484fa8faAD6e33E392" chainID={421614} /> | <AEL address="0x709C3Ad4447adA3c9d1eFDA4C4c5b72D4b22005F" chainID={421614} /> |
| L1 GenericCustom Gateway | <AEL address="0x093353B9f723047abf37Ebe01cE48d7dDA8320F4" chainID={421614} /> | <AEL address="0x99ED0b0934ff766adceA8A1C38566b2C62Dd319D" chainID={421614} /> |
| L1 WETH Gateway          | <AEL address="0x4FEbc93233aAc1523f36Abe297de9323f6C8ce79" chainID={421614} /> | <AEL address="0x298f1539B240f7c2A1EA286AE83E6Fac0C33639b" chainID={421614} /> |
| L1 WETH                  | <AEL address="0x980B62Da83eFf3D4576C647993b0c1D7faf17c73" chainID={421614} /> | <AEL address="0xe39Ab88f8A4777030A534146A9Ca3B52bd5D43A3" chainID={421614} /> |
| L1 ProxyAdmin            | <AEL address="0xBD76fd3fB5F3CD7165fB6e0DB895FFE1d81463e3" chainID={421614} /> | <AEL address="0xA428EfC5353E064f4c576c319836e13ae1157C41" chainID={421614} /> |

The following contracts are deployed on the Stylus testnet.

|                          | Stylus testnet v2                                                               | Stylus Testnet v1 (deprecated)                                                  |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| L2 Gateway Router        | <AEL address="0xD60FD4c5D335b00287202C93C5B4EE0478D92686" chainID={13331371} /> | <AEL address="0xCDdbADaF4FfA77446aB664834AAdb91121DbdA6f" chainID={23011913} /> |
| L2 ERC20 Gateway         | <AEL address="0xCf3a4aF3c48Ba19c5FccFB44FA3E3A0F2A6e60dA" chainID={13331371} /> | <AEL address="0x82D5409C0CC3e1E6eaEdb5D1893Ca85b496Aa646" chainID={23011913} /> |
| L2 GenericCustom Gateway | <AEL address="0xE102D94df0179082B39Ddcad58c9430dedc89aE3" chainID={13331371} /> | <AEL address="0x8a787c6bEd27F90a7302832523f3c63Ef276f193" chainID={23011913} /> |
| L2 WETH Gateway          | <AEL address="0xec018E81eE818b04CFb1E013D91F1b779a2AC440" chainID={13331371} /> | <AEL address="0x024e80adBD08aF5240C7860AF2D44C3596EdB3Da" chainID={23011913} /> |
| L2 WETH                  | <AEL address="0xa3bD1fdeEb903142d16B3bd22f2aC9A82C714D62" chainID={13331371} /> | <AEL address="0xFFaB5a6E03d5099922BAD0B6E561E9129E0FEB4c" chainID={23011913} /> |
| L2 ProxyAdmin            | <AEL address="0x9DC4Da9a940AFEbBC8329aA6534aD767b60d968c" chainID={13331371} /> | <AEL address="0xF113d2bF6c3974810802BE3989e3C1C1BAd0DE69" chainID={23011913} /> |

### Precompiles

The following precompiles are deployed on the Stylus testnet.

|                  | Address                                                                         |
| ---------------- | ------------------------------------------------------------------------------- |
| ArbAddressTable  | <AEL address="0x0000000000000000000000000000000000000066" chainID={13331371} /> |
| ArbAggregator    | <AEL address="0x000000000000000000000000000000000000006D" chainID={13331371} /> |
| ArbBLS           | <AEL address="0x0000000000000000000000000000000000000067" chainID={13331371} /> |
| ArbFunctionTable | <AEL address="0x0000000000000000000000000000000000000068" chainID={13331371} /> |
| ArbGasInfo       | <AEL address="0x000000000000000000000000000000000000006C" chainID={13331371} /> |
| ArbInfo          | <AEL address="0x0000000000000000000000000000000000000065" chainID={13331371} /> |
| ArbOwner         | <AEL address="0x0000000000000000000000000000000000000070" chainID={13331371} /> |
| ArbOwnerPublic   | <AEL address="0x000000000000000000000000000000000000006b" chainID={13331371} /> |
| ArbRetryableTx   | <AEL address="0x000000000000000000000000000000000000006E" chainID={13331371} /> |
| ArbStatistics    | <AEL address="0x000000000000000000000000000000000000006F" chainID={13331371} /> |
| ArbSys           | <AEL address="0x0000000000000000000000000000000000000064" chainID={13331371} /> |
| ArbWasm          | <AEL address="0x0000000000000000000000000000000000000071" chainID={13331371} /> |
| ArbWasmCache     | <AEL address="0x0000000000000000000000000000000000000072" chainID={13331371} /> |
| NodeInterface    | <AEL address="0x00000000000000000000000000000000000000C8" chainID={13331371} /> |

### Misc

The following contracts are deployed on the Stylus testnet.

|               | Stylus testnet v2                                                               | Stylus Testnet v1 (deprecated)                                                  |
| ------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| ArbMulticall2 | <AEL address="0x39E068582873B2011F5a1e8E0F7D9D993c8111BC" chainID={13331371} /> | <AEL address="0x42aaE78422EF3e8E6d0D88e58E25CA7C7Ecb9D5a" chainID={23011913} /> |
