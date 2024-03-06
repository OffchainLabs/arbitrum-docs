---
title: 'Arbitrum Orbit SDK'
sidebar_label: 'Rollup Orbit Deployment'
description: 'Arbitrum SDK '
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 1
---

### Orbit Core Contracts Deployment (Rollup)
The primary and most crucial function of our Orbit SDK is to streamline the deployment of core contracts essential for Orbit chains. Each Orbit chain requires a set of fundamental contracts to be deployed on its parent chain. This set includes Bridge contracts, Rollup contracts, and contracts designed to handle fraud proofs. These smart contracts are the backbone of the Arbitrum Nitro stack, ensuring its robust and efficient operation. You can explore these contracts in detail in the GitHub repository: [OffchainLabs/nitro-contracts](https://github.com/OffchainLabs/nitro-contracts). Beyond the deployment stage, the Orbit SDK also takes charge of the necessary initializations and configurations. This means that after the core contracts are successfully deployed, the SDK facilitates their setup and fine-tuning, ensuring that your Orbit chain is not only up and running but also optimized for performance and functionality. This comprehensive approach by the Orbit SDK makes the process of launching and managing an Orbit chain more accessible and efficient.

To streamline the deployment process and make it more efficient, we've developed a key smart contract known as the [RollupCreator contract](https://github.com/OffchainLabs/nitro-contracts/blob/main/src/rollup/RollupCreator.sol). This contract plays a vital role in setting up Orbit chains and has two primary functions:

1. **setTemplates:** This function is essential for maintaining the latest versions of each core contract, such as the Bridge contract. By using [setTemplates](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/rollup/RollupCreator.sol#L63C14-L63C26), we can specify which versions of these contracts should be used in the deployment process. It ensures that every new Orbit chain is set up with the most up-to-date and efficient contracts available.

2. **createRollup:** The [createRollup](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/rollup/RollupCreator.sol#L107) function is critical for actually deploying a new set of core contracts for a desired Orbit chain. It utilizes the templates set by the **setTemplates** function and initializes them based on the provided configurations. This function requires specific inputs from the chain deployer, which are crucial for customizing the deployment to meet the unique needs of each Orbit chain.

These functionalities within the RollupCreator contract significantly simplify the deployment process, providing a smoother and more user-friendly experience for chain deployer. We will delve into the specifics of the inputs and configurations required for the createRollup function and how to use Orbit-SDK for chain deployment in the following sections.

### Rollup Deployment Parameters Configuration

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
4. **chainConfig:**

    The `chainConfig` parameter within the `Config` structure, is a critical component for customizing the Orbit chain. It's a stringified JSON object containing various configuration options that dictate how the Orbit chain behaves and interacts with the parent chain network. Here's a brief overview of the JSON structure:
   ```bash
   {
     chainId: number;
     homesteadBlock: number;
     daoForkBlock: null;
     daoForkSupport: boolean;
     eip150Block: number;
     eip150Hash: string;
     eip155Block: number;
     eip158Block: number;
     byzantiumBlock: number;
     constantinopleBlock: number;
     petersburgBlock: number;
     istanbulBlock: number;
     muirGlacierBlock: number;
     berlinBlock: number;
     londonBlock: number;
     clique: {
       period: number;
       epoch: number;
     };
     arbitrum: {  
     EnableArbOS: boolean;
     AllowDebugPrecompiles: boolean;
     DataAvailabilityCommittee: boolean;
     InitialArbOSVersion: number;
     InitialChainOwner: Address;
     GenesisBlockNum: number;
     MaxCodeSize: number;
     MaxInitCodeSize: number;
     };
   }
   ```
    Out of these parameters, a few are particularly important and are likely to be configured by the chain owner: **chainId**, **DataAvailabilityCommittee**, **InitialChainOwner**, **MaxCodeSize** and **MaxInitCodeSize**. The other parameters, while part of the chainConfig, typically use default values and are less frequently modified. In the [Chain Config Parameter](#chain-config-parameter)  section, we will delve into each of these important parameters in more detail. Additionally, we'll guide you through using the Orbit SDK to effectively set and customize these configurations, ensuring that your Orbit chain is tailored to your specific requirements and operational needs.

All the parameters explained in this section are customizable, allowing the chain deployer to either stick with default settings or specify new values. In the upcoming sections, we will dive deeper into what each of these parameters represents and how you can utilize the Orbit SDK to configure them effectively for your Orbit chain deployment.

<h3 id="chain-config-parameter">Chain Config Parameter</h3>


In this section, we provide detailed explanations of key configurable parameters within the `chainConfig` for Orbit chain deployment and guide you on how to utilize the Orbit SDK to generate the desired `chainConfig` JSON string. These parameters play a crucial role in defining the characteristics and operational parameters of your Orbit chain. Here are the parameters you need to know about:

1. **chainId**: This is the unique identifier for your Orbit chain. It differentiates your chain from others in the ecosystem.

2. **DataAvailabilityCommittee**: This boolean parameter determines the nature of your Orbit chain. Setting it to `False` indicates a Rollup chain, whereas `True` configures it as an Anytrust chain.

3. **InitialChainOwner**: This address is crucial as it denotes who initially owns and has control over the chain.

4. **MaxCodeSize**: This parameter sets the maximum size for smart contract bytecodes on the Orbit chain. For comparison, the Ethereum mainnet has a limit of 24,576 Bytes.

5. **MaxInitCodeSize**: Similar to `MaxCodeSize`, this parameter defines the maximum size for the **initialization** code on your Orbit chain. The Ethereum mainnet limit is 49,152 Bytes for reference.

To make the configuration process user-friendly, the Orbit SDK includes an API named `prepareChainConfig`. This API allows you to input the above parameters and receive a `chainConfig` JSON string in return. Any parameters not provided will default to standard values, which are detailed in the [Orbit SDK](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/1f251f76a55bc1081f50938b0aa9f7965660ebf7/src/prepareChainConfig.ts#L3-L31).

Here is an example of how to use the `prepareChainConfig` API in the Orbit SDK to set up a chain with a specific `chainId`, an `InitialChainOwner` (denoted as `deployer_address`), and configure it as an Rollup chain:

```bash
import { prepareChainConfig } from '@arbitrum/orbit-sdk';

const chainConfig = prepareChainConfig({
    chainId: Some_Chain_ID,
    arbitrum: { InitialChainOwner: deployer_address, DataAvailabilityCommittee: false },
});
```

This API simplifies the process of configuring your Orbit chain, ensuring that you can tailor it to your specific needs efficiently and effectively.

### Rollup Configuration Parameters
In this section, we'll provide detailed explanations of the various chain configuration parameters used in the deployment of Orbit chains. Understanding these parameters is key to customizing your Orbit chain to suit your specific needs.

1. **batchPoster**: This parameter sets the batch poster address for your Orbit chain. The batch poster account plays a crucial role in batching and compressing transactions on the Orbit chain and transmitting them back to the parent chain.

2. **validators**: This parameter is an array of validator addresses. Validators are responsible for validating the chain state and posting Rollup Blocks (RBlocks) back to the parent chain. They also monitor the chain and initiate challenges against potentially faulty RBlocks submitted by other validators.

3. **nativeToken**: This parameter determines the token used for paying gas fees on the Orbit chain. It can be set to ETH for regular chains, or to any ERC20 token for **gas fee token network** Orbit chains.

4. **confirmPeriodBlocks**: This parameter sets the challenge period in terms of blocks, which is the time allowed for validators to dispute or challenge state assertions. On Arbitrum One and Arbitrum Nova, this is currently set to approximately 7 days in block count.

5. **stakeToken and baseStake**: Every Orbit chain requires at least one validator node. To post state assertions on the base chain, validators must stake a certain amount as an incentive for honest participation. The base stake parameter specifies the quantity of stake token (either ETH or an ERC-20 token) required for validators to post state assertions of your Orbit chain on the base chain's rollup contracts.

6. **owner**: This is the account address responsible for deploying, owning, and managing your Orbit chain's base contracts on its parent chain.

7. **chainId**: This parameter sets the unique chain ID for your Orbit chain 

**Note** that chainId and owner parameters must be equal to the chain ID and InitialOwner defined on chainConfig section.

While other configurable parameters exist, they are set to defaults, and it's generally not anticipated that a chain deployer would need to modify them. However, if you believe there's a need to alter any other parameters not listed here, please feel free to contact us for further details and support.

### Configuration of Rollup Params and Deployment on Orbit SDK

In order to facilitate the configuration and deployment of Rollup parameters for an Orbit chain, the Orbit SDK provides two essential APIs: `createRollupPrepareConfig` and `createRollupPrepareTransactionRequest`. These APIs simplify the process of setting up and deploying the core contracts necessary for an Orbit chain.

1. **createRollupPrepareConfig API**: 
   This API is designed to take parameters as defined in the Config structure and fill in the rest with default values. It outputs a complete Config structure that is ready for use. 
   
   For example, to create a Config structure with a specific chain ID (`chainId`), an owner address (`deployer_address`), and a `chainConfig` as described in the [previous section](#chain-config-parameter), you would use the Orbit SDK as follows:

   ```bash
   import { createRollupPrepareConfig } from '@arbitrum/orbit-sdk';

   const config = createRollupPrepareConfig({
       chainId: BigInt(chainId),
       owner: deployer.address,
       chainConfig,
   });
   ```

2. **createRollupPrepareTransactionRequest API**: 
   This API accepts parameters defined in the RollupDeploymentParams structure, applying defaults where necessary, and constructs the RollupDeploymentParams. This structure is then used to create a raw transaction which call the `createRollup` function of the RollupCreator contract. As discussed in previous sections, this function deploys and initializes all core Orbit contracts.

   For instance, to deploy using the Orbit SDK with a Config equal to `config`, a batchPoster, and an array of validators such as `[validator]`, the process would look like this:

   ```bash
   import { createRollupPrepareTransactionRequest } from '@arbitrum/orbit-sdk';

   const request = await createRollupPrepareTransactionRequest({
       params: {
           config,
           batchPoster,
           validators: [validator],
       },
       account: deployer_address,
       publicClient,
   });
   ```
    After creating the raw transaction, you need to sign and broadcast it to the network.

These APIs in the Orbit SDK make the complex process of configuring and deploying an Orbit chain more manageable and user-friendly. By abstracting the intricacies of smart contract interactions and deployment logistics, the SDK allows developers to focus more on their specific use cases and less on the underlying blockchain mechanics.

### Getting the Orbit Chain Information After Deployment

Once you've successfully deployed your Orbit chain, the next step is to retrieve detailed information about the deployment. The Orbit SDK provides a convenient way to do this through the `createRollupPrepareTransactionReceipt` API. This API allows you to extract vital data about the core contracts and other important aspects of your newly deployed Orbit chain.

After you send the signed transaction and receive the transaction receipt, you can use the `createRollupPrepareTransactionReceipt` API to parse this receipt and extract the relevant data. This process will provide you with comprehensive details about the deployed chain, such as contract addresses, configuration settings, and other essential information.

Here's an example of how to use the Orbit SDK to get data from a deployed Orbit chain:

```bash
import { createRollupPrepareTransactionReceipt } from '@arbitrum/orbit-sdk';

const data = createRollupPrepareTransactionReceipt(txReceipt);
```

In this example, `txReceipt` refers to the transaction receipt you received after deploying the chain. By passing this receipt to the `createRollupPrepareTransactionReceipt` function, you can easily access a wealth of information about your Orbit chain. This feature of the Orbit SDK simplifies the post-deployment process, allowing you to quickly and efficiently gather all necessary details about your chain for further use or reference. 