---
title: 'Stylus testnet information'
description: A reference providing details about the Stylus testnet and faucets for obtaining testnet ETH
author: amarrazza
sme: amarrazza
target_audience: Developers building on the Stylus testnet
sidebar_position: 9
---

import StylusFaucets from './partials/_stylus-faucets.mdx';

import StylusSmartContractsAddresses from './partials/_stylus-smart-contract-addresses.mdx';

import PublicPreviewBannerPartial from '../partials/_stylus-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

:::caution

Stylus is undergoing major upgrades, and some improvements are expected to require a chain reset. Prior to a reset, developers on the testnet are recommended to withdraw their testnet ETH (there is no 7-day delay since this is a testnet, withdrawals are processed in minutes) and redeploy their contracts on the new chain. There will be advanced warning of any resets. Stay up-to-date by joining the Stylus channel in [Discord](https://discord.com/invite/arbitrum).

:::

import ArbitrumRpcEndpoints from '../../partials/_reference-arbitrum-rpc-endpoints-partial.mdx';

<ArbitrumRpcEndpoints />

<StylusFaucets />

<StylusSmartContractsAddresses />
