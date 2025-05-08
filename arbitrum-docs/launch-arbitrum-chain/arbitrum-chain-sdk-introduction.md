---
title: 'Deploy a production chain: an overview'
description: 'Learn how to deploy and manage your Arbitrum chain with the Arbitrum chain SDK.'
author: GreatSoshiant, jose-franco
sme: GreatSoshiant, jose-franco
user_story: As a current or prospective Arbitrum chain owner, I need to onboard into the Arbitrum chain SDK by understanding the available onboarding paths, and how to select the path that meets my needs.
content_type: overview
---

:::info RaaS providers

It is highly recommended to work with a Rollup-as-a-Service (RaaS) provider if you intend to deploy a production chain. You can find a list of RaaS providers [here](/launch-arbitrum-chain/06-third-party-integrations/02-third-party-providers.md#rollup-as-a-service-raas-providers).

:::

Deploying new Arbitrum chains is done through a [RollupCreator](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/07-canonical-factory-contracts.mdx) contract that processes the creation of the needed contracts and sends the initialization messages from the parent chain to the newly created Arbitrum chain. To assist with these operations, the Arbitrum chain SDK contains a series of tools and scripts that help create and manage your chain(s). Its capabilities include:

- Configuration and deployment of your Arbitrum chain's core contracts
- Configuration and deployment of the chain's TokenBridge contracts
- Initialization of your chain and management of its configuration post-deployment

This overview describes the process for creating a new Arbitrum chain, with each step linking to the appropriate guide to follow. You'll find guides to use the Arbitrum chain SDK for deploying a new chain, configuring your node, initializing your chain's configuration, and creating a token bridge.

:::info The Arbitrum chain SDK

It is recommended to use the Arbitrum chain SDK when deploying new chains and performing chain owner actions.

:::

## 1. Select a chain type

There are three types of Arbitrum chains. Review the following table to determine which type best fits your needs:

| Chain type           | Description                                                                                                                                                                                                                                                                                                       | Use case                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Rollup**           | Offers Ethereum-grade security by batching, compressing, and posting data to the parent chain, similarly to <a data-quicklook-from='arbitrum-one'>Arbitrum One</a>.                                                                                                                                               | Ideal for applications that require high security guarantees.                         |
| **AnyTrust**         | Implements the <a data-quicklook-from='arbitrum-anytrust-protocol'>AnyTrust protocol</a>, relying on an external <a data-quicklook-from='data-availability-committee-dac'>Data Availability Committee (DAC)</a> to store data and provide it on-demand, effectively using it as its Data Availability (DA) layer. | Suitable for applications that require lower transaction fees.                        |
| **Custom gas token** | An AnyTrust Arbitrum chain with the ability to specify a custom `ERC-20` gas token.                                                                                                                                                                                                                               | Ideal for applications that require custom gas fee tokens and lower transaction fees. |

## 2. Deploy your chain

After selecting a chain type, you can follow the corresponding guide to deploy your chain:

- [Deploy a Rollup Arbitrum chain](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/02-deploying-rollup-chain.md)
- [Deploy an AnyTrust Arbitrum chain](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/03-deploying-anytrust-chain.md)
- [Deploy a custom gas token Arbitrum chain](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/04-deploying-custom-gas-token-chain.md)

## 3. Configure your Arbitrum chain's node

Once the chain is deployed, you'll need to craft the configuration to run its node. To learn how, visit [Configure your Arbitrum chain's node](/launch-arbitrum-chain/how-tos/arbitrum-chain-sdk-preparing-node-config.md).

## 4. Deploy your Arbitrum chain's token bridge

Your Arbitrum chain's token bridge contracts allow `ERC-20` tokens to move between your Arbitrum chain and its underlying parent chain. Read [Deploy your Arbitrum chain's token bridge](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/05-deploying-token-bridge.md) to learn how to set up your bridge.

## 5. Configure your Arbitrum chain

Lastly, your chain has multiple parameters that you might want to configure. [Configure your Arbitrum chain](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/01-configuring-arbitrum-chain.md) walks you through each of these parameters.
