---
title: 'Orbit SDK createRollupPrepareTransactionReceipt function reference guide'
sidebar_label: 'createRollupPrepareTransactionReceipt'
description: 'Describes Orbit SDK createRollupPrepareTransactionReceipt function'
author: anegg0
sme: GreatSoshiant
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 1
user_story: As a current or prospective Orbit chain deployer, I need to understand how to use createRollupPrepareTransactionReceipt to deploy faster.
content_type: reference
---

### Function Definition

After sending a deployment transaction and receiving the transaction receipt, you can use `createRollupPrepareTransactionReceipt` to parse this receipt and access details about the deployed chain:contract addresses, configuration settings, and other information.

```ts
function createRollupPrepareTransactionReceipt(
  receipt: TransactionReceipt,
): RollupTransactionReceipt;
```

#### Parameters

| Name      | Type                 | Optional | Description                                                         |
| --------- | -------------------- | -------- | ------------------------------------------------------------------- |
| `receipt` | `TransactionReceipt` | No       | The transaction receipt object returned from the blockchain client. |

#### Example Usage

Here's an example of how to use the `createRollupPrepareTransactionReceipt` function in conjunction with other relevant functions for deploying an Orbit Chain.

```ts
// Import necessary modules from the Orbit SDK
import {
  createRollupPrepareTransactionRequest,
  createRollupPrepareConfig,
  createRollupPrepareTransactionReceipt,
} from '@offchainlabs/arbitrum-orbit-sdk';

// prepare the transaction for deploying the core contracts
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
    batchPoster: '0xBatchPosterAddress',
    validators: ['0xValidatorAddress'],
  },
  account: '0xYourAddressHere',
  publicClient: parentChainPublicClient,
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

After sending the signed transaction and receiving the transaction receipt, you can use `createRollupPrepareTransactionReceipt` to parse this receipt and extract the relevant data. This process will provide comprehensive details about the deployed chain, such as contract addresses, configuration settings, and other information.

#### Output

The `createRollupPrepareTransactionReceipt` function processes the `TransactionReceipt` and returns a structured `RollupTransactionReceipt`.

```json
{
  "transactionHash": "0xTransactionHash",
  "blockHash": "0xBlockHash",
  "blockNumber": 123456,
  "gasUsed": 21000,
  "logs": [],
  "status": true
}
```

#### Function in Action

Combining `createRollupPrepareTransactionReceipt` with other relevant functions:

```ts
// Example of creating a rollup prepare transaction request and processing the receipt

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
    batchPoster: '0xBatchPosterAddress',
    validators: ['0xValidatorAddress'],
  },
  account: '0xYourAddressHere',
  publicClient: parentChainPublicClient,
});

const txHash = await parentChainPublicClient.sendRawTransaction({
  serializedTransaction: await deployer.signTransaction(request),
});

const txReceipt = createRollupPrepareTransactionReceipt(
  await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash }),
);
```
