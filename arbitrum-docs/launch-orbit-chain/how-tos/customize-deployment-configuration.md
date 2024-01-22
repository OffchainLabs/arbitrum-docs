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

When you visit the [Orbit chain deployment portal](https://orbit.arbitrum.io/) to launch your Orbit chain, you'll be prompted to complete a form that looks like this:

import { PlaceholderForm } from '/src/components/PlaceholderForm/PlaceholderForm';

<PlaceholderForm inputs="Chain ID, Chain name, Challenge period (blocks), Stake token, Base stake, Owner" />

This form will be prefilled with default values that usually don't need to be changed. However, there are some cases where you may want to customize the configuration values. This how-to explains how and when to modify these default values.

Let's briefly review each of the deployment configuration parameters, the rationale underlying the default values, and the tradeoffs that you should consider when modifying them.

### Chain ID

Don't worry about this; it's inconsequential for devnets. In production scenarios (which aren't yet supported), you'll want to use a unique integer identifier that represents your chain's network on chain indexes like [Chainlist.org](http://chainlist.org).

### Chain name

This name provides a way for people to distinguish your Orbit chain from other Orbit chains. You’ll want to make this a name that you can easily remember, and that your users and developers will recognize.

### Challenge period (blocks)

The `Challenge period (blocks)` parameter determines the amount of time your chain's validators have to dispute - or "challenge" - the current state of the chain posted to your Orbit chain's base chain on L2 (Arbitrum Goerli or Sepolia for now; settlement to One and Nova mainnet chains isn't supported yet).

A longer challenge period means that your chain's nodes will have more time to dispute fraudulent states, but it also means that your chain's users will have to wait longer to withdraw their assets from your chain. This is one of the many tradeoffs that Orbit allows you to make when configuring your chain.

Note that the challenge period is measured in blocks on the underlying L1 chain, not the base (L2) chain. For example, if your Orbit chain settles to Arbitrum Goerli, the challenge period window would be the number of `Challenge period (blocks)` multiplied by the L1 Goerli block time (~12 seconds).

<!-- todo: revisit and discuss defaults -->

### Gas Token

The `Gas Token` parameter specifies the token (ETH or an ERC-20 token) that is natively used for gas payments on the network. On Ethereum, Arbitrum One, and Arbitrum Nova the gas token is ETH. Orbit chains that are configured as AnyTrust chains can specify a different gas token as long as it falls within certain requirements.

The main requirement for custom gas tokens is that they are natively deployed on the parent chain. For example, if a team deploying an Orbit chain wants to use a specific ERC-20 as the gas token, that token must be deployed on the parent chain first (i.e. Arbitrum One or Nova). During chain deployment, that token is "natively bridged" and then properly configured as the native gas token on the new network.

There are other important considerations to keep in mind when deciding to use a custom gas token. Restrictions on the ERC-20 token include:

- In this version, only tokens with **18** decimals are permitted to be the native token.
- The token can't be rebasing or have a transfer fee.
- The token must only be transferrable via a call to the token address itself.
- The token must only be able to set allowance via a call to the token address itself.
- The token must not have a callback on transfer, and more generally a user must not be able to make a transfer to themselves revert.

It is worth reiterating that currently this feature is only supported on **Orbit AnyTrust chains**. Additionally, using a gas token other than ETH adds additional overhead when it comes to ensuring chains are funded properly when posting data to their parent chain.

### Stake token

Your Orbit chain will be supported by at least one validator node. In order for your chain's validators to post assertions of the state of the chain on the base chain (L2), they're required to stake some value as a way to incentivize honest participation.

This `Stake token` parameter specifies the token that your chain's validators must deposit into this contract when they stake. This is specified using the token's contract address on the L2 chain that your chain is settling to - Arbitrum Goerli or Arbitrum Sepolia - or `0x0000000000000000000000000000000000000000` if you want to use ETH as the stake token.

### Base stake

The `Base stake` parameter specifies the amount of the stake token (ETH or an ERC-20 token) that your chain's validators must deposit in order to post assertions of the state of your Orbit chain on the base chain's rollup contracts. This is specified using a float value.

If your `Base stake` is low, the barrier to participation will be low, but your chain will be more vulnerable to certain types of attacks.

For example, an Orbit chain with a base stake of 0.01 ETH could be halted by an adversary who can afford to deploy sacrificial validators that maliciously challenge every RBlock submitted to your Orbit chain's base chain.

The malicious challenges would result in slashed Orbit chain validators (one slashed validator per malicious challenge), but from the adversary's perspective, periodic slashing is just the price they have to pay to keep your chain offline.

A higher base stake incentivize honest participation by making it more expensive to launch these types of attacks. However, a higher base stake also translates to a higher barrier to entry for your chain's validators. This is another tradeoff to consider.

### Owner

This account address is responsible for deploying, owning, and updating your Orbit chain's base contracts on its base chain.

<!-- possible cut / clarification: --**rollup owner**, and also it has been used as **chain owner** -->

In production scenarios, this is a high-stakes address that's often controlled by a DAO's governance protocol or multisig. For your Orbit devnet chain, think of this as a low-stakes administrative service account.

Note that **you'll have to fund this address** with enough ETH to cover the gas costs of deploying your core contracts to L2.

When deploying your Orbit chain, this address must be a standard Ethereum wallet address (precisely speaking, an EOA); it can't be a smart contract/wallet contract.

## Additional Configuration Parameters

There are a number of additional parameters that are not presented in the deployment UI, but are still configurable for more advanced chain deployers.

### Extra challenge period blocks

This parameter specifies the amount of time to wait before a challenge period expires. Like the challenge period parameter, this is measured in blocks on the underlying L1 chain, not the base (L2) chain. The default for this parameter is 200 blocks, or roughly 40 minutes.

This parameter can be set either in the `extraChallengeTimeBlocks` field in the `RollupCreator` config, or by calling `Rollup.setExtraChallengePeriodBlocks()`.

### Loser stake escrow

This parameter specifies the address where funds staked by a validator that has lost a challenge are sent to be escrowed. It is recommended that this be set to an address that is controlled by the chain owners or to the burn address if the desire is for escrowed funds to be lost.

This parameter can be set either in the `loserStakeEscrow` field in the `RollupCreator` config, or by calling `Rollup.setLoserStakeEscrow()`.

### WASM module root

This parameter specifies the hash of the WASM module root to be used when validating. The WASM module root is a 32 byte hash usually expressed in hexadecimal which is a merkelization of the replay binary, which is too large to be posted on-chain. This hash is set in the L1 rollup contract to determine the correct replay binary during fraud proofs. Unless the STF has been customized, the default WASM module root in the latest consensus release should be used.

This parameter can be set either in the `wasmModuleRoot` field in the `RollupCreator` confid, or by calling `Rollup.setWasmModuleRoot()`.

### Gas speed limit

This parameter specifies the target gas usage per second, over which the congestion mechanism activates. This parameter is set to 7 million on Arbitrum One and Nova, and alterations to this should be considered carefully, as setting it too high may resuly in state bloat that impacts the performance of the chain.

This parameter can be set by calling `ArbOwner.setSpeedLimit()` and passing in the maximum number of gas units to be executed per second.

### Block gas limit

This parameter specifies the maximum amount of gas that can be consumed by all of the transactions within a block. On Arbitrum One this is set to 30 million. It can comfortably be set higher, but may harm UX as the processing time of a block will increase correspondingly.

This parameter can be set by calling `ArbOwner.setMaxTxGasLimit()` and passing in the maximum number of gas units to be executed per block and transaction.

### Gas price floor

This parameter specifies the minimum gas price and is defaulted to 0.1 gwei. This can be set lower or higher as needed, and will impact the willingness of users to transact on the network.

This parameter can be set either in the `minL2BaseFee` field in the orbit setup script config or by calling `ArbOwner.setMinimumL2BaseFee()` passing in the minimum base fee in wei.

### Network fee Account

This parameter specifies the account that will receive the L2 surplus fees. It is recommended this is set to an address controlled by the chain owners, or the burn address if fees are intended to be burned. If set to zero, this defaults to the owner address.

This parameter can be set either in the `networkFeeReceiver` field in the orbit setup script config or by calling `ArbOwner.setNetworkFeeAccount()`.

### Infrastructure fee account

This parameter specifies the account that will receive the L2 base fees. It is recommended this is set to an address controlled by the chain owners, or the burn address if fees are intended to be burned. If set to zero, this defaults to the owner address.

This parameter can be set either in the `infrastructureFeeCollector` field in the orbit setup script config or by calling `ArbOwner.setInfraFeeAccount()`.

### L1 pricing reward recipient

This parameter specifies the account that will receive the rewards from the L1 fees. It is recommended this is set to an address controlled by the chain owners, or the burn address if fees are intended to be burned. By default, this is set to the owner address.

This parameter can be set by calling `ArbOwner.setL1PricingRewardRecipient()`.

### L1 pricing reward per unit (rate)

This parameter specified the amount of rewards per unit to send to the L1 pricing reward recipient (multiplied by the unitsAllocated). The default for this parameter is 15 wei.

This parameter can be set by calling `ArbOwner.setL1PricingRewardRate()` and passing in the amount of wei per unit to reward.

### Sequencer inbox maximum time variation

This parameter specifies the boundaries of the sequencer to manipulate blocks and timestamps. The default values are as follows, and are set as such on Arbitrum One:

- `delayBlocks`: 5760
- `futureBlocks`: 12
- `delaySeconds`: 86400
- `futureSeconds`: 3600

This parameter can be set either in the `sequencerInboxMaxTimeVariation` field in the `RollupCreator` config or by calling `SequencerInbox.setMaxTimeVariation` on the parent chain.

#### Force-include period

This parameter specifies the length of the period after which a delayed message can be included into the inbox without any action from the sequencer. This parameter corresponds to `delayBlocks` and `delaySeconds` above and is measured in L1 block time.

### Batch posting minimum frequency

This parameter specifies the maximum time to wait after a transaction is sent to post a batch containing it. Note that if no transactions are sent, no batches will be posted, regardless of this setting. The default setting is 1 hour, and can be set lower but may reduce efficiency in the case of low activity on the Orbit chain.

This parameter can be set in the `--node.batch-poster.max-delay` in the batch poster config.

### Validator node (branch) creation frequency

This parameter specifies the minimum time to wait since the last assertion to post a new assertion, if configured to post new assertions (”MakeNodes”). This is bypassed if there is an incorrect assertion and a dispute needs to be made by making a new assertion. Note that if no new batches are posted (and no force inclusion happens), no new assertions will be posted, regardless of this setting. The default setting is 1 hour and is alterable but should always be greater than the rollup contract's `minimumAssertionPeriod`, which is measured in L1 blocks and is defaulted to 75 blocks, or roughly 15 minutes.

This parameter can be set in the `--node.staker.make-assertion-interval` in the validator config.