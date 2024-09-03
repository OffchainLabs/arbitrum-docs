---
title: 'ArbOS software releases: Overview'
sidebar_label: 'Overview'
sidebar_position: 1
author: dlee
---

:::info

This document provides an overview of Nitro node software releases that upgrade ArbOS. Visit the [Nitro Github repository](https://github.com/OffchainLabs/nitro/releases) for a detailed index of Nitro releases.

:::

Arbitrum chains are powered by Arbitrum nodes running the Nitro software stack. The Nitro software stack includes [ArbOS](https://forum.arbitrum.foundation/t/arbitrum-arbos-upgrades/19695), the Layer 2 EVM hypervisor that facilitates the execution environment of an Arbitrum chain.

Although new Nitro releases are shipped regularly, only a subset of Nitro releases carry ArbOS upgrades. These special Nitro releases are significant because ArbOS upgrades are Arbitrum's equivalent to a ["hard fork"](https://ethereum.org/en/history/) - an upgrade that alters a node's ability to produce valid Arbitrum blocks. This is why validator nodes supporting a public Arbitrum chain (One, Nova) **must update Nitro** whenever a new ArbOS version is released and voted for adoption by the ArbitrumDAO.

Note that every Nitro release is backwards compatible. In other words, the latest version of Nitro will support all previous ArbOS releases. This means that your validator's Nitro version must be greater than or equal to the version that includes the latest ArbOS upgrade.

import PublicPreviewBannerPartial from '../../node-running/partials/_upgrade-cadence-recommendations-partial.mdx';

<PublicPreviewBannerPartial />

ArbOS upgrades are carried out by the chain's owner; in the case of Arbitrum One and Nova, the owner is the Arbitrum DAO and so an upgrade will require a governance proposal and vote to pass to complete the upgrade. [This is an example of a Nitro release that contains an ArbOS version bump, specifically to ArbOS 11](https://github.com/OffchainLabs/nitro/releases/tag/v2.2.0).

Visit [Inside Arbitrum Nitro](/how-arbitrum-works/inside-arbitrum-nitro.md) to learn more about Nitro's architecture; more information about ArbOS software releases is available on [the Arbitrum DAO forum](https://forum.arbitrum.foundation/t/arbitrum-arbos-upgrades/19695).

## List of available ArbOS releases

- [ArbOS 31 "Bianca"](/run-arbitrum-node/arbos-releases/arbos31.md)
- [ArbOS 20 "Atlas"](/run-arbitrum-node/arbos-releases/arbos20.md)
- [ArbOS 11](/run-arbitrum-node/arbos-releases/arbos11.md)

## Naming and numbering scheme

Beginning with ArbOS 20, ArbOS releases use the name of planetary moons in our solar system, ascending in alphabetical order (i.e. the next ArbOS upgrade after ArbOS 20 "Atlas" will be a planetary moon that begins with the letter "B").

The number used to denote each upgrade will increment by 10, starting from ArbOS 20 (i.e., the next ArbOS upgrade after ArbOS 20 will be ArbOS 31). This was done because there are teams who have customized their Orbit chain's [behavior](/launch-orbit-chain/how-tos/customize-stf.mdx) or [precompiles](/launch-orbit-chain/how-tos/customize-precompile.mdx) and who may wish to use ArbOS's naming schema between official ArbOS version bumps (e.g. ArbOS 12 could be the name of a customized version of ArbOS for a project's L3 Orbit chain). 

Note that there may be cases where special optimizations or changes are needed for a specific family of ArbOS releases that will diverge from the standard numbering scheme described above. For example, ArbOS 31 will be the canonical ArbOS version for the “Bianca” family of releases. Node operators and chain owners are expected to upgrade from ArbOS 20 directly to ArbOS 31 (instead of ArbOS 30).

## Network status

To view the status and timeline of network upgrades on Arbitrum One and Nova, [please visit this page](https://docs.arbitrum.foundation/network-upgrades).

## Expectations for Orbit chain owners

For Orbit chain owners or maintainers: it is important to note that _before_ upgrading your Orbit chain(s) to the newest ArbOS release, we strongly encourage waiting at least 2 weeks after the new ArbOS release has been activated on Arbitrum One and Nova before attempting the upgrade yourself. The rationale behind this short time buffer is to allow the Offchain Labs team to address any upgrade issues or stability concerns that may arise with the initial rollout so that we can minimize the chances of your chain(s) hitting the same or similar issues and to maximize the likelihood of an eventual smooth, seamless upgrade. Arbitrum Orbit chains, as always, can pick up new features & enable new customizations as they see fit. ArbOs 31 "Bianca" which unlocks Stylus for use, is no exception to this rule. However, we believe this delay ensures consistent UX across all Orbit chain owners and managers for these critical upgrades.

Note that enabling an ArbOS upgrade is not as simple as bumping your chain’s Nitro node version. Instead, there are other steps required that are outlined in our docs on [How to upgrade ArbOS on your Orbit chain](../../launch-orbit-chain/how-tos/arbos-upgrade.md). Please be sure to follow them and let us know if you encounter any issues. 

## Stay up to date

To stay up to date with proposals, timelines, and statuses of network upgrades to Arbitrum One and Nova:

- Subscribe to the [Arbitrum Node Upgrade Announcement channel on Telegram](https://t.me/arbitrumnodeupgrade)
- Join both the `#dev-announcements` and `#node-runners` Discord channels in the [Arbitrum Discord server](https://discord.gg/arbitrum)
- Follow the official Arbitrum ([`@Arbitrum`](https://twitter.com/arbitrum)) and Arbitrum Developers ([`@ArbitrumDevs`](https://twitter.com/ArbitrumDevs)) X accounts, formerly Twitter.
