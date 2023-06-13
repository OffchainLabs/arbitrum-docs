---
title: "Quickstart: Launch an Orbit appchain (Experimental)"
description: "Launch your own Orbit appchain with the Arbitrum Nitro codebase's new license. Settle to Arbitrum's L2 chains via bridge contracts on the underlying L2 chain (Goerli for now; One and Nova coming soon). No need for permission from the Arbitrum DAO or Offchain Labs to create your appchain. Modify the Nitro codebase freely for your appchain."
sidebar_position: 2
author: oliviaJ3388
sidebar_label: "Quickstart: Launch an Orbit appchain"
---

import { PlaceholderForm } from '/src/components/PlaceholderForm/PlaceholderForm';

import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md'; 

<PublicPreviewBannerPartial />

:::warning Editor's note

 - We'll tighten this copy up after we "feedback freeze" the docs, just before publishing them.
 - Docs generally flow through `outline` -> `draft` -> `edit` -> `publish`; we're currently `drafting`.
 - Don't worry too much about the finer editorial details; the most useful feedback at this point will focus on technical truth, product truth, core messaging, and devex.
 - As of 6/12, this draft contains 4-5 different voices, many typos, and lots of inconsistency. The purpose of the `edit` step is to address this.
 - Before shifting from `draft` to `edit`, we need 1) eng signoff on the technical procedure's alignment with the UI/devex, and 2) product signoff on broad theme and terminology conventions.

:::

This quickstart is for developers who want to launch their own application-specific chain (appchain) using Arbitrum Orbit. Familiarity with Ethereum, Arbitrum, and Solidity is expected.

<!-- If you're new to Arbitrum or Arbitrum Orbit, consider reviewing [A gentle introduction to Arbitrum Orbit](./orbit-gentle-introduction.md) before proceeding. -->

By the end of this quickstart, you'll have a **local devnet** that accepts transactions and settles them to the public **Arbitrum Goerli testnet**.

:::caution THIS IS A LOCAL DEVNET

Your Orbit appchain **is a local devnet that settles to Arbitrum Goerli, not a mainnet L2 chain**. We recommend using it to prototype and experiment.

While you're building solutions on your local devnet, we'll be building out the tech and docs that help you move from "local devnet that settles to Arbitrum Goerli" to "public production-ready appchain that settles to Arbitrum One or Arbitrum Nova".

