---
title: 'Arbitrum Orbit SDK'
sidebar_label: 'Orbit SDK'
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