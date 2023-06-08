---
title: "Quickstart: Launch an L3 devnet chain with Orbit (Experimental)"
description: "Launch your own L3 devnet chain with the Arbitrum Nitro codebase's new license. Settle to Arbitrum's L2 chains via bridge contracts on the underlying L2 chain (Goerli for now; One and Nova coming soon). No need for permission from the Arbitrum DAO or Offchain Labs to create your L3. Modify the Nitro codebase freely for your L3."
sidebar_position: 2
author: oliviaJ3388
sidebar_label: "Quickstart: Launch an L3 devnet chain"
---

import { PlaceholderForm } from '/src/components/PlaceholderForm/PlaceholderForm';

import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md'; 

<PublicPreviewBannerPartial />

This quickstart is for developers who want to launch their own Layer-3 (L3) rollup chain using Arbitrum Orbit. Familiarity with Ethereum, Arbitrum, and Solidity is expected.

<!-- If you're new to Arbitrum or Arbitrum Orbit, consider reviewing [A gentle introduction to Arbitrum Orbit](./orbit-gentle-introduction.md) before proceeding. -->

By the end of this quickstart, you'll have a functional **L3 Orbit devnet chain** that accepts transactions and settles them to **Arbitrum Goerli**.

:::caution NOT A MAINNET CHAIN; NOT FOR PRODUCTION SCENARIOS

Your Orbit devnet chain **settles to Arbitrum Goerli, not a mainnet L2 chain**; it's **not intended to be used in production scenarios**; it's for prototyping, experimentation, and discovery. We'll provide guidance for production chains (those that settle to mainnet chains) in the future.

