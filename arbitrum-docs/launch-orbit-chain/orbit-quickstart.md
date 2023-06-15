---
title: "Quickstart: Launch an Orbit chain"
description: "Launch your own Orbit chain with the Arbitrum Nitro codebase's new license. Settle to Arbitrum's L2 chains via bridge contracts on the underlying L2 chain (Goerli for now; One and Nova coming soon). No need for permission from the Arbitrum DAO or Offchain Labs to create your Orbit chain. Modify the Nitro codebase freely for your chain."
sidebar_position: 2
target_audience: developers who want to create their own self-managed AnyTrust or One chain
sidebar_label: "Quickstart: Launch an Orbit chain"
---


import PublicPreviewBannerPartial from './partials/_orbit-public-preview-banner-partial.md'; 

<PublicPreviewBannerPartial />

This quickstart is for developers who want to launch their own Arbitrum Orbit chain.

By the end of this quickstart, you'll have a **local devnet chain** that hosts EVM-compatible smart contracts. Your chain will process transactions locally while settling to the public **Arbitrum Goerli testnet**. Familiarity with Ethereum, Ethereum's Goerli testnet, Arbitrum, and Solidity is expected.

If you're looking for a conceptual introduction to Orbit chains, see the [Gentle introduction to Orbit chains](./orbit-gentle-introduction.md).


:::caution YOUR ORBIT CHAIN IS A LOCAL DEVNET CHAIN (FOR NOW)

Your local Orbit chain will settle transactions to Arbitrum Goerli, **not a mainnet L2 chain**. We recommend using this public preview version of Orbit to **prototype** and **experiment**.

While you're tinkering locally, we'll be building the tech and docs that help you move your project from "local devnet chain that settles to Arbitrum Goerli" to "public production-ready chain that settles to Arbitrum One or Arbitrum Nova". Stay tuned!

:::


