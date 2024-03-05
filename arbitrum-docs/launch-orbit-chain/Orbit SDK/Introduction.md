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

### 1. Orbit Chain Deployment
The main functionality of Orbit SDK would be deployment of a new Orbit chain. The first step to setup an Orbit chain would be deciding which kind of Orbit fits your needs. We generally have four different types of Orbit chains:
1. **Rollup Orbit chains**: This is the most straight kind of Orbit chains. In these types of orbit chains, the transaction data would be batched and compressed and posted to the parent chain. These chains would be similar to Arbitrum One chain as a rollup chain. You can find steps of a rollup chain deployment on [this](deployment-rollup.md) page.
2. **Anytrust Orbit chains**: In Anytrust Orbit chains, the logic would be the same as a rollup but batches would not be posted to the parent chain directly. It would be stored in a Data Availability Committee (DAC) to reduce the fees need to be paid for transactions. The main differences between an Anytrust chain and a rollup chain is:
   
   1. **Data Availability**: The approach to data availability in Anytrust chains is distinct. On Anytrust members of a Data Availability Committee is responsible to keep the data of transactions but in Rollup chains, the data would be sent back the parent chain.

   2. **Security Guarantees**: Anytrust chains provide a different level of security guarantees, which might be more suitable for certain types of applications, such as gaming and social media.
   
   3. **Fee Cost**: Anytrust chain is way more cheaper than Rollups because on Anytrust there's no need to send the data to the parent chain. This will open up opportunities for chains to host applications that need cheaper fees.
   
   You can find steps of a rollup chain deployment on [this](deployment-anytrust.md) page.

3. **Custom gas token Orbit chains**: Deploying a Custom Gas Token Orbit chain introduces a unique aspect to the standard Orbit chain setup – the ability to pay transaction fees using a specific ERC20 token instead of ETH. While the setup process largely mirrors that of a standard Rollup Orbit chain (as detailed on [this](deployment-rollup.md) page), there are key differences to account for when configuring a Custom Gas Token Orbit chain. You can find the details for setup Custpm gas token orbit chain [here](deployment-custom-gas-token.md)
**Important Note** Custom gas token Orbit chains can be just Anytrust chains and you cannot have a Rollup Orbit with custom gas fee token.
4. **Orbit chains with outsourced DA layers**: The other type of Orbit chains would be advantaging 3rd party Data Availability (DA) layers to send the transaction data instead of posting them to parent chain (rollup chains) or keeping them on a DAC Committee (Anytrust chains). There are some solutions that you can use and support Orbit chains for this purpose such as Celestia.

### 2. Node Configuration Preparation
After the deployment phase, the next step would be initializing the chain. To initialize the chain, you need to create a config JSON file based on your chain deployment setup. In this [page](node-config-preparation.md) we explained how to generate node config for your chain using Orbit SDK.

### 3. Token Bridge Deployment
To bridge ERC-20 tokens in and out of Arbitrum chains, we have a set of contracts to handle this bridging. More information about Token Bridging can be found on our [docs](../../for-devs/concepts/token-bridge/token-bridge-erc20.mdx).
So to enable token bridging on an Orbit chain the fist step would be deployment of token bridge contracts which is explained on this [page](token-bridge-deployment.md).
### 4. Orbit Chain Configuration
After chain deployment, initializing the chain and token bridge deploytment the chain owner needs to configure their Orbit chain based on the desired setup. On this [page](orbit-chain-configuration.md) we explained how you can configure your orbit chain.