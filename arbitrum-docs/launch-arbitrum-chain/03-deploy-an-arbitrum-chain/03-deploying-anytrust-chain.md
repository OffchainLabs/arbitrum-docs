---
title: 'How to deploy an AnyTrust chain using the Arbitrum chain (Orbit) SDK'
description: 'Learn how to deploy an AnyTrust chain using the Arbitrum chain (Orbit) SDK '
author: GreatSoshiant, jose-franco
sme: GreatSoshiant, jose-franco
target_audience: 'Developers deploying and maintaining Arbitrum chains.'
user_story: As a current or prospective Arbitrum chain deployer, I need to configure and deploy an AnyTrust Arbitrum chain.
content_type: how-to
---

:::info RaaS providers

It is highly recommended to work with a Rollup-as-a-Service (RaaS) provider if you intend to deploy a production chain. You can find a list of RaaS providers [here](/launch-arbitrum-chain/06-third-party-integrations/02-third-party-providers.md#rollup-as-a-service-raas-providers).

:::

Creating a new Arbitrum chain involves deploying a set of contracts on the <a data-quicklook-from="parent-chain">parent chain</a> of your chain. This page explains how to deploy an <a data-quicklook-from="arbitrum-anytrust-chain">AnyTrust Arbitrum chain</a> using the Arbitrum chain (Orbit) SDK. See the [Overview](/launch-arbitrum-chain/arbitrum-chain-sdk-introduction.md) for an introduction to the process of creating and configuring an Arbitrum chain.

Before reading this guide, we recommend that you're familiar with the general process for creating new chains explained in the introduction and the first section of [How to deploy a Rollup chain](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/02-deploying-rollup-chain.md).

## About AnyTrust

AnyTrust chains implement the Arbitrum AnyTrust protocol, an alternative to the Arbitrum Rollup protocol. AnyTrust reduces transaction fees by introducing a minor trust assumption in the form of a permissioned set of parties responsible for managing data availability. You can learn more about the AnyTrust protocol in [this page](/how-arbitrum-works/08-anytrust-protocol.mdx).

## How to create a new AnyTrust chain using the Arbitrum chain (Orbit) SDK

AnyTrust chains' deployment process is very similar to that of [Rollup chains](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/02-deploying-rollup-chain.md), but with some differences that we'll discuss in this guide.

:::info Example script

The Arbitrum chain (Orbit) SDK includes an example script for creating an Arbitrum chain. We recommend that you first understand the process described in this section and then check the [create-rollup-eth](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-eth/index.ts) script.

:::

Here are the steps involved in the deployment process:

1. [Create the chain configuration object](#1-create-the-chain-configuration-object)
2. [Deploy the AnyTrust Arbitrum chain](#2-deploy-the-anytrust-arbitrum-chain)
3. [Understand the results obtained](#3-understand-the-returned-data)
4. [Set the DAC keyset in the SequencerInbox](#4-set-the-dac-keyset-in-the-sequencerinbox)

### 1. Create the chain configuration object

The [How to deploy a Rollup chain](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/02-deploying-rollup-chain.md#parameters-used-when-deploying-a-new-chain) guide explains the configuration structure that we need to craft and send to the `RollupCreator` contract when we wish to create a new chain. We recommend becoming familiar with that section before continuing.

The only difference between both types of chain is that the AnyTrust chain sets the `arbitrum.DataAvailabilityCommittee` flag to `true`, to indicate that the chain will use a Data Availability Committee (DAC).

Below is an example of how to use `createRollupPrepareDeploymentParamsConfig` and the `prepareChainConfig` methods to craft the needed configuration:

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

### 2. Deploy the AnyTrust Arbitrum chain

With the crafted configuration, we can call the `createRollup` method, which will send the transaction to the `RollupCreator` contract and wait until it is executed.

Below is an example of how to use `createRollup` using the `createRollupConfig` crafted in the previous step:

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

### 4. Set the DAC keyset in the SequencerInbox

The final step is to set up the keyset of your Data Availability Committee (DAC) on the SequencerInbox contract. This process involves setting up the Data Availability Servers (DAS) and generating the keyset with all DAS' keys. See [How to configure a DAC](/run-arbitrum-node/data-availability-committees/01-get-started.mdx) to learn more about setting up a DAC.

:::info

The Arbitrum chain (Orbit) SDK includes an example script for setting up the keyset in the SequencerInbox. We recommend that you first understand the process described in this section and then check the [set-valid-keyset](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/set-valid-keyset/index.ts) script.

:::

The Arbitrum chain (Orbit) SDK includes a `setValidKeyset` function to help set the keyset in the SequencerInbox. From the last step, you can gather the `sequencerInbox` and `upgradeExecutor` addresses and pass them to the function along with the `keyset`, a public client of the parent chain, and a wallet client of an account that has executor privileges in the `UpgradeExecutor` contract (to learn more about `UpgradeExecutor`, see [Ownership structure and access control](/launch-arbitrum-chain/04-maintain-your-chain/03-ownership-structure-access-control.mdx)).

Below is an example of how to use `setValidKeyset` using the parameters described above:

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { setValidKeyset } from '@arbitrum/orbit-sdk';

const deployer = privateKeyToAccount(deployerPrivateKey);
const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(),
});
const deployerWalletClient = createWalletClient({
  account: deployer,
  chain: parentChain,
  transport: http(),
});

const transactionReceipt = await setValidKeyset({
  coreContracts: {
    upgradeExecutor: '0xUpgradeExecutor',
    sequencerInbox: '0xSequencerInbox',
  },
  keyset: generatedKeyset,
  publicClient: parentChainPublicClient,
  walletClient: deployerWalletClient,
});
```

This function will send the transaction and wait for its execution, returning the transaction receipt.

### 5. Next step

Once the chain's contracts are created, you can move to the next step: [configure your Arbitrum chain's node](/launch-arbitrum-chain/how-tos/arbitrum-chain-sdk-preparing-node-config.md).
