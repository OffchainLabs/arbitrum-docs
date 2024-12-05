---
title: 'Get started with the Arbitrum Orbit SDK'
sidebar_label: 'Get started'
description: 'Learn how to deploy and manage your Orbit chain with the Arbitrum Orbit SDK.'
author: GreatSoshiant
sme: GreatSoshiant
user_story: As a current or prospective Orbit chain owner, I need to onboard into the Orbit SDK by understanding the available onboarding paths, and how to select the path that meets my needs.
content_type: get-started
---

The Arbitrum Orbit SDK lets you programmatically create and manage your own Orbit chain(s). Its capabilities include:

- Configuration and deployment of your Orbit chain's core contracts
- Initialization of your chain and management of its configuration post-deployment

## 1. Select a chain type

There are three types of Orbit chains. Review the following table to determine which type best fits your needs:

| Chain Type           | Description                                                                                                                                                                                                                                                                                                                                                     | Use Case                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Rollup**           | Offers Ethereum-grade security by batching, compressing, and posting data to the parent chain, similarly to [Arbitrum One](https://arbitrum.io/).                                                                                                                                                                                                               | Ideal for applications that require high security guarantees.                         |
| **AnyTrust**         | Implements the [AnyTrust protocol](/how-arbitrum-works/inside-arbitrum-nitro.mdx#inside-anytrust), relying on an external [Data Availability Committee (DAC)](/intro/glossary#data-availability-committee-dac) to store data and provide it on-demand instead of using their [parent chain](https://docs.arbitrum.io/intro/glossary#parent-chain) as the Data Availability (DA) layer. | Suitable for applications that require lower transaction fees.                        |
| **Custom gas token** | An AnyTrust Orbit chain with the ability to specify a custom `ERC-20` gas token.                                                                                                                                                                                                                                                                                | Ideal for applications that require custom gas fee tokens and lower transaction fees. |

## 2. Deploy your chain

After selecting a chain type, you need to deploy your Orbit chain. Visit the deployment guide for your selected chain type:

- [Deploy a Rollup Orbit chain](/launch-orbit-chain/how-tos/orbit-sdk-deploying-rollup-chain.md)
- [Deploy an AnyTrust Orbit chain](/launch-orbit-chain/how-tos/orbit-sdk-deploying-anytrust-chain.md)
- [Deploy a Custom Gas Token Orbit chain](/launch-orbit-chain/how-tos/orbit-sdk-deploying-custom-gas-token-chain.md)

## 3. Configure your Orbit chain's node

After selecting a chain type, you need to specify your Orbit chain's node configuration by creating a `JSON` file. Visit [Configure your Orbit chain's node](/launch-orbit-chain/how-tos/orbit-sdk-preparing-node-config.md), then proceed to the next step.

## 4. Deploy your Orbit chain's token bridge

Your Orbit chain's token bridge contracts allow ERC-20 tokens to move between your Orbit chain and its underlying parent chain. See [Deploy your Orbit chain's token bridge](/launch-orbit-chain/how-tos/orbit-sdk-deploying-token-bridge.md), then proceed to the next step.

## 5. Configure your Orbit chain

With your node configuration specified and token bridge deployed, you'll be ready to configure your Orbit chain. Visit [Configure your Orbit chain](/launch-orbit-chain/how-tos/orbit-sdk-configuring-orbit-chain.md) to complete this final step.

## See also

- Learn more about the [AnyTrust consensus mechanism](/how-arbitrum-works/inside-arbitrum-nitro.mdx#inside-anytrust)
- Learn more about the [`ERC-20` token bridge architecture](/build-decentralized-apps/token-bridging/03-token-bridge-erc20.mdx)
