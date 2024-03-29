---
title: 'Get started with the Arbitrum Orbit SDK'
sidebar_label: 'Get started'
description: 'Learn how to deploy and manage your Orbit chain with the Arbitrum Orbit SDK.'
author: GreatSoshiant
sme: GreatSoshiant
user_story: As a current or prospective Orbit chain owner, I need to onboard into the Orbit SDK by understanding the available onboarding paths, and how to select the path that meets my needs.
content_type: get-started
---

import PublicPreviewBannerPartial from './partials/_orbit-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

The Arbitrum Orbit SDK lets you programmatically create and manage your own Orbit chain(s). Its capabilities include:

- Configuration and deployment of your Orbit chain's core contracts
- Initialization of your chain and management of its configuration post-deployment


## 1. Select a chain type

There are three types of Orbit chains. Review the following table to determine which type best fits your needs:

| Chain Type           | Description                                                                                                                                                                                                                                                                                                                               | Use Case                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Rollup**           | Offers Ethereum-grade security by batching, compressing, and posting data to the parent chain, similarly to [Arbitrum One](https://arbitrum.io/).                                                                                                                                                                                         | Ideal for applications that require high security guarantees.                         |
| **AnyTrust**         | Implements the [AnyTrust protocol](/inside-arbitrum-nitro/#inside-anytrust), relying on an external [Data Availability Committee (DAC)](/intro/glossary#data-availability-committee-dac) to store data and provide it on-demand instead of using their [parent chain](/intro/glossary/#parent-chain) as the Data Availability (DA) layer. | Suitable for applications that require lower transaction fees.                        |
| **Custom gas token** | An AnyTrust Orbit chain with the ability to specify a custom `ERC-20` gas token.                                                                                                                                                                                                                                                          | Ideal for applications that require custom gas fee tokens and lower transaction fees. |


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

- Learn more about the [AnyTrust consensus mechanism](/inside-arbitrum-nitro/inside-arbitrum-nitro.mdx#inside-anytrust)
- Learn more about the [`ERC-20` token bridge architecture](/build-decentralized-apps/token-bridging/03-token-bridge-erc20.md) 



<!-- ORIGINAL COPY BELOW

The Arbitrum Orbit SDK is a comprehensive toolkit designed for intermediate blockchain developers interested in building on the Arbitrum Orbit platform. It helps create and manage your own Orbit chain thanks to its integration with [Viem](https://viem.sh), a modern alternative to traditional Ethereum libraries like _ethers.js_ and _web3.js_.

### Capabilities of the SDK:

- **Configuration and Deployment**: Simplifies configuring and deploying Orbit chain's core contracts.
- **Initialization and Management**: The SDK helps you initialize your chain and adjust configuration parameters after deployment.
- **Ongoing Support and Updates**: Future releases will bring new features, such as tools for creating custom dashboards and monitoring systems for your Orbit chain. Feel free to return to this page regularly for updates.


Here are the recommended steps to create an Orbit chain with the Orbit SDK:
### 1. Orbit Chain Deployment

Deployment of a new Orbit chain is a primary function of the Orbit SDK. The initial step in setting up an Orbit chain involves determining the type that best fits your needs. We offer three distinct types of Orbit chains:

1. **Rollup Orbit Chains** offer Ethereum-grade security by batching, compressing, and posting data to the parent chain, similarly to <a data-quicklook-from="arbitrum-one">Arbitrum One</a> with Ethereum mainnet. You can learn how to deploy an Orbit Rollup chain on the [orbit Rollup deployment page](/launch-orbit-chain/how-tos/orbit-sdk-deploying-rollup-chain.md).

2. **AnyTrust Orbit Chains** are implementations of the <a data-quicklook-from="arbitrum-anytrust-protocol">AnyTrust protocol</a>, they rely on an external <a data-quicklook-from="data-availability-committee-dac">Data Availability Committee (DAC)</a> to store data and provide it on-demand instead of using their <a data-quicklook-from="parent-chain">parent chain</a> as the Data Availability (DA) layer. That mild trust assumption reduces transaction fees. 

   The main differences between AnyTrust and Rollup chains are:
   
   - **Data Availability**: AnyTrust chains utilize a unique approach, with members of a Data Availability Committee responsible for keeping transaction data, whereas Rollup chains send the data back to the parent chain.

   - **Security Guarantees**: AnyTrust chains offer different security levels that might be more suited for specific applications, like gaming and social media.

   - **Fee Cost**: AnyTrust chains are significantly cheaper than Rollup chains because there's no need to send data to the parent chain, facilitating cheaper transaction fees.
   
###### 

3. **[Custom Gas Token Orbit Chains](/launch-orbit-chain/how-tos/orbit-sdk-deploying-custom-gas-token-chain.md)**: This type allows transaction fees to be paid with a specific `ERC-20` token instead of `ETH`. Although the setup process is similar to a standard Rollup Orbit chain, there are important distinctions to consider. Feel free to consult the [Custom Gas Token Orbit chain deployment guide](/launch-orbit-chain/how-tos/orbit-sdk-deploying-custom-gas-token-chain.md). 

:::important

Custom Gas Token Orbit chains can only be AnyTrust chains; a Rollup Orbit chain currently cannot use a custom gas fee token.

:::

### 2. [Node Configuration Preparation](/launch-orbit-chain/how-tos/orbit-sdk-preparing-node-config.md)

Once the chain has been deployed, you need to start up your node. This step requires creating a configuration `JSON` file based on your chain deployment setup. The [preparation guide](/launch-orbit-chain/how-tos/orbit-sdk-preparing-node-config.md) will help you use the Orbit SDK to generate a node configuration.

### 3. [Token Bridge Deployment](/launch-orbit-chain/how-tos/orbit-sdk-deploying-token-bridge.md)

To enable `ERC-20` tokens in and out of your orbit chain, you will need to deploy a bridge instance, which consists of a set of contracts.
To do this, follow the steps outlined in the [token bridge contract deployment guide](/launch-orbit-chain/how-tos/orbit-sdk-deploying-token-bridge.md).

You can also learn more about our bridge design in the [`ERC-20` token bridge overview](/build-decentralized-apps/token-bridging/03-token-bridge-erc20.md) 

### 4. [Orbit Chain Configuration](/launch-orbit-chain/how-tos/orbit-sdk-configuring-orbit-chain.md)

After deploying the chain, starting your node, and deploying the token bridge, the chain owner must configure their Orbit chain according to the desired setup. 
   

-->


-->
