---
title: "Quickstart: Launch an L3 devnet chain with Orbit (Experimental)"
description: "Launch your own L3 devnet chain with the Arbitrum Nitro codebase's new license. Settle to Arbitrum's L2 chains via bridge contracts on the underlying L2 chain (One or Nova). No need for permission from the Arbitrum DAO or Offchain Labs to create your L3. Modify the Nitro codebase freely for your L3. Stay tuned for more information."
sidebar_position: 2
author: oliviaJ3388
sidebar_label: "Quickstart: Launch an L3 devnet chain"
---

import { PlaceholderForm } from '/src/components/PlaceholderForm/PlaceholderForm';

import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md'; 

<PublicPreviewBannerPartial />

This quickstart is for developers who want to launch their own sovereign Layer-3 (L3) rollup chain using Arbitrum Orbit. Familiarity with Ethereum, Arbitrum, and Solidity is expected.

<!-- If you're new to Arbitrum or Arbitrum Orbit, consider reviewing [A gentle introduction to Arbitrum Orbit](./orbit-gentle-introduction.md) before proceeding. -->

By the end of this quickstart, you'll have a functional **L3 Orbit devnet chain** that accepts transactions and settles them to <a data-quicklook-from="arbitrum-one">Arbitrum One</a>.

:::caution NOT FOR PRODUCTION SCENARIOS

Your Orbit chain **is not intended to be used in production scenarios**; it's meant for prototyping, experimentation, and discovery. We're excited to see what you build, and we're eager to learn how we can improve Orbit to better support your needs.

