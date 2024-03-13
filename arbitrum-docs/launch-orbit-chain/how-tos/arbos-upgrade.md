---
title: 'How to upgrade ArbOS on your Orbit chain'
sidebar_label: 'Upgrade ArbOS'
description: 'Learn how to upgrade ArbOS on your Orbit chain.'
author: greatsoshiant
sme: greatsoshiant
target_audience: 'Developers maintaining Orbit chains.'
sidebar_position: 3
---

This how-to provides step-by-step instructions for Orbit chain operators who want to upgrade ArbOS on their Orbit chain(s). Familiarity with ArbOS, Orbit, and [chain ownership](../concepts/chain-ownership.md) is expected. Note that Orbit chain owners have full discretion over when and whether to upgrade their ArbOS version.

The specific upgrade requirements for each ArbOS release are located under each reference page for that specific [ArbOS release](../../node-running/reference/arbos-software-releases/overview.mdx#list-of-available-arbos-releases).

import PublicPreviewBannerPartial from '../../node-running/partials/_upgrade-cadence-recommendations-partial.mdx';

<PublicPreviewBannerPartial />

#### Step 1: Update Nitro on nodes and validators

Refer to the [requirements for the targeted ArbOS release](../../node-running/reference/arbos-software-releases/overview.mdx) to identify the specific [Nitro release](https://github.com/OffchainLabs/nitro/releases/) that supports the ArbOS version that you're upgrading to. For example, if your upgrade targets ArbOS 20, you'd use Nitro `v2.3.1` (Docker image: `offchainlabs/nitro-node:v2.3.1-26fad6f`) or higher. This is the version of the Nitro stack that needs to be running on each of your Orbit chain's nodes. A list of [all Nitro releases can be found on Github](https://github.com/OffchainLabs/nitro/releases).

Begin by upgrading your validator node(s) to the specified Nitro version, then update each remaining Orbit node to match this version.

Note that upgrading your node version _must occur_ before the deadline established for the target ArbOS upgrade. Refer to the timestamp in the ArbOS upgrade schedule for a precise deadline.

#### Step 2: Upgrade the Wasm module root & your chain's Nitro contracts

While every ArbOS upgrade will require an update to the Wasm module root, not every ArbOS upgrade will require an upgrade to the chain's `nitro-contracts` version.
If necessary, as defined in the release notes for each ArbOS release, you may need to deploy new versions of some (or all) of the Nitro contracts to the parent chain of your Orbit chain. These contracts include the rollup logic, bridging logic, fraud proof contracts, and interfaces for interacting with Nitro precompiles.

To update the Wasm module root and deploy your chain's Nitro contracts to the parent chain for the most recent ArbOS release, you will need the following inputs (obtained from the [requirements for the targeted ArbOS release](../../node-running/reference/arbos-software-releases/overview.mdx)):

- The WASM module root, and if necessary,
- The required `nitro-contracts` version

Once you have the WASM module root and have identified the required `nitro-contracts` version, if any, [please follow the instructions in this guide](https://github.com/OffchainLabs/orbit-actions?tab=readme-ov-file#nitro-contracts-upgrades) for specific actions based on the `nitro-contracts` version you are deploying. Note that each ArbOS release will require performing this step with a different Wasm module root and may potentially require a different version of `nitro-contracts`. The guide linked above will be kept updated with the instructions for each specific ArbOS release.

The `WASM module root` is a 32-byte hash, created from the Merkelized Go replay binary and its dependencies. When ArbOS is upgraded, a new Wasm module root is generated due to modifications in the State Transition Function. This new Wasm module root must be set in the rollup contract on the parent chain. You can get the For example, the Wasm module root for ArbOS 20 Atlas is `0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4`.

To set the Wasm module root manually (i.e. not using the above guide), use the `Rollup proxy` contract's [setWasmModuleRoot](https://github.com/OffchainLabs/nitro-contracts/blob/38a70a5e14f8b52478eb5db08e7551a82ced14fe/src/rollup/RollupAdminLogic.sol#L321) method. Note that the `upgrade executor` contract on the parent chain is the designated owner of the rollup contract, so the **chain owner account** needs to initiate a call to the `upgrade executor` contract in order to perform the upgrade. This call should include the correct calldata for setting the new Wasm module root.

:::tip Backward compatibility

Wasm module roots are backward compatible, so upgrading them before an ArbOS version upgrade will not disrupt your chain's functionality.

:::

#### Step 3: Schedule the ArbOS version upgrade

To schedule an ArbOS version upgrade for your Orbit chain, [follow this guide](https://github.com/OffchainLabs/orbit-actions/tree/main/scripts/foundry/arbos-upgrades/at-timestamp). In addition to the upgrade action contract address and the account address for the chain owner account, you will need the following inputs:

1. **`newVersion`**: Specify the ArbOS version you wish to upgrade to (e.g. `20`).
2. **`timestamp`**: Set the exact Unix timestamp at which you want your Orbit chain to transition to the new ArbOS version.

If you would prefer to do this manually, simply call the [`scheduleArbOSUpgrade`](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/precompiles/ArbOwner.sol#L61) function on the `ArbOwner` precompile of the Orbit chain(s) you're upgrading. Because this is an administrative action (similar to upgrading your Wasm module root), the **chain owner account** must call the target chain's `upgrade executor` contract with the appropriate calldata in order to invoke the `scheduleArbOSUpgrade` function of the ArbOwner precompile. This will schedule the ArbOS upgrade using the specified version and timestamp.

:::tip Immediate upgrades

To upgrade immediately (without scheduling), set the timestamp to `0`.

:::

:::info Obtaining the current ArbOS version

You can obtain the current ArbOS version of your chain by calling `ArbSys.ArbOSVersion()`. Keep in mind that this function adds `55` to the current ArbOS version. For example, if your chain is running on ArbOS 10, calling this function will return `65`.

When scheduling the ArbOS upgrade through `ArbOwner.scheduleArbOSUpgrade` you must use the actual ArbOS version you're upgrading to. For example, if you're upgrading to ArbOS 11, you will pass `11` when calling this function.

:::

#### Step 4: Enable ArbOS specific configurations or feature flags (not always required)

For some ArbOS upgrades, such as [ArbOS 20 Atlas](../../node-running/reference/arbos-software-releases/arbos20.mdx), there may be additional requirements or steps that need to be satisified to ensure your Orbit chain can use all of the new features and improvements made available in that particular ArbOS release.

If there are additional requirements for the targeted ArbOS release you're attempting to upgrade to, the additional requirements will be listed on the reference pages for [the targeted ArbOS release](../../node-running/reference/arbos-software-releases/overview.mdx#list-of-available-arbos-releases). For example, the additional requirements for Orbit chains upgrading to ArbOS 20 can be found [here on the ArbOS 20 docs](../../node-running/reference/arbos-software-releases/arbos20.mdx#additional-requirements-for-arbitrum-orbit-chain-operators).

Congratulations! You've upgraded your Orbit chain(s) to the specified ArbOS version.
