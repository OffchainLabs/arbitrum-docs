---
title: 'How to deploy an Arbitrum chain using the Arbitrum chain (Orbit) SDK'
description: 'How to deploy an Arbitrum chain using the Arbitrum chain (Orbit) SDK '
author: GreatSoshiant, jose-franco
sme: GreatSoshiant, jose-franco
target_audience: 'Developers deploying and maintaining Arbitrum chains.'
user_story: As a current or prospective Arbitrum chain deployer, I need to configure and deploy an Arbitrum chain.
content_type: how-to
---

import RaaSNotice from '../partials/_raas-providers-notice.mdx';

<RaaSNotice />

Creating a new Arbitrum chain involves deploying a set of contracts on your chain's <a data-quicklook-from="parent-chain">parent chain</a>. These contracts are:

- Bridge contracts: used to send cross-chain messages between the Arbitrum chain and its parent chain, including batches posted by the sequencer
- Rollup contracts: used by validators to create and confirm assertions of the current state of the Arbitrum chain
- Challenge protocol contracts: used by validators to dispute current assertions of the state of the chain, and ultimately resolve those disputes

You can explore the code of these contracts in the [nitro-contracts repository](https://github.com/OffchainLabs/nitro-contracts).

Upon deployment, an Arbitrum chain can be configured as a <a data-quicklook-from="arbitrum-rollup-chain">Rollup</a> or <a data-quicklook-from="arbitrum-anytrust-chain">AnyTrust</a> chain, and use ETH or any standard ERC-20 token as its gas token.

This page explains how to deploy an <a data-quicklook-from="arbitrum-chain">Arbitrum chain</a> using the Arbitrum chain (Orbit) SDK. See the [Overview](/launch-arbitrum-chain/arbitrum-chain-sdk-introduction.md) for an introduction to the process of creating and configuring an Arbitrum chain.

:::info About custom gas token Arbitrum chains

Custom gas token Arbitrum chains let participants pay transaction fees in an `ERC-20` token instead of `ETH`. Standard `ERC-20` tokens can be used as gas tokens, while more complex tokens with additional functionality must fulfill [these requirements](/launch-arbitrum-chain/02-configure-your-chain/common-configurations/02-use-a-custom-gas-token-rollup.mdx#requirements-of-the-custom-gas-token) to be used as gas tokens. Remember that the `ERC-20` token to be used must be deployed on your chain's parent chain.

:::

## Parameters used when deploying a new chain

Before we describe the process of creating a chain using the Arbitrum chain (Orbit) SDK, let's see what configuration options we have available when creating a chain.

Deploying a new Arbitrum chain is done through a [RollupCreator](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/07-canonical-factory-contracts.mdx) contract that processes the creation of the needed contracts and sends the initialization messages from the parent chain to the newly created Arbitrum chain.

`RollupCreator` has a `createRollup` function that deploys your chain's core contracts to the parent chain. `createRollup` takes a complex struct called `RollupDeploymentParams` as its only input. This struct defines the parameters of the Arbitrum chain to be created.

```solidity
struct RollupDeploymentParams {
    Config config;
    address[] validators;
    uint256 maxDataSize;
    address nativeToken;
    bool deployFactoriesToL2;
    uint256 maxFeePerGasForRetryables;
    address[] batchPosters;
    address batchPosterManager;
}
```

The following table describes `RollupDeploymentParams`'s parameters:

| Parameter                   | Type      | Description                                                                                                                                                                                                                                                                                                                |
| :-------------------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config`                    | Config    | The chain's configuration, explained below.                                                                                                                                                                                                                                                                                |
| `validators`                | address[] | Initial set of <a data-quicklook-from="validator">validator</a> addresses. Validators are responsible for validating the chain state and posting assertions (`RBlocks`) back to the parent chain. They also monitor the chain and initiate challenges against potentially faulty assertions submitted by other validators. |
| `maxDataSize`               | uint256   | Maximum message size for the Inbox contract (`117964` for L2 chains, and `104857` for L3 chains).                                                                                                                                                                                                                          |
| `nativeToken`               | address   | Address of the token contract in the parent chain, used for paying gas fees on the Arbitrum chain. It can be set to `ETH` for regular chains or to any `ERC-20` token for custom gas token Arbitrum chains.                                                                                                                |
| `deployFactoriesToL2`       | bool      | Whether or not to deploy several deterministic factory contracts to the Arbitrum chain.                                                                                                                                                                                                                                    |
| `maxFeePerGasForRetryables` | uint256   | Gas price bid to use when sending the retryable tickets.                                                                                                                                                                                                                                                                   |
| `batchPosters`              | address[] | Initial set of batch poster addresses. Batch posters batch and compress transactions on the Arbitrum chain and transmit them back to the parent chain.                                                                                                                                                                     |
| `batchPosterManager`        | address   | Address of the account responsible for managing currently active batch posters. Not mandatory, as these actions can also be taken by the chain owner.                                                                                                                                                                      |

The `Config` struct used in the previous configuration looks like this:

```solidity
struct Config {
    uint64 confirmPeriodBlocks;
    address stakeToken;
    uint256 baseStake;
    bytes32 wasmModuleRoot;
    address owner;
    address loserStakeEscrow;
    uint256 chainId;
    string chainConfig;
    uint256 minimumAssertionPeriod;
    uint64 validatorAfkBlocks;
    uint256[] miniStakeValues;
    ISequencerInbox.MaxTimeVariation sequencerInboxMaxTimeVariation;
    uint256 layerZeroBlockEdgeHeight;
    uint256 layerZeroBigStepEdgeHeight;
    uint256 layerZeroSmallStepEdgeHeight;
    AssertionState genesisAssertionState;
    uint256 genesisInboxCount;
    address anyTrustFastConfirmer;
    uint8 numBigStepLevel;
    uint64 challengeGracePeriodBlocks;
    BufferConfig bufferConfig;
}
```

Most of these parameters don't need to be configured, since the Arbitrum chain (Orbit) SDK will provide the right default values for them. However, the following table describes some of the parameters that you might want to configure:

| Parameter             | Type    | Description                                                                                                                                                                                                                                                                                         |
| :-------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `confirmPeriodBlocks` | uint64  | Sets the challenge period in terms of blocks, which is the time allowed for validators to dispute or challenge state assertions. Learn more about it in [Customizable challenge period](/launch-arbitrum-chain/02-configure-your-chain/common-configurations/03-customizable-challenge-period.mdx). |
| `stakeToken`          | address | Address of the token that validators must stake to participate in the chain's validation process.                                                                                                                                                                                                   |
| `baseStake`           | uint256 | Arbitrum chain validator nodes must stake a certain amount to incentivize honest participation. This parameter specifies this amount.                                                                                                                                                               |
| `wasmModuleRoot`      | address | Hash of the WASM module root to be used when validating.                                                                                                                                                                                                                                            |
| `owner`               | address | Account address responsible for deploying, owning, and managing your Arbitrum chain's base contracts on its parent chain.                                                                                                                                                                           |
| `loserStakeEscrow`    | address | Address that will receive any extra stakes deposited in the same assertion (when creating disputes).                                                                                                                                                                                                |
| `chainId`             | uint256 | Your chain's unique identifier. It differentiates your chain from others in the ecosystem.                                                                                                                                                                                                          |
| `chainConfig`         | string  | Additional chain configuration, explained below.                                                                                                                                                                                                                                                    |

The `chainConfig` parameter within the `Config` struct is a stringified `JSON` object that looks like this:

```typescript
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
  }
  arbitrum: {
    EnableArbOS: boolean;
    AllowDebugPrecompiles: boolean;
    DataAvailabilityCommittee: boolean;
    InitialArbOSVersion: number;
    InitialChainOwner: Address;
    GenesisBlockNum: number;
    MaxCodeSize: number;
    MaxInitCodeSize: number;
  }
}
```

Again, most of these parameters don't need to be configured, since the Arbitrum chain (Orbit) SDK will provide the right default values for them. However, the following table describes some of the parameters that you might want to configure:

| Parameter                            | Type    | Description                                                                                                                                                     |
| :----------------------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chainId`                            | number  | Your chain's unique identifier. It differentiates your chain from others in the ecosystem.                                                                      |
| `arbitrum.DataAvailabilityCommittee` | bool    | Whether or not to use a Data Avalability Committee (DAC) to store your chain's data (this should be `false` for Rollup chains, and `true` for AnyTrust chains). |
| `arbitrum.InitialArbOSVersion`       | number  | ArbOS version to use (it should be the latest ArbOS version available).                                                                                         |
| `arbitrum.InitialChainOwner`         | address | Account address responsible for deploying, owning, and managing your Arbitrum chain's base contracts on its parent chain.                                       |
| `arbitrum.MaxCodeSize`               | number  | Sets the maximum size for contract bytecodes on the chain (it's recommended to use the default 24Kb, and not set it higher than 96Kb).                          |
| `arbitrum.MaxInitCodeSize`           | number  | Maximum initialization bytecode size allowed (usually double the amount set in `MaxCodeSize`).                                                                  |

:::info

The `chainId` and `InitialChainOwner` parameters must be equal to the `chainId` and `owner` defined in the `Config` struct.

:::

## How to create a new Arbitrum chain using the Arbitrum chain (Orbit) SDK

Now, let's look at the methods to use when creating a new Arbitrum chain with the Arbitrum chain (Orbit) SDK.

:::info Example script

The Arbitrum chain (Orbit) SDK includes an example script for creating an Arbitrum chain. We recommend that you first understand the process described in this section and then check the following example scripts:

- [create-rollup-eth](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-eth/index.ts) for creating an Arbitrum AnyTrust chain with ETH as the gas token.
- [create-rollup-custom-fee-token](https://github.com/OffchainLabs/arbitrum-orbit-sdk/tree/main/examples/create-rollup-custom-fee-token) for creating an Arbitrum AnyTrust chain with an ERC-20 as the gas token.

:::

Here are the steps involved in the deployment process:

1. [Create the chain's configuration object](#1-create-the-chains-configuration-object)
2. [Deploy the Arbitrum chain](#2-deploy-the-arbitrum-chain)
3. [Understand the returned data](#3-understand-the-returned-data)
4. [Set the DAC keyset in the SequencerInbox (for AnyTrust chains)](#4-set-the-dac-keyset-in-the-sequencerinbox-for-anytrust-chains)
5. [Next step](#5-next-step)

### 1. Create the chain's configuration object

The `prepareChainConfig` function creates a `chainConfig` structure like the one defined in the previous section. It sets the appropriate defaults for most of the parameters, allowing you to override any of these defaults. However, the `chainId` and `InitialChainOwner` parameters must be set to the desired values.

Below is an example of how to use `prepareChainConfig` to obtain the chain configuration for a Rollup chain with a specific `chainId` and `InitialChainOwner`:

```typescript
import { prepareChainConfig } from '@arbitrum/orbit-sdk';

const chainConfig = prepareChainConfig({
  chainId: 123_456,
  arbitrum: {
    InitialChainOwner: 0x123...890,
    // Set the following parameter to `true` to deploy instead an AnyTrust chain
    DataAvailabilityCommittee: false,
  },
});
```

Once we have the `chainConfig`, we can use the function `createRollupPrepareDeploymentParamsConfig` to craft a `Config` structure like the one defined in the section above. Again, this function will set the appropriate defaults for most parameters, allowing you to override any of these defaults. However, the `chainId` and `owner` parameters must be set to the desired values. Additionally, a public client of the parent chain must be passed as an argument to the function.

Below is an example of how to use `createRollupPrepareDeploymentParamsConfig` to obtain the chain configuration for a chain with a specific `chainId` and `owner`:

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
  chainConfig: chainConfig,
});
```

### 2. Deploy the Arbitrum chain

With the new crafted configuration, we can call the `createRollup` method which will send the transaction to the `RollupCreator` contract and wait until it is executed.

Besides the `Config` structure created in the previous step, other parameters from the `RollupDeploymentParams` structure can be passed to override the defaults set by the Arbitrum chain (Orbit) SDK. Batch poster and validator addresses must be set to the desired values. Additionally, a public client of the parent chain and a deployer PrivateKeyAccount must be passed as arguments to the function.

:::info Additional step for custom gas token chains

If you want to configure a custom gas token, the deployer needs to give allowance to the `RollupCreator` contract before starting the deployment process, so that it can spend enough tokens to send the correspondant `Parent-to-Child` messages during the deployment process. This process is handled within the `createRollup` function, but the deployer must own enough tokens to create these messages.

:::

If you want to configure a custom gas token, you can pass the address in the parent chain of the `ERC-20` token to use in the `nativeToken` parameter of the `createRollup` function.

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
    // Uncomment the following line and add the address of the custom gas token
    // nativeToken: '0xAddressInParentChain',
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

### 4. Set the DAC keyset in the SequencerInbox (for AnyTrust chains)

If you're creating an AnyTrust chain, the next step is to set up the keyset of your Data Availability Committee (DAC) on the SequencerInbox contract. This process involves setting up the Data Availability Servers (DAS) and generating the keyset with all DAS' keys. See [How to configure a DAC](/run-arbitrum-node/data-availability-committees/01-get-started.mdx) to learn more about setting up a DAC.

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
