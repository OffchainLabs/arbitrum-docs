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

To streamline the deployment process and make it more efficient, we've developed a key smart contract known as the [RollupCreator contract](https://github.com/OffchainLabs/nitro-contracts/blob/main/src/rollup/RollupCreator.sol). This contract plays a vital role in setting up Orbit chains and has two primary functions:

1. **setTemplates:** This function is essential for maintaining the latest versions of each core contract, such as the Bridge contract. By using [setTemplates](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/rollup/RollupCreator.sol#L63C14-L63C26), we can specify which versions of these contracts should be used in the deployment process. It ensures that every new Orbit chain is set up with the most up-to-date and efficient contracts available.

2. **createRollup:** The [createRollup](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/rollup/RollupCreator.sol#L107) function is critical for actually deploying a new set of core contracts for a desired Orbit chain. It utilizes the templates set by the **setTemplates** function and initializes them based on the provided configurations. This function requires specific inputs from the chain deployer, which are crucial for customizing the deployment to meet the unique needs of each Orbit chain.

These functionalities within the RollupCreator contract significantly simplify the deployment process, providing a smoother and more user-friendly experience for chain deployers. We will delve into the specifics of the inputs and configurations required for the createRollup function and how to use Orbit-SDK for chain deployment in the following sections.

### Chain Configuration

The `createRollup` function in the [RollupCreator contract](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/rollup/RollupCreator.sol#L107) is a crucial component for deploying Orbit chains. It takes a complex input named `deployParams`, structured to encapsulate various configurable parameters essential for customizing the Orbit chain. Let's break down the structure of these parameters:

1. **RollupDeploymentParams Structure:**
   ```bash
   struct RollupDeploymentParams {
       Config config;
       address batchPoster;
       address[] validators;
       uint256 maxDataSize;
       address nativeToken;
       bool deployFactoriesToL2;
       uint256 maxFeePerGasForRetryables;
   }
   ```
   This structure includes key settings like the chain configuration (`Config`), validator addresses, maximum data size, the native token of the chain, and more.

2. **Config Structure:**
   ```bash
   struct Config {
       uint64 confirmPeriodBlocks;
       uint64 extraChallengeTimeBlocks;
       address stakeToken;
       uint256 baseStake;
       bytes32 wasmModuleRoot;
       address owner;
       address loserStakeEscrow;
       uint256 chainId;
       string chainConfig;
       uint64 genesisBlockNum;
       ISequencerInbox.MaxTimeVariation sequencerInboxMaxTimeVariation;
   }
   ```
   The `Config` structure defines the core settings of the chain, including block confirmation periods, stake parameters, and the chain ID.

3. **MaxTimeVariation Structure:**
   ```bash
   struct MaxTimeVariation {
       uint256 delayBlocks;
       uint256 futureBlocks;
       uint256 delaySeconds;
       uint256 futureSeconds;
   }
   ```
   This nested structure within `Config` specifies time variations related to block sequencing, providing control over block delay and future block settings.

All these parameters are customizable, allowing the chain deployer to either stick with default settings or specify new values. In the upcoming sections, we will dive deeper into what each of these parameters represents and how you can utilize the Orbit SDK to configure them effectively for your Orbit chain deployment.

### Chain Configuration Parameters
In this section, we'll provide detailed explanations of the various chain configuration parameters used in the deployment of Orbit chains. Understanding these parameters is key to customizing your Orbit chain to suit your specific needs.

1. **batchPoster**: This parameter sets the batch poster address for your Orbit chain. The batch poster account plays a crucial role in batching and compressing transactions on the Orbit chain and transmitting them back to the parent chain.

2. **validators**: This parameter is an array of validator addresses. Validators are responsible for validating the chain state and posting Rollup Blocks (RBlocks) back to the parent chain. They also monitor the chain and initiate challenges against potentially faulty RBlocks submitted by other validators.

3. **nativeToken**: This parameter determines the token used for paying gas fees on the Orbit chain. It can be set to ETH for regular chains, or to any ERC20 token for **gas fee token network** Orbit chains.

4. **confirmPeriodBlocks**: This parameter sets the challenge period in terms of blocks, which is the time allowed for validators to dispute or challenge state assertions. On Arbitrum One and Arbitrum Nova, this is currently set to approximately 7 days in block count.

5. **stakeToken and baseStake**: Every Orbit chain requires at least one validator node. To post state assertions on the base chain, validators must stake a certain amount as an incentive for honest participation. The base stake parameter specifies the quantity of stake token (either ETH or an ERC-20 token) required for validators to post state assertions of your Orbit chain on the base chain's rollup contracts.

6. **owner**: This is the account address responsible for deploying, owning, and managing your Orbit chain's base contracts on its parent chain.

7. **chainId**: This parameter sets the unique chain ID for your Orbit chain.

While other configurable parameters exist, they are set to defaults, and it's generally not anticipated that a chain deployer would need to modify them. However, if you believe there's a need to alter any other parameters not listed here, please feel free to contact us for further details and support.