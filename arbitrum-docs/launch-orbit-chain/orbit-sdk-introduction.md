---
title: 'Deploy a production chain: an overview'
description: 'Learn how to deploy and manage your Orbit chain with the Arbitrum Orbit SDK.'
author: GreatSoshiant, jose-franco
sme: GreatSoshiant, jose-franco
user_story: As a current or prospective Orbit chain owner, I need to onboard into the Orbit SDK by understanding the available onboarding paths, and how to select the path that meets my needs.
content_type: overview
---

:::info RaaS providers

It is highly recommended to work with a Rollup-as-a-Service (RaaS) provider if you intend to deploy a production chain. You can find a list of RaaS providers [here](/launch-orbit-chain/06-third-party-integrations/02-third-party-providers.md#rollup-as-a-service-raas-providers).

:::

Deploying new Orbit chains is done through a [RollupCreator](/launch-orbit-chain/03-deploy-an-orbit-chain/07-canonical-factory-contracts.mdx) contract that processes the creation of the needed contracts and sends the initialization messages from the parent chain to the newly created Orbit chain. To assist with these operations, the Orbit SDK contains a series of tools and scripts that help create and manage your chain(s). Its capabilities include:

- Configuration and deployment of your Orbit chain's core contracts
- Configuration and deployment of the chain's TokenBridge contracts
- Initialization of your chain and management of its configuration post-deployment

This overview describes the process for creating a new Orbit chain, with each step linking to the appropriate guide to follow. You'll find guides to use the Orbit SDK for deploying a new chain, configuring your node, initializing your chain's configuration, and creating a token bridge.

:::info The Orbit SDK

It is recommended to use the Orbit SDK when deploying new chains and performing chain owner actions.

:::

## 1. Select a chain type

There are three types of Orbit chains. Review the following table to determine which type best fits your needs:

| Chain type           | Description                                                                                                                                                                                                                                                                                               | Use case                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Rollup**           | Offers Ethereum-grade security by batching, compressing, and posting data to the parent chain, similarly to <a data-quicklook-from='arbitrum-one'>Arbitrum One</a>.                                                                                                                                       | Ideal for applications that require high security guarantees.                         |
| **AnyTrust**         | Implements the <a data-quicklook-from='arbitrum-anytrust-protocol'>AnyTrust protocol</a>, relying on an external <a data-quicklook-from='data-availability-committee-dac'>Data Availability Committee (DAC)</a> to store data and provide it on-demand instead of using the Data Availability (DA) layer. | Suitable for applications that require lower transaction fees.                        |
| **Custom gas token** | An AnyTrust Orbit chain with the ability to specify a custom `ERC-20` gas token.                                                                                                                                                                                                                          | Ideal for applications that require custom gas fee tokens and lower transaction fees. |

## 2. Deploy your chain

After selecting a chain type, you can follow the corresponding guide to deploy your chain:

- [Deploy a Rollup Orbit chain](/launch-orbit-chain/03-deploy-an-orbit-chain/02-deploying-rollup-chain.md)
- [Deploy an AnyTrust Orbit chain](/launch-orbit-chain/03-deploy-an-orbit-chain/03-deploying-anytrust-chain.md)
- [Deploy a custom gas token Orbit chain](/launch-orbit-chain/03-deploy-an-orbit-chain/04-deploying-custom-gas-token-chain.md)

## 3. Configure your Orbit chain's node

Once the chain is deployed, you'll need to craft the configuration to run its node. To learn how, visit [Configure your Orbit chain's node](/launch-orbit-chain/how-tos/orbit-sdk-preparing-node-config.md).

## 4. Deploy your Orbit chain's token bridge

Your Orbit chain's token bridge contracts allow `ERC-20` tokens to move between your Orbit chain and its underlying parent chain. Read [Deploy your Orbit chain's token bridge](/launch-orbit-chain/03-deploy-an-orbit-chain/05-deploying-token-bridge.md) to learn how to set up your bridge.

## 5. Configure your Orbit chain

Lastly, your chain has multiple parameters that you might want to configure. [Configure your Orbit chain](/launch-orbit-chain/03-deploy-an-orbit-chain/01-configuring-orbit-chain.md) walks you through each of these parameters.
