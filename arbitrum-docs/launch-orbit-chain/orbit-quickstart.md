---
title: 'Quickstart: Launch an Orbit chain'
description: "Launch your own Orbit chain with the Arbitrum Nitro codebase's new license. Settle to Arbitrum's L2 chains via bridge contracts on the underlying L2 chain (Sepolia, One or Nova). No need for permission from the Arbitrum DAO or Offchain Labs to create your Orbit chain. Modify the Nitro codebase freely for your chain."
sidebar_position: 2
author: greatsoshiant
sme: greatsoshiant
editor: symbolpunk
target_audience: developers who want to create their own self-managed AnyTrust or One chain
---

This quickstart is for developers who want to launch their own Arbitrum Orbit chain using the [Orbit chain deployment portal](https://orbit.arbitrum.io/).

:::caution Not for Mainnet Production

This quickstart is intended for development purposes only and is not suitable for deploying production-grade mainnet chains.

:::

By the end of this quickstart, you'll have a **local devnet chain** that hosts EVM-compatible smart contracts. Your chain will process transactions locally while settling to the public **Arbitrum Sepolia testnet**. Familiarity with Ethereum, Ethereum's testnets, and Arbitrum is expected.

If you're looking for a conceptual introduction to Orbit chains, see the [Gentle introduction to Orbit chains](/launch-orbit-chain/01-a-gentle-introduction.md).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- A browser-based Ethereum wallet (e.g., [MetaMask](https://metamask.io/) and click View MetaMask web or [OKX Wallet](https://www.okx.com/web3) and click Connect Wallet to install.
- At least 1.2 testnet `ETH` (for custom gas token chains, 0.8 `ETH` and 0.4 native tokens)

## Step 1: Acquire Arbitrum Testnet `ETH` (and the native token for Orbit chains with custom gas tokens)

You'll need at least 1.2 testnet `ETH` for regular Orbit chains or 0.8 `ETH` plus 0.4 of your desired native token for Orbit chains with a custom gas token. The funds are needed to cover the cost of deploying your Orbit chain's **base contracts** to its **base chain** (Arbitrum Sepolia).

At the time of this quickstart's writing, the easiest way to acquire `ETH` is to bridge testnet `ETH` from Ethereum's L1 Sepolia network to Arbitrum Sepolia L2 testnet:

1. Use an L1 testnet `ETH` faucet like [sepoliafaucet.com](https://sepoliafaucet.com/) to acquire some testnet `ETH` on an L1 testnet.
2. Bridge your L1 testnet `ETH` into Arbitrum L2 using [the Arbitrum bridge](https://bridge.arbitrum.io/).

## Step 2: Choose your chain type: AnyTrust or Rollup

<!-- when we start a line with HTML (such as quicklook <a></a> anchors), the markdown -> HTML rendering doesn't render the line into a <p></p> tag, which removes the vertical margin between paragraphs. We fix this by manually reintroducing the <p></p> tag whenever we need to begin a line with an HTML element. -->

<p>
  <a data-quicklook-from="arbitrum-rollup-protocol">Arbitrum Rollup</a> is an Optimistic Rollup
  protocol; it's <a data-quicklook-from="trustless">trustless</a> and permissionless. These
  properties are achieved by requiring all chain data to be posted on Ethereum's "Layer 1" (L1)
  chain. This means the availability of this data follows directly from the security properties of
  Ethereum itself, and, in turn, that any party can participate in validating the chain and ensuring
  its safety.
</p>

By contrast, <a data-quicklook-from='arbitrum-anytrust-protocol'>Arbitrum AnyTrust</a> introduces a trust assumption in exchange for lower fees. Instead of requiring all Arbitrum nodes to have access to the data of every L2 transaction in the Arbitrum chain's inbox, AnyTrust relies on an external <a data-quicklook-from='data-availability-committee-dac'>Data Availability Committee</a> to store data and provide it on demand, reducing the costs of batching and posting all L2 transaction data to L1. Visit our [FAQ docs](../learn-more/faq) to learn more.

We generally recommend using Rollup chains for use-cases that demand the highest level of security (like decentralized exchanges and other DeFi dApps). AnyTrust chains are suitable for use-cases that require lower fees and generate lots of transactions (like gaming and social dApps).

## Step 3: Configure your Orbit chain's deployment

<!-- https://orbit-deployment-ui.vercel.app/ -->

Visit the [Orbit chain deployment portal](https://orbit.arbitrum.io/). You'll be prompted to connect your wallet. You may be prompted to add the **Arbitrum Sepolia** network to your wallet and/or to switch your wallet to this network; approve this.

The deployment portal will then display a form that looks like this:

import { PlaceholderForm } from '/src/components/PlaceholderForm/PlaceholderForm';

<PlaceholderForm inputs="Chain ID, Chain name, Challenge period (blocks), Stake token, Base stake, Owner" />

The below table provides a brief description of each of these configuration parameters. We recommend sticking to the defaults; to learn more about customizing your Orbit chain's deployment configuration, visit [How (and when) to customize your Orbit chain's deployment config](/launch-orbit-chain/02-configure-your-chain/common-configurations/01-use-a-custom-gas-token.mdx):

<!-- todo: determine whether or not we want to align the UI with docs section-casing and param-casing patterns; align docs to UI if needed -->

| Parameter                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chain ID**                  | A unique integer identifier that represents your chain's network. Your `Chain ID` can be submitted to chain indexes like [Chainlist.org](http://chainlist.org). For devnets, this is randomly generated for each deployment - don't worry about it for now.                                                                                                                                                                                                                        |
| **Chain name**                | A human-readable way to distinguish your Orbit chain from other Orbit chains. Users, developers and the wider community will refer to your chain by your `Chain name` and/or your `Chain ID`.                                                                                                                                                                                                                                                                                      |
| **Challenge period (blocks)** | The amount of time that your Orbit chain's nodes have to dispute the current state of the chain before it's confirmed (and ultimately finalized) on the underlying L2 chain (e.g. Arbitrum Sepolia). Note that this refers to the number of blocks on the underlying L1 chain (e.g., Ethereum's Sepolia chain).                                                                                                                                                                    |
| **Stake token**               | The token that your chain's validators must stake in order to participate in your chain. This is hardcoded to `ETH` for now, but future versions of Orbit chains will let you specify an arbitrary `ERC-20` token contract here.                                                                                                                                                                                                                                                   |
| **Base stake**                | The amount of your configured `Stake token` that your chain's validators must stake in order to participate in your chain. Should be greater than 0.                                                                                                                                                                                                                                                                                                                               |
| **Owner**                     | The administrative Ethereum address that will deploy, own, and update your chain's base contracts. This will default to your connected wallet's address. This needs to be a standard Ethereum wallet account - an EOA, not a contract address. Note that you'll have to specify this wallet's private key within a local JSON file later.                                                                                                                                          |
| **Gas token**                 | The address of the `ERC-20` token on the parent chain that is intended to be used as the native gas token on the Orbit chain. This token must already be deployed natively on the parent chain and is bridged to the Orbit chain during chain deployment. This feature is only supported on AnyTrust chains currently, and more information around token restrictions can be found [here](https://docs.arbitrum.io/launch-orbit-chain/how-tos/customize-deployment-configuration). |

## Step 4: Configure your chain's validator(s)

You should see a `Configure Validators` section appear, with a form that looks like this:

<PlaceholderForm inputs="Number of Validators, Validator 1 (0x...), [...], Validator n (0x...)" />

The first input field is an integer value that determines **the number of validators that will support your initial deployment**. Subsequent fields allow you to specify each of these validators' addresses.

The first validator address is randomly generated and can't be changed. Its private key will be automatically generated and stored within one of the JSON configuration files that will be generated in a moment.

<!-- possible cut (we can provide this information when it's needed): a `Staker` JSON property that you'll find in the -->

Your chain's validators are responsible for validating the integrity of transactions and posting assertions of the current state of your Orbit chain to its base chain. In production scenarios, your Orbit chain would likely be hosted by a network of validator nodes working together. For your local Orbit chain, you can stick to the auto-generated single validator address.

<!-- possible cut (relevance is unclear): We call this validator ```Staker account ```, because this validator would be responsible to create new RBlocks and stake on them. -->

Each of the validator addresses specified in this step will be added to an allow-list in one of your chain's **base contracts**, allowing them each to **stake** and validate transactions submitted to your Orbit chain.

<!-- todo: triple-check that "base contracts" is the term we want to use - previously signed off in pattern guide -->

:::info NEW TERMINOLOGY

When we say "base contracts" and "base chain", we're referring to your Orbit chain's L2 contracts and the L2 chain that they're deployed to, respectively. We'll use these terms throughout the rest of this guide.

:::

<!-- possible cut (meaning is unclear): or even challenges staker of a specific RBlock. -->

Once your validator addresses are configured, click `Next` to proceed the next step: **batch poster configuration**.

## Step 5: Configure your chain's batch poster

You should see a `Configure Batch Poster` section appear, with a form that looks like this:

<PlaceholderForm inputs="Batch Poster Address" />

Your batch poster address is responsible for posting batches of transactions from your Orbit chain to its base contracts on its base chain. An address will automatically be generated for you; its private key will be automatically generated and stored within one of the JSON configuration files that will be generated in a moment.

Once your batch poster address is configured, click `Next` to proceed to the next step: **review & deploy your Orbit chain**.

## Step 6: Review & Deploy your Orbit chain

Deploy your chain's base contracts to Arbitrum Sepolia

<!-- todo: label-casing alignment - could sentence-case in UI -->

Click the **Deploy** button located below the config form. Your wallet should prompt you to submit a transaction to the Arbitrum testnet. You'll have to pay a little gas; your wallet may denominate this in ETH; as long as you see your chosen Arbitrum testnet in the transaction details, this gas fee will be paid in testnet ETH.

Before proceeding, let's briefly review what just happened:

- You submitted a deployment transaction to an Orbit "factory" smart contract on the Arbitrum testnet, the public L2 chain that your local Orbit chain will settle transactions to.
- This Orbit smart contract then initialized your Orbit chain's base contracts with the values that you specified in the previous step, and deployed these base contracts to the Arbitrum testnet.

Your Orbit chain's base contracts are responsible for facilitating the exchange of information between your chain's node(s) and its base chain's nodes. This includes the batch posting of transactions from your Orbit chain to its base chain, the staking of tokens by your Orbit chain's validators, the challenge mechanism, bridging mechanisms, and more.

Once your transaction is complete, if you deployed an AnyTrust chain, you'll next be asked to configure your keyset. Otherwise, continue to [Step 8](#step-8-download-your-chains-configuration-files-and-launch-your-chain) to download your chain's configuration files and launch your chain.

## Step 7: Configure keyset (AnyTrust chains only)

:::info Not applicable to Rollup chains

Skip this step if you're deploying a Rollup chain.

:::

For the Batch Poster to function correctly, it's essential that the keyset corresponding to its current configuration is active within the `SequencerInbox` contract. The production of the keyset and keyset hash binary blobs is mandatory, which should then be used as inputs for the `SetValidKeyset` method on the `SequencerInbox` contract.

The current version of Orbit AnyTrust chains uses a single Data Availability Server and assigns a null value to its private key in order to generate an initial keyset. As part of this transaction process, you'll assign this initial keyset to your recently generated `SequencerInbox` contract.

Click the **Deploy** button located below the Deployment Summary. Again, your wallet should prompt you to submit a transaction to the Arbitrum testnet. Gas fees will be handled similarly to the previous transaction.

Once the transaction completes, you'll be directed to the download page to continue your chain deployment.

## Step 8: Download your chain's configuration files and launch your chain

You should see two JSON code blocks appear labeled `Rollup Config` and `L3 Config`. Use the download buttons at the top right of each code block to save it locally.

<!-- todo: align UI with terminology patterns - eg NOT saying L3 -->

1.  **Download Rollup JSON**: This will generate `nodeConfig.json`, which contains your **chain's node configuration**. Note that this includes the private keys for your validator (staker) and batch poster, which are used to sign transactions that post RBlocks and batches to your chain's base contracts on L2.
2.  **Download L3Config JSON**: This will generate `orbitSetupScriptConfig.json`, which contains your **chain's configuration**, including that which supports your **Token Bridge contracts**.

## Step 9: Clone the setup script repository and add your configuration files

1.  Clone the [orbit-setup-script](https://github.com/OffchainLabs/orbit-setup-script) repository: `git clone https://github.com/OffchainLabs/orbit-setup-script.git`
2.  Move the `nodeConfig.json` file that you downloaded into the `config` directory in the root of your cloned `orbit-setup-script` repository.
3.  Move the `orbitSetupScriptConfig.json` file you downloaded into the `config` directory in the root of your cloned `orbit-setup-script` repository.
4.  Install dependencies by running `yarn install` from the root of the `orbit-setup-script` repository.

## Step 10: Run your chain's node and block explorer

Run Docker, then run `docker-compose up -d` from the root of the `orbit-setup-script` repository.

A Nitro node and BlockScout explorer instance will be started. Visit [http://localhost/](http://localhost/) to access your BlockScout explorer instance - this will allow you to view your chain's transactions and blocks, which can be useful for debugging.

## Step 11: Finish setting up your chain

We've provided a Hardhat script that handles the following tasks:

1. Fund the **batch-poster** and **validator** (staker) accounts on your underlying L2 chain.
2. Deposit ETH into your account on the chain using your chain's newly deployed bridge.
3. Deploy your Token Bridge contracts on both L2 and local Orbit chains.
4. Configure parameters on the chain.

To run this script, issue the following command from the root of the `orbit-setup-script` repository, replacing `OxYourPrivateKey` with the private key of the `Owner` account you used to deploy your chain's contracts, and replacing `http://localhost:8449` with the RPC URL of your chain's node.

Using Arbitrum Sepolia:

```shell
PRIVATE_KEY="0xYourPrivateKey" L2_RPC_URL="https://sepolia-rollup.arbitrum.io/rpc" L3_RPC_URL="http://localhost:8449" yarn run setup
```

<!-- todo: align on mainnet guidance when ready to update quickstart -->

## Congratulations

Your local Orbit chain is now running. You'll see an `outputInfo.json` file in the main directory of your script folder––this contains more information about your chain, including the addresses of your chain's base contracts.

### Appendix A: Logging

Run this command in the root directory of your cloned orbit setup script repo to view your chain's logs:

```shell
docker-compose logs -f nitro
```

### Appendix B: Depositing ETH/native token

If you need to deposit more `ETH` (or native tokens) into your Orbit chain account, run this command on the base directory of the setup script, replacing `0xYourPrivateKey` with the private key of the originating account, and `<AMOUNT>` with the amount to send:

Using Arbitrum Sepolia:

```shell
PRIVATE_KEY="0xYourPrivateKey" L2_RPC_URL="https://sepolia-rollup.arbitrum.io/rpc" L3_RPC_URL="http://localhost:8449"
AMOUNT="<AMOUNT>" yarn run deposit
```

### Appendix C: Troubleshooting

- You may see `error getting latest batch count` in your node's output logs (from Appendix A). This is usually safe to ignore. It's usually displayed when your Orbit chain's base contract deployment isn't yet finalized on the L1 chain. This finalization can take 15-20 minutes, but don't worry––the deployment doesn't need to be L1-finalized in order for your chain to function properly.
