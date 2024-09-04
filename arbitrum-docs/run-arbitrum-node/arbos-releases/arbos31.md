---
title: 'ArbOS 31 Bianca'
sidebar_label: 'ArbOS 31 Bianca'
sidebar_position: 2
author: dlee
---

:::caution

Please upgrade directly to ArbOS 31 from ArbOS 20 and not to ArbOS 30. The ArbOS 31 release builds upon ArbOS 30 and includes new fixes & optimizations coming out of rigorous testing and feedback from Stylus teams. ArbOS 31 “Bianca” will be the canonical ArbOS version for the “Bianca” family of releases. 

Future versions of Nitro may remove support for Orbit chains which have historically upgraded to ArbOS 30 instead of going directly to ArbOS 31.

:::

ArbOS 31 "Bianca" is shipped via [Nitro v3.1.2](https://github.com/OffchainLabs/nitro/releases/tag/v3.1.2), which is available on Docker hub with the image tag: `offchainlabs/nitro-node:v3.1.2-309340a`. This release of Nitro is a mandatory upgrade for Arbitrum One and Nova validators. For Arbitrum One and Nova, the ArbOS 31 "Bianca" upgrade requires a governance vote to activate.

Please note that it is important that you only run the Nitro v3.1.1 against trusted databases. If you want to use an untrusted database, you can first remove the `wasm` directory if it exists (it might be inside the `nitro` folder). Otherwise, the database may have malicious, unvalidated code that can result in remote code execution. This is also mitigated by ensuring you run the Arbitrum Nitro node inside Docker.

The Arbitrum docs will remain the canonical home for information regarding ArbOS releases, with more details found on the [ArbOS Software Releases Overview page](./01-overview.md).

### Requirements:

- [Nitro 3.1.2](https://github.com/OffchainLabs/nitro/releases/tag/v3.1.2) or higher
- [nitro-contracts v2.1.0](https://github.com/OffchainLabs/nitro-contracts/releases/tag/v2.1.0) or higher
- WASM module root: `0x260f5fa5c3176a856893642e149cf128b5a8de9f828afec8d11184415dd8dc69`

### High-level description of ArbOS 31 changes

ArbOS 31 Bianca is a major upgrade for Arbitrum chains. As a refresher, ArbOS upgrades can be treated as Arbitrum’s equivalent of a hard fork - more can be read about this subject over in [Arbitrum ArbOS upgrades](https://forum.arbitrum.foundation/t/arbitrum-arbos-upgrades/19695). Please note that ArbOS 31 Bianca is an upgrade that builds upon [ArbOS 20 Atlas](./arbos20.md).

ArbOS 31 Bianca brings many features, improvements, and bug fixes to Arbitrum chains. A full list of changes can be found in the Nitro release notes for [Nitro 3.1.1](https://github.com/OffchainLabs/nitro/releases/tag/v3.1.1) or higher (as Nitro 3.1.1 is the endorsed Nitro node version for ArbOS 31 Bianca). Highlighted below are a few of the most impactful and critical features that are introduced with ArbOS 31 Bianca:

- Addition and subsequent activation of [Stylus](../../stylus/stylus-gentle-introduction.md) on Arbitrum chains through the addition of a new WebAssembly-based (WASM) virtual machine that runs alongside the EVM. Stylus enables developers to write smart contracts in new programming languages that compile to WASM, like Rust, that are more efficient and safer than Solidity smart contracts while retaining complete interoperability.
- Adding support for [RIP-7212](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md) decreases the costs of verifying the secp256r1 curve on-chain [by 99% when compared to current implementations](https://www.alchemy.com/blog/what-is-rip-7212), making secp256r1 verification more feasible for everyday use and enabling dApp developers and protocols to offer their users improved UX on Arbitrum One and Arbitrum Nova. Without this precompile, verifying this signature on-chain is extremely expensive. Passkey-based wallets offer better security than a typical EOA and seamless cross-device support. Many wallets, notably apps using embedded wallets, have been requesting this feature for over a year.
- [Only relevant to Arbitrum Nova] Updated the transaction fee router contracts on Arbitrum Nova to allow for fees collected to be automatically sent to the ArbitrumDAO Treasury on Arbitrum One. Currently, the ArbitrumDAO receives Arbitrum Nova transaction fees that are sent to an ArbitrumDAO-controlled address that requires a constitutional proposal to move, which is less efficient. This change is specific to Arbitrum Nova and is not expected to impact Orbit chains.
- Introduction of a new Fast Withdrawals feature for Orbit chains to achieve fast finality. This feature allows for transactions processed by a committee of validators to be unanimously confirmed as quickly as 15 minutes, as opposed to the default 7-day challenge period. While any Orbit chain can adopt Fast Withdrawals, we only recommend Fast Withdrawals for AnyTrust chains. Note that to enable this feature, separate steps must be followed (below).

### Additional requirement for Arbitrum Orbit chains who wish to take advantage of the Stylus Cache Manager

:::tip Stylus Cache Manager
It is strongly recommended that teams upgrading to ArbOS 31 also spend the time following the instructions described below to deploy and enable the Stylus Cache Manager. Even if your team does not intend to build with Stylus in the immediate term, enabling the Cache Manager ensures that future usage of Arbitrum Stylus on your chain is smooth and provides a consistent UX with the developer experience of building with Arbitrum Stylus on Arbitrum One.
:::

Specific to Stylus and ArbOS 31 "Bianca", we have developed a caching strategy that stores frequently accessed contracts in memory to reduce the costs and time associated with contract execution from repeated initializations. Check out the [Stylus caching strategy docs](../../stylus/concepts/stylus-cache-manager.md) to learn more.

In order to take advantage of this caching strategy, an additional step is required to deploy and enable it's use on your Orbit chain. 

After you have upgraded your Orbit chain to ArbOS 31 "Bianca" (i.e. you have fully completed [Step 3 in the "How to upgrade ArbOS on your Orbit chain" guide](../../launch-orbit-chain/how-tos/arbos-upgrade.md#step-3-schedule-the-arbos-version-upgrade) for your Orbit chain), please follow [these additional instructions](https://github.com/OffchainLabs/orbit-actions/tree/main/scripts/foundry/stylus/setCacheManager) in the `orbit-actions` repository to deploy the cache manager contract on your chain. 

### Additional requirement for Arbitrum Orbit chains who wish to enable Fast Withdrawals

After you have upgraded your Orbit chain to ArbOS 31 "Bianca" (i.e. you have fully completed [Step 3 in the "How to upgrade ArbOS on your Orbit chain" guide](../../launch-orbit-chain/how-tos/arbos-upgrade.md#step-3-schedule-the-arbos-version-upgrade) for your Orbit chain), please follow [these additional instructions](https://github.com/OffchainLabs/orbit-actions/tree/main/scripts/foundry/fast-confirm) in the `orbit-actions` repository to deploy the Safe contract for the fast confirmation committee and set the Safe contract to be both the validator and fast confirmer on your rollup, note that Fast Withdrawals is disabled by default unless explicitly set up and enabled by the Orbit chain owner/maintainer. 

### Reference links for ArbOS 30 Bianca

- [Nitro v3.1.1 release notes](https://github.com/OffchainLabs/nitro/releases/tag/v3.1.1)
- [ArbOS 31 "Bianca" on-chain Tally vote](https://www.tally.xyz/gov/arbitrum/proposal/108288822474129076868455956066667369439381709547570289793612729242368710728616)
- [AIP: Activate Stylus and Enable Next-Gen WebAssembly Smart Contracts (ArbOS 31)](https://forum.arbitrum.foundation/t/aip-activate-stylus-and-enable-next-gen-webassembly-smart-contracts-arbos-30/22970)
- [AIP: Support RIP-7212 for Account Abstraction Wallets (ArbOS 31)](https://forum.arbitrum.foundation/t/aip-support-rip-7212-for-account-abstraction-wallets-arbos-30/23298)
- [AIP: Nova Fee Router Proposal (ArbOS 31)](https://forum.arbitrum.foundation/t/aip-nova-fee-router-proposal-arbos-30/23310)
- [Arbitrum Stylus Audit Report by Trail of Bits](../../audit-reports.mdx)
