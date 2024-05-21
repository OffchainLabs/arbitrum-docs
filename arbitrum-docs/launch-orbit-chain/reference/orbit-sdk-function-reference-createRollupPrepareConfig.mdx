---
title: 'Orbit SDK createRollupPrepareConfig function reference guide'
sidebar_label: 'createRollupPrepareConfig'
description: 'Describes Orbit SDK createRollupPrepareConfig function'
author: anegg0
sme: GreatSoshiant
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 1
user_story: As a current or prospective Orbit chain deployer, I need to understand how to use createRollupPrepareConfig to deploy faster.
content_type: reference
---

In this guide, we focus on the `createRollupPrepareConfig` function, essential for deploying an Orbit Chain using the Orbit SDK. The example code is sourced from [here](https://github.com/OffchainLabs/arbitrum-orbit-sdk/tree/main/examples/create-rollup-eth). Below is a brief example that we'll explore in detail:

```ts
// prepare the transaction for deploying the core contracts
const request = await createRollupPrepareTransactionRequest({
  params: {
    config: createRollupPrepareConfig({
      chainId: BigInt(chainId),
      owner: deployer.address,
      chainConfig,
      genesisBlock: '0xInitialBlock',
      sequencer: '0xSequencerAddress',
      validators: [validator],
      batchPoster,
    }),
    account: deployer.address,
    publicClient: parentChainPublicClient,
  },
});

// sign and send the transaction
const txHash = await parentChainPublicClient.sendRawTransaction({
  serializedTransaction: await deployer.signTransaction(request),
});

// get the transaction receipt after waiting for the transaction to complete
const txReceipt = createRollupPrepareTransactionReceipt(
  await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash }),
);
```

`createRollupPrepareConfig` takes parameters defined in the `Config` struct and fills in the rest with default values. It outputs a complete Config struct that is ready for use.

#### Function Definition

```ts
function createRollupPrepareConfig({
  chainId,
  owner,
  chainConfig,
  genesisBlock,
  sequencer,
  validators,
  batchPoster
}) { ... }
```

This function receives an object with specific parameters which define the deployment configuration.

#### Parameters

| Name           | Type             | Optional | Description                                                          |
| -------------- | ---------------- | -------- | -------------------------------------------------------------------- |
| `chainId`      | `bigint`         | No       | The unique identifier for the Orbit Chain.                           |
| `owner`        | `Address`        | No       | The address initiating the deployment.                               |
| `chainConfig`  | `Object`         | No       | Specific chain configuration settings (e.g., `maxGas`, `allowList`). |
| `genesisBlock` | `string`         | Yes      | Represents the initial block of the chain.                           |
| `sequencer`    | `Address`        | Yes      | The address of the sequencer responsible for ordering transactions.  |
| `validators`   | `Array<Address>` | Yes      | List of validator addresses.                                         |
| `batchPoster`  | `Address`        | Yes      | Address responsible for posting the rollup batches.                  |

#### Example Usage

```ts
const config = createRollupPrepareConfig({
  chainId: BigInt(97400766948),
  owner: '0x8BdF2e6822631664433e47a5aa8D6cF4addAc1f0',
  chainConfig: {
    londonBlock: 0,
    clique: {
      period: 0,
      epoch: 0,
    },
    arbitrum: {
      EnableArbOS: true,
      AllowDebugPrecompiles: false,
      DataAvailabilityCommittee: true,
      MaxCodeSize: 24576,
      MaxInitCodeSize: 49152,
      InitialChainOwner: '0x8BdF2e6822631664433e47a5aa8D6cF4addAc1f0',
    },
    chainId: 97400766948,
  },
  genesisBlock: '0xInitialBlock',
  sequencer: '0xSequencerAddress',
  validators: ['0xValidatorAddress1', '0xValidatorAddress2'],
  batchPoster: '0xBatchPosterAddress',
});
```

#### Output

The function outputs a configuration object necessary for transaction creation. The structure would resemble:

```json
{
  "confirmPeriodBlocks": "150",
  "extraChallengeTimeBlocks": "0",
  "stakeToken": "0x0000000000000000000000000000000000000000",
  "baseStake": "100000000000000000",
  "wasmModuleRoot": "0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4",
  "loserStakeEscrow": "0x0000000000000000000000000000000000000000",
  "genesisBlockNum": "0",
  "sequencerInboxMaxTimeVariation": {
    "delayBlocks": "5760",
    "futureBlocks": "48",
    "delaySeconds": "86400",
    "futureSeconds": "3600"
  },
  "chainId": "97400766948",
  "owner": "0x8BdF2e6822631664433e47a5aa8D6cF4addAc1f0",
  "chainConfig": {
    "homesteadBlock": 0,
    "daoForkBlock": null,
    "daoForkSupport": true,
    "eip150Block": 0,
    "eip150Hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "muirGlacierBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "clique": {
      "period": 0,
      "epoch": 0
    },
    "arbitrum": {
      "EnableArbOS": true,
      "AllowDebugPrecompiles": false,
      "DataAvailabilityCommittee": true,
      "InitialArbOSVersion": 20,
      "GenesisBlockNum": 0,
      "MaxCodeSize": 24576,
      "MaxInitCodeSize": 49152,
      "InitialChainOwner": "0x8BdF2e6822631664433e47a5aa8D6cF4addAc1f0"
    },
    "chainId": 97400766948
  }
}
```

#### Function in Action

Combining `createRollupPrepareConfig` with `createRollupPrepareTransactionRequest`:

```ts
const request = await createRollupPrepareTransactionRequest({
  params: {
    config: createRollupPrepareConfig({
      chainId: BigInt(97400766948),
      owner: '0x8BdF2e6822631664433e47a5aa8D6cF4addAc1f0',
      chainConfig: {
        homesteadBlock: 0,
        daoForkBlock: null,
        daoForkSupport: true,
        eip150Block: 0,
        eip150Hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        eip155Block: 0,
        eip158Block: 0,
        byzantiumBlock: 0,
        constantinopleBlock: 0,
        petersburgBlock: 0,
        istanbulBlock: 0,
        muirGlacierBlock: 0,
        berlinBlock: 0,
        londonBlock: 0,
        clique: {
          period: 0,
          epoch: 0,
        },
        arbitrum: {
          EnableArbOS: true,
          AllowDebugPrecompiles: false,
          DataAvailabilityCommittee: true,
          InitialArbOSVersion: 20,
          GenesisBlockNum: 0,
          MaxCodeSize: 24576,
          MaxInitCodeSize: 49152,
          InitialChainOwner: '0x8BdF2e6822631664433e47a5aa8D6cF4addAc1f0',
        },
        chainId: 97400766948,
      },
      genesisBlock: '0xInitialBlock',
      sequencer: '0xSequencerAddress',
      validators: ['0xValidatorAddress1', '0xValidatorAddress2'],
      batchPoster: '0xBatchPosterAddress',
    }),
    account: '0xYourAddressHere',
    publicClient: parentChainPublicClient,
  },
});

const txHash = await parentChainPublicClient.sendRawTransaction({
  serializedTransaction: await deployer.signTransaction(request),
});

const txReceipt = createRollupPrepareTransactionReceipt(
  await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash }),
);
```
