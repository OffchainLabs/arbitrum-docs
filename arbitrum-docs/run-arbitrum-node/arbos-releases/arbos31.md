---
title: 'ArbOS 31 Bianca'
sidebar_label: 'ArbOS 31 Bianca'
sidebar_position: 2
author: dlee
---

ArbOS 31 "Bianca" is shipped via Nitro v2.3.1, which is available on Docker hub with the image tag: `offchainlabs/nitro-node:v2.3.1-26fad6f`. This release of Nitro is a mandatory upgrade for Arbitrum One and Nova validators. For Arbitrum One and Nova, the ArbOS 20 upgrade requires a governance vote to activate.

The Arbitrum docs will remain the canonical home for information regarding ArbOS releases, with more details found on the [ArbOS Software Releases Overview page](./01-overview.md).

### Requirements:

- Nitro 3.1.1 or higher (TODO: INSERT GITHUB LINK)
- nitro-contracts v2.0.0 or higher
- WASM module root: `0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4
`

### High-level description of ArbOS 31 changes

ArbOS 31 Bianca is a major upgrade for Arbitrum chains. As a refresher, ArbOS upgrades can be treated as Arbitrum’s equivalent of a hard fork - more can be read about this subject over in [Arbitrum ArbOS upgrades](https://forum.arbitrum.foundation/t/arbitrum-arbos-upgrades/19695). Please note that ArbOS 31 Bianca is an upgrade that builds upon [ArbOS 20 Atlas](./arbos20.md).

ArbOS 31 Bianca brings many features, improvements, and bug fixes to Arbitrum chains. The full list of changes can be found in the Nitro release notes for [Nitro 3.1.1](https://github.com/OffchainLabs/nitro/releases/tag/v3.1.1) or higher (as Nitro 3.1.1 is the first Nitro version that adds support for ArbOS 31 Bianca). Highlighted below are a few of the most impactful and critical features that are introduced with ArbOS 31:

- Addition and subsequent activation of [Stylus](../../stylus/stylus-gentle-introduction.md) on Arbitrum chains through the addition of a new WebAssembly-based (WASM) virtual machine that runs alongside the EVM. Stylus enables developers to write smart contracts in new programming languages that compile down to WASM, like Rust, that are more efficient and safer than Solidity smart contracts while retaining complete interoperability.
- Adding support for [RIP-7212](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md) decreases the costs of verifying the secp256r1 curve on-chain [by 99% when compared to current implementations](https://www.alchemy.com/blog/what-is-rip-7212), making secp256r1 verification more feasible for everyday use and enabling dApp developers and protocols to offer their users improved UX on Arbitrum One and Arbitrum Nova. Without this precompile, verifying this signature on-chain is extremely expensive. Passkey-based wallets offer a better level of security than a typical EOA and seamless cross-device support. Many wallets, and notably, apps using embedded wallets, have been requesting this feature for over a year.
- A change to the transaction fee router contracts on Arbitrum Nova to allow for fees collected to be automatically sent to the ArbitrumDAO Treasury on Arbitrum One. Currently, the ArbitrumDAO receives Arbitrum Nova transaction fees are sent to a ArbitrumDAO controlled address that requires a constitutional proposal to move, which is less efficient. This change is specific to Arbitrum Nova and is not expected to impact Orbit chains.

### Reference links for ArbOS 30 Bianca

- [Nitro v3.1.1 release notes](https://github.com/OffchainLabs/nitro/releases/tag/v3.1.1)
- [ArbOS 31 "Bianca" on-chain Tally vote](https://www.tally.xyz/gov/arbitrum/proposal/108288822474129076868455956066667369439381709547570289793612729242368710728616)
- [AIP: Activate Stylus and Enable Next-Gen WebAssembly Smart Contracts (ArbOS 31)](https://forum.arbitrum.foundation/t/aip-activate-stylus-and-enable-next-gen-webassembly-smart-contracts-arbos-30/22970)
- [AIP: Support RIP-7212 for Account Abstraction Wallets (ArbOS 31)](https://forum.arbitrum.foundation/t/aip-support-rip-7212-for-account-abstraction-wallets-arbos-30/23298)
- [AIP: Nova Fee Router Proposal (ArbOS 31)](https://forum.arbitrum.foundation/t/aip-nova-fee-router-proposal-arbos-30/23310)
- [Arbitrum Stylus Audit Report by Trail of Bits](../../audit-reports.mdx)
