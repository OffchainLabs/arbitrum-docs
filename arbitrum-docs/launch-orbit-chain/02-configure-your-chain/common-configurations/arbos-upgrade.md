---
title: 'How to upgrade ArbOS on your Orbit chain'
sidebar_label: 'Upgrade ArbOS'
description: 'Learn how to upgrade ArbOS on your Orbit chain.'
author: greatsoshiant
sme: greatsoshiant
target_audience: 'Developers maintaining Orbit chains.'
sidebar_position: 3
---

This how-to provides step-by-step instructions for Orbit chain operators who want to upgrade ArbOS on their Orbit chain(s). Familiarity with ArbOS, Orbit, and [chain ownership](/launch-orbit-chain/04-maintain-your-chain/03-ownership-structure-access-control.mdx) is expected. Note that Orbit chain owners have full discretion over when and whether to upgrade their ArbOS version.

The specific upgrade requirements for each ArbOS release are located under each reference page for that specific [ArbOS release](/run-arbitrum-node/arbos-releases/01-overview.mdx#list-of-available-arbos-releases).

#### Step 1: Update Nitro on nodes and validators

Refer to the [requirements for the targeted ArbOS release](/run-arbitrum-node/arbos-releases/01-overview.mdx) to identify the specific [Nitro release](https://github.com/OffchainLabs/nitro/releases/) that supports the ArbOS version that you're upgrading to. For example, if your upgrade targets ArbOS 20, you'd use Nitro `v2.3.1` (Docker image: `offchainlabs/nitro-node:v2.3.1-26fad6f`) or higher. This is the version of the Nitro stack that needs to be running on each of your Orbit chain's nodes. A list of [all Nitro releases can be found on Github](https://github.com/OffchainLabs/nitro/releases).

Begin by upgrading your validator node(s) to the specified Nitro version, then update each remaining Orbit node to match this version.

Note that upgrading your node version _must occur_ before the deadline established for the target ArbOS upgrade. Refer to the timestamp in the ArbOS upgrade schedule for a precise deadline.

#### Step 2: Upgrade the WASM module root & your chain's Nitro contracts

While every ArbOS upgrade will require an update to the WASM module root, not every ArbOS upgrade will require an upgrade to the chain's `nitro-contracts` version.

If necessary, as defined in the release notes for each ArbOS release ([example of ArbOS 20](/run-arbitrum-node/arbos-releases/arbos20.mdx)), you may need to deploy new versions of some (or all) of the Nitro contracts to the parent chain of your Orbit chain. These contracts include the rollup logic, bridging logic, fraud-proof contracts, and interfaces for interacting with Nitro precompiles. To verify the current version of your Nitro contracts, follow [these instructions](https://github.com/OffchainLabs/orbit-actions/blob/main/README.md#check-version-and-upgrade-path) while replacing the inbox contract address and network name with that of your Orbit chain. This information will allow you to find the correct upgrade path for your Nitro contracts.

To update the Wasm module root and deploy your chain's Nitro contracts to the parent chain for the most recent ArbOS release, you will need the following inputs (obtained from the [requirements for the targeted ArbOS release](/run-arbitrum-node/arbos-releases/01-overview.mdx)):

- The WASM module root, and if necessary,
- The required `nitro-contracts` version

Once you have the WASM module root and have identified the required `nitro-contracts` version for the target ArbOS release, if any, [please follow the instructions in this guide](https://github.com/OffchainLabs/orbit-actions?tab=readme-ov-file#nitro-contracts-upgrades) for specific actions based on the `nitro-contracts` version you are deploying. Note that each ArbOS release will require performing this step with a different WASM module root and may require a different version of `nitro-contracts`. The guide linked above will be kept updated with the instructions for each specific ArbOS release.

The `WASM module root` is a 32-byte hash created from the Merkelized Go replay binary and its dependencies. When ArbOS is upgraded, a new WASM module root is generated due to modifications in the State Transition Function. This new WASM module root must be set in the rollup contract on the parent chain. You can get the For example, the WASM module root for ArbOS 20 Atlas is `0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4`.

To set the WASM module root manually (i.e., not using the above guide), use the `Rollup proxy` contract's [setWasmModuleRoot](https://github.com/OffchainLabs/nitro-contracts/blob/38a70a5e14f8b52478eb5db08e7551a82ced14fe/src/rollup/RollupAdminLogic.sol#L321) method. Note that the `upgrade executor` contract on the parent chain is the designated owner of the rollup contract, so the **chain owner account** needs to initiate a call to the `upgrade executor` contract in order to perform the upgrade. This call should include the correct calldata for setting the new WASM module root.

:::tip Backward compatibility

WASM module roots are backward compatible, so upgrading them before an ArbOS version upgrade will not disrupt your chain's functionality.

:::

#### Step 3: Schedule the ArbOS version upgrade

To schedule an ArbOS version upgrade for your Orbit chain, [follow this guide](https://github.com/OffchainLabs/orbit-actions/tree/main/scripts/foundry/arbos-upgrades/at-timestamp). In addition to the upgrade action contract address and the account address for the chain owner account, you will need the following inputs:

1. **`newVersion`**: Specify the ArbOS version you wish to upgrade to (e.g., `20`).
2. **`timestamp`**: Set the exact UNIX timestamp at which you want your Orbit chain to transition to the new ArbOS version.

If you would prefer to do this manually, simply call the [`scheduleArbOSUpgrade`](https://github.com/OffchainLabs/nitro-contracts/blob/acb0ef919cce9f41da531f8dab1b0b31d9860dcb/src/precompiles/ArbOwner.sol#L61) function on the `ArbOwner` precompile of the Orbit chain(s) you're upgrading. Because this is an administrative action (similar to upgrading your Wasm module root), the **chain owner account** must call the target chain's `upgrade executor` contract with the appropriate calldata in order to invoke the `scheduleArbOSUpgrade` function of the ArbOwner precompile. This will schedule the ArbOS upgrade using the specified version and timestamp.

:::tip Immediate upgrades

To upgrade immediately (without scheduling), set the timestamp to `0`.

:::

:::info Obtaining the current ArbOS version

You can obtain the current ArbOS version of your chain by calling `ArbSys.ArbOSVersion()`. Keep in mind that this function adds `55` to the current ArbOS version. For example, if your chain is running on ArbOS 10, calling this function will return `65`.

When scheduling the ArbOS upgrade through `ArbOwner.scheduleArbOSUpgrade` you must use the actual ArbOS version you're upgrading to. For example, if you're upgrading to ArbOS 11, you will pass `11` when calling this function.

:::

#### Step 4: Enable ArbOS specific configurations or feature flags (not always required)

For some ArbOS upgrades, such as [ArbOS 20 Atlas](/run-arbitrum-node/arbos-releases/arbos20.mdx), there may be additional requirements or steps that need to be satisfied to ensure your Orbit chain can use all of the new features and improvements made available in that particular ArbOS release.

If there are additional requirements for the targeted ArbOS release you're attempting to upgrade to; the additional requirements will be listed on the reference pages for [the targeted ArbOS release](/run-arbitrum-node/arbos-releases/01-overview.mdx#list-of-available-arbos-releases). For example, the additional requirements for Orbit chains upgrading to ArbOS 20 can be found [here on the ArbOS 20 docs](/run-arbitrum-node/arbos-releases/arbos20.mdx).

Congratulations! You've upgraded your Orbit chain(s) to the specified ArbOS version.
