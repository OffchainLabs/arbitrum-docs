---
title: 'Stylusテストネット情報'
description: A reference providing details about the Stylus testnet and faucets for obtaining testnet ETH
author: amarrazza
translator: Ying@Fracton, Naoki@Fracton, Hikaru@Fracton
sme: amarrazza
target_audience: Developers building on the Stylus testnet
sidebar_label: 'テストネット情報'
sidebar_position: 9
---

import TranslationBannerPartial from "./partials/_stylus-translation-banner-partial.md";

import PublicPreviewBannerPartial from './partials/_stylus-public-preview-banner-partial.md';

<TranslationBannerPartial />

<PublicPreviewBannerPartial />

:::caution

Stylusは大規模なアップグレードを実施中であり、いくつかの改善がチェーンのリセットを必要とする可能性があります。リセットの前に、テストネット上の開発者はテストネットETHを引き出すことをお勧めします。テストネットでは7日間の遅延はなく、引き出しは数分で処理されます。新しいチェーンにコントラクトを再デプロイすることを検討してください。リセットの前に事前の警告が行われます。最新情報を得るために、[Discord](https://discord.com/invite/arbitrum)のStylusチャンネルに参加してください。

:::

## RPCエンドポイント

この表は、Stylusテストネットの利用可能なパブリックRPCエンドポイントとそれらと対話するために必要な詳細を概説しています。

| 名前            | RPC URL                              | Chain ID | ブロックエクスプローラー                        | ベースチェーン     | テックスタック    | Sequencer endpoint<sup>⚠️</sup>                  |
|----------------|----------------------------------------|----------|----------------------------------------------|------------------|----------------| ------------------------------------------------ |
| Stylus Testnet | https://stylus-testnet.arbitrum.io/rpc | 23011913 | https://stylus-testnet-explorer.arbitrum.io/ | Arbitrum Sepolia | Nitro (Rollup) | https://stylus-testnet-sequencer.arbitrum.io/rpc |

:::caution

RPC Urlと異なり、シーケンサーエンドポイントは`eth_sendRawTransaction`と`eth_sendRawTransactionConditional`呼び出しのみサポートしています。

:::


他のArbitrumメインネットとテストネットチェーンに関する情報は、ドキュメントの[Node Runner](https://docs.arbitrum.io/node-running/node-providers#rpc-endpoints)セクションをご覧ください。

## フォーセット

テストネットイーサを取得するフォーセットは、下記のフォーセットオペレータから取得し、[Arbitrum Bridge](/node-running/node-providers#rpc-endpoints)経由でStylusテストネットにブリッジできます。

| フォーセットオペレーター | フォーセットURL                                         | チェーン          |
| -------------------- | ----------------------------------------------------- | ---------------- |
| Bware Labs           | https://bwarelabs.com/faucets/arbitrum-stylus-testnet | Stylus Testnet   |
| QuickNode            | https://faucet.quicknode.com/arbitrum/sepolia         | Arbitrum Sepolia |
| Alchemy              | https://sepoliafaucet.com/                            | Ethereum Sepolia |
| Sepolia PoW Faucet   | https://sepolia-faucet.pk910.de/                      | Ethereum Sepolia |

## 便利なスマートコントラクトアドレス

import { AddressExplorerLink as AEL } from '@site/src/components/AddressExplorerLink';

:::caution

Stylusは現在メジャーアップグレードを進行中で、その改良の一部にはチェーンリセットが必要になると予想されています。チェーンリセットの間に以下のアドレスが変更される可能性があるため、ご注意ください。

:::

ここでは、プロトコル、トークンブリッジ、およびStylusテストネットのプリコンパイルに関連するスマートコントラクトのアドレスを一覧にしています。Arbitrumチェーン上で展開されているこれらのコントラクトのアドレスに関する詳細は、リファレンスページ[Smart contract addresses](/for-devs/useful-addresses)をご覧ください。

### プロトコルスマートコントラクト

以下のコントラクトは、Arbitrum Sepolia（Stylusテストネットの親チェーン）に配備されています。

|                   | アドレス                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| Rollup            | <AEL address="0x94db9E36d9336cD6F9FfcAd399dDa6Cc05299898" chainID={421614} /> |
| Sequencer Inbox   | <AEL address="0x00A0F15b79d1D3e5991929FaAbCF2AA65623530c" chainID={421614} /> |
| Core ProxyAdmin   | <AEL address="0x86D3d0752557F74b0a287F174a5dE35707435e40" chainID={421614} /> |
| Delayed Inbox     | <AEL address="0xe1e3b1CBaCC870cb6e5F4Bdf246feB6eB5cD351B" chainID={421614} /> |
| Bridge            | <AEL address="0x35aa95ac4747D928E2Cd42FE4461F6D9d1826346" chainID={421614} /> |
| Outbox            | <AEL address="0x98fcA8bFF38a987B988E54273Fa228A52b62E43b" chainID={421614} /> |
| Challenge Manager | <AEL address="0xf398577501999f14E8a85B1A09816D4Cb0aE0DCf" chainID={421614} /> |

### トークンブリッジスマートコントラクト

以下のコントラクトは、Arbitrum Sepolia（Stylusテストネットの親チェーン）に配備されています。

|                          | アドレス                                                                       |
| ------------------------ | ----------------------------------------------------------------------------- |
| L1 Gateway Router        | <AEL address="0xa72a2F3559Bb337309BCE13f18fae748C6A7D0fa" chainID={421614} /> |
| L1 ERC20 Gateway         | <AEL address="0x709C3Ad4447adA3c9d1eFDA4C4c5b72D4b22005F" chainID={421614} /> |
| L1 GenericCustom Gateway | <AEL address="0x99ED0b0934ff766adceA8A1C38566b2C62Dd319D" chainID={421614} /> |
| L1 WETH Gateway          | <AEL address="0x298f1539B240f7c2A1EA286AE83E6Fac0C33639b" chainID={421614} /> |
| L1 WETH                  | <AEL address="0xe39Ab88f8A4777030A534146A9Ca3B52bd5D43A3" chainID={421614} /> |
| L1 ProxyAdmin            | <AEL address="0xA428EfC5353E064f4c576c319836e13ae1157C41" chainID={421614} /> |

以下のコントラクトは、Stylusテストネットに配備されています。

|                          | アドレス                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| L2 Gateway Router        | <AEL address="0xCDdbADaF4FfA77446aB664834AAdb91121DbdA6f" chainID={23011913} /> |
| L2 ERC20 Gateway         | <AEL address="0x82D5409C0CC3e1E6eaEdb5D1893Ca85b496Aa646" chainID={23011913} /> |
| L2 GenericCustom Gateway | <AEL address="0x8a787c6bEd27F90a7302832523f3c63Ef276f193" chainID={23011913} /> |
| L2 WETH Gateway          | <AEL address="0x024e80adBD08aF5240C7860AF2D44C3596EdB3Da" chainID={23011913} /> |
| L2 WETH                  | <AEL address="0xFFaB5a6E03d5099922BAD0B6E561E9129E0FEB4c" chainID={23011913} /> |
| L2 ProxyAdmin            | <AEL address="0xF113d2bF6c3974810802BE3989e3C1C1BAd0DE69" chainID={23011913} /> |

### プリコンパイル

以下のコントラクトは、Stylusテストネットに配備されています。

|                  | アドレス                                                                         |
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

### 他

以下のコントラクトは、Stylusテストネットに配備されています。

|               | アドレス                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| ArbMulticall2 | <AEL address="0x42aaE78422EF3e8E6d0D88e58E25CA7C7Ecb9D5a" chainID={23011913} /> |