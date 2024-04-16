---
title: 'How to Deploy an Orbit chain using the Orbit SDK'
sidebar_label: 'Deploy an Orbit chain using the Orbit SDK'
description: 'How to Deploy an Orbit chain using the Orbit SDK'
author: anegg0
sme: anegg0
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 1
user_story: As a current or prospective Orbit chain deployer, I need to configure and deploy an Orbit chain using the Orbit SDK.
content_type: how-to
---

This document explains how to use the Orbit SDK to deploy a <a data-quicklook-from="arbitrum-orbit">`Orbit chain`</a>.

:::caution UNDER CONSTRUCTION

This document is under construction and may change significantly as we incorporate [style guidance](/for-devs/contribute#document-type-conventions) and feedback from readers. Feel free to request specific clarifications by clicking the `Request an update` button at the top of this document.

:::

:::info

See the ["create-rollup-eth" example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-eth/index.ts) in the Orbit SDK repository for additional guidance.

:::

import ChainSelectorPartial from './partials/_deploy-orbit-chain-select-chain.md';

<ChainSelectorPartial />

import ChainParameters from './partials/_deploy-orbit-chain-parameters.md';

<ChainParameters />

### Configuration and deployment helpers

The Orbit SDK provides two APIs, `createRollupPrepareConfig` and `createRollupPrepareTransactionRequest` to facilitate the configuration and deployment of Rollup parameters for an Orbit chain. These APIs simplify the process of setting up and deploying the core contracts necessary for an Orbit chain.

#### **createRollupPrepareConfig API**: 

   This API is designed to take parameters defined in the Config struct and fill in the rest with default values. It outputs a complete Config struct that is ready for use. 
   
   For example, to create a Config struct with a specific chain ID (`chainId`), an owner address (`deployer_address`), and a `chainConfig` as described in the [previous section](#chain-config-parameter), you would use the Orbit SDK as follows:

   ```js
   import { createRollupPrepareConfig } from '@arbitrum/orbit-sdk';

   const config = createRollupPrepareConfig({
       chainId: BigInt(chainId),
       owner: deployer.address,
       chainConfig,
   });
   ```

#### createRollupPrepareTransactionRequest API: 

   This API accepts parameters defined in the `RollupDeploymentParams` struct, applying defaults where necessary, and generates the `RollupDeploymentParams`. This struct is then used to create a raw transaction which calls the `createRollup` function of the `RollupCreator` contract. As discussed in previous sections, this function deploys and initializes all core Orbit contracts.

   For instance, to deploy using the Orbit SDK with a Config equal to `config`, a `batchPoster`, and a set of validators such as `[validator]`, the process would look like this:

   ```js
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

### Getting the Orbit chain information after deployment

Once you've successfully deployed your Orbit chain, the next step is to retrieve detailed information about the deployment, which you can do with the `createRollupPrepareTransactionReceipt` API. 

After sending the signed transaction and receiving the transaction receipt, you can use the `createRollupPrepareTransactionReceipt` API to parse this receipt and extract the relevant data. This process will provide comprehensive details about the deployed chain, such as contract addresses, configuration settings, and other information.

Here's an example of how to use the Orbit SDK to get data from a deployed Orbit chain:

```js
import { createRollupPrepareTransactionReceipt } from '@arbitrum/orbit-sdk';

const data = createRollupPrepareTransactionReceipt(txReceipt);
```

In this example, `txReceipt` refers to the transaction receipt you received after deploying the chain. By passing this receipt to the `createRollupPrepareTransactionReceipt` function, you can access your Orbit chain's information. This feature of the Orbit SDK simplifies the post-deployment process, allowing you to quickly and efficiently gather all necessary details about your chain for further use or reference. 
