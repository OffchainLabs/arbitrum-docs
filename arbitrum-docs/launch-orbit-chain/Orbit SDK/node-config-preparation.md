---
title: 'Arbitrum Orbit SDK'
sidebar_label: 'Node Config Generation'
description: 'Arbitrum SDK '
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 4
---
### Node Configuration

Once you have successfully deployed and initialized the Orbit core contracts, the next crucial step is configuring and running your Orbit chain using a Node Config JSON file. This file is a comprehensive JSON object containing all necessary configurations for the Arbitrum Node, which includes settings for the Batch-poster, Validator, and the chain itself.

#### Example of Node Config for a Rollup Orbit Chain:

Here’s a sample configuration for a Rollup Orbit Chain:

```bash
{
  'chain': {
    'info-json': stringifyInfoJson([...]),
    'name': chainName,
    // Additional chain-specific configurations
  },
  'parent-chain': {
    connection: {
      url: parentChainRpcUrl,
    },
  },
  'http': {
    addr: '0.0.0.0',
    port: 8449,
    vhosts: '*',
    corsdomain: '*',
    api: ['eth', 'net', 'web3', 'arb', 'debug'],
  },
  'node': {
    // Node-specific settings including sequencer, batch-poster, staker configurations
  },
};
```

This configuration includes:

- **Chain Information**: Details about the chain itself, including the chain ID, name, and core contracts.
- **Parent Chain Connection**: Information for connecting to the parent chain.
- **HTTP Settings**: Configuration for the HTTP server.
- **Node Settings**: Specific settings for the node, including sequencer and batch-poster configurations.

#### Additional Configuration for Anytrust Orbit Chains:

For Anytrust Orbit chains, the Node Config JSON has an additional segment under the 'node' field. This addition includes settings specific to the Anytrust model, such as the sequencer inbox address, parent chain node URL, and configurations for the rest and RPC aggregators.

Example addition for Anytrust Node Config:

```bash
{
  ...
  'node': {
    ...
    'sequencer-inbox-address': coreContracts.sequencerInbox,
    'parent-chain-node-url': parentChainRpcUrl,
    'rest-aggregator': {
      enable: true,
      urls: 'http://localhost:9876',
    },
    'rpc-aggregator': {
      'enable': true,
      'assumed-honest': 1,
      'backends': stringifyBackendsJson([...]),
    },
  }
  ...
};
```

#### Configuring Your Node Config:

The Node Config file comprises three types of fields:

1. **Information from the Orbit Deployment Chain**: Such as the addresses of the core contracts.
2. **Parameters Configurable by the Chain Deployer**: These parameters, like `max-block-speed`, can be adjusted to alter the behavior of your chain.
3. **Fields Not Typically Configured**: Like the HTTP section, which usually remains standard.

In upcoming sections, we'll delve into how to configure these parameters effectively and create the Node Config for your Orbit chain. This configuration is essential for initializing your chain and ensuring it runs according to your specifications. Proper configuration leads to an optimized, stable, and secure Orbit chain, tailored to your project's requirements.

#### Node Config Generation with Orbit SDK

Generating a Node Config JSON file for initiating your Orbit chain is a crucial step in the deployment process. The Orbit SDK simplifies this task with an API named `prepareNodeConfig`. This API takes specific parameters for your Orbit chain and returns a JSON file that can be used as the Node Config to initiate the chain.

Here’s an example of using the `prepareNodeConfig` API to generate the node config:

```bash
const nodeConfig = prepareNodeConfig({
  chainName: 'My Orbit Chain',
  chainConfig,
  coreContracts,
  batchPosterPrivateKey: 'BATCH_POSTER_PRIVATE_KEY_HERE',
  validatorPrivateKey: 'VALIDATOR_PRIVATE_KEY_HERE',
  parentChainId: parentChain_chain_id,
  parentChainRpcUrl: parentChain_RPC_URL,
});
```

The parameters required for the `prepareNodeConfig` API are:

1. **chainName**: The name you have chosen for your Orbit chain.
2. **chainConfig**: This is the configuration used for chain deployment, detailed in the Rollup Orbit Deployment section ('#'). It is obtained during the deployment process using the `createRollupPrepareTransactionReceipt` API.
3. **coreContracts**: The addresses of the core contracts of your newly deployed Orbit chain, which are also obtained from the `createRollupPrepareTransactionReceipt` API.
4. **batchPosterPrivateKey**: The private key of the batch-poster account, used for signing batch-posting transactions and related functions.
5. **validatorPrivateKey**: The private key of the validator or validators, used for validating state and posting Rollup Blocks (RBlocks) to the parent chain, and initiating challenges if necessary.
6. **parentChainId**: The chain ID of the parent chain where your Orbit chain is deployed.
7. **parentChainRpcUrl**: The RPC URL of the parent chain.

In case you do not have the `chainConfig` and `coreContracts` readily available, you can obtain them using the `createRollupPrepareTransaction` and `createRollupPrepareTransactionReceipt` APIs. Here's an example of how to extract `chainConfig` and `coreContracts` using just the transaction hash from your deployment:

```bash
import {
  ChainConfig,
  createRollupPrepareTransaction,
  createRollupPrepareTransactionReceipt
} from '@arbitrum/orbit-sdk';

const tx = createRollupPrepareTransaction({ hash: txHash });
const txReceipt = createRollupPrepareTransactionReceipt({ hash: txHash });
const chainConfig: ChainConfig = JSON.parse(tx.getInputs()[0].config.chainConfig);
const coreContracts = txReceipt.getCoreContracts();
```

This process ensures that all necessary configurations and contract details are included in your Node Config, paving the way for a successful initiation and operation of your Orbit chain.