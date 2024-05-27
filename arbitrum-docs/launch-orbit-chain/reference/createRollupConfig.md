---
title: 'Orbit SDK references: `createRollupPrepareConfig` function'
sidebar_label: 'createRollupPrepareConfig'
description: 'Describes Orbit SDK's 'createRollupPrepareConfig' function'
author: anegg0
sme: GreatSoshiant
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 1
user_story: As a current or prospective Orbit chain deployer, I need to understand how to use createRollupPrepareConfig to deploy faster.
content_type: reference
---

The `createRollupPrepareConfig` function helps deploy an Orbit Chain using the Orbit SDK. It prepares the configuration needed to set up a rollup, crucial for deploying core contracts on the chain. Below is an example of its usage, sourced from the [create-rollup-eth example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/tree/main/examples/create-rollup-eth).

```typescript
// prepare the transaction for deploying the core contracts
const request = await createRollupPrepareTransactionRequest({
  params: {
    config: createRollupPrepareConfig({
      chainId: BigInt(chainId),           // Chain ID for the rollup
      owner: deployer.address,            // Address of the initial chain owner
      chainConfig,                        // Configuration for the chain
    }),
    batchPoster,                          // Batch poster configuration
    validators: [validator],              // Validators for the chain
  },
  account: deployer.address,              // Deployer account address
  publicClient: parentChainPublicClient,  // Public client for the parent chain
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

### Function: `createRollupPrepareConfig`

The `createRollupPrepareConfig` function creates a configuration object for the rollup chain deployment. It accepts parameters that define the rollup chain's properties, fills in the rest with default values, and returns a configuration object that is ready for use by `createRollupPrepareTransactionRequest`.

#### Parameters

| Name                        | Type       | Optional | Description                                                             |
|--------------------------   |------------|----------|-------------------------------------------------------------------------|
| `chainId`                   | `BigInt`   | No       | The unique identifier for the chain.                                    |
| `owner`                     | `Address`  | No       | The address of the initial chain owner.                                 |
| `chainConfig`               | `Object`   | No       | The configuration object for the chain.                                 |
| `DataAvailabilityCommittee` | `boolean`  | Yes      | Enables the Data Availability Committee for the chain.                  |
| `InitialChainOwner`         | `Address`  | No       | The initial owner of the chain, typically the deployer's address.       |
| `MaxCodeSize`               | `number`   | Yes      | The maximum code size allowed for the chain.                            |
| `MaxInitCodeSize`           | `number`   | Yes      | The maximum initialization code size allowed for the chain.             |

#### Example

Below is an example of how to use the `createRollupPrepareConfig` function with comprehensive parameters.

```typescript
import { createRollupPrepareConfig } from 'arbitrum-orbit-sdk';

// Example parameters for creating a rollup configuration
const config = createRollupPrepareConfig({
  chainId: BigInt(420),               // Chain ID for the rollup
  owner: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // Initial chain owner
  chainConfig: {
    homesteadBlock: 1,
    daoForkBlock: null,
    daoForkSupport: false,
    eip150Block: 1,
    eip150Hash: '0x1100000000000000000000000000000000000000000000000000000000000000',
    eip155Block: 1,
    eip158Block: 1,
    byzantiumBlock: 1,
    constantinopleBlock: 1,
    petersburgBlock: 1,
    istanbulBlock: 1,
    muirGlacierBlock: 1,
    berlinBlock: 1,
    londonBlock: 1,
    clique: {
      period: 1,
      epoch: 1,
    },
    arbitrum: {
      EnableArbOS: false,
      AllowDebugPrecompiles: true,
      DataAvailabilityCommittee: true,
      InitialArbOSVersion: 20,
      InitialChainOwner: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      GenesisBlockNum: 1,
      MaxCodeSize: 40 * 1024,  // 40 KB
      MaxInitCodeSize: 80 * 1024,  // 80 KB
    },
  },
});
```

In this example, `createRollupPrepareConfig` is used to create a configuration object with detailed parameters, ensuring the rollup chain is set up correctly. The parameters include specific chain settings and initial owner details, among other configurations.
