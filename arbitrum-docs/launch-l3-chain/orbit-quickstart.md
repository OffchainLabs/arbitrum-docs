---
title: "Quickstart: Launch an L3 devnet chain with Orbit (Experimental)"
description: "Launch your own L3 devnet chain with the Arbitrum Nitro codebase's new license. Settle to Arbitrum's L2 chains via bridge contracts on the underlying L2 chain (One or Nova). No need for permission from the Arbitrum DAO or Offchain Labs to create your L3. Modify the Nitro codebase freely for your L3. Stay tuned for more information."
sidebar_position: 2
author: oliviaJ3388
sidebar_label: "Quickstart: Launch an L3 devnet chain"
---

import { PlaceholderForm } from '/src/components/PlaceholderForm/PlaceholderForm';

<!-- import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md'; 

<PublicPreviewBannerPartial /> -->

This quickstart is for developers who want to launch their own sovereign Layer-3 (L3) rollup chain using Arbitrum Orbit. Familiarity with Ethereum, Arbitrum, and Solidity is expected.

<!-- If you're new to Arbitrum or Arbitrum Orbit, consider reviewing [A gentle introduction to Arbitrum Orbit](./orbit-gentle-introduction.md) before proceeding. -->

By the end of this quickstart, you'll have a functional **L3 Orbit devnet chain** that accepts transactions and settles them to Arbitrum L2.

:::caution NOT FOR PRODUCTION SCENARIOS

Your Orbit chain **is not intended to be used in production scenarios**; it's meant for prototyping, experimentation, and discovery. We're excited to see what you build, and we're eager to learn how we can improve Orbit to better support your needs.

If you have any questions, feature requests, or configurability requests, **please reach out to our team directly** by (TODO). Your feedback will determine how this capability evolves over time, so please don't hesitate to reach out!

:::


## Step 1: Configure your L3 chain

An **Orbit L3 chain launchpad portal** will soon be available. There, you'll see a form that looks like this:

<PlaceholderForm id="foo" inputs="Chain ID, Challenge period (blocks), Staking token (0x... address), Base stake" />

- **Chain ID**: A unique integer identifier that represents your L3 chain's network. This chain ID can be submitted to chain indexes like [Chainlist.org](http://chainlist.org). For devnets, this is hardcoded to a default value - don't worry about it for now.
- **Challenge period (blocks)**: The amount of time that your chain's nodes have to dispute transactions before they're confirmed and posted to the underlying L2 chain. Each block takes 12 seconds.
- **Staking token**: The token that your chain's validators must stake in order to participate in your L3 chain. This token must be an ERC20 token contract address on Arbitrum One.
- **Base stake**: The number of staking tokens that your chain's validators must stake in order to participate in your L3 chain. This number must be greater than 0.

Let's briefly review each of these parameters, how to evaluate tradeoffs when configuring them, and what to set if you're not sure.


### Chain ID

Don't worry about this; it's inconsequential for devnets. For production scenarios, you'll want to use a unique integer identifier that represents your L3 chain's network on chain indexes like [Chainlist.org](http://chainlist.org).


### Challenge period (blocks)

Transactions submitted to your L3 chain are placed within a queue before being confirmed and finalized (settled to the L2 chain). The `Challenge period (blocks)` parameter determines the amount of time that must pass before the transactions can move out of this queue and into the underlying L2. While in this queue, transactions can be disputed by your chain's nodes.

A longer challenge period means that your chain's nodes will have more time to dispute fraudulent transactions, but it also means that your chain's users will have to wait longer for their transactions to settle to the underlying L2 chain. This is one of the many tradeoffs that Orbit allows you to make when configuring your L3 chain. If you're not sure what to put here, use the default value of `10080` (7 days).

Note that the challenge period is measured in blocks on the L2 chain, not the L3 chain.


### Stake token

Your L3 devnet chain will be supported by at least one node. In production scenarios, your chain may be supported by a decentralized network of nodes. In order for your chain's nodes to recored transactions, they need to stake value in a smart contract that's used to incentivize honest participation. This `Stake token` parameter specifies the type of token that your chain's nodes must deposit into this contract when they stake. This is specified using the **token's contract address on the L2 chain that your L3 chain is settling to**.

If you're not sure what to put here, use the default value of `0x000..000`. This will configure your chain to use ETH as a stake token.


### Base stake

While the `Stake token` parameter specifies the type of token that your chain's nodes must deposit into the staking contract, the `Base stake` parameter specifies the amount of this token that your chain's nodes must deposit in order to begin proposing batches of transactions to your L3 chain. This is specified using an integer value.

Lower base stakes translate to lower barriers to entry for your chain's nodes, but they also translate to lower security by reducing the cost of certain attacks. For example, an L3 chain with a base stake of 0.01 ETH could be halted by an attacker who can afford to deploy sacrificial nodes that maliciously challenges every submitted RBlock. Every malicious challenge would delay the chain's posting of transactions to the underlying L2 chain by the configured challenge period, and this could continue indefinitely.

A higher base stake incentivizes honest participation by making it more expensive to launch these types of attacks. However, a higher base stake also translates to a higher barrier to entry for your chain's nodes. This is another tradeoff to consider.

If you're not sure what to put here, use the default value of `1`, which translates to 1 ETH assuming that your chain's `Stake token` is set to `0x000..000`.


#### Owner

This address represents the `sudo` address of your entire chain responsible for deploying your chain's foundation contracts to the underlying L2 chain, among other things. 

In production scenarios, this address would likely be controlled by a DAO's governance protocol or multisig that's responsible for managing the chain's configuration.

For your L3 devnet chain, think of this as a service account. You'll have to fund this address with enough ETH to cover the gas costs of deploying your foundation contracts to L2.


## Step 2: Deploy your L3 chain's foundation contracts to L2

Click `Deploy rollup`. This will submit a transaction to Arbitrum One, so you'll have to pay a little gas. Once this transaction is confirmed, you'll see a new form appear that allows you to configure your L3 chain's validators.

This transaction is responsible for deploying your L3 chain's foundation contracts to the underlying L2 chain. These contracts are responsible for facilitating the exchange of information between your L3 chain and the underlying L2 chain. This includes the batch posting of transactions to the underlying L2 chain, the staking of tokens by your chain's validators, the challenge mechanism, bridging mechanisms, and more.

Once this transaction is confirmed, you'll see a new form appear that allows you to configure your L3 chain's validators.


## Step 3: Configure your L3 chain's validators

Your L3 chain's validators are responsible for proposing batches of transactions to your L3 chain. These batches are then posted to the underlying L2 chain. In production scenarios, your L3 chain's validators would likely be a decentralized network of nodes. For your L3 devnet chain, you'll be configuring a single validator by default, with the option to add more.

The addresses that you specify here will be submitted to one of your L3 chain's foundation contracts on L2. This effectively allowlists the validator addresses, allowing them to stake tokens and participate in your L3 chain's consensus mechanism.

Once this transaction is confirmed, you'll see a new form appear that allows you to configure your L3 chain's batch poster.


## Step 4: Configure your L3 chain's batch poster

When your end users submit transactions to your L3 chain, those transactions are deterministically batched, sequenced, and hashed into RBlocks that get posted to the underlying L2 chain through your L3 chain's foundation contracts. Your batch poster is the address that's responsible for submitting these RBlocks to your L3 chain's foundation contracts on L2.

Once this transaction is confirmed, you'll be ready to run your L3 chain's node(s) and start accepting transactions from your end users.


## Step 5: Generate config and run your L3 chain's node(s)

:::info coming soon

These steps are a work-in-progress. Thanks for your patience, check back soon!

:::