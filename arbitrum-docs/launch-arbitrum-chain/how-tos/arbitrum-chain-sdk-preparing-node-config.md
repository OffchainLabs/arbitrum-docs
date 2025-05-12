---
title: "How to configure your Arbitrum chain's node using the Arbitrum chain (Orbit) SDK"
description: 'Learn how to configure a node using the Arbitrum chain (Orbit) SDK'
author: GreatSoshiant, jose-franco
sme: GreatSoshiant, jose-franco
target_audience: 'Developers deploying and maintaining Arbitrum chains.'
user_story: As a current or prospective Arbitrum chain deployer, I need to understand how to configure a node using the Arbitrum chain (Orbit) SDK.
content_type: how-to
---

import RaaSNotice from '../partials/_raas-providers-notice.mdx';

<RaaSNotice />

Once you have successfully deployed and initialized the Arbitrum chain core contracts, the next step is to configure and run an Arbitrum <a data-quicklook-from="arbitrum-nitro">Nitro</a> node for your chain. You configure a Nitro node using a `JSON` file describing all the parameters for the node, including settings for the batch poster, validator, and the chain itself. See the [Overview](/launch-arbitrum-chain/arbitrum-chain-sdk-introduction.md) for an introduction to creating and configuring an Arbitrum chain.

Before reading this guide, we recommend that you're familiar with the general process for creating new chains explained in the introduction and the first section of [How to deploy a Rollup chain](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/02-deploying-rollup-chain.md).

## Structure of a Nitro node configuration JSON object

When starting up the node, a Nitro node reads its configuration from a JSON object, usually provided in a file. This object has the following structure:

```typescript
{
  "chain": {
    "info-json": "[{...}]",
    "name": "MyArbitrumChain",
  },
  "parent-chain": {
    "connection": {
      "url": "http://parentChainRpcUrl",
    },
  },
  "http": {
    "addr": "0.0.0.0",
    "port": 8449,
    "vhosts": "*",
    "corsdomain": "*",
    "api": ["eth", "net", "web3", "arb", "debug"],
  },
  "node": {
    // Node specific settings including sequencer, batch-poster and validator
  },
  "execution": {
    // Execution-client specific settings
  }
};
```

The following table briefly describes the type of parameters that can be configured in each root property:

| Property       | Description                                                                          |
| :------------- | :----------------------------------------------------------------------------------- |
| `chain`        | Information about the chain, including the chain ID, its name, and the chain config. |
| `parent-chain` | Information for accessing the parent chain.                                          |
| `http`         | Configuration parameters for the HTTP server.                                        |
| `node`         | Node settings, including sequencer, batch-poster and validator if enabled.           |
| `execution`    | Execution settings, including archive mode and block production parameters.          |

### Additional configuration for Arbitrum AnyTrust chains:

For <a data-quicklook-from="arbitrum-anytrust-chain">Arbitrum AnyTrust chains</a>, the Nitro node configuration object has an additional segment under the `node` field to configure the AnyTrust specific properties:

```typescript
{
  ...
  "node": {
    ...
    "sequencer-inbox-address": "0xSequencerInbox",
    "parent-chain-node-url": "http://parentChainRpcUrl",
    "rest-aggregator": {
      "enable": true,
      "urls": "http://localhost:9876",
    },
    "rpc-aggregator": {
      "enable": true,
      "assumed-honest": 3,
      "backends": "[...]",
    },
  }
  ...
};
```

You can find information about what these parameters configure in [How to configure a DAC](/run-arbitrum-node/data-availability-committees/04-configure-dac.mdx).

## How to generate a node's configuration file using the Arbitrum chain (Orbit) SDK

Let's look at what methods to use for generating a configuration file for the Nitro node of your Arbitrum chain, using the Arbitrum chain (Orbit) SDK.

:::info Example script

The Arbitrum chain (Orbit) SDK includes an example script for generating a node configuration file. We recommend that you first understand the process described in this section and then check the [prepare-node-config](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/prepare-node-config/index.ts) script.

:::

### 1. Gather information from the deployed chain

To generate the configuration file for your node, you'll need the following information:

- Core contracts: you'll have to configure your node with all the core contracts created on deployment.
- Chain config: the same configuration used when deploying the chain must be passed to the node.
- Private keys of the accounts that will operate the chain, like the batch poster and the validator
- Any extra configuration desired for the sequencer, batch poster and validator, like batch posting frequency or maximum block speed.

### 2. Generate the node configuration object

The `prepareNodeConfig` method generates a JSON object with the configuration for the node. It sets the appropriate defaults for most parameters, allowing you to override any of these defaults.

Below is an example of how to use `prepareNodeConfig` to obtain the node configuration for an Arbitrum chain deployed on transaction `txHash` (**Note**: _This transaction hash is not strictly required; it's only for obtaining the core contracts and chain config to use in the node_):

```typescript
import { createPublicClient, http } from 'viem';
import {
  createRollupPrepareTransaction,
  createRollupPrepareTransactionReceipt,
  ChainConfig,
  prepareNodeConfig,
} from '@arbitrum/orbit-sdk';

const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(),
});

// get the transaction
const tx = createRollupPrepareTransaction(
  await parentChainPublicClient.getTransaction({ hash: txHash }),
);

// get the transaction receipt
const txReceipt = createRollupPrepareTransactionReceipt(
  await parentChainPublicClient.getTransactionReceipt({ hash: txHash }),
);

// get the chain config and core contracts
const config = tx.getInputs()[0].config;
const chainConfig: ChainConfig = JSON.parse(config.chainConfig);
const coreContracts = txReceipt.getCoreContracts();

const nodeConfig = prepareNodeConfig({
  chainName: 'MyArbitrumChain',
  chainConfig,
  coreContracts,
  batchPosterPrivateKey,
  validatorPrivateKey,
  stakeToken: config.stakeToken,
  parentChainId: parentChain.id,
  parentChainRpcUrl: parentChain.rpcUrls.default.http[0],
});
```

Note that `prepareNodeConfig` will also generate the specific configuration for AnyTrust chains if it detects that the chain configuration includes the appropriate flag.

After generating the node configuration object, it can be saved to a file for later use by the Nitro node.

### 3. Next step

You can now run the Nitro node for your Arbitrum chain with the node configuration generated. You can find instructions for running a node in [How to run a full node](/run-arbitrum-node/03-run-full-node.mdx).