If you have any questions or feature requests as you begin to tinker, **please reach out to our team directly** through [this form](http://bit.ly/3yy6EUK). Your feedback will determine how this capability evolves over time, so please don't hesitate to reach out! We're eager to learn how we can improve Orbit to better support your needs :).

:::


## Step 1: Configure your L3 chain

Visit the [Orbit L3 chain deployment portal](https://orbit.arbitrum.io/deployment). There, you'll see a form that looks like this:

<PlaceholderForm inputs="Chain ID, Chain name, Challenge period (blocks), Staking token (0x... address), Base stake, Owner" />

- **Chain ID**: A unique integer identifier that represents your L3 chain's network. This chain ID can be submitted to chain indexes like [Chainlist.org](http://chainlist.org). For devnets, this is hardcoded to a default value - don't worry about it for now.
- **Chain name**: A human-readable way to distinguish your L3 chain from others. Users, developers and the wider community will refer to and recognize your chain by this name.
- **Challenge period (blocks)**: The amount of time that your chain's nodes have to dispute transactions before they're confirmed and posted to the underlying L2 chain (Arbitrum Goerli).
- **Staking token**: The token that your chain's validators must stake in order to participate in your L3 chain. This token must be an ERC-20 token contract address on Arbitrum Goerli.
- **Base stake**: The number of staking tokens that your chain's validators must stake in order to participate in your L3 chain. This number must be greater than 0.
- **Owner**: The `sudo` / administrative address of your entire L3 chain. It's responsible for deploying your chain's L2 contracts to the underlying L2 chain, and it has the power to change your chain's configuration.


Let's briefly review each of these parameters and the tradeoffs that you should consider when configuring them.


### Chain ID

Don't worry about this; it's inconsequential for devnets. In production scenarios (which aren't yet supported), you'll want to use a unique integer identifier that represents your L3 chain's network on chain indexes like [Chainlist.org](http://chainlist.org).


### Chain Name

This name provides a way to identify and distinguish your L3 chain from others. You’ll want to make this a name that you can easily remember.


### Challenge period (blocks)

Transactions submitted to your L3 chain are placed within a queue before being confirmed and finalized (settled to the L2 chain). The `Challenge period (blocks)` parameter determines the amount of time that must pass before the transactions can move out of this queue and into the underlying L2 (Arbitrum Goerli for now; settlement to One and Nova mainnet chains isn't supported yet). While in this queue, transactions can be disputed by your chain's nodes.

A longer challenge period means that your chain's nodes will have more time to dispute fraudulent transactions, but it also means that your chain's users will have to wait longer for their transactions to settle to the underlying L2 chain. This is one of the many tradeoffs that Orbit allows you to make when configuring your L3 chain.

If you're not sure what to put here, use the default value of `10080`, which translates to roughly 7 days.

Note that the challenge period is measured in blocks on the L2 chain, not the L3 chain.


### Stake token

Your L3 devnet chain will be supported by at least one node. In production scenarios, your chain may be supported by a decentralized network of nodes. In order for your chain's nodes to record transactions, they need to stake value in a smart contract that's used to incentivize honest participation. This `Stake token` parameter specifies the type of token that your chain's nodes must deposit into this contract when they stake. This is specified using the **token's contract address on the L2 chain that your L3 chain is settling to - Arbitrum Goerli**.

If you're not sure what to put here, use the default value of `0x000..000`. This tells Orbit to set your chain's stake token to plain-old ETH.


### Base stake

While the `Stake token` parameter specifies the **type of token** that your chain's nodes must deposit into the staking contract, the `Base stake` parameter specifies the **amount of this token** that your chain's nodes must deposit in order to begin proposing batches of transactions from your L3 chain to your L2 chain. This is specified using an integer value.

If your base stake is low, the barrier to participation will be low, but your chain will be more vulnerable to certain types of attacks.

For example, an L3 chain with a base stake of 0.01 ETH could be halted by an adversary who can afford to deploy sacrificial nodes that maliciously challenge every RBlock that your chain's honest nodes submit. The malicious challenges would result in slashed nodes (one slashed node per malicious challenge), but from the adversary's perspective, periodic slashing is just the price they have to pay to keep your chain offline.

A higher base stake incentivizes honest participation by making it more expensive to launch these types of attacks. However, a higher base stake also translates to a higher barrier to entry for your chain's node operators. This is another tradeoff to consider.

If you're not sure what to put here, use the default value of `1`, which translates to 1 ETH (assuming that your chain's `Stake token` is set to `0x000..000`).


### Owner

This address is responsible for deploying your chain's **core contracts** to the underlying L2 chain, and it has the power to change your chain's configuration after it's been deployed.

In production scenarios, this is a high-stakes address that's often controlled by a DAO's governance protocol or multisig. For your L3 devnet chain, think of this as a low-stakes administrative service account.

Note that **you'll have to fund this address** with enough ETH to cover the gas costs of deploying your core contracts to L2.


## Step 2: Deploy your L3 chain's core contracts to L2

Click `Deploy rollup`. This will submit a transaction to Arbitrum Goerli, so you'll have to pay a little gas. Once this form-submission transaction is confirmed, you'll see a new form appear that allows you to configure your L3 chain's validators.

Before configuring your validators, let's briefly review what just happened:

 - You submitted a deployment transaction to an Orbit smart contract on Arbitrum Goerli, the L2 chain that your L3 chain will settle transactions to.
 - This smart contract initialized your Orbit L3 chain's core contracts with values that you specified in the previous step.
 - It then deployed these contracts to Arbitrum Goerli.

Your L3 chain's core contracts are responsible for facilitating the exchange of information between your L3 chain and the underlying L2 chain. This includes the batch posting of transactions to the underlying L2 chain, the staking of tokens by your chain's validators, the challenge mechanism, bridging mechanisms, and more.

Ok, on to the validators.

## Step 3: Configure your L3 chain's validators

Your L3 chain's validators are responsible for sending batches of transactions to your L2 chain in the form of RBlocks. In production scenarios, your L3 chain would likely be hosted by a decentralized network of validator nodes working together. For your L3 devnet chain, you'll be configuring a single validator by default, with the option to add more.

The first address is randomly generated and can't be changed. Its private key will be stored in the JSON configuration file that we'll generate in Step 5 below.

Each of the addresses specified in this step will be added to an allow-list in one of your L3 chain's core contracts. This lets each of the specified addresses **stake** and serve your chain's users.

Once this form-submission transaction is confirmed, you'll see a new form appear that allows you to configure your L3 chain's batch poster.


## Step 4: Configure your L3 chain's batch poster

Your L3 chain's user-submitted transactions are deterministically batched and sequenced within RBlocks that get posted to Arbitrum Goerli through your L3 chain's core contracts. Your batch poster address is the L3 address that's responsible for posting these RBlocks from your L3 to your core contracts on L2.

Once this form-submission transaction is confirmed, you'll be ready to run your L3 chain's validator(s) and batch poster. Your L3 chain can then begin accepting transactions from users and settling them to Arbitrum Goerli (and, by extension, Ethereum's L1 Goerli network).

## Step 5: Generate config files and download them

In this last step you can download two configuration files in JSON format. By clicking on **Download Rollup JSON**, a file named **nodeConfig.json** will be downloaded. This config file would be used to run Orbit node, which will be discussed later.

Also by clicking on **Download L3Config JSON**, a file named **orbitSetupScriptConfig.json** will be downloaded. This config file would be consumed later by Orbit setup script later in order to setup final steps of running Orbit chain.

## Step 6: Move nodeConfig.json file and run your Orbit chain's node(s)

On this step, we aim to show how to run an L3 node. As a prerequisite you need to have Docker installed and run on your computer. If not please visit [this page](https://docs.docker.com/get-docker/) to download and run it.

- Having the Docker up and running, you can create a folder in a desired path like ```/some/local/dir/arbitrum```
- Move the **nodeConfig.json** file that you downloaded into the newly generated folder with the path ```/some/local/dir/arbitrum``` 
- When running docker image, an external volume should be mounted to persist the database across restarts. The mount point inside the docker image should be ```/home/user/.arbitrum```
- Here is the command you can run in the ```/some/local/dir/arbitrum``` folder to run your Orbit node:
  
   ```shell
   docker run -p 8449:8449 --rm -it -v /some/local/dir/arbitrum:/home/user/.arbitrum offchainlabs/nitro-node:v2.1.0-beta.2-58a23c8 --conf.file /home/user/.arbitrum/nodeConfig.json
   ```

Congrats! Your run your Orbit chain node! 🎉

## Step 7: Move orbitSetupScriptConfig.json file and run Orbit setup script

Now that the orbit chain is up and running, you need to take some other steps to set things up completely. These steps would be:

1. Funding **batch-poster** and **staker** accounts.
2. Depositing ETH into your account on L3 using your Orbit chain's newly deployed bridge (to be able to send transactions on L3) 
3. Deploying Token Bridge Contracts on both L2 and L3 chains. For more info on what/why/how is Token Bridge, please visit our docs.
4. Configuring parameters on L3.

Don't worry about all the things discussed above. We wrote a hardhat script which you can use and it'll do all the things for you. Just follow the below steps:

- Clone the repository of [orbit-setup-script](https://github.com/OffchainLabs/orbit-setup-script) from our github.
- There is a folder named **config**.You need to move the **orbitSetupScriptConfig.json** file you downloaded on the previous step to this folder
- Set the values shown in ```.env-sample ``` as environmental variables. To copy it into a .env file:

   ```shell
    cp .env-sample .env
    ```
- You just need to put the chain owner private key on the .env file, and not modifying other two env variables:

   ```shell
    PRIVATE_KEY="0xChainOwnerPrivateKey"
    L2_RPC_URL=https://goerli-rollup.arbitrum.io/rpc
    L3_RPC_URL=http://localhost:8449
    ```
- To install all dependencies for this script, you need to run:

   ```shell
    yarn install
    ```

- Now all things are set, and it's time to run the script. For running the script you can use this command:

   ```shell
    npx hardhat run scripts/setup.ts 
    ```
Congratulations! 🎉🎉🎉

Your Orbit Chain is completely set up and configured. You can find core contract addresses on ```nodeConfig.json``` file you've downloaded and the token bridge contract address on ```tokenAddresses.json``` in the script folder!