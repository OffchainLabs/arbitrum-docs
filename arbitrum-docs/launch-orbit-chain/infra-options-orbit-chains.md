---
title: 'Infrastructure options for Orbit chains'
description: 'A high-level overview of Orbit chain infrastructure options for production-grade chains.'
author: leartulaj
sme: leartulaj
user_story: As an Orbit chain deployer, I want to know what infrastructure options are available so that I can make informed decisions about the components I need to deploy and maintain a production-grade chain.
content_type: overview
---

This overview provides Orbit chain deployers with a high-level understanding of the infrastructure options available for production-grade chains. The following list is not comprehensive, but it covers the most common components you may need to deploy and maintain a successful chain.

## Rollup-as-a-Service (RaaS) providers

For most production use-cases, we encourage Orbit chain operators to work with one of the following RaaS (Rollup as a Service) providers. These providers manage the infrastructure required to maintain high-performance, secure Orbit chain deployments:

- [Caldera](https://www.caldera.xyz/)
- [Conduit](https://conduit.xyz/)
- [AltLayer](https://altlayer.io/)
- [Gelato](https://www.gelato.network/)

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

## Data availability

Orbit chains can optionally use a Data Availability solution that stores chain data off-chain. The following third-party services can be used to store Orbit chain data:

- [Celestia](https://celestia.org/)
- [EigenDA](https://www.eigenlayer.xyz/)
- [Avail](https://www.availproject.org/) (coming soon)
- [Near](https://near.org/data-availability) (coming soon)

## Indexers

Indexers provide a convenient way to retrieve historic or application-specific data without having to interface with your chain through an RPC endpoint. The following third-party providers offer indexing services that can be used with Orbit chains:

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
- [QuickNode](https://www.quicknode.com/)