---
title: 'Deploy a production chain: an overview'
description: 'Learn how to deploy and manage your Arbitrum chain with the Arbitrum chain SDK.'
author: GreatSoshiant, jose-franco
sme: GreatSoshiant, jose-franco
user_story: As a current or prospective Arbitrum chain owner, I need to onboard into the Arbitrum chain SDK by understanding the available onboarding paths, and how to select the path that meets my needs.
content_type: overview
---

import RaaSNotice from './partials/_raas-providers-notice.mdx';

<RaaSNotice />

Deploying new Arbitrum chains is done through a [RollupCreator](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/07-canonical-factory-contracts.mdx) contract that processes the creation of the needed contracts and sends the initialization messages from the parent chain to the newly created Arbitrum chain. To assist with these operations, the Arbitrum chain SDK contains a series of tools and scripts that help create and manage your chain(s). Its capabilities include:

- Configuration and deployment of your Arbitrum chain's core contracts
- Configuration and deployment of the chain's TokenBridge contracts
- Initialization of your chain and management of its configuration post-deployment

This overview describes the process for creating a new Arbitrum chain, with each step linking to the appropriate guide to follow. You'll find guides to use the Arbitrum chain SDK for deploying a new chain, configuring your node, initializing your chain's configuration, and creating a token bridge.

:::info The Arbitrum chain SDK

It is recommended to use the Arbitrum chain SDK when deploying new chains and performing chain owner actions.

:::

## 1. Select a chain type

There are two main types of Arbitrum chains. Review the following table to determine which type best fits your needs:

| Chain type   | Description                                                                                                                                                                                                                                                                                                       | Use case                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Rollup**   | Offers Ethereum-grade security by batching, compressing, and posting data to the parent chain, similarly to <a data-quicklook-from='arbitrum-one'>Arbitrum One</a>.                                                                                                                                               | Ideal for applications that require high security guarantees.  |
| **AnyTrust** | Implements the <a data-quicklook-from='arbitrum-anytrust-protocol'>AnyTrust protocol</a>, relying on an external <a data-quicklook-from='data-availability-committee-dac'>Data Availability Committee (DAC)</a> to store data and provide it on-demand, effectively using it as its Data Availability (DA) layer. | Suitable for applications that require lower transaction fees. |

Additionally, Arbitrum chains can be configured to use ETH or any standard `ERC-20` token as the gas token. To understand the implications of using a custom gas token, see [Configure a custom gas token](/launch-arbitrum-chain/02-configure-your-chain/common-configurations/02-use-a-custom-gas-token-rollup.mdx).

## 2. Deploy your chain

After selecting a chain type, follow [this guide](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/02-deploying-an-arbitrum-chain.md) to deploy your chain using the Arbitrum chain (Orbit) SDK.

## 3. Configure your Arbitrum chain's node

Once the chain is deployed, you'll need to generate the configuration to run its node. To learn how, visit [Configure your Arbitrum chain's node](/launch-arbitrum-chain/how-tos/arbitrum-chain-sdk-preparing-node-config.md).

## 4. Deploy your Arbitrum chain's token bridge

Your Arbitrum chain's token bridge contracts allow `ERC-20` tokens to move between your Arbitrum chain and its underlying parent chain. Read [Deploy your Arbitrum chain's token bridge](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/05-deploying-token-bridge.md) to learn how to set up your bridge.
