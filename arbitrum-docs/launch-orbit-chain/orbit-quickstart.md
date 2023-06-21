---
title: "Quickstart: Launch an Orbit chain"
description: "Launch your own Orbit chain with the Arbitrum Nitro codebase's new license. Settle to Arbitrum's L2 chains via bridge contracts on the underlying L2 chain (Goerli for now; One and Nova coming soon). No need for permission from the Arbitrum DAO or Offchain Labs to create your Orbit chain. Modify the Nitro codebase freely for your chain."
sidebar_position: 2
target_audience: developers who want to create their own self-managed AnyTrust or One chain
sidebar_label: "Quickstart: Launch an Orbit chain"
---


This quickstart is for developers who want to launch their own Arbitrum Orbit chain.

By the end of this quickstart, you'll have a **local devnet chain** that hosts EVM-compatible smart contracts. Your chain will process transactions locally while settling to the public **Arbitrum Goerli testnet**. Familiarity with Ethereum, Ethereum's Goerli testnet, and Arbitrum is expected.

If you're looking for a conceptual introduction to Orbit chains, see the [Gentle introduction to Orbit chains](./orbit-gentle-introduction.md).

import PublicPreviewBannerPartial from './partials/_orbit-public-preview-banner-partial.md'; 

<PublicPreviewBannerPartial />

:::caution YOUR ORBIT CHAIN IS A LOCAL DEVNET CHAIN (FOR NOW)

Your local Orbit chain will settle transactions to Arbitrum Goerli, **not a mainnet L2 chain**. We recommend using this public preview version of Orbit to **prototype** and **experiment**.

While you're tinkering locally, we'll be building the tech and docs that help you move your project from "local devnet chain that settles to Arbitrum Goerli" to "public production-ready chain that settles to Arbitrum One or Arbitrum Nova". Stay tuned!

:::


