---
title: 'BoLD configuration parameters'
sidebar_label: 'BoLD configuration parameters'
description: 'Learn about the various parameters that can be configured for Arbitrum BoLD'
author: dlee
sme: dlee
user_story: As a current or prospective Orbit chain owner, I need to understand the various configuration parameters with Arbitrum BoLD
content_type: how-to
---

<a data-quicklook-from="bold">Arbitrum BoLD</a> is the latest iteration of the Optimistic Rollup dispute
protocol used by Arbitrum chains today, like Arbitrum One. This page is intended for Orbit chain owners/operators
and assumes knowledge of Arbitrum BoLD is and experience upgrading an Arbitrum chain's Rollup contracts.
This page assumes you have read and followed the guide on [How to upgrade to BoLD](../../04-maintain-your-chain/05-upgrade-to-bold.mdx).

To read more about Arbitrum BoLD, please refer to the [Gentle Introduction for BoLD](../../../how-arbitrum-works/bold/gentle-introduction.mdx). To learn more about some guidelines/best-practices for using BoLD on your Orbit chain, please refer to our guide on [BoLD adoption for Orbit chains](../../bold-adoption-for-orbit-chains.mdx).

:::caution
As mentioned in our guide on [BoLD adoption for Orbit chains](../../bold-adoption-for-orbit-chains.mdx), the recommendation is that Orbit chains keep validation permissioned by having `disableValidatorWhitelist` be `false` (which is the default) and by having a list of validators on the whitelist via the `validators[]` array.
:::

## Table of Arbitrum BoLD parameters

The following configuration parameters can be applied when deploying or managing your Orbit chain. For an example of a configuration, feel free to reference this [sample configuration](../../04-maintain-your-chain/05-upgrade-to-bold.mdx#configure-your-chain-parameters) in our guide on how to upgrade your chain to use BoLD.

import OptionalOrbitCompatibleCLIFlagsPartial from '../../../partials/_bold-config-params.mdx';

<OptionalOrbitCompatibleCLIFlagsPartial />
