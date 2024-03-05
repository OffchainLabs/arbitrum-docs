---
title: 'Arbitrum Orbit SDK'
sidebar_label: 'Introduction'
description: 'Arbitrum SDK '
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 0
---

# Welcome to the Arbitrum Orbit SDK

Dive into the forefront of decentralized blockchain development with the Arbitrum Orbit SDK, a comprehensive toolkit designed for developers eager to explore the innovative Arbitrum Orbit platform. This SDK facilitates the creation and management of your own Orbit chain using the advanced capabilities of Viem, a modern alternative to traditional Ethereum libraries like ethers.js and web3.js.

## Embracing Flexibility and Power with Arbitrum Orbit

With the Arbitrum Orbit SDK, you have the flexibility to establish your Orbit chain as a Layer 3 (L3) chain settling transactions with any Layer 2 (L2) chains, or as a Layer 2 (L2) chain directly settling on Layer 1 (L1) chains. This adaptability opens up a realm of possibilities for application development and blockchain use cases.

### Enhanced Development Experience

The SDK is developed using TypeScript, providing a strong foundation for your development efforts. At the core of our SDK is Viem, which elevates the development experience by offering a streamlined, efficient, and modular approach to interacting with Ethereum's blockchain and smart contracts. Whether you're a seasoned developer familiar with ethers.js or new to blockchain development, Viem and the Arbitrum Orbit SDK offer a smooth transition and easy comparison to understand the benefits and similarities between the platforms, especially with resources like [Viem's ethers.js migration guide](https://viem.sh/docs/ethers-migration.html).

### Capabilities of the SDK:
- **Configuration and Deployment**: Simplify the process of configuring and deploying the core contracts needed for an Orbit chain.
- **Initialization and Management**: After deployment, utilize the SDK to initialize your chain and adjust configuration parameters as necessary.
- **Ongoing Support and Updates**: Look forward to future releases that will bring new features, such as tools for creating custom dashboards and monitoring systems for your Orbit chain.

By choosing the Arbitrum Orbit SDK, you're not just accessing a set of development tools; you're unlocking a universe of opportunities to create bespoke blockchain projects tailored to your needs. Stay tuned for more exciting updates and features as we continue to enhance the Arbitrum Orbit SDK, making it an even more powerful resource for developers.

Below, you will find detailed information about the steps for setting up an Orbit chain and how to utilize the Orbit SDK throughout the process:

### 1. Orbit Chain Deployment

A primary function of the Orbit SDK is the deployment of a new Orbit chain. The initial step in setting up an Orbit chain involves determining the type that best fits your needs. We offer four distinct types of Orbit chains:

1. **Rollup Orbit Chains**: These are the most straightforward Orbit chains. In this type, transaction data is batched, compressed, and posted to the parent chain, akin to the Arbitrum One chain as a rollup chain. Detailed steps for deploying a rollup chain can be found [here](deployment-rollup.md).

2. **Anytrust Orbit Chains**: Anytrust Orbit chains share a similar logic with rollup chains but with a key difference: batches are not posted directly to the parent chain. Instead, they are stored by a Data Availability Committee (DAC) to reduce transaction fees. The main differences between an Anytrust chain and a rollup chain are:
   
   - **Data Availability**: Anytrust chains utilize a unique approach, with members of a Data Availability Committee responsible for keeping transaction data, whereas rollup chains send the data back to the parent chain.

   - **Security Guarantees**: Anytrust chains offer different security levels that might be more suited for specific applications, like gaming and social media.

   - **Fee Cost**: Anytrust chains are significantly cheaper than Rollup chains because there's no need to send data to the parent chain, facilitating cheaper transaction fees for applications.
   
   Steps for deploying an Anytrust chain are available [here](deployment-anytrust.md).

3. **Custom Gas Token Orbit Chains**: This type allows transaction fees to be paid with a specific ERC20 token instead of ETH. Although the setup process is similar to that of a standard Rollup Orbit chain, there are important distinctions to consider. Details for setting up a Custom Gas Token Orbit chain can be found [here](deployment-custom-gas-token.md). 
**Important Note**: Custom Gas Token Orbit chains can only be Anytrust chains; a Rollup Orbit chain cannot use a custom gas fee token.

4. **Orbit Chains with Outsourced DA Layers**: These chains leverage third-party Data Availability (DA) layers for transmitting transaction data, instead of posting them directly to the parent chain (as in rollup chains) or storing them on a DAC (as in Anytrust chains). Solutions like Celestia can be used to support Orbit chains for this purpose.

### 2. Node Configuration Preparation

Following the deployment phase, the next step involves initializing the chain. This requires creating a configuration JSON file based on your chain deployment setup. We explain how to generate a node config for your chain using the Orbit SDK on [this page](node-config-preparation.md).

### 3. Token Bridge Deployment

To facilitate the bridging of ERC-20 tokens in and out of Arbitrum chains, we utilize a set of contracts designed for this purpose. Detailed information about token bridging is available in our [docs](../../for-devs/concepts/token-bridge/token-bridge-erc20.mdx). The first step to enable token bridging on an Orbit chain is the deployment of token bridge contracts, as explained [here](token-bridge-deployment.md).

### 4. Orbit Chain Configuration

After deploying the chain, initializing it, and deploying the token bridge, the chain owner must configure their Orbit chain based on the desired setup. We detail how you can configure your Orbit chain on [this page](orbit-chain-configuration.md).