## Prerequisites

 - [Docker](https://docs.docker.com/get-docker/)
 - A browser-based Ethereum wallet (like [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn))
 - At least 1.5 Goerli ETH


## Step 1: Acquire Arbitrum Goerli $ETH ($AGOR)

<!-- note: this is a convention, currently used both here and in the OG quickstart. -->

<!-- todo: partialize / quicklookify these bits - duplicated in OG quickstart -->

:::info $AGOR IS SHORTHAND

"$AGOR" isn't a canonical term. It's just shorthand for "Arbitrum Goerli testnet $ETH" that we use for convenience.

:::

You'll need at least 1.5 $AGOR to cover the cost of deploying your Orbit chain's **base contracts** to its **base chain** (Arbitrum Goerli). 

At the time of this quickstart's writing, the easiest way to acquire $AGOR is to bridge Goerli $ETH from Ethereum's L1 Goerli network to Arbitrum's L2 Goerli network:

 1. Use an L1 Goerli $ETH faucet like [goerlifaucet.com](https://goerlifaucet.com/) to acquire some testnet $ETH on L1 Goerli.
 2. Bridge your L1 Goerli $ETH into Arbitrum L2 using [the Arbitrum bridge](https://bridge.arbitrum.io/).


## Step 2: Configure your Orbit chain's deployment

<!-- https://orbit-deployment-ui.vercel.app/ -->

Visit the [Orbit chain deployment portal](https://orbit.arbitrum.io/deployment). You'll be prompted to connect your wallet. You may be prompted to add the **Arbitrum Goerli** network to your wallet and/or to switch your wallet to this network; approve this.

The deployment portal will then display a form that looks like this:

import { PlaceholderForm } from '/src/components/PlaceholderForm/PlaceholderForm';

<PlaceholderForm inputs="Chain ID, Chain name, Challenge period (blocks), Stake token, Base stake, Owner" />

The below table provides a brief description of each of these configuration parameters. We recommend sticking to the defaults; to learn more about customizing your Orbit chain's deployment configuration, visit [How (and when) to customize your Orbit chain's deployment config](./how-tos/customize-deployment-configuration.md):

<!-- todo: determine whether or not we want to align the UI with docs section-casing and param-casing patterns; align docs to UI if needed -->


| Parameter                     | Description                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chain ID**                  | A unique integer identifier that represents your chain's network. Your `Chain ID` can be submitted to chain indexes like [Chainlist.org](http://chainlist.org). For devnets, this is randomly generated for each deployment - don't worry about it for now.                                                                               |
| **Chain name**                | A human-readable way to distinguish your Orbit chain from other Orbit chains. Users, developers and the wider community will refer to your chain by your `Chain name` and/or your `Chain ID`.                                                                                                                                             |
| **Challenge period (blocks)** | The amount of time that your Orbit chain's nodes have to dispute the current state of the chain before it's confirmed (and ultimately finalized) on the underlying L2 chain (Arbitrum Goerli). Note that this refers to the number of blocks on the underlying L1 chain (Ethereum's Goerli chain).                                        |
| **Stake token**               | The token that your chain's validators must stake in order to participate in your chain. This is hardcoded to $ETH for now, but future versions of Orbit chains will let you specify an arbitrary ERC-20 token contract here.                                                                                                             |
| **Base stake**                | The amount of your configured `Stake token` that your chain's validators must stake in order to participate in your chain. Should be greater than 0.                                                                                                                                                                                      |
| **Owner**                     | The administrative Ethereum address that will deploy, own, and update your chain's base contracts. This will default to your connected wallet's address. This needs to be a standard Ethereum wallet account - an EOA, not a contract address. Note that you'll have to specify this wallet's private key within a local JSON file later. |


## Step 3: Deploy your chain's base contracts to Arbitrum Goerli

<!-- todo: label-casing alignment - could sentence-case in UI -->

Click the `Deploy Rollup` button located below the config form. Your wallet should prompt you to submit a transaction to Arbitrum Goerli. You'll have to pay a little gas; your wallet may denominate this in $ETH; as long as you see `Arbitrum Goerli` in the transaction details, this gas fee will be paid in $AGOR.

Once this form-submission transaction is confirmed, you'll see a number of contract addresses appear below your `Deployment Summary`. These are your Orbit chain's **base contracts**, deployed to its **base chain** (Arbitrum Goerli).

<!-- todo: triple-check that "base contracts" is the term we want to use - previously signed off in pattern guide -->

:::info NEW TERMINOLOGY

When we say "base contracts" and "base chain", we're referring to your Orbit chain's L2 contracts and the L2 chain that they're deployed to, respectively. We'll use these terms throughout the rest of this guide.

:::

Before proceeding, let's briefly review what just happened:

 - You submitted a deployment transaction to an Orbit "factory" smart contract on Arbitrum Goerli, the public L2 chain that your local Orbit chain will settle transactions to.
 - This Orbit smart contract then initialized your Orbit chain's base contracts with the values that you specified in the previous step, and deployed these base contracts to Arbitrum Goerli.


Your Orbit chain's base contracts are responsible for facilitating the exchange of information between your chain's node(s) and its base chain's nodes. This includes the batch posting of transactions from your Orbit chain to its base chain, the staking of tokens by your Orbit chain's validators, the challenge mechanism, bridging mechanisms, and more.

Click `Next` to proceed to the next step: **validator configuration**. 


## Step 4: Configure your chain's validator(s)

You should see a `Configure Validators` section appear, with a form that looks like this:

<PlaceholderForm inputs="Number of Validators, Validator 1 (0x...), [...], Validator n (0x...)" />

The first input field is an integer value that determines **the number of validators that will support your initial deployment**. Subsequent fields allow you to specify each of these validators' addresses.

The first validator address is randomly generated and can't be changed. Its private key will be automatically generated and stored within one of the JSON configuration files that will be generated in a moment.

<!-- possible cut (we can provide this information when it's needed): a `Staker` JSON property that you'll find in the -->

Your chain's validators are responsible for validating the integrity of transactions and posting assertions of the current state of your Orbit chain to its base chain. In production scenarios, your Orbit chain would likely be hosted by a network of validator nodes working together. For your local Orbit chain, you can stick to the auto-generated single validator address.

<!-- possible cut (relevance is unclear): We call this validator ```Staker account ```, because this validator would be responsible to create new RBlocks and stake on them. -->

Each of the validator addresses specified in this step will be added to an allow-list in one of your chain's base contracts, allowing them each to **stake** and validate transactions submitted to your Orbit chain.

<!-- possible cut (meaning is unclear): or even challenges staker of a specific RBlock. -->

Click `Submit` to issue another Arbitrum Goerli transaction that allow-lists your configured validator addresses within your Orbit chain's base contracts. 

Once this transaction is confirmed, you should see a `Validator set changed!` notification appear in the portal UI. Click `Next` to proceed the next step: **batch poster configuration**.

## Step 5: Configure your chain's batch poster

You should see a `Configure Batch Poster` section appear, with a form that looks like this:

<PlaceholderForm inputs="Batch Poster Address" />

Your batch poster address is responsible for posting batches of transactions from your Orbit chain to its base contracts on its base chain. An address will automatically be generated for you; its private key will be automatically generated and stored within one of the JSON configuration files that will be generated in a moment.

Click `Submit` to issue the final Arbitrum Goerli transaction that configures the specified batch poster address within your Orbit chain's base contracts.

Once this transaction is confirmed, you should see a `Batch poster changed!` notification appear in the portal UI. Click `Next` to proceed to the next step: **Download your chain's config files**.

<br />

:::caution UNDER CONSTRUCTION

The following steps are under construction and will be updated with more detailed guidance soon. Stay tuned, and don't hesitate to click the `Request an update` at the top of this document if you have any feedback along the way.

:::


## Step 6: Download your chain's configuration files and launch your chain

You should see two buttons appear: `Download Rollup JSON` and `Download L3Config JSON`. Follow the instructions in the UI to download your configuration files and deploy your Orbit chain locally using Docker.


<!-- todo: align UI with terminology patterns - eg NOT saying L3 -->

 1. **Download Rollup JSON**: This will generate `nodeConfig.json`, which contains your **chain's node configuration**. Note that this includes the private keys for your validator (staker) and batch poster, which are used to sign transactions that post RBlocks to your chain's base contracts on L2.
 2. **Download L3Config JSON**: This will generate `orbitSetupScriptConfig.json`, which contains your **chain's configuration**, including that which supports your **Token Bridge Contract**.



## Step 7: Clone the setup script repository and add your configuration files

 1. Clone the [orbit-setup-script](https://github.com/OffchainLabs/orbit-setup-script) repository: `git clone https://github.com/OffchainLabs/orbit-setup-script.git`
 2. Move the `nodeConfig.json` file that you downloaded into the  `chain` directory in the root of your cloned `orbit-setup-script` repository.
 3. Move the `orbitSetupScriptConfig.json` file you downloaded into the `config` directory in the root of your cloned `orbit-setup-script` repository.
 4. Install dependencies by running `yarn install` from the root of the `orbit-setup-script` repository.


## Step 8: Run your chain's node and block explorer

Run Docker, then run `docker-compose up -d` from the root of the `orbit-setup-script` repository.

A Nitro node and BlockScout explorer instance will be started. Visit [http://localhost:4000/](http://localhost:4000/) to access your BlockScout explorer instance - this will allow you to view your chain's transactions and blocks, which can be useful for debugging.


## Step 9: Finish setting up your chain

We've provided a Hardhat script that handles the following tasks:

1. Fund the **batch-poster** and **validator** (staker) accounts on your underlying L2 chain.
2. Deposit ETH into your account on the chain using your chain's newly deployed bridge.
3. Deploy your Token Bridge Contracts on both L2 and chains.
4. Configure parameters on the chain.

To run this script, issue the following command from the root of the `orbit-setup-script` repository, replacing `OxYourPrivateKey` with the private key of the `Owner` account you used to deploy your chain's contracts, and replacing `http://localhost:8449` with the RPC URL of your chain's node.


```shell
PRIVATE_KEY="0xYourPrivateKey" L2_RPC_URL="https://goerli-rollup.arbitrum.io/rpc" L3_RPC_URL="http://localhost:8449" yarn run setup
```

## Congratulations!

Your local Orbit chain is now running. You'll see an `outputInfo.json` file in the main directory of your script folder - this contains more information about your chain, including the addresses of your chain's base contracts.


### Appendix A: Logging

Run this command in the root directory of your cloned orbit setup script repo to view your chain's logs:

```shell
docker-compose logs -f nitro
```

### Appendix B: Depositing ETH

If you need to deposit more ETH into either your validator or batch poster addresses, run this command on the base directory of the setup script, replacing `0xYourPrivateKey` and `<AMOUNT>`:

```shell
PRIVATE_KEY="0xYourPrivateKey" L2_RPC_URL="https://goerli-rollup.arbitrum.io/rpc" L3_RPC_URL="http://localhost:8449" AMOUNT="<AMOUNT>" yarn run deposit
```


### Appendix C: Troubleshooting

 - You may see `error getting latest batch count` in your node's output logs (from Appendix A). This is usually safe to ignore. It's usually displayed when your Orbit chain's base contract deployment isn't yet finalized on the L1 chain. This finalization can take 15-20 minutes, but don't worry - the deployment doesn't need to be L1-finalized in order for your chain to function properly.