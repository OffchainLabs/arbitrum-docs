---
title: 'Arbitrum Orbit SDK'
sidebar_label: 'Anytrust Orbit Deployment'
description: 'Arbitrum SDK '
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 2
---

### Anytrust Deployment

Having previously covered the essentials of deploying Arbitrum Orbit chains and specifically focusing on Rollup Orbit chains, we now turn our attention to setting up an Anytrust Orbit chain. Anytrust chains represent a different model within the Arbitrum Orbit ecosystem, offering unique features and deployment processes. For a comprehensive understanding of the general principles of Orbit chains, please refer to the preceding sections or the dedicated page [here](#).

#### Key Differences Between Rollup and Anytrust Chains

Before diving into the deployment process, it's important to understand the key differences between Rollup and Anytrust chains:
   
1. **Data Availability**: The approach to data availability in Anytrust chains is distinct. On Anytrust members of a Data Availability Committee is responsible to keep the data of transactions but in Rollup chains, the data would be sent back the parent chain.

2. **Security Guarantees**: Anytrust chains provide a different level of security guarantees, which might be more suitable for certain types of applications, such as gaming and social media.
   
3. **Fee Cost**: Anytrust chain is way more cheaper than Rollups because on Anytrust there's no need to send the data to the parent chain. This will open up opportunities for chains to host applications that need cheaper fees.
   

#### Setting Up an Anytrust Orbit Chain Using Orbit SDK

The process of setting up an Anytrust Orbit chain involves several steps, similar to the Rollup chain setup but with specific configurations tailored for Anytrust:

1. **Prepare the Configuration**: Similar to the Rollup chain, you'll need to prepare the chain configuration, focusing on parameters that are specific to Anytrust chains.

2. **Use Orbit SDK APIs**: The Orbit SDK provides APIs tailored for Anytrust chain deployment. These APIs might differ slightly from those used for Rollup chains, reflecting the unique aspects of Anytrust chains.

3. **Deploy the Chain**: Utilize the Orbit SDK to deploy your Anytrust chain. This process will involve sending transactions and setting up the necessary smart contracts on the parent chain.
   
4. **Setting Anytrust Keyset**: In the deployment of an Anytrust Orbit chain, a crucial step involves defining and setting up the Data Availability Committee (DAC) keyset. This keyset, comprising keys from the appointed members of the DAC, is essential for ensuring data availability and integrity. Once you have selected your committee members and gathered their keys, these keys are then configured into a keyset using the Orbit SDK. This keyset is subsequently embedded into the chain, serving as a verification mechanism to maintain the trust and security of the Anytrust chain. The proper configuration and deployment of this keyset are vital for the effective operation and reliability of the Anytrust model within the Arbitrum Orbit framework.

We will explain each step on the coming sections.

### Anytrust Deployment Parameters Configuration

Deploying an Anytrust Orbit chain involves a series of steps that mirror those required for a Rollup Orbit chain, with certain specificities unique to the Anytrust model. These steps ensure that the chain is configured correctly and operates as intended. Here’s an overview of the steps involved in configuring and deploying an Anytrust Orbit chain:

1. **Chain Config Parameter**: Start by setting up the chain configuration parameters. This includes defining key elements like `chainId`, `DataAvailabilityCommittee`, `InitialChainOwner`, `MaxCodeSize`, and `MaxInitCodeSize`. These parameters tailor the chain to your specific requirements and operational context.

2. **Configuration of RollupCreator Params and Deployment of Anytrust on Orbit SDK**: Utilize the Orbit SDK's functionalities to configure the RollupCreator parameters. This step involves preparing the deployment settings for the Anytrust chain, including the core contracts and operational parameters that govern the chain's functionality.

3. **Getting the Anytrust Orbit Chain Information After Deployment**: After deploying the Anytrust chain, it's crucial to retrieve detailed information about the deployment. This includes data about the core contracts, the configuration settings, and other relevant operational details. The Orbit SDK provides tools for extracting this information efficiently.

4. **Setting Valid Keyset on Parent Chain**: A unique aspect of the Anytrust model is setting up a valid keyset for the Data Availability Committee (DAC) on the parent chain. This step involves defining and deploying a set of cryptographic keys that will be used by the DAC to ensure data availability and integrity.

Each of these steps plays a vital role in the successful deployment and operation of an Anytrust Orbit chain. The upcoming sections will provide detailed explanations and guidance on how to accomplish each step, ensuring a smooth and effective deployment process. By following these guidelines, developers can leverage the capabilities of the Orbit SDK to set up an Anytrust chain that meets their specific needs and aligns with their project goals.

#### 1. Chain Config Parameter

The `chainConfig` parameter within the `Config` structure is an essential element for tailoring your Orbit chain according to specific needs. This parameter is particularly significant when setting up an Anytrust Orbit chain, as it includes configurations that distinguish it from a Rollup chain. The key parameter that differentiates an Anytrust chain in this context is the `DataAvailabilityCommittee`.

For an Anytrust chain, you need to set the `DataAvailabilityCommittee` to **true**. This setting is crucial as it indicates the chain's reliance on a committee for data availability, which is a hallmark of the Anytrust model.

Here’s an example of how to configure the `chainConfig` for an Anytrust chain using the Orbit SDK:

```bash
import { prepareChainConfig } from '@arbitrum/orbit-sdk';

const chainConfig = prepareChainConfig({
    chainId: Some_Chain_ID,
    arbitrum: { InitialChainOwner: deployer_address, DataAvailabilityCommittee: true },
});
```

In this example, you set up the chain configuration with a specific `chainId`, the `InitialChainOwner` as the deployer's address, and importantly, you configure the `DataAvailabilityCommittee` as `true`. This configuration ensures that your Orbit chain is set up as an Anytrust chain, utilizing the unique features and operational model of the Anytrust system within the Arbitrum Orbit framework.

#### 2. Configuration of RollupCreator Params and Deployment of Anytrust on Orbit SDK

The process of configuring and deploying an Anytrust Orbit chain closely parallels that of a Rollup Orbit chain, as detailed on the Rollup deployment page. The key lies in utilizing specific APIs provided by the Orbit SDK, which are instrumental in preparing and executing the deployment. These APIs are:

1. **createRollupPrepareConfig API**: This API is used to set up the configuration for your Anytrust chain. It takes in the parameters defined in the Config structure, applies them, and fills in any remaining details with default values. The output is a fully-formed Config structure that is ready for deployment.

2. **createRollupPrepareTransactionRequest API**: After configuring your chain with the createRollupPrepareConfig API, the next step is to use the createRollupPrepareTransactionRequest API. This API is designed to take the parameters defined in the RollupDeploymentParams, along with the configuration generated by the createRollupPrepareConfig API, to prepare a transaction request. This request is then used to invoke the createRollup function of the RollupCreator contract, which effectively deploys and initializes the core contracts of your Anytrust Orbit chain.

Both of these APIs are critical in the setup process and were previously discussed with examples provided on the Rollup deployment page. By following those examples and instructions, you can apply the same methods to set up an Anytrust chain, ensuring a seamless and efficient deployment process using the Orbit SDK.

### 3. Getting the Anytrust Orbit Chain Information After Deployment:

The procedure for retrieving information about your deployed Anytrust Orbit chain is identical to the method used for Rollup Orbit chains, as detailed on the Rollup Orbit page. This consistency in approach ensures a streamlined process, regardless of the type of Orbit chain you are working with.

To extract detailed information about your Anytrust Orbit chain post-deployment, you will use the same API and steps as you would for a Rollup Orbit chain. Here's a reminder of the example:

```bash
import { createRollupPrepareTransactionReceipt } from '@arbitrum/orbit-sdk';

const data = createRollupPrepareTransactionReceipt(txReceipt);
```

In this example, `txReceipt` refers to the transaction receipt you received after deploying the Anytrust chain. By inputting this receipt into the `createRollupPrepareTransactionReceipt` function, you can access comprehensive data about your deployment, including details about the core contracts and configuration settings.

This uniform method for both Rollup and Anytrust chains simplifies the process for developers, allowing for a smooth transition between working with different types of Orbit chains. It ensures that you can efficiently gather all necessary information about your deployed chain for further use or analysis.


### 4. Setting Valid Keyset on Parent Chain:

The final step in deploying your Anytrust Orbit chain is to set up the valid keyset for your Data Availability Committee (DAC) on the parent chain. This keyset is essential for ensuring that the parent chain can verify the data from your Orbit chain. The process of generating keys and the keyset for your committee is comprehensively explained in our documentation (referenced as '#'). Once you have your keyset, it needs to be established on the SequencerInbox contract of your Orbit chain on the parent chain.

To facilitate this, we provide an API in our documentation named `setValidKeysetPrepareTransactionRequest`. This API aids in setting the keyset on the parent chain. To use this API, you need specific information that you gathered in step 3. This includes the `upgradeExecutor` and `sequencerInbox` addresses of your Orbit chain, the generated keyset for your committee, and the account of the owner.

Here's an example of how you can use the Orbit SDK to set the keyset:

```bash
const txRequest = await setValidKeysetPrepareTransactionRequest({
  coreContracts: {
    upgradeExecutor: 'upgradeExecutor_address',
    sequencerInbox: 'sequencerInbox_address',
  },
  keyset,
  account: deployer.address,
  publicClient: parentChainPublicClient,
});
```

In this example, `upgradeExecutor_address` and `sequencerInbox_address` are placeholders for the actual addresses of the respective contracts in your Orbit chain. `keyset` is the keyset you generated for your committee, and `deployer.address` refers to the owner's account address.

After you create the transaction request using the above API, the next step is to sign and send the transaction. This action will effectively set the keyset on the parent chain, allowing it to recognize and verify the valid keyset for your Anytrust Orbit chain. This step is crucial for the operational integrity and security of your Anytrust chain, ensuring that the data verified by the DAC is recognized and accepted by the parent chain.
