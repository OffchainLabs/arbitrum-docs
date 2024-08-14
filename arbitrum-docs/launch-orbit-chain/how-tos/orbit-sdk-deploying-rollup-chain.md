---
title: 'How to Deploy a Rollup chain using the Orbit SDK'
sidebar_label: 'Deploy a Rollup chain'
description: 'How to deploy a Rollup chain using the Orbit SDK '
author: GreatSoshiant
sme: GreatSoshiant
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 1
user_story: As a current or prospective Orbit chain deployer, I need to configure and deploy a Rollup Orbit chain.
content_type: how-to
---

This document explains how to use the Orbit SDK to deploy a <a data-quicklook-from="arbitrum-rollup-chain">`Rollup Orbit chain`</a>.

:::caution UNDER CONSTRUCTION

This document is under construction and may change significantly as we incorporate [style guidance](/for-devs/contribute#document-type-conventions) and feedback from readers. Feel free to request specific clarifications by clicking the `Request an update` button at the top of this document.

:::

:::info

See the ["create-rollup-eth" example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-eth/index.ts) in the Orbit SDK repository for additional guidance.

:::

The main benefit of the Orbit SDK lies in facilitating the deployment and fine-tuning of Orbit chains core Smart-Contracts.

These contracts are deployed on <a data-quicklook-from="parent-chain">`parent chains`</a>, they are:

- Rollup contracts
- <a data-quicklook-from="bridge">Bridge contracts</a>
- Contracts handling <a data-quicklook-from="fraud-proof">fraud proofs</a>

Core contracts are the backbone of Arbitrum's <a data-quicklook-from="arbitrum-nitro">Nitro stack</a>, ensuring its robust and efficient operation. You can explore their code in the [nitro-contracts GitHub repository](https://github.com/OffchainLabs/nitro-contracts).

### Rollup deployment parameters

[`createRollup`](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/rollup/RollupCreator.sol#L107) is the function that will deploy your core contracts on the parent chain.
`createRollup` takes a complex input named `deployParams', which defines the characteristics of an Orbit Rollup chain.

The following will walk you through the methods and properties you will use to configure your chain.

#### 1. RollupDeploymentParams struct

```solidity {2,4,6}
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

This Solidity struct includes key settings like the chain configuration (`Config`), validator addresses, maximum data size, the native token of the chain, and more.

#### 2. Config struct

```solidity {2,4,5,9}
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

The `Config` struct defines the chain's core settings, including block confirmation periods, stake parameters, and the chain ID.

#### 3. MaxTimeVariation struct

```solidity
struct MaxTimeVariation {
    uint256 delayBlocks;
    uint256 futureBlocks;
    uint256 delaySeconds;
    uint256 futureSeconds;
}
```

This nested struct within `Config` specifies time variations related to block sequencing, providing control over block delay and future block settings.

#### 4. chainConfig

The `chainConfig` parameter within the `Config` struct allows you to customize your Orbit chain. It's a stringified `JSON` object containing various configuration options that dictate how the Orbit chain behaves and interacts with the parent chain network.

Here's a brief overview of `chainConfig`:

```json {2,24,26,28,29}
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

Out of `chainConfig`'s parameters, a few are particularly important and are likely to be configured by the chain owner: `chainId`, `arbitrum.InitialChainOwner`, `arbitrum.InitialArbOSVersion`, `arbitrum.DataAvailabilityCommittee`, `arbitrum.MaxCodeSize`, and `arbitrum.MaxInitCodeSize`. These parameters are customizable, while the other parameters use default values and should not be modified.

For easier config preparation, the Orbit SDK provides the `prepareChainConfig` API, which takes config parameters as arguments and returns a `chainConfig` `JSON` string. Any parameters not provided will default to standard values, which are detailed [here](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/src/prepareChainConfig.ts).

Here are the parameters you can use with `prepareChainConfig`:

| Parameter                            | Type    | Required | Default Value  | Description                                                                                                          |
| :----------------------------------- | :------ | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| `chainId`                            | Number  | Yes      | /              | Your chain's unique identifier. It differentiates your chain from others in the ecosystem.                           |
| `arbitrum.InitialChainOwner`         | Address | Yes      | /              | Specifies who owns and controls the chain.                                                                           |
| `arbitrum.InitialArbOSVersion`       | Number  | No       | latest         | Specifies which version of ArbOS should the chain run.                                                               |
| `arbitrum.DataAvailabilityCommittee` | Boolean | No       | false          | When set to `false`, your chain will run as a Rollup chain, and when set to `true` it will run as an AnyTrust chain. |
| `arbitrum.MaxCodeSize`               | Number  | No       | 24_576 (bytes) | Sets the maximum size for contract bytecodes on the chain.                                                           |
| `arbitrum.MaxInitCodeSize`           | Number  | No       | 49_152 (bytes) | Similar to `arbitrum.MaxCodeSize`, defines the maximum size for your chain's **initialization** code.                |

Below is an example of how to use `prepareChainConfig` to set up a Rollup chain with a specific `chainId`, an `InitialChainOwner` (named as `deployer`):

```js
import { prepareChainConfig } from '@arbitrum/orbit-sdk';

const chainConfig = prepareChainConfig({
  chainId: 123_456,
  arbitrum: {
    InitialChainOwner: deployer,
    DataAvailabilityCommittee: false,
  },
});
```

### Rollup configuration parameters

In this section, we'll provide detailed explanations of the various chain configuration parameters used in the deployment of Orbit chains.

| Parameter             | Description                                                                                                                                                                                                                                                                                                           |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `batchPosters`        | Array of batch poster addresses. Batch posters batch and compress transactions on the Orbit chain and transmit them back to the parent chain.                                                                                                                                                                         |
| `batchPosterManager`  | Account address responsible for managing currently active batch posters. Not mandatory, as these actions can also be taken by the chain owner.                                                                                                                                                                        |
| `validators`          | Array of <a data-quicklook-from="validator">validator</a> addresses. Validators are responsible for validating the chain state and posting Rollup Blocks (`RBlocks`) back to the parent chain. They also monitor the chain and initiate challenges against potentially faulty RBlocks submitted by other validators.  |
| `nativeToken`         | Determines the token used for paying gas fees on the Orbit chain. It can be set to `ETH` for regular chains or to any `ERC-20` token for **gas fee token network** Orbit chains.                                                                                                                                      |
| `confirmPeriodBlocks` | Sets the challenge period in terms of blocks, which is the time allowed for validators to dispute or challenge state assertions. On Arbitrum One and Arbitrum Nova, this is currently set to approximately seven days in block count. `confirmPeriodBlocks` is measured in L1 blocks, we recommend a value of `45818` |
| `baseStake`           | Orbit chain validator nodes must stake a certain amount to incentivize honest participation. The `basestake` parameter specifies this amount.                                                                                                                                                                         |
| `stakeToken`          | Token in which the `basestake` is required. It represents the token's address on the parent chain. Can be `ETH` or a `ERC-20`token. Note that the use of an `ERC-20` token as the `stakeToken` is currently not supported by Nitro, but will be soon.                                                                 |
| `owner`               | Account address responsible for deploying, owning, and managing your Orbit chain's base contracts on its parent chain.                                                                                                                                                                                                |
| `chainId`             | Sets the unique chain ID of your Orbit chain.                                                                                                                                                                                                                                                                         |

:::note

`chainId` and owner parameters must be equal to the chain ID and `InitialOwner` defined in the `chainConfig` section.

:::

While other configurable parameters exist, they are set to defaults, and it's generally not anticipated that a chain deployer would need to modify them. However, if you believe there's a need to alter any other parameters not listed here, please feel free to [contact us on our Discord server](https://discord.com/channels/585084330037084172/1116812793606328340/1205801459518804018) for further details and support.

### Configuration and deployment helpers

The Orbit SDK provides two APIs, `createRollupPrepareDeploymentParamsConfig` and `createRollupPrepareTransactionRequest` to facilitate the configuration and deployment of Rollup parameters for an Orbit chain. These APIs simplify the process of setting up and deploying the core contracts necessary for an Orbit chain.

#### **createRollupPrepareDeploymentParamsConfig API**:

This API is designed to take parameters defined in the Config struct and fill in the rest with default values. It outputs a complete Config struct that is ready for use.

For example, to create a Config struct with a specific chain ID (`chainId`), an owner address (`deployer_address`), and a `chainConfig` as described in the [previous section](#chain-config-parameter), you would use the Orbit SDK as follows:

```js
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { createRollupPrepareDeploymentParamsConfig } from '@arbitrum/orbit-sdk';

const parentPublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

const config = createRollupPrepareDeploymentParamsConfig(parentPublicClient, {
  chainId: BigInt(chainId),
  owner: deployer.address,
  chainConfig,
});
```

#### createRollupPrepareTransactionRequest API:

This API accepts parameters defined in the `RollupDeploymentParams` struct, applying defaults where necessary, and generates the `RollupDeploymentParams`. This struct is then used to create a raw transaction which calls the `createRollup` function of the `RollupCreator` contract. As discussed in previous sections, this function deploys and initializes all core Orbit contracts.

For instance, to deploy using the Orbit SDK with a Config equal to `config`, a single batch poster in `[batchPoster]`, and a single validator in `[validator]`, the process would look like this:

```js
import { createRollupPrepareTransactionRequest } from '@arbitrum/orbit-sdk';

const request = await createRollupPrepareTransactionRequest({
  params: {
    config,
    batchPosters: [batchPoster],
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

In this example, `txReceipt` refers to the transaction receipt you received after deploying the chain. You can access your Orbit chain's information by passing this receipt to the `createRollupPrepareTransactionReceipt` function. This feature of the Orbit SDK simplifies the post-deployment process, allowing you to quickly and efficiently gather all necessary details about your chain for further use or reference.
