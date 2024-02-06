---
title: 'How to upgrade ArbOS on your Orbit chain'
sidebar_label: 'ArbOS upgrade'
description: 'Overview of steps to upgrade arb os on an orbit chain.'
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers maintaining Orbit chains.'
sidebar_position: 3
---

In this how-to, you'll discover how to upgrade ArbOS on your Orbit chain. This walkthrough assumes you have a basic understanding of ArbOS, Orbit chains, and smart contract operations. This step-by-step guide is designed to navigate you through the process, from the initial wasm module root upgrade to the final node update, ensuring a successful upgrade of the new ArbOS version.

### ArbOS
ArbOS functions as a vital element in Arbitrum Nitro stack, acting as the connecting framework within the State Transition Function. It delivers key services for Arbitrum systems, including inter-chain communication, management of resources and Arbitrum Nitro specific fee structures, as well as overseeing chain operations.

### ArbOS upgrade
Similar to other software, ArbOS may undergo periodic upgrades to introduce new features or modify existing ones. In the event of an upgrade, owners of Orbit chains have the discretion to either update their chain and ArbOS version to the latest, benefiting from new features, or maintain their current setup.

The process of upgrading ArbOS on an Orbit chain involves specific steps, which are outlined in the following section.

Before delving into the steps for upgrading, it's important to understand the concept of chain ownership and the methods through which a chain owner can upgrade their chain. These topics are comprehensively covered in the [Chain Ownership](../concepts/chain-ownership.md) section of the documentation.

To upgrade ArbOS on an Orbit chain, follow these steps:

#### Step 1: Update Nodes and Validators

To ensure compatibility with the new ArbOS version, the Orbit chain's nodes need an upgrade. 

**Validators** should be the first to receive this update. It's crucial to upgrade the software on validator nodes to the latest Nitro version supporting the new ArbOS before proceeding to set a new Wasm Module Root (step 2). Chain owners should prioritize this to ensure their validators are equipped with the necessary updates.

All remaining orbit nodes must be upgraded prior to activating the new ArbOS version, specifically before the **deadline** established for the ArbOS update (timestamp set in the ArbOS update schedule). 

For example, if your upgrade targets ArbOS 11, you should look for node version `v2.2.2`. The Docker image to use for this version is `offchainlabs/nitro-node:v2.2.2-8f33fea`. Completing this step guarantees that your nodes are prepared and will function smoothly with the ArbOS update.

#### Step 2: Wasm Module Root Upgrade

The `WASM module root` is a 32-byte hash, created from the Merkelized Go replay binary and its dependencies. When ArbOS is upgraded, a new Wasm module root is generated due to modifications in the State Transition Function. This new wasm module root must be set in the rollup contract on the parent chain. To implement the upgrade, you should utilize the [setWasmModuleRoot](https://github.com/OffchainLabs/nitro-contracts/blob/38a70a5e14f8b52478eb5db08e7551a82ced14fe/src/rollup/RollupAdminLogic.sol#L321) method by calling the `Rollup proxy` contract. As the `upgrade executor` contract on the parent chain is the designated owner of the rollup contract, it is necessary for the **chain owner account** to initiate a call to the upgrade executor. This call should include the correct calldata for setting the new wasm module root through the setWasmModuleRoot function within the rollup contract. For example, the wasm module root for ArbOS 11 is `0xf4389b835497a910d7ba3ebfb77aa93da985634f3c052de1290360635be40c4a`. 
**Note** that wasm module roots are backward compatible, meaning upgrading it prior to an ArbOS version upgrade won't disrupt the system.

#### Step 3: Schedule ArbOS version Upgrade

To update the ArbOS version, you must schedule an upgrade on the Orbit chain. This is done by calling the [scheduleArbOSUpgrade](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/precompiles/ArbOwner.sol#L61) function on the ArbOwner precompile of the Orbit chain. This function requires two inputs:
1. **newVersion**: Specify the ArbOS version you wish to upgrade to.
2. **timestamp**: Set the exact timestamp at which you want your Orbit chain to transition to the new ArbOS version.

As with the parent chain, performing **admin actions** on the orbit chain necessitates using the `upgrade executor` contract on the orbit chain. The **chain owner account** must execute a call to the upgrade executor with the appropriate calldata, to invoke the `scheduleArbOSUpgrade` function of the ArbOwner precompile, thereby setting the new ArbOS version and the desired timestamp for the upgrade. 
**Note** that setting timestamp to `0` causes the upgrade to activate immediately.

By following these three steps, your chain will be successfully upgraded and start using the new ArbOS version after reaching the `timestamp` you specified in step 2. This process ensures a seamless transition to the latest functionalities and improvements of ArbOS.