If you have any questions or feature requests as you begin to tinker, **please reach out to our team directly** through [this form](http://bit.ly/3yy6EUK). Your feedback will determine how this capability evolves over time, so please don't hesitate to reach out!

:::


## Step 1: Configure your L3 chain

An **Orbit L3 chain launchpad portal** will soon be available. There, you'll see a form that looks like this:

<PlaceholderForm id="foo" inputs="Chain ID, Challenge period (blocks), Staking token (0x... address), Base stake" />

- **Chain ID**: A unique integer identifier that represents your L3 chain's network. This chain ID can be submitted to chain indexes like [Chainlist.org](http://chainlist.org). For devnets, this is hardcoded to a default value - don't worry about it for now.
- **Challenge period (blocks)**: The amount of time that your chain's nodes have to dispute transactions before they're confirmed and posted to the underlying L2 chain (Arbitrum One).
- **Staking token**: The token that your chain's validators must stake in order to participate in your L3 chain. This token must be an ERC20 token contract address on Arbitrum One.
- **Base stake**: The number of staking tokens that your chain's validators must stake in order to participate in your L3 chain. This number must be greater than 0.

Let's briefly review each of these parameters, how to evaluate tradeoffs when configuring them.


### Chain ID

Don't worry about this; it's inconsequential for devnets. For production scenarios, you'll want to use a unique integer identifier that represents your L3 chain's network on chain indexes like [Chainlist.org](http://chainlist.org).


### Challenge period (blocks)

Transactions submitted to your L3 chain are placed within a queue before being confirmed and finalized (settled to the L2 chain). The `Challenge period (blocks)` parameter determines the amount of time that must pass before the transactions can move out of this queue and into the underlying L2. While in this queue, transactions can be disputed by your chain's nodes.

A longer challenge period means that your chain's nodes will have more time to dispute fraudulent transactions, but it also means that your chain's users will have to wait longer for their transactions to settle to the underlying L2 chain. This is one of the many tradeoffs that Orbit allows you to make when configuring your L3 chain.

If you're not sure what to put here, use the default value of `10080`, which translates to roughly 7 days.

Note that the challenge period is measured in blocks on the L2 chain, not the L3 chain.


### Stake token

Your L3 devnet chain will be supported by at least one node. In production scenarios, your chain may be supported by a decentralized network of nodes. In order for your chain's nodes to recored transactions, they need to stake value in a smart contract that's used to incentivize honest participation. This `Stake token` parameter specifies the type of token that your chain's nodes must deposit into this contract when they stake. This is specified using the **token's contract address on the L2 chain that your L3 chain is settling to**.

If you're not sure what to put here, use the default value of `0x000..000`. This tells Orbit to set your chain's stake token to plain-old ETH.


### Base stake

While the `Stake token` parameter specifies the type of **token** that your chain's nodes must deposit into the staking contract, the `Base stake` parameter specifies the **amount of this token** that your chain's nodes must deposit in order to begin proposing batches of transactions from your L3 chain to your L2 chain. This is specified using an integer value.

If your base stake is low, the barrier to participation will be low, but your chain will be more vulnerable to certain types of attacks.

For example, an L3 chain with a base stake of 0.01 ETH could be halted by an adversary who can afford to deploy sacrificial nodes that maliciously challenge every RBlock that your chain's honest nodes submit. The malicious challenges would be slashed, but from the adversary's perspective, periodic slashing is just the price they have to pay to keep your chain offline.

A higher base stake incentivizes honest participation by making it more expensive to launch these types of attacks. However, a higher base stake also translates to a higher barrier to entry for your chain's nodes. This is another tradeoff to consider.

If you're not sure what to put here, use the default value of `1`, which translates to 1 ETH (assuming that your chain's `Stake token` is set to `0x000..000`).


### Owner

This address is responsible for deploying your chain's **foundation contracts** to the underlying L2 chain, and it has the power to change your chain's configuration.

In production scenarios, this address is often controlled by a DAO's governance protocol or multisig. For your L3 devnet chain, think of this as a low-stakes administrative service account.

Note that **you'll have to fund this address** with enough ETH to cover the gas costs of deploying your foundation contracts to L2.


## Step 2: Deploy your L3 chain's foundation contracts to L2

Click `Deploy rollup`. This will submit a transaction to Arbitrum One, so you'll have to pay a little gas. Once this form-submission transaction is confirmed, you'll see a new form appear that allows you to configure your L3 chain's validators.

Before we configure our validators, let's briefly review what just happened, your L3 chain's underlying L2 chain.

 - You submitted a deployment transaction to an Orbit smart contract on Arbitrum One.
 - This smart contract initialized your Orbit L3 chain's foundation contracts with values that you specified in the previous step.
 - It then deployed these contracts to Arbitrum One.

Your L3 chain's foundation contracts are responsible for facilitating the exchange of information between your L3 chain and the underlying L2 chain. This includes the batch posting of transactions to the underlying L2 chain, the staking of tokens by your chain's validators, the challenge mechanism, bridging mechanisms, and more.

Ok, on to the validators.

## Step 3: Configure your L3 chain's validators

Your L3 chain's validators are responsible for sending batches of transactions to your L2 chain in the form of RBlocks. In production scenarios, your L3 chain would likely be hosted by a decentralized network of validator nodes working together. For your L3 devnet chain, you'll be configuring a single validator by default, with the option to add more.

The first address is randomly generated and can't be changed. Its private key will be available later on.

Each of the addresses specified in this step will be added to an allow-list in one of your L3 chain's foundation contracts. This lets each of the specified addresses **stake** and serve your chain's users.

Once this form-submission transaction is confirmed, you'll see a new form appear that allows you to configure your L3 chain's batch poster.


## Step 4: Configure your L3 chain's batch poster

Your L3 chain's user-submitted transactions are deterministically batched and sequenced within RBlocks that get posted to Arbitrum One through your L3 chain's foundation contracts. Your batch poster address is the L3 address that's responsible for posting these RBlocks from your L3 to your foundation contracts on L2.

Once this form-submission transaction is confirmed, you'll be ready to run your L3 chain's validator(s) and batch poster. Your L3 chain can then begin accepting transactions from users and settling them to Arbitrum One and then Ethereum mainnet.


## Step 5: Generate config and run your L3 chain's node(s)

:::info coming soon

These steps are a work-in-progress. Thanks for your patience, check back soon!

:::