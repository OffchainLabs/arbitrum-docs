---
title: 'L1 Ethereum beacon chain RPC providers'
author: dlee
---

import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.mdx';

<PublicPreviewBannerPartial />

:::info Note
This reference document provides an overview of Ethereum beacon chain RPC providers for Arbitrum validators to use for accessing blob data following Ethereum's Dencun upgrade in March 2024. The list curated here is **not comprehensive and in no way does Offchain Labs endorse or benefit from your use of any of these providers.**
:::

Following [Ethereum's Dencun upgrade in March 2024](https://eips.ethereum.org/EIPS/eip-7569), Layer 2 blockchains like Arbitrum will be able to roll up and post batches of transaction data on Ethereum in the form of a new transaction format called a Blob. This Blob data will be part of the beacon chain and is fully downloadable by all consensus nodes. This means that data stored in blobs are inaccessible by the EVM, unlike Calldata.

### What does this mean for node operators?

To run a node for an L2 Arbitrum chain (i.e. Arbitrum One, Arbitrum Nova, and L2 Orbit chains), your node will need access to blob data to sync up to the latest state of your Arbitrum L2 chain. Blob data on Ethereum is stored on the beacon chain and is inaccessible to the EVM, hence why dedicated RPC endpoints for the beacon chain will be required after the Dencun upgrade. You can find more details on node requirements in the [Run a full node guide](/run-arbitrum-node/03-run-full-node.md).

Furthermore, new node operators joining a network or node operators who come online following an extended period of offline time will require access to _historical_ blob data to sync up to the latest state of their Arbitrum chain.

Offchain Labs has plans to reduce a Nitro validator's reliance on historical blob data and will share updates on this effort in the future.

### List of Ethereum beacon chain RPC providers

| Provider                                                                    | Mainnet Beacon chain APIs? | Mainnet Historical blob data? | Holesky Beacon chain APIs? | Sepolia Beacon chain APIs? |
| --------------------------------------------------------------------------- | -------------------------- | ----------------------------- | -------------------------- | -------------------------- |
| [Ankr](https://www.ankr.com/docs/rpc-service/chains/chains-api/eth-beacon/) | ✅                         | ✅                            |                            |                            |
| [Chainbase](https://chainbase.com/)                                         | ✅                         |                               |                            |                            |
| [Chainstack](https://docs.chainstack.com/reference/beacon-chain)            | ✅                         | ✅                            |                            | ✅                         |
| [Conduit](https://conduit.xyz/)\*                                           | ✅                         | ✅                            |                            |                            |
| [BlastAPI](https://blastapi.io/public-api/ethereum)                         |                            |                               | ✅                         |                            |
| [Nirvana Labs](https://nirvanalabs.io)                                      | ✅                         | ✅                            |                            |                            |
| [NodeReal](https://nodereal.io/)                                            | ✅                         |                               |                            |                            |
| [QuickNode](https://www.quicknode.com/docs/ethereum)                        | ✅                         | ✅                            | ✅                         | ✅                         |
| [dRPC](https://drpc.org/chainlist/eth-beacon-chain)                         | ✅                         | ✅                            | ✅                         | ✅                         |

Please reach out to these teams individually if you need assistance with setting up your validator with any of the above providers.

**\*Case-by-case basis, please contact them directly for help**
