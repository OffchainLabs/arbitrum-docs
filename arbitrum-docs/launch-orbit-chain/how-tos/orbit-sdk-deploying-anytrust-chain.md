---
title: 'How to Deploy an AnyTrust chain using the Orbit SDK'
sidebar_label: 'Deploy an AnyTrust chain'
description: 'Learn how to deploy an AnyTrust chain using the Orbit SDK '
author: GreatSoshiant
sme: GreatSoshiant
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 2
user_story: As a current or prospective Orbit chain deployer, I need to configure and deploy an AnyTrust Orbit chain.
content_type: how-to
---

This section explains how to initiate an <a data-quicklook-from="arbitrum-anytrust-chain">AnyTrust Orbit chain</a> using [Arbitrum's Orbit SDK](https://github.com/OffchainLabs/arbitrum-orbit-sdk).

:::caution UNDER CONSTRUCTION

This document is under construction and may change significantly as we incorporate [style guidance](/for-devs/contribute#document-type-conventions) and feedback from readers. Feel free to request specific clarifications by clicking the `Request an update` button at the top of this document.

:::

:::info

See the ["set-valid-keyset" example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/set-valid-keyset/index.ts) in the Orbit SDK repository for additional guidance.

:::

### About AnyTrust Orbit

AnyTrust chains implement the Arbitrum AnyTrust protocol, an alternative to the Arbitrum Rollup protocol. AnyTrust reduces transaction fees by introducing a minor trust assumption in the form of a permissioned set of parties responsible for managing data availability. For an overview of Orbit chain types, please refer to the [Orbit SDK introduction](../orbit-sdk-introduction.md).

### Deployment steps

The deployment process of AnyTrust chains is very similar to that of [Rollup chains](orbit-sdk-deploying-rollup-chain.md#rollup-config-param), but with some differences that we'll discuss in this guide.

Here are the steps involved in the deployment process:

1. **[Setting up the chain parameters](#1-setting-up-the-chain-parameters)**
2. **[Deploying your AnyTrust chain](#2-deploying-your-anytrust-chain)**
3. **[Getting the AnyTrust Orbit chain information after deployment](#3-getting-the-anytrust-orbit-chain-information-after-deployment)**
4. **[Setting valid keyset on parent chain](#4-setting-valid-keyset-on-parent-chain)**

The deployment of an AnyTrust Orbit chain involves defining and setting up the <a data-quicklook-from="data-availability-committee-dac">`Data Availability Committee (DAC)`</a> keyset. This keyset includes keys from the appointed members of the DAC. They are required to ensure the chain's data availability and integrity. Once you have selected your committee members and gathered their keys, the Orbit SDK helps you configure these keys into a keyset.
This keyset is then embedded into the chain, serving as a verification mechanism.

Let's go through each deployment step:

### 1. Setting up the chain parameters

Similarly to the Rollup chain, you'll need to prepare the AnyTrust chain configuration, including the core contracts and operational parameters that govern the chain's functionality, focusing on parameters specific to AnyTrust chains.

```solidity {10}
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

The `chainConfig` parameter within the `Config` structure lets you configure the following:

Start by setting up the chain configuration parameters. This includes defining key elements like:

| Parameter                   | Description                                                                                                                                                 |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chainId`                   | Your Orbit chain's unique identifier. It differentiates your chain from others in the ecosystem.                                                            |
| `DataAvailabilityCommittee` | Set to `false`, this boolean defines your chain as a Rollup; set to `true`, it configures it as an AnyTrust chain.                                          |
| `InitialChainOwner`         | Identifies who owns and controls the chain.                                                                                                                 |
| `MaxCodeSize  `             | Sets the maximum size for contract bytecodes on the Orbit chain. e.g. Ethereum mainnet has a limit of 24,576 Bytes.                                         |
| `MaxInitCodeSize`           | Similar to `MaxCodeSize`, defines the maximum size for your Orbit chain's **initialization** code. For example, the Ethereum mainnet limit is 49,152 Bytes. |

For an AnyTrust chain, you need to set the `DataAvailabilityCommittee` to **true**. This setting is crucial as it indicates the chain's reliance on a committee for data availability.

Here's an example of how to configure the `chainConfig` for an AnyTrust chain using the Orbit SDK:

```js
import { prepareChainConfig } from '@arbitrum/orbit-sdk';

const chainConfig = prepareChainConfig({
  chainId: Some_Chain_ID,
  arbitrum: {
    InitialChainOwner: deployer_address,
    DataAvailabilityCommittee: true,
  },
});
```

In this example, you need to set up the chain configuration with a unique `chainId`, the `InitialChainOwner` as the deployer's address, and, importantly, you must set the `DataAvailabilityCommittee` as `true`.

The Orbit SDK has a helper to execute this part: the `prepareChainConfig` API, which takes config parameters as arguments and returns a `chainConfig` `JSON` string. Any parameters not provided will default to standard values, which are detailed in the [Orbit SDK repository](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/1f251f76a55bc1081f50938b0aa9f7965660ebf7/src/prepareChainConfig.ts#L3-L31).

### 2. Deploying your AnyTrust chain

After configuring your chain with the `createRollupPrepareConfig` API, the next step is to use the `createRollupPrepareTransactionRequest` API. This API is designed to take the parameters defined in the `RollupDeploymentParams`, along with the configuration generated by the `createRollupPrepareConfig` API, to prepare a transaction request. This request is then used to invoke the `createRollup` function of the `RollupCreator` contract, which effectively deploys and initializes the core contracts of your AnyTrust Orbit chain.

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

After creating the raw transaction, you can sign and broadcast it to the network.

### 3. Getting the AnyTrust Orbit chain information after deployment

To extract detailed information about your AnyTrust Orbit chain post-deployment, you can use the same API and steps as you would for a Rollup Orbit chain. Here's a reminder of the example:

```js
import { createRollupPrepareTransactionReceipt } from '@arbitrum/orbit-sdk';

const data = createRollupPrepareTransactionReceipt(txReceipt);
```

In this example, `txReceipt` refers to the transaction receipt you received after deploying the AnyTrust chain. By inputting this receipt into the `createRollupPrepareTransactionReceipt` function, you can access comprehensive data about your deployment, including details about the core contracts and configuration settings.

### 4. Setting valid keyset on parent chain

The final step is to set up a valid keyset for your Data Availability Committee (DAC) on the parent chain. See [AnyTrust Orbit chains: Keyset generation](/launch-orbit-chain/concepts/anytrust-orbit-chain-keyset-generation) for instructions.

Once created, your keyset needs to be established on your Orbit chain's `SequencerInbox` contract on the parent chain.
To facilitate this, we provide an API in Orbit SDK named `setValidKeysetPrepareTransactionRequest`. This API requires specific information you can gather at [step three](#3-getting-the-anytrust-orbit-chain-information-after-deployment). This includes the `upgradeExecutor` and `sequencerInbox` addresses of your Orbit chain, the generated keyset for your committee, and the owner's account.

Here's an example of how you can use the Orbit SDK to write your keyset:

```js
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

In this example, `upgradeExecutor_address` and `sequencerInbox_address` are placeholders for the Orbit chain's contract addresses. `keyset` is the keyset you generated for your committee, and `deployer.address` refers to the owner's account address.

Once you've created the transaction request using the above API, the next step is to sign and send the transaction. This transaction writes the keyset to the parent chain, enabling it to recognize and verify the valid keyset for your AnyTrust Orbit chain.
