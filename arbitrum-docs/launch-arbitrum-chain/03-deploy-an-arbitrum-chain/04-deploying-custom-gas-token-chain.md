---
title: 'How to deploy a custom gas token chain using the Arbitrum chain (Orbit) SDK'
description: 'How to deploy a custom gas token chain using the Arbitrum chain (Orbit) SDK'
author: GreatSoshiant, jose-franco
sme: GreatSoshiant, jose-franco
target_audience: 'Developers deploying and maintaining Arbitrum chains.'
user_story: As a current or prospective Arbitrum chain deployer, I need to understand how to deploy a custom gas token chain using the Arbitrum chain (Orbit) SDK.
content_type: how-to
---

import RaaSNotice from '../partials/_raas-providers-notice.mdx';

<RaaSNotice />

Creating a new Arbitrum chain involves deploying a set of contracts on your chain's <a data-quicklook-from="parent-chain">parent chain</a>. This page explains how to deploy a custom gas token Arbitrum chain using the Arbitrum chain (Orbit) SDK. See the [Overview](/launch-arbitrum-chain/arbitrum-chain-sdk-introduction.md) for an introduction to creating and configuring an Arbitrum chain.

Before reading this guide, we recommend:

- Becoming familiar with the general process of creating new chains explained in [How to deploy a Rollup chain](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/02-deploying-rollup-chain.md)
- Learning about the process of [creating new AnyTrust chains](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/03-deploying-anytrust-chain.md) since custom gas token chains must use the <a data-quicklook-from="arbitrum-anytrust-chain">AnyTrust protocol</a>

:::info

Custom gas tokens are **not supported yet** on Rollup chains, only on AnyTrust chains.

:::

## About custom gas token Arbitrum chains

Custom gas token Arbitrum chains let participants pay transaction fees in an `ERC-20` token instead of `ETH`. Standard `ERC-20` tokens can be used as gas tokens, while more complex tokens with additional functionality must fulfill [these requirements](/launch-arbitrum-chain/02-configure-your-chain/common-configurations/01-use-a-custom-gas-token-anytrust.mdx#requirements-of-the-custom-gas-token) to be used as gas tokens. The `ERC-20` token to be used must be deployed on your chain's parent chain.

## How to create a new custom gas token chain using the Arbitrum chain (Orbit) SDK

The deployment process for a custom gas token chain is very similar to that of an [AnyTrust chain](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/03-deploying-anytrust-chain.md), but with some differences that we'll discuss in this guide.

:::info Example script

The Arbitrum chain (Orbit) SDK includes an example script for creating a custom gas token Arbitrum chain. We recommend that you first understand the process described in this section and then check the [create-rollup-custom-fee-token](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-custom-fee-token/index.ts) script.

:::

Here are the steps involved in the deployment process:

1. [Create the chain's configuration object](#1-create-the-chains-configuration-object)
2. [Deploy the custom gas token Arbitrum chain](#2-deploy-the-custom-gas-token-arbitrum-chain)
3. [Understand the returned data](#3-understand-the-returned-data)
4. [Additional configuration](#4-additional-configuration)

### 1. Create the chain's configuration object

The [How to deploy a Rollup chain](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/02-deploying-rollup-chain.md#parameters-used-when-deploying-a-new-chain) guide explains the configuration structure that we need to craft and send to the `RollupCreator` contract when we wish to create a new chain. We recommend that you familiarize yourself with that section before continuing.

Because we are deploying an AnyTrust chain, we must set the `arbitrum.DataAvailabilityCommittee` flag to `true`, to indicate that the chain will use a Data Availability Committee (DAC).

Below is an example of how to use `createRollupPrepareDeploymentParamsConfig` and the `prepareChainConfig` methods to craft the configuration needed:

```typescript
import { createPublicClient, http } from 'viem';
import { createRollupPrepareDeploymentParamsConfig } from '@arbitrum/orbit-sdk';

const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(),
});

const createRollupConfig = createRollupPrepareDeploymentParamsConfig(parentChainPublicClient, {
  chainId: 123_456,
  owner: 0x123...890,
  chainConfig: prepareChainConfig({
    chainId: 123_456,
    arbitrum: {
      InitialChainOwner: 0x123...890,
      DataAvailabilityCommittee: true,
    },
  }),
});
```

### 2. Deploy the custom gas token Arbitrum chain

With the crafted configuration, we can call the `createRollup` function, which will send the transaction to the `RollupCreator` contract and wait until it is executed.

However, before doing that, the owner needs to give allowance to the `RollupCreator` contract before starting the deployment process, so that it can spend enough tokens to send the correspondant Parent-to-Child messages during the deployment process. This process is handled within the `createRollup` function, but the owner must own enough tokens to create these messages.

Additionally, we'll pass the `ERC-20` token to use as custom gas token in the `nativeToken` parameter of the `createRollup` function. We'll specify the address of the token contract in the parent chain.

Below is an example of how to use `createRollup` using the `createRollupConfig` crafted in the previous step, and the parameters mentioned above:

```typescript
import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createRollup } from '@arbitrum/orbit-sdk';

const deployer = privateKeyToAccount(deployerPrivateKey);
const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(),
});

const createRollupResults = await createRollup({
  params: {
    config: createRollupConfig,
    batchPosters: [batchPoster],
    validators: [validator],
    nativeToken: '0xAddressInParentChain',
  },
  account: deployer,
  parentChainPublicClient,
});
```

### 3. Understand the returned data

After calling `createRollup`, an object of type `CreateRollupResults` is returned with the following fields:

```typescript
type CreateRollupResults = {
  // The transaction sent
  transaction: CreateRollupTransaction;
  // The transaction receipt
  transactionReceipt: CreateRollupTransactionReceipt;
  // An object with the addresses of the contracts created
  coreContracts: CoreContracts;
};
```

### 4. Additional configuration

Since custom gas token chains are AnyTrust chains, we'll also have to set the DAC keyset in the SequencerInbox. Refer to [Set the DAC keyset in the SequencerInbox](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/03-deploying-anytrust-chain.md#4-set-the-dac-keyset-in-the-sequencerinbox) in the AnyTrust guide to learn how to do it.

### 5. Next step

Once the chain's contracts are created, you can move to the next step: [configure your Arbitrum chain's node](/launch-arbitrum-chain/how-tos/arbitrum-chain-sdk-preparing-node-config.md).