If you have any questions or feature requests as you begin to tinker, **please reach out to our team directly** through [this form](http://bit.ly/3yy6EUK). Your feedback will determine how this capability evolves over time, so please don't hesitate to reach out! We're eager to learn how we can improve Orbit to better support your needs :).

:::

## Prerequisites

 - [Docker](https://docs.docker.com/get-docker/)
 - You need to have at least ```1.2 ETH``` on your wallet on Arbitrum Goerli chain. Note that this may varries due to changes on base fee on Goerli testnet.


## Step 1: Configure your Orbit appchain

Visit the [Orbit appchain deployment portal](https://orbit.arbitrum.io/deployment). There, you'll see a form that looks like this:

<PlaceholderForm inputs="Chain ID, Chain name, Challenge period (blocks), Staking token (0x... address), Base stake, Owner" />

- **Chain ID**: A unique integer identifier that represents your appchain's network. This chain ID can be submitted to chain indexes like [Chainlist.org](http://chainlist.org). For devnets, this is randomly generated for each deployment - don't worry about it for now.
- **Chain name**: A human-readable way to distinguish your appchain from others. Users, developers and the wider community will refer to and recognize your chain by this name and also the chain ID for the chain.
- **Challenge period (blocks)**: The amount of time that your chain's nodes have to dispute the current state of the chain before it's confirmed (and ultimately finalized) in the underlying L2 chain (Arbitrum Goerli). Note that block number here refers to ``` Underlying L1 Block Number ``` and not L2 block number.
- **Base stake**: The number that specifies amount of ETH that your chain's validators must stake in order to participate in your appchain. This number must be greater than 0.
- **Owner**: A `sudo` / administrative address responsible for deploying your chain's L2 contracts to the underlying L2 chain, with the power to change your appchain's configuration post-deployment.


Let's briefly review each of these parameters and the tradeoffs that you should consider when configuring them.


### Chain ID

Don't worry about this; it's inconsequential for devnets. In production scenarios (which aren't yet supported), you'll want to use a unique integer identifier that represents your appchain's network on chain indexes like [Chainlist.org](http://chainlist.org).


### Chain Name

This name provides a way to identify and distinguish your appchain from others. You’ll want to make this a name that you can easily remember, and that your users and developers will recognize.


### Challenge period (blocks)

The `Challenge period (blocks)` parameter determines the amount of time your chain's validators have to dispute - or "challenge" - the integrity of transactions posted to the underlying L2 chain (Arbitrum Goerli for now; settlement to One and Nova mainnet chains isn't supported yet).

A longer challenge period means that your chain's nodes will have more time to dispute fraudulent transactions, but it also means that your chain's users will have to wait longer for their withdrawal transactions from appchain back to the underlying L2 chain. This is one of the many tradeoffs that Orbit allows you to make when configuring your appchain.

If you're not sure what to put here, use the default value of `150`, which translates to roughly 30 minutes.

Note that the challenge period is measured in blocks on the ``` Underlying L1 Block Number ```. So if you run your appchain on top of Arbitrum Goerli, the challenge window would be number of **Challenge period (blocks)** you specified times the Goerli Block time (~ 12 seconds). It's currently defaulted as 150 blocks which is almost 30 minutes.

### Base stake

The `Base stake` parameter specifies the **amount of ETH** that your chain's validator must deposit in order to begin proposing batches of transactions from your appchain to your L2 chain. This is specified using a float value.

If your base stake is low, the barrier to participation will be low, but your chain will be more vulnerable to certain types of attacks.

For example, an appchain with a base stake of 0.01 ETH could be halted by an adversary who can afford to deploy sacrificial validators that maliciously challenge every RBlock that your chain's honest validator submitted. The malicious challenges would result in slashed validators (one slashed validator per malicious challenge), but from the adversary's perspective, periodic slashing is just the price they have to pay to keep your chain offline.

A higher base stake incentivize honest participation by making it more expensive to launch these types of attacks. However, a higher base stake also translates to a higher barrier to entry for your chain's node operators. This is another tradeoff to consider.

If you're not sure what to put here, use the default value of `0.1` Ethers.

### Owner

This account address is responsible for managing your chain's **core contracts** on the underlying L2 chain--**rollup owner**, and also it has been used as **chain owner** which has power to change your appchain's configuration after it's been deployed.

In production scenarios, this is a high-stakes address that's often controlled by a DAO's governance protocol or multisig. For your devnet appchain, think of this as a low-stakes administrative service account.

Note that **you'll have to fund this address** with enough ETH to cover the gas costs of deploying your core contracts to L2. (Note to self: add an approximate amount)

**Important Note:** This address must be an EOA on the deployment. So be certain that the address you are providing is not an smart contract/contract wallet.

## Step 2: Deploy your appchain's core contracts to L2

Click `Deploy rollup`. This will submit a transaction to Arbitrum Goerli, so you'll have to pay a little gas. Once this form-submission transaction is confirmed, you'll see a new form appear that allows you to configure your appchain's validators.

Before configuring your validators, let's briefly review what just happened:

 - You submitted a deployment transaction to an Orbit smart contract on Arbitrum Goerli, the L2 chain that your appchain will settle transactions to.
 - This smart contract initialized your Orbit appchain's core contracts with values that you specified in the previous step.
 - It then deployed these contracts to Arbitrum Goerli.

Your appchain's core contracts are responsible for facilitating the exchange of information between your appchain and the underlying L2 chain. This includes the batch posting of transactions to the underlying L2 chain, the staking of tokens by your chain's validators, the challenge mechanism, bridging mechanisms, and more.

Ok, on to the validators.

## Step 3: Configure your appchain's validators

Your appchain's validators are responsible for validating the integrity of transactions and posting assertions of the current state of the to the underlying L2. In production scenarios, your appchain would likely be hosted by a decentralized network of validator nodes working together. For your devnet appchain, you'll be configuring a single validator by default, with the option to add more. We call this validator ```Staker account ```, because this validator would be responsible to create new RBlocks and stake on them.

The first address is randomly generated and can't be changed. Its private key will be stored in the JSON configuration file with name **staker**, that we'll generate in Step 5 below.

Each of the addresses specified in this step will be added to an allow-list in one of your appchain's core contracts. This lets each of the specified addresses **stake** and serve your chain's users, or even challenges staker of a specific RBlock.

Once this form-submission transaction is confirmed, you'll see a new form appear that allows you to configure your appchain's batch poster.


## Step 4: Configure your appchain's batch poster

Your appchain's user-submitted transactions are deterministically sequenced, batched, compressed, and posted to the underlying L2 (Arbitrum Goerli). Your batch poster address is the appchain address that's responsible for posting these batches of transactions from your appchain to your core contracts on L2.

Once this form-submission transaction is confirmed, you'll be ready to run your appchain's validator(s) and batch poster. Your appchain can then begin accepting transactions from users and settling them to Arbitrum Goerli (and, by extension, Ethereum's L1 Goerli network).


## Step 5: Generate and download your appchain's configuration files

This step will generate two JSON configuration files - one for your **nodes**; another for setting up your **appchain configurations**

 1. Clicking **Download Rollup JSON** will generate `nodeConfig.json`: This file will be consumed as the configuration for your appchain's node, contains validator (staker) and batch poster setup. It also contains the private key for your appchain's batch poster, which is used to send the batched transaction and also private key for your appchain's staker, which is used to sign transactions that post RBlocks to your appchain's core contracts on L2.
 2. Clicking **Download L3Config JSON** will generate `orbitSetupScriptConfig.json`: This file contains the configuration for your appchain. It'll be consumed to setup your appchain parameters and also setting up your **Token Bridge Contract**.

<!-- prev

In this last step you can download two configuration files in JSON format. By clicking on **Download Rollup JSON**, a file named **nodeConfig.json** will be downloaded. This config file would be used to run Orbit node, which will be discussed later.

Also by clicking on **Download L3Config JSON**, a file named **orbitSetupScriptConfig.json** will be downloaded. This config file would be consumed later by Orbit setup script later in order to setup final steps of running Orbit chain.

-->

## Step 6: Clone "Orbit setup script" repository and Moving config files
Clone the repository of [orbit-setup-script](https://github.com/OffchainLabs/orbit-setup-script) from our github. This script will handle running node, and also setting up your appchain.

After cloning you need to:

- Move the **nodeConfig.json** file that you downloaded into the  ```chain``` directory, where you have cloned the orbit setup script.
   
- Also move the **orbitSetupScriptConfig.json** file you downloaded into ```config``` directory of the path.

- To install all dependencies for this script, you need to run:

   ```shell
    yarn install
    ```


## Step 7: Running appchain node

To run the node, in the base directory run:

   ```shell
      docker-compose up -d 
   ```
Note that you need Docker up and running, before running the command.

By running this command:
- A Nitro node will be run for your appchain
- A BlockScout explorer instance would be run for your appchain, which you can find it from [http://localhost:4000/](http://localhost:4000/)


## Step 8: appchain setup phase

Now that your appchain node is up and running, you need to take some other steps to set things up completely. These steps would be:

1. Funding **batch-poster** and **staker** accounts on underlying L2 chain.
2. Depositing ETH into your account on the appchain using your appchain's newly deployed bridge
3. Deploying Token Bridge Contracts on both L2 and appchains. For more info on what/why/how is Token Bridge, please visit our docs.
4. Configuring parameters on the appchain.

Don't worry about all the things discussed above. We wrote a hardhat script which you already cloned it, and it'll do all the things for you. To run the script just **put your private key** in the command below and run it on the base directory of the script:


   ```shell
    PRIVATE_KEY="0xYourPrivateKey" L2_RPC_URL="https://goerli-rollup.arbitrum.io/rpc" L3_RPC_URL="http://localhost:8449" yarn run setup
   ```

Note: The private key MUST be the chain owner private key, otherwise you cannot setup the appchain.

## Step 9 LFG!! 

Congratulations! 🎉🎉🎉

Your Chain is completely set up and configured. You can find core contract addresses on ```orbitSetupScriptConfig.json``` file you've downloaded and the token bridge contract address on ```tokenAddresses.json``` in the script folder!


### optional:

- If you want to track and have view of all logs of your node, you can just run this command on the main directory of the orbit setup script:`

   ```shell
   docker-compose logs -f nitro
   ```

- If you run out of ETH on your account on the appchain, you can easily deposit more ETH from your account on Arbitrum Goerli into your account on the appchain by running this command on the base directory of the setup script:

   ```shell
    PRIVATE_KEY="0xYourPrivateKey" L2_RPC_URL="https://goerli-rollup.arbitrum.io/rpc" L3_RPC_URL="http://localhost:8449" AMOUNT="Put your desired amount of ETH here" yarn run deposit
   ```
   **Note:** Don't forget to replace your private key and also the amount you want to deposit on corresponding places on the command above.

**Note** that as mentioned, this step is completely ```optional```.

**Note:** When you first start up the node, you may see "error getting latest batch count" on the logs (if you run the log for nodes) because the core contracts deployment is not finalized on the underlying L1 yet. It may take 15-20 minutes for the finalization. Worths mentioning that you can do all with the chain and it won't affect the functionalities.