---
title: 'RPC endpoints and providers'
description: Find available RPC endpoints and providers in the ecosystem
reader_audience: developers who want to build on Arbitrum
content_type: overview
---

:::info WANT TO BE LISTED HERE?

Complete [this form](@portalApplicationForm@) , if you'd like to see your project added to this list (and the [Arbitrum portal](https://portal.arbitrum.one/)).

:::

## Arbitrum public RPC endpoints

This section provides an overview of the available public RPC endpoints for different Arbitrum chains and necessary details to interact with them.

| Name                       | RPC Url(s)                             | Chain ID | Block explorer              | Underlying chain | Tech stack       | Sequencer feed URL                    | Sequencer endpoint<sup>⚠️</sup>                  |
| -------------------------- | -------------------------------------- | -------- | --------------------------- | ---------------- | ---------------- | ------------------------------------- | ------------------------------------------------ |
| Arbitrum One               | https://arb1.arbitrum.io/rpc           | 42161    | https://arbiscan.io/        | Ethereum         | Nitro (Rollup)   | wss://arb1.arbitrum.io/feed           | https://arb1-sequencer.arbitrum.io/rpc           |
| Arbitrum Nova              | https://nova.arbitrum.io/rpc           | 42170    | https://nova.arbiscan.io/   | Ethereum         | Nitro (AnyTrust) | wss://nova.arbitrum.io/feed           | https://nova-sequencer.arbitrum.io/rpc           |
| Arbitrum Sepolia (Testnet) | https://sepolia-rollup.arbitrum.io/rpc | 421614   | https://sepolia.arbiscan.io | Sepolia          | Nitro (Rollup)   | wss://sepolia-rollup.arbitrum.io/feed | https://sepolia-rollup-sequencer.arbitrum.io/rpc |

:::caution

- Unlike the RPC Urls, the Sequencer endpoints only support `eth_sendRawTransaction` and `eth_sendRawTransactionConditional` calls.
- Arbitrum public RPCs do not provide Websocket support.
- Stylus testnet (v1) has been deprecated, but you can still find its information in [Stylus testnet information](/stylus/reference/testnet-information.mdx).
- Stylus testnet (v2) has been deprecated, but you can still find its information in [Stylus testnet information](/stylus/reference/testnet-information.mdx).
- Visit [Quicknode's Arbitrum Sepolia faucet](https://faucet.quicknode.com/arbitrum/sepolia) for testnet Sepolia tokens on L2.

:::

:::info More RPC endpoints

More Arbitrum chain RPC endpoints can be found in Chain Connect: [Arbitrum One](https://www.alchemy.com/chain-connect/chain/arbitrum-one) and [Arbitrum Nova](https://www.alchemy.com/chain-connect/chain/arbitrum-nova).

:::

## Third-party RPC providers

Alternatively, to interact with public Arbitrum chains, you can rely on many of the same popular node providers that you are already using on Ethereum:

| Provider                                                                             | Arb One? | Arb Nova? | Arb Sepolia? | Websocket? |
| ------------------------------------------------------------------------------------ | -------- | --------- | ------------ | ---------- |
| [1RPC](https://docs.1rpc.io/overview/supported-networks#arbitrum)                    | ✅       |           |              |            |
| [Alchemy](https://docs.alchemy.com/reference/arbitrum-api-quickstart)                | ✅       | ✅        | ✅           | ✅         |
| [Allnodes](https://arbitrum.publicnode.com)                                          | ✅       | ✅        |              | ✅         |
| [Ankr](https://www.ankr.com/docs/rpc-service/chains/chains-list/#arbitrum)           | ✅       |           |              | ✅         |
| [Blast](https://blastapi.io/public-api/arbitrum)                                     | ✅       | ✅        |              | ✅         |
| [BlockPi](https://docs.blockpi.io/documentations/api-reference/arbitrum)             | ✅       | ✅        |              |            |
| [BlockVision](https://dashboard.blockvision.org/connect)                             | ✅       |           |              |            |
| [Chainbase](https://docs.chainbase.com/docs/chain-api-overview#arbitrum-one)         | ✅       |           |              | ✅         |
| [Chainnodes](https://www.chainnodes.org/chains/arbitrum)                             | ✅       |           |              |            |
| [Chainstack](https://chainstack.com/build-better-with-arbitrum/)                     | ✅       |           |              | ✅         |
| [DataHub](https://datahub.figment.io/)                                               | ✅       |           |              |            |
| [DRPC](https://drpc.org/public-endpoints/arbitrum)                                   | ✅       | ✅        |              | ✅         |
| [GetBlock](https://getblock.io/nodes/arb/)                                           | ✅       |           |              | ✅         |
| [Infura](https://docs.infura.io/infura/networks/arbitrum)                            | ✅       |           | ✅           | ✅         |
| [Lava](https://docs.lavanet.xyz/gateway-access)                                      | ✅       | ✅        |              |            |
| [Moralis](https://docs.moralis.io/reference/introduction)                            | ✅       |           |              |            |
| [Nirvana Labs](https://nirvanalabs.io)                                               | ✅       | ✅        | ✅           | ✅         |
| [NodeReal](https://nodereal.io/meganode/api-marketplace/arbitrum-nitro-rpc)          | ✅       | ✅        |              |            |
| [NOWNodes](https://nownodes.io/nodes/arbitrum-arb)                                   | ✅       |           |              |            |
| [Pocket Network](https://docs.pokt.network/welcome-to-pokt-network/supported-chains) | ✅       |           |              |            |
| [Quicknode](https://www.quicknode.com/chains/arb)                                    | ✅       | ✅        | ✅           | ✅         |
| [Unifra](https://unifra.io/)                                                         | ✅       |           |              |            |
