---
title: "How to configure your Orbit chain's node using the Orbit SDK"
sidebar_label: "Configure your chain's node"
description: 'How to configure a node using the Orbit SDK'
author: GreatSoshiant
sme: GreatSoshiant
target_audience: 'Developers deploying and maintaining Orbit chains.'
user_story: As a current or prospective Orbit chain deployer, I need to understand how to configure a node using the Orbit SDK.
content_type: how-to
---

This guide will walk you through configuring an Orbit node supporting a <a data-quicklook-from="arbitrum-rollup-chain">Rollup</a> or <a data-quicklook-from="arbitrum-anytrust-chain">AnyTrust</a> chain.

:::caution UNDER CONSTRUCTION

This document is under construction and may change significantly as we incorporate [style guidance](/for-devs/contribute#document-type-conventions) and feedback from readers. Feel free to request specific clarifications by clicking the **Request an update** button at the top of this document.

:::

:::info

See the ["prepare-node-config" example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/tree/main/examples/prepare-node-config) in the Orbit SDK repository for additional guidance.

:::

- Prerequisite: having deployed an Orbit chain. If you haven't done so yet, you can find detailed instructions in the [Rollup Deployment Parameters](/launch-orbit-chain/03-deploy-an-orbit-chain/02-deploying-rollup-chain.md) section of the rollup deployment guide.

Once you have successfully deployed and initialized the Orbit core contracts, the next step is configuring and running your Orbit chain using a Node Config `JSON` file describing all the configurations for the Arbitrum Node, including settings for the Batch-poster, Validator, and the chain itself.

Example for a Rollup Orbit Chain:

```js
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

Here are some inputs details from the example above:

| Parameters     | Description                                                                   |
| :------------- | :---------------------------------------------------------------------------- |
| `chain`        | Details about the hosted chain, including chain ID, name, and core contracts. |
| `parent-chain` | Information for connecting to the parent chain.                               |
| `http`         | Configuration parameters for the HTTP server.                                 |
| `node`         | Specific node settings, including sequencer and batch-poster configurations.  |

### Additional configuration for AnyTrust Orbit chains:

For AnyTrust Orbit chains, the Node Config `JSON` has an additional segment under the `node` field. This addition includes settings specific to the AnyTrust model, such as:

- Sequencer's inbox address
- Parent chain node URL
- RPC aggregators

Example addition for AnyTrust Node Config:

```js
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

### Preparing your node config file

The Node Config file includes three fields types:

1. **Information from the Orbit deployment chain**: Such as the addresses of the core contracts.
2. **Parameters configurable by the chain deployer**: These parameters, like `max-block-speed`, can be adjusted to modify your chain's behavior.
3. **Fields not typically configured**: Like the HTTP section, which usually remains standard.

Let's explore the parameters allowing you to set up a stable, and secure Orbit chain tailored to your project's requirements:

### Node config generation with Orbit SDK

Generating a Node Config `JSON` file to initiate your Orbit chain is a step in the deployment process. The Orbit SDK simplifies this task with an API named `prepareNodeConfig`. This API takes specific parameters for your Orbit chain and returns a `JSON` file that can be used as the Node Config to initiate the chain.

Here’s an example of using the `prepareNodeConfig` API to generate the node config:

```js
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

Here are some details about the parameters used in the example above:

| Parameters                | Description                                                                                                                                                                                                                                                                                                             |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chainName`               | The name you have chosen for your Orbit chain.                                                                                                                                                                                                                                                                          |
| `chainConfig`             | Configuration used for [chain deployment](/launch-orbit-chain/03-deploy-an-orbit-chain/02-deploying-rollup-chain.md), returned from the [createRollupPrepareTransactionReceipt](/launch-orbit-chain/03-deploy-an-orbit-chain/02-deploying-rollup-chain.md) API. |
| `coreContracts`           | Addresses of your newly deployed Orbit chain's, also returned from the `createRollupPrepareTransactionReceipt` API.                                                                                                                                                                                                     |
| `batchPosterPrivateKey  ` | Private key of the batch-poster account, used for signing batch-posting transactions and related functions.                                                                                                                                                                                                             |
| `validatorPrivateKey`     | Private key of the validator(s), used for validating state, posting assertions (`RBlocks`) to the parent chain, and initiating challenges if necessary.                                                                                                                                                                 |
| `parentChainId`           | Chain ID of the parent chain where your Orbit chain is deployed.                                                                                                                                                                                                                                                        |
| `parentChainRpcUrl`       | Parent chain's RPC URL.                                                                                                                                                                                                                                                                                                 |

If you don't have the `chainConfig` and `coreContracts` readily available, you can obtain them using the `createRollupPrepareTransaction` and `createRollupPrepareTransactionReceipt` APIs.

Here's an example of how to extract `chainConfig` and `coreContracts` using just the transaction hash from your deployment:

```js
import {
  ChainConfig,
  createRollupPrepareTransaction,
  createRollupPrepareTransactionReceipt,
} from '@arbitrum/orbit-sdk';

const tx = createRollupPrepareTransaction({ hash: txHash });
const txReceipt = createRollupPrepareTransactionReceipt({ hash: txHash });
const chainConfig: ChainConfig = JSON.parse(tx.getInputs()[0].config.chainConfig);
const coreContracts = txReceipt.getCoreContracts();
```

This process ensures that all necessary configurations and contract details are included in your Node Config.
