---
title: 'Arbitrum Orbit SDK'
sidebar_label: 'Orbit SDK'
description: 'Arbitrum SDK '
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 1
---
# Orbit SDK

In this section, we delve into the technical framework of our SDK, which is developed using TypeScript. A central element of our SDK is the inclusion of "Viem," an alternative to popular Ethereum libraries like ethers.js and web3.js. Viem brings a streamlined and efficient approach to Ethereum development, enhancing our SDK with modular and user-friendly features for interacting with Ethereum's blockchain and smart contracts. For developers already experienced with ethers.js, Viem offers a smooth transition. You can easily compare and understand the differences and similarities between ethers.js and Viem by referring to the official Viem documentation, particularly the ethers.js migration guide available at [Viem's ethers.js migration guide](https://viem.sh/docs/ethers-migration.html). This integration underscores our commitment to providing a versatile and efficient development environment in our SDK.

The Arbitrum Orbit SDK is your gateway to harnessing the full potential of this technology. It empowers developers with the tools and resources needed to configure, deploy, and manage an Orbit chain effectively.

#### Capabilities of the SDK:
- **Configuration and Deployment**: The SDK simplifies the process of configuring and deploying the core contracts required for an Orbit chain.
- **Initialization and Management**: Post-deployment, the SDK aids in initializing your chain and enables you to modify configuration parameters as needed.
- **Ongoing Support and Updates**: Future releases of the SDK will introduce exciting new features, including tools to create custom dashboards and monitoring systems for your Orbit chain.

As you start using the Arbitrum Orbit SDK, you're getting much more than just a set of tools. You're entering a world full of opportunities to create your own special blockchain projects that perfectly fit what you need. Keep an eye out for more great updates and new features as we keep making the Arbitrum Orbit SDK even better.

### Orbit Core Contracts Deployment
The primary and most crucial function of our Orbit SDK is to streamline the deployment of core contracts essential for Orbit chains. Each Orbit chain requires a set of fundamental contracts to be deployed on its parent chain. This set includes Bridge contracts, Rollup contracts, and contracts designed to handle fraud proofs. These smart contracts are the backbone of the Arbitrum Nitro stack, ensuring its robust and efficient operation. You can explore these contracts in detail in the GitHub repository: [OffchainLabs/nitro-contracts](https://github.com/OffchainLabs/nitro-contracts). Beyond the deployment stage, the Orbit SDK also takes charge of the necessary initializations and configurations. This means that after the core contracts are successfully deployed, the SDK facilitates their setup and fine-tuning, ensuring that your Orbit chain is not only up and running but also optimized for performance and functionality. This comprehensive approach by the Orbit SDK makes the process of launching and managing an Orbit chain more accessible and efficient.