## Prerequisites

 - [Docker](https://docs.docker.com/get-docker/)
 - [Visual Studio Code](https://code.visualstudio.com/)
 - A browser-based Ethereum wallet (like [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn))
 - At least 1.5 Goerli ETH


## Step 1: Acquire Arbitrum Goerli $ETH ($AGOR)

<!-- note: this is a convention, currently used both here and in the OG quickstart. -->

<!-- todo: partialize / quicklookify these bits - duplicated in OG quickstart -->

:::info $AGOR IS SHORTHAND

"$AGOR" isn't a canonical term. It's just convenient shorthand for "Arbitrum Goerli testnet $ETH" that we use for convenience.

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

The below table provides a brief overview of each of these configuration parameters. We recommend sticking to the defaults; to learn more about customizing your Orbit chain's deployment configuration, visit [How (and when) to customize your Orbit chain's deployment config](./how-tos/customize-deployment-configuration.md):

<!-- todo: determine whether or not we want to align the UI with docs section-casing and param-casing patterns; align docs to UI if needed -->

<!-- todo: nudge fullstack to remove inline links to sections (maintenance overhead); evaluate cost of replacing inline docs links with question-icons that display guidance on hover/click -->


| Parameter                     | Description                                                                                                                                                                                                                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chain ID**                  | A unique integer identifier that represents your chain's network. Your `Chain ID` can be submitted to chain indexes like [Chainlist.org](http://chainlist.org). For devnets, this is randomly generated for each deployment - don't worry about it for now.                                                                         |
| **Chain name**                | A human-readable way to distinguish your Orbit chain from other Orbit chains. Users, developers and the wider community will refer to your chain by your `Chain name` and/or your `Chain ID`.                                                                                                                                       |
| **Challenge period (blocks)** | The amount of time that your Orbit chain's nodes have to dispute the current state of the chain before it's confirmed (and ultimately finalized) on the underlying L2 chain (Arbitrum Goerli). Note that this refers to the number of blocks on the underlying L1 chain (Ethereum's Goerli chain).                                  |
| **Stake token**               | The token that your chain's validators must stake in order to participate in your chain. This is hardcoded to $ETH for now, but future versions of Orbit chains will let you specify an arbitrary ERC-20 token contract here.                                                                                                       |
| **Base stake**                | The amount of your configured `Stake token` that your chain's validators must stake in order to participate in your chain. Should be greater than 0.                                                                                                                                                                                |
| **Owner**                     | The administrative Ethereum address that will deploy, own, and update your chain's base contracts. This will default to your connected wallet's address. Note that you'll have to specify the private key associated with this wallet into a local JSON file later; consider using a burner account in the spirit of opsec hygiene. |


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

## Step 5: Download your chain's configuration files and launch your chain

You should see two buttons appear: `Download Rollup JSON` and `Download L3Config JSON`. Follow the instructions in the UI to download your configuration files and deploy your Orbit chain locally using Docker.


<!-- todo: align UI with terminology patterns - eg NOT saying L3 -->

<!-- todo: instructions become fragmented between UI <> docs at this point. Recommend sticking to one or the other for subsequent steps, so as to minimize fragmentation/friction/confusion for devs. Will likely need to align on this. -->

<!-- editing stopped here -->

<!-- possibly unnecessary, as instructions are provided in the UI 

 1. Clicking **Download Rollup JSON** will generate `nodeConfig.json`: This file will be consumed as the configuration for your chain's node, contains validator (staker) and batch poster setup. It also contains the private key for your chain's batch poster, which is used to send the batched transaction and also private key for your chain's staker, which is used to sign transactions that post RBlocks to your chain's core contracts on L2.
 2. Clicking **Download L3Config JSON** will generate `orbitSetupScriptConfig.json`: This file contains the configuration for your chain. It'll be consumed to setup your chain parameters and also setting up your **Token Bridge Contract**.

-->

<!-- prev

In this last step you can download two configuration files in JSON format. By clicking on **Download Rollup JSON**, a file named **nodeConfig.json** will be downloaded. This config file would be used to run Orbit node, which will be discussed later.

Also by clicking on **Download L3Config JSON**, a file named **orbitSetupScriptConfig.json** will be downloaded. This config file would be consumed later by Orbit setup script later in order to setup final steps of running Orbit chain.

-->

<!-- possibly unnecessary, as instructions are provided in the UI 

## Step 6: Clone "Orbit setup script" repository and Moving config files

Clone the repository of [orbit-setup-script](https://github.com/OffchainLabs/orbit-setup-script) from our github. This script will handle running node, and also setting up your chain.

After cloning you need to:

- Move the **nodeConfig.json** file that you downloaded into the  ```chain``` directory, where you have cloned the orbit setup script.
   
- Also move the **orbitSetupScriptConfig.json** file you downloaded into ```config``` directory of the path.

- To install all dependencies for this script, you need to run:

   ```shell
    yarn install
    ```


## Step 7: Running chain node


I’m not sure exactly where to leave this feedback but this feedback is addressed at the current step 7 as reflected in the latest staged version with step 7’s header reading “Running chain node”:

we want to make it clear that running the docker compose command stands up a block explorer as well. so we could potentially:

1. update the header to say “Running the Orbit chain node and Block Explorer”

and 2. update the body copy to mention that the blockscout instance is helpful for debugging.


To run the node, in the base directory run:

   ```shell
      docker-compose up -d 
   ```
Note that you need Docker up and running, before running the command.

By running this command:
- A Nitro node will be run for your chain
- A BlockScout explorer instance would be run for your chain, which you can find it from [http://localhost:4000/](http://localhost:4000/)


## Step 8: chain setup phase

Now that your chain node is up and running, you need to take some other steps to set things up completely. These steps would be:

1. Funding **batch-poster** and **staker** accounts on underlying L2 chain.
2. Depositing ETH into your account on the chain using your chain's newly deployed bridge
3. Deploying Token Bridge Contracts on both L2 and chains. For more info on what/why/how is Token Bridge, please visit our docs.
4. Configuring parameters on the chain.

Don't worry about all the things discussed above. We wrote a hardhat script which you already cloned it, and it'll do all the things for you. To run the script just **put your private key** in the command below and run it on the base directory of the script:


   ```shell
    PRIVATE_KEY="0xYourPrivateKey" L2_RPC_URL="https://goerli-rollup.arbitrum.io/rpc" L3_RPC_URL="http://localhost:8449" yarn run setup
   ```

Note: The private key MUST be the chain owner private key, otherwise you cannot setup the chain.

## Step 9 LFG!! 

Congratulations! 🎉🎉🎉

Your Chain is completely set up and configured. You can find all information you would need in the future about the newly deployed chain in the ```outputInfo.json``` file which is created on the main directory of script folder!


### optional:

- If you want to track and have view of all logs of your node, you can just run this command on the main directory of the orbit setup script:`

   ```shell
   docker-compose logs -f nitro
   ```

- If you run out of ETH on your account on the chain, you can easily deposit more ETH from your account on Arbitrum Goerli into your account on the chain by running this command on the base directory of the setup script:

   ```shell
    PRIVATE_KEY="0xYourPrivateKey" L2_RPC_URL="https://goerli-rollup.arbitrum.io/rpc" L3_RPC_URL="http://localhost:8449" AMOUNT="Put your desired amount of ETH here" yarn run deposit
   ```
   **Note:** Don't forget to replace your private key and also the amount you want to deposit on corresponding places on the command above.

**Note** that as mentioned, this step is completely ```optional```.

**Note:** When you first start up the node, you may see "error getting latest batch count" on the logs (if you run the log for nodes) because the core contracts deployment is not finalized on the underlying L1 yet. It may take 15-20 minutes for the finalization. Worths mentioning that you can do all with the chain and it won't affect the functionalities.


-->

Congratulations! You've deployed your local devnet Orbit chain.