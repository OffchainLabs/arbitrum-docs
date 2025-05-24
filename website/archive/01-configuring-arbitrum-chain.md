---
title: 'How to configure your Arbitrum chain using the Arbitrum chain (Orbit) SDK'
sidebar_label: 'Configure your chain'
description: 'How to configure an Arbitrum chain using the Arbitrum chain (Orbit) SDK '
author: GreatSoshiant
sme: GreatSoshiant
target_audience: 'Developers deploying and maintaining Arbitrum chains.'
sidebar_position: 6
user_story: As a current or prospective Arbitrum chain deployer, I need to understand how to configure an Arbitrum chain using the Arbitrum chain (Orbit) SDK.
content_type: how-to
---

In this how-to, you'll learn how to configure your Arbitrum chain using the Arbitrum chain (Orbit) SDK.

:::caution UNDER CONSTRUCTION

This document is under construction and may change significantly as we incorporate [style guidance](/for-devs/contribute#document-type-conventions) and feedback from readers. Feel free to request specific clarifications by clicking the `Request an update` button at the top of this document.

:::

Arbitrum chains have three areas of configuration:

1. [<a data-quicklook-from="parent-chain">Parent chain</a> configuration](#1-parent-chain-configuration)
2. [ **Node** configuration ](#2-node-configuration)
3. [ <a data-quicklook-from="child-chain">Child chain</a> configuration ](#3-child-chain-parameter-configuration)

## 1. Parent chain configuration

Configuring the parent chain is the initial step to setting up your Arbitrum chain. Most of the parent chain configurations are specified during the setup phase. Detailed instructions can be found in the [Rollup Deployment Parameters](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/02-deploying-rollup-chain.md) section of the Rollup deployment guide.

After the initial setup, the chain owner can modify configurations as needed. For instance, the validator set can be updated by invoking the [`setValidKeyset`](https://github.com/OffchainLabs/nitro-contracts/blob/90037b996509312ef1addb3f9352457b8a99d6a6/src/bridge/SequencerInbox.sol#L751) function with a new set of validators. This adaptability facilitates your chain's optimization and management.

## 2. Node configuration

As a chain deployer, you can configure a node during the node config generation process with the `nodeConfig.json` file. `nodeConfig.json` allows you to set up a node as a validator or a sequencer and specify requirements or performance criteria. For more information, refer to the [Node Configuration Preparation](/launch-arbitrum-chain/how-tos/arbitrum-chain-sdk-preparing-node-config.md) documentation.

## 3. Child chain parameter configuration

The child chain configuration can be performed after the chain has been initialized and the token bridge has been deployed. Child chains' parameters are configurable via setter functions in the [`ArbOwner precompile`](https://github.com/OffchainLabs/nitro-contracts/blob/main/src/precompiles/ArbOwner.sol). Additionally, there are various getter functions in the `ArbOwner precompile` that you can use to read the current configuration.

Below, we explain several methods in the `ArbOwner precompile` that you can use to configure the parameters or read their current state.

### Setter functions

You can use these setter functions to configure the child chain parameters:

| Parameter              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addChainOwner`        | Adds a new chain owner to your Arbitrum chain.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `removeChainOwner`     | Removes an existing owner from the list of chain owners.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `setMinimumL2BaseFee`  | Sets the minimum base fee on the child chain. The minimum base fee is the lowest amount that the base fee on the child chain can ever be. For example, the current minimum base fee on Arbitrum One and Arbitrum Nova is 0.01 `gwei`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `setSpeedLimit`        | The fee mechanism on the Arbitrum Nitro stack differs from the Ethereum blockchain. The Nitro stack has a parameter called the speed limit, which targets the number of gas consumed on the child chain per second. If the amount of gas per second exceeds this pre-specified amount, the base fee on the child chain will increase, and vice versa. The current speed limit on Arbitrum One is 7 million gas per second, meaning if the Arbitrum One chain consumes more than seven million gas per second, its base fee will increase. For more information on the speed limit, please refer to this [document explaining the concept of speed limit in the Nitro stack](https://docs.arbitrum.io/inside-arbitrum-nitro/#the-speed-limit). |
| `setInfraFeeAccount`   | Sets the infrastructure fee account address, which receives all fees collected on the child chain. It is meant to receive the minimum base fee, with any amount above that going to the network fee account.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `setNetworkFeeAccount` | Sets the network fee account address. As mentioned, this address collects all fees above the base fee. Note that if you set this amount to the 0 address on your chain, all fees will be deposited into the infrastructure fee account.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `scheduleArbOSUpgrade` | If you plan to upgrade the <a data-quicklook-from="arbos">ArbOS</a> version of your chain, this method can help you schedule the upgrade. For a complete guide, please refer to the explanation for the [arbos upgrade](/launch-arbitrum-chain/02-configure-your-chain/common-configurations/13-arbos-upgrade.mdx).                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `setChainConfig`       | We discussed the `chainConfig` in the [Rollup deployment guide](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/02-deploying-rollup-chain.md) in detail. If you wish to change any field of the `chainConfig`, you need to use this method on the child chain.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

### Getter functions

| Parameter              | Description                                                            |
| :--------------------- | :--------------------------------------------------------------------- |
| `getAllChainOwners`    | Provides the list of all current chain owners.                         |
| `isChainOwner`         | Allows you to check whether an address is on the list of chain owners. |
| `getInfraFeeAccount`   | Returns the infrastructure fee account address.                        |
| `getNetworkFeeAccount` | Returns the network fee account address.                               |

### Configuring the child chain using the Arbitrum chain (Orbit) SDK

In the Arbitrum chain (Orbit) SDK, we use the [Client Extension](https://viem.sh/docs/clients/custom#extending-with-actions-or-configuration) feature of Viem to extend the public client. In the Arbitrum chain (Orbit) SDK, we defined `arbOwnerPublicActions` to use it and extend the client on [Viem](https://viem.sh/docs/clients/custom#extending-with-actions-or-configuration). An example of creating a public client extended with `arbOwner` public actions is:

```js
import { createPublicClient, http } from 'viem';
import { arbOwnerPublicActions } from '@arbitrum/orbit-sdk';

const client = createPublicClient({
  chain: arbitrumLocal,
  transport: http(),
}).extend(arbOwnerPublicActions);
```

With `arbOwnerPublicActions` and the public client in the Arbitrum chain (Orbit) SDK, we've added two new methods to the public clients:

#### 1. `arbOwnerReadContract`

This method can be used to read the parameters of the child chain discussed in the [previous section](#getter-functions). An example of using this method with the `client` defined in the previous section is:

```js
const result = await client.arbOwnerReadContract({
  functionName: 'getAllChainOwners',
});
```

The other parameters can be obtained by changing the function names in the [the Getter functions section](#getter-functions) list.

#### 2. `arbOwnerPrepareTransactionRequest`

This method can be used to configure the parameters on the `ArbOwner` precompile, which are listed in [the Setter functions section](#setter-functions). An example of utilizing this method to configure parameters using the `client` defined in the previous section is:

```js
// Adding a random address as chain owner using the upgrade executor
const transactionRequest = await client.arbOwnerPrepareTransactionRequest({
  functionName: 'addChainOwner',
  args: [randomAccountAddress],
  upgradeExecutor: false,
  account: owner.address,
});

// Submitting the transaction to add a chain owner
await client.sendRawTransaction({
  serializedTransaction: await owner.signTransaction(transactionRequest),
});
```

To use this method, as shown in the example above, some inputs need to be defined:

| Parameter         | Description                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `functionName`    | The name of the method you want to use to set the parameter, which can be found in [the Setter functions section](#setter-functions).                               |
| `args`            | The arguments for the defined function.                                                                                                                             |
| `upgradeExecutor` | Specifies whether a `upgradeExecutor` contract governs your chain. If it is not using a `upgradeExecutor`, you can set it to `false`, similar to the example above. |
| `account`         | Defines the chain owner if an `upgradeExecutor` does not govern the chain.                                                                                          |

If a `upgradeExecutor` contract governs your chain, then you need to use the `arbOwnerPrepareTransactionRequest` method, similar to the example below:

```js
// Adding a random address as chain owner using the upgrade executor
const transactionRequest = await client.arbOwnerPrepareTransactionRequest({
  functionName: 'addChainOwner',
  args: [randomAccountAddress],
  upgradeExecutor: upgradeExecutorAddress,
  account: owner.address,
});

// Submitting the transaction to add a chain owner
await client.sendRawTransaction({
  serializedTransaction: await owner.signTransaction(transactionRequest),
});
```

In this example, all the fields are the same as in the first example, except the `upgradeExecutor` field, which you need to set to the `upgradeExecutor` address, and the `account` parameter, which needs to be set to the owner of the `upgradeExecutor` contract.
