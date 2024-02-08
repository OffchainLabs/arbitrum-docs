---
title: 'How to upgrade ArbOS on your Orbit chain'
sidebar_label: 'ArbOS upgrade'
description: 'Learn how to upgrade ArbOS on your Orbit chain.'
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers maintaining Orbit chains.'
sidebar_position: 3
---

This how-to provides step-by-step instructions for Orbit chain operators who want to upgrade ArbOS on their Orbit chain(s). Familiarity with ArbOS, Orbit, and [chain ownership](../concepts/chain-ownership.md) is expected.






#### Step 1: Update Nitro on nodes and validators


First, update your validator nodes to the latest Nitro version compatible with the version of ArbOS that you're upgrading to.

All remaining orbit nodes must be upgraded prior to activating the new ArbOS version, specifically before the **deadline** established for the ArbOS update (timestamp set in the ArbOS update schedule). 

For example, if your upgrade targets ArbOS 11, you should look for node version `v2.2.2`. The Docker image to use for this version is `offchainlabs/nitro-node:v2.2.2-8f33fea`.

#### Step 2: Upgrade the Wasm module root

The `WASM module root` is a 32-byte hash, created from the Merkelized Go replay binary and its dependencies. When ArbOS is upgraded, a new Wasm module root is generated due to modifications in the State Transition Function. This new Wasm module root must be set in the rollup contract on the parent chain. To set the new Wasm module root, use the `Rollup proxy` contract's [setWasmModuleRoot](https://github.com/OffchainLabs/nitro-contracts/blob/38a70a5e14f8b52478eb5db08e7551a82ced14fe/src/rollup/RollupAdminLogic.sol#L321) method.

Note that the `upgrade executor` contract on the parent chain is the designated owner of the rollup contract, so the **chain owner account** needs to initiate a call to the `upgrade executor` contract in order to perform the upgrade. This call should include the correct calldata for setting the new Wasm module root. For example, the Wasm module root for ArbOS 11 is `0xf4389b835497a910d7ba3ebfb77aa93da985634f3c052de1290360635be40c4a`. 
:::tip Backward compatibility
Wasm module roots are backward compatible, so upgrading them before an ArbOS version upgrade will not disrupt your chain's functionality.
:::

#### Step 3: Schedule the ArbOS version upgrade

To schedule an ArbOS version upgrade, call the [`scheduleArbOSUpgrade`](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/precompiles/ArbOwner.sol#L61) function on the `ArbOwner` precompile of the Orbit chain(s) you're upgrading. This function requires two inputs:
1. **`newVersion`**: Specify the ArbOS version you wish to upgrade to.
2. **`timestamp`**: Set the exact Unix timestamp at which you want your Orbit chain to transition to the new ArbOS version.

Because this is an administrative action (similar to upgrading your Wasm module root), the **chain owner account** must call the target chain's `upgrade executor` contract with the appropriate calldata in order to invoke the `scheduleArbOSUpgrade` function of the ArbOwner precompile. This will schedule the ArbOS upgrade using the specified version and timestamp. 
:::tip Immediate upgrades
To upgrade immediately (without scheduling), set the timestamp to `0`.
:::

Congratulations! You've upgraded your Orbit chain(s) to the specified ArbOS version.