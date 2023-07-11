---
title: "How (and when) to customize your Orbit chain's deployment configuration"
sidebar_label: "Customize your chain's deployment config"
description: "Learn how (and when) to customize your Orbit chain's deployment configuration in the Orbit chain deployment portal."
author: symbolpunk
sidebar_position: 1
---

import PublicPreviewBannerPartial from '../partials/_orbit-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

import UnderConstructionPartial from '../../partials/_under-construction-banner-partial.md';

<UnderConstructionPartial />

When you visit the [Orbit chain deployment portal](https://orbit.arbitrum.io/deployment) to launch your Orbit chain, you'll be prompted to complete a form that looks like this:

import { PlaceholderForm } from '/src/components/PlaceholderForm/PlaceholderForm';

<PlaceholderForm inputs="Chain ID, Chain name, Challenge period (blocks), Stake token, Base stake, Owner" />

This form will be prefilled with default values that usually don't need to be changed. However, there are some cases where you may want to customize the configuration values. This how-to explains how and when to modify these default values.

Let's briefly review each of the deployment configuration parameters, the rationale underlying the default values, and the tradeoffs that you should consider when modifying them.

### Chain ID

Don't worry about this; it's inconsequential for devnets. In production scenarios (which aren't yet supported), you'll want to use a unique integer identifier that represents your chain's network on chain indexes like [Chainlist.org](http://chainlist.org).

### Chain name

This name provides a way for people to distinguish your Orbit chain from other Orbit chains. You’ll want to make this a name that you can easily remember, and that your users and developers will recognize.

### Challenge period (blocks)

The `Challenge period (blocks)` parameter determines the amount of time your chain's validators have to dispute - or "challenge" - the integrity of transactions posted to your Orbit chain's base chain on L2 (Arbitrum Goerli for now; settlement to One and Nova mainnet chains isn't supported yet).

A longer challenge period means that your chain's nodes will have more time to dispute fraudulent transactions, but it also means that your chain's users will have to wait longer for their transactions to finalize. This is one of the many tradeoffs that Orbit allows you to make when configuring your chain.

Note that the challenge period is measured in blocks on the underlying L1 chain, not the base (L2) chain. If your Orbit chain settles to Arbitrum Goerli, the challenge period window would be the number of `Challenge period (blocks)` multiplied by the L1 Goerli block time (~12 seconds).

<!-- todo: revisit and discuss defaults -->

### Stake token

Your Orbit chain will be supported by at least one node. In order for your chain's nodes to record transactions, they're required to stake some value as a way to incentivize honest participation.

This `Stake token` parameter specifies the type of token that your chain's nodes must deposit into this contract when they stake. This is specified using the **token's contract address on the L2 chain that your chain is settling to - Arbitrum Goerli**.

### Base stake

The `Base stake` parameter specifies the **amount of ETH** that your chain's validator must deposit in order to begin proposing batches of transactions from your Orbit chain to its base contracts. This is specified using a float value.

If your `Base stake` is low, the barrier to participation will be low, but your chain will be more vulnerable to certain types of attacks.

For example, an Orbit chain with a base stake of 0.01 ETH could be halted by an adversary who can afford to deploy sacrificial validators that maliciously challenge every RBlock submitted to your Orbit chain's base chain.

The malicious challenges would result in slashed Orbit chain validators (one slashed validator per malicious challenge), but from the adversary's perspective, periodic slashing is just the price they have to pay to keep your chain offline.

A higher base stake incentivize honest participation by making it more expensive to launch these types of attacks. However, a higher base stake also translates to a higher barrier to entry for your chain's validator operators. This is another tradeoff to consider.

### Owner

This account address is responsible for deploying, owning, and updating your Orbit chain's base contracts on its base chain.

<!-- possible cut / clarification: --**rollup owner**, and also it has been used as **chain owner** -->

In production scenarios, this is a high-stakes address that's often controlled by a DAO's governance protocol or multisig. For your Orbit devnet chain, think of this as a low-stakes administrative service account.

Note that **you'll have to fund this address** with enough ETH to cover the gas costs of deploying your core contracts to L2.

This address must be a standard Ethereum wallet address (precisely speaking, an EOA); it can't be a smart contract/wallet contract.
