---
title: 'ArbOS upgrade on orbit chains'
sidebar_label: 'ArbOS upgrade'
description: 'Overview of steps to upgrade arb os on an orbit chain.'
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers maintaining Orbit chains.'
sidebar_position: 3
---

### ArbOS
ArbOS functions as a vital element in Arbitrum Nitro stack, acting as the connecting framework within the State Transition Function. It delivers key services for Arbitrum systems, including inter-chain communication, management of resources and Arbitrum Nitro specific fee structures, as well as overseeing chain operations.

### ArbOS upgrade
Like any other piece of software, ArbOS could experience upgrades during the time to add a new feature or modify the current features.
In the case that ArbOS experiences an upgrade, any Orbit chain owner can decide whether to upgrade their chain and the ArbOS version to the latest and take advantage of new features or keep it as is.

To upgrade ArbOS on an orbit chain, chain owner needs to take some steps which will be discussed below.

Before explaining the steps, we need to discuss chain ownership and how the chain owner can upgrade their chain. It is discussed in detail on [Chain Ownership](chain-ownership.md) page of the docs.

The steps to upgrade ArbOS on an orbit chain would be as below:

1. **Wasm module root upgrade**: `WASM module root` is represented by a 32-byte hash, derived from the Merkelized version of the Go replay binary and its associated dependencies.
So in case of ArbOS upgrade, new Wasm module root is be generated because the State transition function is being modified.
So we need to set the new wasm module root on rollup contract on the parent chain. To set the new wasm module root, you need to call [setWasmModuleRoot](https://github.com/OffchainLabs/nitro-contracts/blob/38a70a5e14f8b52478eb5db08e7551a82ced14fe/src/rollup/RollupAdminLogic.sol#L321) method of rollup proxy contract, via owner contract. 
Because the owner of the rollup contract is `upgrade executer` contract on the parent chain, **chain owner account** need to call upgrade executor with proper calldata to call setWasmModuleRoot function of rollup contract and set the new wasm module root.
For instance, the wasm module root for ArbOS 11 is:
`0xf4389b835497a910d7ba3ebfb77aa93da985634f3c052de1290360635be40c4a`
**Note** that wasm module roots are backward compatible so upgrading it before an upgrade would not break the system.

2. **Schedule ArbOS Upgrade**: To upgrade ArbOS version, you need to schedule the chain upgrade on the child chain (orbit chain). In order to do that, you need to call [scheduleArbOSUpgrade](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/precompiles/ArbOwner.sol#L61) function on ArbOwner precompile of the orbit chain. This function has two inputs:
   1. **newVersion**: The version of ArbOS you want to upgrade to. 
   2. **timestamp**: The desired timestamp in which you want your orbit chain to upgrade to the new the ArbOS.
   
   Similar to parent chain, in order to do **admin actions** on the orbit chain, you need to call the methods through `upgrade executer` contract on the child chain. **chain owner account** need to call upgrade executor with proper calldata to call scheduleArbOSUpgrade function of ArbOwner precompile and set new ArbOS version and the desired timestamp for the update.
3. **update Arb node**: The last action for ArbOS upgrade is to update your orbit chain nodes into the node version in which the new ArbOS version is supported. It should be done after steps **1** and **2** and before the timestamp you set for ArbOS upgrade.
For instance, the node version for ArbOS 11 is `v2.2.2` and the docker image for the node is `offchainlabs/nitro-node:v2.2.2-8f33fea`


With these three steps, your chain would be upgraded and use the new ArbOS version after the proposed `timestamp` set on step 2.