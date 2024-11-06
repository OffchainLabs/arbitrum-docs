---
title: 'Orbit chain ownership'
description: 'Overview of the technical architecture of chain ownership affordances on Orbit chains.'
author: dzgoldman
sme: dzgoldman
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 0
---

A **chain owner** of an <a data-quicklook-from='arbitrum-orbit'>Orbit</a> chain is an entity that can carry out critical upgrades to the chain's core protocol; this includes upgrading protocol contracts, setting core system parameters, and adding & removing other chain owners.

An Orbit chain's initial chain owner is set by the chain's creator when the chain is deployed.

The chain-ownership architecture is designed to give Orbit chain creators flexibility in deciding how upgrades to their chain occur.

### Architecture

Chain ownership affordance is handled via [**Upgrade Executor**](https://github.com/OffchainLabs/upgrade-executor) contracts.

Each Orbit chain is deployed with two Upgrade Executors — one on the Orbit chain itself, and one on its <a data-quicklook-from='parent-chain'>parent chain.</a> At deployment, the chain's critical affordances are given to the Upgrade Executor contracts.

Some examples:

- The parent chain's core protocol contracts are upgradeable proxies that are controlled by a proxy admin; the proxy admin is owned by the Upgrade Executor on the parent chain.
- The core Rollup contract's admin role is given to the Upgrade Executor on the parent chain.
- The affordance to call setters on the ArbOwner procompile — which allows for setting system gas parameters and scheduling ArbOS upgrades (among other things) — is given to the Upgrade Executor on the Orbit chain.

Calls to an Upgrade Executor can only be made by chain owners; e.g., entities granted the `EXECUTOR_ROLE` affordance on the Upgrade Executor. Upgrade executors also have the `ADMIN_ROLE` affordance granted to themselves, which lets chain owners add or remove chain owners.

With this architecture, the Upgrade Executor represents a single source of truth for affordances over critical upgradability of the chain.

### Upgrades

Upgrades occur via a chain owner initiating a call to an Upgrade Executor, which in turns calls some chain-owned contract.

Chain owners can either call [UpgradeExecutor.executeCall](https://github.com/OffchainLabs/upgrade-executor/blob/a8d3020c2771d164ebd323b1d99249049fe749f9/src/UpgradeExecutor.sol#L73), which will in turn call the target contract directly, or [UpgradeExecutor.execute](https://github.com/OffchainLabs/upgrade-executor/blob/a8d3020c2771d164ebd323b1d99249049fe749f9/src/UpgradeExecutor.sol#L57), which will delegate-call to an "action contract" and use its code to call the target contract.

### Ownership flexibility

A chain owner is simply an address; it is set by the Orbit chain's deployer and can represent any sort of governance scheme. I.e., it could be an EOA (as is set via the [Orbit Quickstart](../orbit-quickstart.md)), a Multisig, a governance token system, etc.

The Arbitrum DAO governed chains, while not Orbit chains themselves, use a similar architecture and upgrade pattern as Orbit chains, with both a governance token and a Multisig (aka, the "Security Council") as chain owners. For more info and best practices on action contracts, see ["DAO Governance Action Contracts"](https://github.com/ArbitrumFoundation/governance/blob/main/src/gov-action-contracts/README.md).

(_NOTE: The DAO Governed chains' Upgrade Executor contracts don't have the `.executeCall` method; only the `.execute` method_)
