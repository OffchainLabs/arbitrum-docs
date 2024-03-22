---
title: 'Introduction to the Arbitrum Orbit SDK'
sidebar_label: 'Orbit SDK: Introduction'
description: 'introduction to the Arbitrum Orbit SDK'
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 0
---

import PublicPreviewBannerPartial from '../partials/_orbit-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />


The Arbitrum Orbit SDK is a comprehensive toolkit designed for intermediate blockchain developers interested in building on the Arbitrum Orbit platform. This SDK facilitates the creation and management of your own Orbit chain using the advanced capabilities of Viem, a modern alternative to traditional Ethereum libraries like _ethers.js_ and _web3.js_.

## Arbitrum Orbit Chains

With the Arbitrum Orbit SDK, you have the flexibility to spin up your <a data-quicklook-from="arbitrum-orbit">Orbit</a> chain as a <a data-quicklook-from="layer-3-l3">Layer 3 (L3)</a> chain settling transactions with any <a data-quicklook-from="layer-2-l2">Layer 2 (L2)</a> chains, or as a Layer 2 (L2) chain directly settling on <a data-quicklook-from="layer-1-l1">Layer 1 (L1)</a> chains. This adaptability opens up a realm of possibilities for application development and blockchain use cases.

### Enhanced Development Experience

The SDK is developed using _TypeScript_, providing a solid foundation for your development efforts. At the core of our SDK is _Viem_, which elevates the development experience by offering a streamlined, efficient, and modular approach to interacting with Ethereum's blockchain and smart contracts. Whether you're a seasoned developer familiar with _ethers.js_ or new to blockchain development, _Viem_ and the Arbitrum Orbit SDK offer a smooth transition and easy comparison to understand the benefits and similarities between the platforms, especially with resources like [Viem's ethers.js migration guide](https://viem.sh/docs/ethers-migration.html).

### Capabilities of the SDK:

- **Configuration and Deployment**: Simplifies the process of configuring and deploying the core contracts needed for an Orbit chain.
- **Initialization and Management**: After deployment, the SDK helps you initialize your chain and adjust configuration parameters as necessary.
- **Ongoing Support and Updates**: Future releases will bring new features, such as tools for creating custom dashboards and monitoring systems for your Orbit chain. Feel free to return to this page regularly for updates and new features!
 

Below, you will find detailed information about the steps for setting up an Orbit chain and how to use the Orbit SDK throughout the process:

### 1. Orbit Chain Deployment

A primary function of the Orbit SDK is the deployment of a new Orbit chain. The initial step in setting up an Orbit chain involves determining the type that best fits your needs. We offer four distinct types of Orbit chains:

1. **Rollup Orbit Chains**: These are the most straightforward Orbit chains. In this type, transaction data is batched, compressed, and posted to the parent chain, akin to the <a data-quicklook-from="arbitrum-one">Arbitrum One</a> chain as a rollup chain. You can read more on the [orbit rollup deployment page](/launch-orbit-chain/orbit-sdk/how-tos/deploying-rollup-chain-with-sdk.md).

2. **Anytrust Orbit Chains**: Anytrust Orbit chains share a similar logic with rollup chains but with a key difference: batches are not posted directly to the parent chain. Instead, they are stored by a <a data-quicklook-from="data-availability-committee-dac">Data Availability Committee (DAC)</a> to reduce transaction fees. The main differences between an Anytrust chain and a rollup chain are:
   
   - **Data Availability**: Anytrust chains utilize a unique approach, with members of a Data Availability Committee responsible for keeping transaction data, whereas rollup chains send the data back to the parent chain.

   - **Security Guarantees**: Anytrust chains offer different security levels that might be more suited for specific applications, like gaming and social media.

   - **Fee Cost**: Anytrust chains are significantly cheaper than Rollup chains because there's no need to send data to the parent chain, facilitating cheaper transaction fees.
   
###### Learn more about [ Anytrust consensus mechanism ]( /inside-arbitrum-nitro/#inside-anytrust )

###### Jump right into the [ Anytrust Orbit chain deployment guide ](/launch-orbit-chain/orbit-sdk/how-tos/deploying-anytrust-chain-with-sdk.md)

3. **Custom Gas Token Orbit Chains**: This type allows transaction fees to be paid with a specific `ERC-20` token instead of `ETH`. Although the setup process is similar to a standard Rollup Orbit chain, there are important distinctions to consider. Feel free to consult the [Custom Gas Token Orbit chain deployment guide](/launch-orbit-chain/orbit-sdk/how-tos/deploying-custom-gas-token-chain-with-sdk.md). 

:::important

Custom Gas Token Orbit chains can only be Anytrust chains; a Rollup Orbit chain cannot use a custom gas fee token.

:::

4. **Orbit Chains with Outsourced DA Layers**: These chains leverage third-party Data Availability (DA) layers to transmit transaction data instead of posting it directly to the parent chain (as in rollup chains) or storing it on a DAC (as in Anytrust chains). Solutions like Celestia can support Orbit chains for this purpose.

### 2. Node Configuration Preparation

Once the chain has been deployed, it needs to be initialized. This step requires creating a configuration `JSON` file based on your chain deployment setup. The [preparation guide](/launch-orbit-chain/orbit-sdk/how-tos/preparing-node-config-with-sdk.md) will help you use the Orbit SDK to generate a node configuration.

### 3. Token Bridge Deployment

To enable `ERC-20` tokens in and out of your orbit chain, you will need to deploy a bridge instance, which consists of a set of contracts.
To do this, follow the steps outlined in the [token bridge contract deployment guide](/launch-orbit-chain/orbit-sdk/how-tos/deploying-token-bridge-with-sdk.md).

You can also learn more about our bridge design in the [`ERC-20` token bridge orverview](/build-decentralized-apps/token-bridging/07-token-bridge-erc20.md) 

### 4. Orbit Chain Configuration

After deploying the chain, initializing it, and deploying the token bridge, the chain owner must configure their Orbit chain based on the desired setup. 
Read more on [how to configure your Orbit chain](/launch-orbit-chain/orbit-sdk/how-tos/configuring-orbit-chain-with-sdk.md).
   
