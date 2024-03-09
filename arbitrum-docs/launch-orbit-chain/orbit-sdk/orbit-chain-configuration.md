---
title: 'Arbitrum Orbit SDK'
sidebar_label: 'Orbit Chain Configuration'
description: 'Arbitrum SDK '
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 6
---
In this guide, we will explore the essentials of configuring your Orbit chain. Configuration includes a range of settings from the parent chain, node configuration, to specific child chain parameter configurations. Our focus here is on child chain configuration, guiding you through the necessary adjustments to customize your chain's operation.

### Orbit Chain Configuration Guide

In the introductory section, we outlined three primary configurations necessary for setting up and managing an Orbit chain. These configurations play a crucial role in ensuring the efficient operation of your chain. Let's delve into each type:

**1. Parent Chain Configuration:**
Configuring the parent chain is an essential initial step in setting up your Orbit chain. Most of these configurations are specified during the setup phase. Detailed instructions can be found in the [Rollup Deployment Parameters](deployment-rollup.md#rollup-deployment-parameter) section of the rollup deployment guide. 

After the initial setup, the chain owner has the flexibility to modify configurations as needed. For instance, the validator set can be updated by invoking the [setValidKeyset](https://github.com/OffchainLabs/nitro-contracts/blob/90037b996509312ef1addb3f9352457b8a99d6a6/src/bridge/SequencerInbox.sol#L751) function with a new set of validators. This adaptability facilitates continuous optimization and management of the chain.

**2. Node/Chain Configuration:**
This category includes settings adjustable within the `nodeConfig.json` file, directly impacting the operation of the nodes of the chain, including special nodes like validators and sequencers. These settings are vital for tailoring the node's functionality to specific requirements or performance criteria. The chain owner can modify these configurations during the node config generation process, ensuring that each node operates with the desired settings from the start. For more information, refer to the [Node Configuration Preparation](node-config-preparation.md) documentation.

**3. Child Chain Parameter Configuration:**
The final configuration type involves setting parameters on the child chain. This level of configuration is primarily achieved through the [ArbOwner precompile](https://github.com/OffchainLabs/nitro-contracts/blob/main/src/precompiles/ArbOwner.sol) on the child chain. These configurations are typically applied post-chain initialization and after the deployment of the token bridge. This guide will help you configure child chain parameters using the Orbit SDK, providing insights into effective management and optimization strategies for your child chain operations.

<h3 id="child-chain-config">Child Chain Configuration</h3>

As previously mentioned, child chain configuration can be performed after the chain initialization. These parameters are configurable via setter functions in the [ArbOwner precompile](https://github.com/OffchainLabs/nitro-contracts/blob/main/src/precompiles/ArbOwner.sol). Additionally, there are various getter functions in the ArbOwner precompile that you can use to read the current configuration. Below, we explain several methods in the ArbOwner precompile that you can use to configure the parameters or read their current state.

<h5 id="setter-functions">Setter Functions</h5>
You can use these setter functions to configure the child chain parameters:

- **addChainOwner:** This method allows you to add a new chain owner to your Orbit chain.
- **removeChainOwner:** This method enables you to remove an existing owner from the list of chain owners.
- **setMinimumL2BaseFee:** This method sets the minimum base fee on the child chain. The minimum base fee is the lowest amount that the base fee on the child chain can ever be. For example, the current minimum base fee on Arbitrum One is 0.1 gwei, and on Arbitrum Nova, it is 0.01 gwei.
- **setSpeedLimit:** The fee mechanism on the Arbitrum Nitro stack differs from the Ethereum blockchain. On the Nitro stack, there is a parameter called the speed limit, which targets the number of gas consumed on the child chain per second. If the amount of gas per second exceeds this pre-specified amount, the base fee on the child chain will increase, and vice versa. The current speed limit on Arbitrum One is 7 million gas per second, meaning if the Arbitrum One chain consumes more than 7 million gas per second, its base fee will increase. For more information on the speed limit, please refer to this [document](https://docs.arbitrum.io/inside-arbitrum-nitro/#the-speed-limit).
- **setInfraFeeAccount:** This method sets the infrastructure fee account address, which receives all fees collected on the child chain. It is meant to receive the minimum base fee, with any amount above that going to the network fee account.
- **setNetworkFeeAccount:** This method sets the network fee account address. As mentioned, this address collects all fees above the base fee. Note that if you set this amount to the 0 address on your chain, then all fees will be deposited into the infrastructure fee account.
- **scheduleArbOSUpgrade:** If you plan to upgrade the ArbOS version of your chain, this method can help you schedule the upgrade. For a complete guide on this matter, please refer to this [document](../how-tos/arbos-upgrade.md).
- **setChainConfig:** We discussed the chainConfig in this [section](deployment-rollup.md#chain-config-parameter) in detail. If you wish to change any field of the chainConfig, you need to use this method on the child chain.

<h5 id="getter-functions">Getter Functions</h5>

To read the child chain parameters, you can use these getter functions:

- **getAllChainOwners:** This method provides the list of all current chain owners.
- **getNetworkFeeAccount:** This method returns the network fee account address.
- **getInfraFeeAccount:** This method returns the infrastructure fee account address.
- **isChainOwner:** This method allows you to check whether an address is on the list of chain owners.

### Configuring the Child Chain Using the Orbit SDK

In the Orbit SDK, we use the [Client Extension](https://viem.sh/docs/clients/custom#extending-with-actions-or-configuration) feature of Viem to extend the public client. In the Orbit SDK, we defined `arbOwnerPublicActions` to use it and extend the client on Viem. An example of creating a public client extended with arbOwner public actions is:

```bash
import { createPublicClient, http } from 'viem';
import { arbOwnerPublicActions } from '@arbitrum/orbit-sdk';

const client = createPublicClient({
  chain: arbitrumLocal,
  transport: http(),
}).extend(arbOwnerPublicActions);
```

With `arbOwnerPublicActions` and the public client in the Orbit SDK, we've added two new methods to the public clients:

**1. arbOwnerReadContract**: This method can be used to read the parameters of the child chain discussed in the [previous section](#getter-functions). An example of using this method with the `client` defined in the previous section is:

```bash
  const result = await client.arbOwnerReadContract({
    functionName: 'getAllChainOwners',
  });
```

**Note** that changing the function names in the list in this [section](#getter-functions) will give you the other parameters.

**2. arbOwnerPrepareTransactionRequest**: This method can be used to configure the parameters on the ArbOwner precompile and listed in this [section](#setter-functions). An example of utilizing this method to configure parameters using the `client` defined in the previous section is:

```bash
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

To use this method, as shown in the example above, some inputs need to be defined. `functionName` is the name of the method you want to use to set the parameter, which can be found in [this section](#setter-functions). `args` are the arguments for the defined function. The `upgradeExecutor` field defines if your chain is governed by an **upgradeExecutor** contract or not. If it is not using an upgradeExecutor, you can set it to `false`, similar to the example above. Also, the `account` field defines the chain owner in case the chain is not governed by an upgradeExecutor.

If your chain is governed by an `upgradeExecutor` contract, then you need to use the **arbOwnerPrepareTransactionRequest** method, similar to the example below:

```bash
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

In this example, all the fields are the same as in the first example, except the `upgradeExecutor` field, which you need to set to the **upgradeExecutor address**, and the `account` parameter, which needs to be set to the owner of the upgradeExecutor contract.

