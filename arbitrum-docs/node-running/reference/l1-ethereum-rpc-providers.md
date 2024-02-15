---
title: 'L1 Ethereum RPC providers'
sidebar_label: 'L1 Ethereum RPC providers'
author: dlee
---

import PublicPreviewBannerPartial from '../../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

:::info
This reference document provides an overview of Ethereum beacon chain RPC providers for Arbitrum validators to use for accessing blob data. The list curated here is **not comprehensive and in no way does Offchain Labs endorse or benefit from the use of any of these providers.**
:::

Following [Ethereum's Dencun upgrade in March 2024](https://eips.ethereum.org/EIPS/eip-7569), Layer 2 blockchains like Arbitrum will be able to roll up and post batches of transaction data on Ethereum in the form of a new transaction format called a blob. This blob data will be part of the beacon chain and is fully downloadable by all consensus nodes. This means that data stored in blobs are inaccessible by the EVM, unlike calldata.

### What does this mean for validators?
Validators for Arbitrum chains settling to L1 Ethereum (i.e. Arbitrum One, Arbitrum Nova, and L2 Orbit chains) will require access to blob data to produce and confirm L2 state assertions (read more about how this works on our [Deep dive: Inside Arbitrum" page](../../inside-arbitrum-nitro/inside-arbitrum-nitro.mdx)). 

urthermore, new validators joining a network or validators who come online following an extended period of offline time will require access to historical blob data to sync up to the latest state of Arbitrum. Offchain Labs has plans to reduce a Nitro validator's reliance on historical blob data and will share updates on this effort in the future.

To run a validator for an L2 Arbitrum chain (i.e. Arbitrum One, Arbitrum Nova, and L2 Orbit chains), you will need access to blob data. Blob data on Ethereum is stored on the beacon chain and is inaccessible to the EVM, hence why dedicated RPC endpoints for the beacon chain will be required after the Dencun upgrade.

### List of Ethereum beacon chain RPC providers
| Provider                                                                             | Beacon chain APIs? | Historical blob data? |
| ------------------------------------------------------------------------------------ | ------------------ | --------------------- |
| [Chainbase](https://chainbase.com/)                                                  | ✅                 |                       |
| [Conduit](https://conduit.xyz/)*                                                     | ✅                 | ✅                    |
| [Lava Network](https://docs.lavanet.xyz/gateway-access)                              | ✅                 | ✅                    |
| [Nirvana Labs](https://nirvanalabs.io)                                               | ✅                 | ✅                    |
| [Quicknode](https://www.quicknode.com/docs/ethereum)                                 | ✅                 | ✅                    |

Please reach out if you need assistance with setting any of the above providers.
***Case-by-case basis**