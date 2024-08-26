---
title: 'Third-party Orbit infrastructure providers'
description: 'A high-level overview of third-party Orbit chain infrastructure providers for production-grade chains.'
author: leartulaj
sme: leartulaj
user_story: As an Orbit chain deployer, I want to know what third-party infrastructure options are available that will help me deploy and maintain a production-grade Orbit chain.
content_type: overview
---

This document provides an overview of third-party Orbit chain infrastructure providers that support production-grade Orbit chain deployments. Note that this list is not exhaustive, and will be continuously updated as the Orbit ecosystem evolves.

## Rollup-as-a-Service (RaaS) providers

For most production use-cases, we encourage Orbit chain operators to work with one of the following RaaS (Rollup as a Service) providers. These providers manage the infrastructure required to maintain high-performance, secure Orbit chain deployments:

- [QuickNode](https://www.quicknode.com/rollup?utm_source=arb-docs)
- [Caldera](https://www.caldera.xyz/)
- [Conduit](https://conduit.xyz/)
- [AltLayer](https://altlayer.io/)
- [Gelato](https://www.gelato.network/)
- [Asphere](https://www.ankr.com/rollup-as-a-service-raas)
- [Alchemy](https://www.alchemy.com/rollups)
- [Zeeve](https://www.zeeve.io)

## Chain explorers

Chain explorers let you view transactions, blocks, addresses, and network activity associated with your Orbit chain. The following explorers support Orbit chains, and can be used to monitor and analyze your chain's activity:

- [Blockscout](https://www.blockscout.com/)
- [Socialscan](https://socialscan.io/)
- [Lore](https://www.lorescan.com/)
- [Routescan](https://routescan.io/)

Additionally, Orbit chains leveraging blobs for data availability may use tools like [Blobscan](https://blobscan.com/) to see which blob/block includes a given transaction.

## Bridges

You can easily launch an Orbit chain with a canonical token bridge, which allows transfers to and from the chain via <a data-quicklook-from="arbitrum-one">Arbitrum One</a>, <a data-quicklook-from="arbitrum-nova">Nova</a>, or the parent chain to which your Orbit chain settles transactions.

For applications that require the ability to transfer assets to chains outside of the Orbit ecosystem or in an expedited manner (without waiting for complete finality), the following third-party bridging providers can be used:

- [LayerZero](https://layerzero.network/)
- [Connext](https://www.connext.network/)
- [Hyperlane](https://www.hyperlane.xyz/)
- [Axelar](https://axelar.network/)
- [Across](https://across.to/)
- [Decent](https://www.decent.xyz/)

## Data availability

One way to reduce transaction fees for Orbit chains is to configure a Data Availability (DA) solution that stores chain data off-chain. Although the AnyTrust protocol offers native support for this functionality (and is configurable by default on Orbit AnyTrust chains), the following third-party providers give you another way to store data off-chain. Note that using these services will limit your chain's ability to leverage AnyTrust protocol improvements as they relate to transaction fee and DA configurability:

- [Celestia](https://celestia.org/)
- [EigenDA](https://www.eigenlayer.xyz/)
- [AvailDA](https://www.availproject.org/)
- [Near](https://near.org/data-availability) (coming soon)

## Indexers

Indexers provide a convenient way to retrieve historic or application-specific data without having to interface with your chain through an RPC endpoint. The following third-party providers offer indexing services that can be used with Orbit chains:

- [QuickNode](https://www.quicknode.com/streams?utm_source=arb-docs)
- [Alchemy](https://www.alchemy.com/)
- [The Graph](https://thegraph.com/)
- [Goldsky](https://goldsky.com/)
- [Ormi](https://www.ormilabs.xyz/)

## Oracles

The following Oracle providers can be used to integrate off-chain data with your Orbit chain's smart contracts:

- [Chainlink](https://chain.link/)
- [Pyth](https://pyth.network/)
- [Redstone](https://redstone.finance/)
- [Randomizer](http://Randomizer.ai) (VRF only)
- [Supra](https://supra.com/)

## RPC endpoints

RPC endpoints are the primary interface through which users and developers interact with any chain, whether it be for transaction submission, reading state, or indexing historical data. The following third-party providers offer RPC endpoint services compatible with Orbit chains:

- [Alchemy](https://www.alchemy.com/)
- [Ankr](https://www.ankr.com/)
- [Chainstack](https://chainstack.com/)
- [QuickNode](https://www.quicknode.com?utm_source=arb-docs)
