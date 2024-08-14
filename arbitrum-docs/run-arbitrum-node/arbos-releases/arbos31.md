---
title: 'ArbOS 31 Bianca'
sidebar_label: 'ArbOS 31 Bianca'
sidebar_position: 2
author: dlee
---

ArbOS 31 "Bianca" is shipped via Nitro v2.3.1, which is available on Docker hub with the image tag: `offchainlabs/nitro-node:v2.3.1-26fad6f`. This release of Nitro is a mandatory upgrade for Arbitrum One and Nova validators. For Arbitrum One and Nova, the ArbOS 20 upgrade requires a governance vote to activate.

The Arbitrum docs will remain the canonical home for information regarding ArbOS releases, with more details found on the [ArbOS Software Releases Overview page](./01-overview.md).

### Requirements:

- A minimum Nitro node version of 3.1.1 (TODO: INSERT GITHUB LINK)
- An upgrade to a new, unreleased version of [`nitro-contracts`](https://github.com/OffchainLabs/nitro-contracts)
- The setting of a new Wasm module root (that will be added here when available)

### High-level description of ArbOS 31 changes

ArbOS 31 Bianca is a major upgrade for Arbitrum chains and ArbOS upgrades can be seen as Arbitrum’s equivalent of a hard fork - more can be read about the subject over in [Arbitrum ArbOS upgrades](https://forum.arbitrum.foundation/t/arbitrum-arbos-upgrades/19695). Please note that ArbOS 31 Bianca is an upgrade that builds upon [ArbOS 20 Atlas](./arbos20.md).

ArbOS 31 Bianca brings many features, improvements, and bug fixes to Arbitrum chains. The full list of changes can be found in the Nitro release notes for [Nitro 3.0.0](https://github.com/OffchainLabs/nitro/releases/tag/v3.0.0) or higher (as Nitro 3.0.0 is the first Nitro version that adds support for ArbOS 31 Bianca). Highlighted below are a few of the most impactful and critical features that are introduced with ArbOS 31:

- Activation of [Stylus](../../stylus/stylus-gentle-introduction.md) on Arbitrum chains through the addition of a new WebAssembly-based virtual machine that runs alongside the EVM. Stylus enables developers to write smart contracts in new programming languages that compile down to WASM, like Rust, that are more efficient and safer than Solidity smart contracts while retaining complete interoperability.
- Adoption of [RIP-7212](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md), a precompile for verifying the [`Secp256r1 or P-256 curve`](https://www.nervos.org/knowledge-base/what_is_secp256r1) on Arbitrum chains. Adding support for this precompile allows account abstraction wallets to cheaply verify a type of signature widely used in passkeys and secure enclaves.
- V0 support for Arbitrum Nitro node snap sync, enabling a Nitro node to sync from a snapshot already accepted from L1 through the propagation of blockstate from other nodes in the network.
- A change to the transaction fee router contracts on Arbitrum Nova to allow for fees collected to be automatically sent to the ArbitrumDAO Treasury on Arbitrum One. Currently, the ArbitrumDAO receives Arbitrum Nova transaction fees are sent to a ArbitrumDAO controlled address that requires a constitutional proposal to move, which is less efficient. This change is specific to Arbitrum Nova and is not expected to impact Orbit chains.

### Reference links for ArbOS 30 Bianca

- [Nitro v3.0.0 release notes](https://github.com/OffchainLabs/nitro/releases/tag/v3.0.0). Note that this is the _first_ version that supports ArbOS 31 Bianca, but Nitro 3.0.0 is not the _required_ version. The final, required version of Nitro for ArbOS 31 Bianca is unreleased but will be shared here on this page when available.
- [AIP: Activate Stylus and Enable Next-Gen WebAssembly Smart Contracts (ArbOS 31)](https://forum.arbitrum.foundation/t/aip-activate-stylus-and-enable-next-gen-webassembly-smart-contracts-arbos-30/22970)
- [AIP: Support RIP-7212 for Account Abstraction Wallets (ArbOS 31)](https://forum.arbitrum.foundation/t/aip-support-rip-7212-for-account-abstraction-wallets-arbos-30/23298)
- [AIP: Nova Fee Router Proposal (ArbOS 31)](https://forum.arbitrum.foundation/t/aip-nova-fee-router-proposal-arbos-30/23310)
- [Arbitrum Stylus Audit Report by Trail of Bits](../../audit-reports.mdx)
