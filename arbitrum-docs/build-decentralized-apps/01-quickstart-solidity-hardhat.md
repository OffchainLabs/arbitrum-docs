---
title: 'Quickstart: Build a decentralized app (Solidity)'
description: This quickstart walks you through the process of converting a Javascript vending machine's business logic into a Solidity smart contract. We'll then deploy the smart contract to a local Hardhat network, then Arbitrum Sepolia testnet, and finally Arbitrum One mainnet.
author: symbolpunk
user_story: As a web2 developer, I want to onboard into Arbitrum by building and deploying my first smart contract.
content_type: quickstart
---

:::info Want to use Rust instead?

Head over to [the Stylus quickstart](/stylus/stylus-quickstart) if you'd like to use Rust instead of Solidity.

:::

This quickstart is for web developers who want to start building **decentralized applications** (dApps) using <a data-quicklook-from='arbitrum'>Arbitrum</a>. It makes no assumptions about your prior experience with Ethereum, Arbitrum, or Solidity. Familiarity with Javascript and `yarn` is expected. If you're new to Ethereum, consider studying the [Ethereum documentation](https://ethereum.org/en/developers/docs/) before proceeding.

### What we're building

We're going to build a digital cupcake vending machine using Solidity smart contracts[^1]. Our vending machine will follow two rules:

1. The vending machine will distribute a cupcake to anyone who hasn't recently received one.
2. The vending machine's rules can't be changed by anyone.

Here's our vending machine implemented with Javascript.
To use it, enter a name in the form below and press the 'Cupcake please!' button, you should see your cupcake balance go up.

import { VendingMachine } from '@site/src/components/VendingMachine/VendingMachine';

<VendingMachine id="dumb-cupcakes" type="web2" />

Note that although this vending machine appears to follow the rules, it doesn't follow them as much as we'd like. The vending machine's business logic and data are hosted by a **centralized service provider**. We're trusting that this service provider isn't malicious, but:

1. Our centralized service provider can deny access to particular users.
2. A malicious actor can change the rules of the vending machine at any time, for example, to give their friends extra cupcakes.

Centralized third-party intermediaries represent a **single point of failure** that malicious actors may become incentivized to exploit. To mitigate this type of risk, we can decentralize our vending machine's **business logic and data**, rendering this type of exploitation infeasible.

This is Arbitrum's core value proposition to you, dear developer. Arbitrum makes it easy for you to deploy your vending machines to Ethereum's permissionless, <a data-quicklook-from='trustless'>trustless</a>, _decentralized_ network of nodes[^2] while keeping costs low for you and your users.

Let's implement the "web3" version of the above vending machine using Arbitrum.

### Prerequisites

- **VS Code**: The IDE we'll use to build our vending machine. See [code.visualstudio.com](https://code.visualstudio.com/) to install.
- **Metamask**: The <a data-quicklook-from='ethereum-wallet'>wallet</a> we'll use to interact with our vending machine. See [metamask.io](https://metamask.io/) to install.
- **Yarn**: The package manager we'll use to install our dependencies. See [yarnpkg.com](https://yarnpkg.com/) to install.

We'll address remaining dependencies as we go.

### Ethereum and Arbitrum in a nutshell

- **Ethereum**
  - Ethereum is a decentralized network of <a href='https://docs.prylabs.network/docs/concepts/nodes-networks'>nodes</a> that use Ethereum's client software (like Offchain's <a href='https://docs.prylabs.network/docs/getting-started'>Prysm</a>) to maintain a public <a data-quicklook-from='blockchain'>blockchain</a> data structure.
  - The data within Ethereum's blockchain data structure changes one transaction at a time.
  - <a data-quicklook-from="smart-contract">Smart contracts</a> are small programs that execute transactions
    according to predefined rules. Ethereum's nodes host and execute smart contracts.
  - You can use smart contracts to build decentralized apps (dApps) that use Ethereum's network to process transactions and store data.
  - DApps let users carry their data and identity between applications without having to trust centralized service providers.
  - People who run Ethereum validator nodes[^3] can earn $ETH for processing and validating transactions on behalf of users and dApps.
  - These transactions can be expensive when the network is under heavy load.
- **Arbitrum**
  - Arbitrum is a suite of L2 scaling solutions for dApp developers.
  - <a data-quicklook-from="arbitrum-one">Arbitrum One</a> is an L2 chain that implements the
    <a data-quicklook-from="arbitrum-rollup-protocol">Arbitrum Rollup protocol</a>.
  - You can use Arbitrum One to build user-friendly dApps with high throughput, low latency, and low transaction costs while inheriting Ethereum's high security standards[^4].

Let's review our vending machine's Javascript implementation, then convert it into a Solidity smart contract, then deploy it to Arbitrum One.

We'll ask your smart contract for cupcakes using the vending machines on this page.

### Review our Javascript vending machine

Here's our vending machine implemented as a Javascript class:

```js title="VendingMachine.js"
class VendingMachine {
  // state variables = internal memory of the vending machine
  cupcakeBalances = {};
  cupcakeDistributionTimes = {};

  // Vend a cupcake to the caller
  giveCupcakeTo(userId) {
    if (this.cupcakeDistributionTimes[userId] === undefined) {
      this.cupcakeBalances[userId] = 0;
      this.cupcakeDistributionTimes[userId] = 0;
    }

    // Rule 1: The vending machine will distribute a cupcake to anyone who hasn't recently received one.
    const fiveSeconds = 5000;
    const userCanReceiveCupcake = this.cupcakeDistributionTimes[userId] + fiveSeconds <= Date.now();
    if (userCanReceiveCupcake) {
      this.cupcakeBalances[userId]++;
      this.cupcakeDistributionTimes[userId] = Date.now();
      console.log(`Enjoy your cupcake, ${userId}!`);
      return true;
    } else {
      console.error(
        'HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)',
      );
      return false;
    }
  }

  getCupcakeBalanceFor(userId) {
    return this.cupcakeBalances[userId];
  }
}
```

The `VendingMachine` class uses _state variables_ and _functions_ to implement _predefined rules_. This implementation is useful because it automates cupcake distribution, but there's a problem: it's hosted by a centralized server controlled by a third-party service provider.

Let's decentralize our vending machine's business logic and data by porting the above Javascript implementation into a Solidity smart contract.

### Configure your project directory

Create a `decentralized-cupcakes` directory for your project and install [hardhat](https://hardhat.org/hardhat-runner/docs/getting-started#overview) using VS Code's integrated terminal:

```
mkdir decentralized-cupcakes
cd decentralized-cupcakes
yarn init -y
yarn add hardhat @nomicfoundation/hardhat-toolbox -D
```

This installs two packages: `hardhat` lets us write, test and deploy our smart contracts, and `hardhat-toolbox` is a bundle of popular Hardhat plugins that we'll use later.

Next, run `yarn hardhat init` to configure Hardhat. Select `Create a JavaScript project` when prompted. Make sure you specify your `decentralized-cupcakes` directory as the project root when asked.

At this point, you should see the following items (among others) in your `decentralized-cupcakes` project directory:

| Item                | Description                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| `contracts/`        | Contains your smart contracts. You should see the `Lock.sol` contract here.                               |
| `scripts/`          | Contains scripts that you can use to interact with your smart contracts. You should see `deploy.js` here. |
| `hardhat.config.js` | Contains the configuration settings for Hardhat.                                                          |

Replace the contents of `hardhat.config.js` with the following:

```javascript title="hardhat.config.js"
require('@nomicfoundation/hardhat-toolbox');

// NEVER record important private keys in your code - this is for demo purposes
const SEPOLIA_TESTNET_PRIVATE_KEY = '';
const ARBITRUM_MAINNET_TEMPORARY_PRIVATE_KEY = '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.18',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    arbitrumSepolia: {
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      chainId: 421614,
      //accounts: [Sepolia_TESTNET_PRIVATE_KEY]
    },
    arbitrumOne: {
      url: 'https://arb1.arbitrum.io/rpc',
      //accounts: [ARBITRUM_MAINNET_TEMPORARY_PRIVATE_KEY]
    },
  },
};
```

Before compiling the default `contracts`, you will need to install additional dependencies. Run `yarn hardhat compile` and expect it to fail for the first time — follow those instructions, then run `yarn hardhat compile` again until it runs successfully. You should see `Compiled 1 Solidity file successfully` in the terminal output. You should also see a new `decentralized-cupcakes/artifacts/` directory. This directory contains the compiled smart contract.

Open `scripts/deploy.js` and replace its contents with the following:

```javascript title="scripts/deploy.js"
const hre = require('hardhat');

async function main() {
  const vendingMachine = await hre.ethers.deployContract('VendingMachine');
  await vendingMachine.waitForDeployment();
  console.log(`Cupcake vending machine deployed to ${vendingMachine.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

We'll use this to deploy our smart contract in a moment. Next, delete `contracts/Lock.sol` and replace it with `contracts/VendingMachine.sol`, the smarter alternative to our Javascript implementation:

```solidity title="VendingMachine.sol"
pragma solidity ^0.8.9;

// Rule 2: The vending machine's rules can't be changed by anyone.
contract VendingMachine {
    // state variables = internal memory of the vending machine
    mapping(address => uint) private _cupcakeBalances;
    mapping(address => uint) private _cupcakeDistributionTimes;

    function giveCupcakeTo(address userAddress) public returns (bool) {
        // this code is unnecessary, but we're keeping it here so you can compare it to the JS implementation
        if (_cupcakeDistributionTimes[userAddress] == 0) {
            _cupcakeBalances[userAddress] = 0;
            _cupcakeDistributionTimes[userAddress] = 0;
        }

        // Rule 1: The vending machine will distribute a cupcake to anyone who hasn't recently received one.
        uint fiveSecondsFromLastDistribution = _cupcakeDistributionTimes[userAddress] + 5 seconds;
        bool userCanReceiveCupcake = fiveSecondsFromLastDistribution <= block.timestamp;
        if (userCanReceiveCupcake) {
            _cupcakeBalances[userAddress]++;
            _cupcakeDistributionTimes[userAddress] = block.timestamp;
            return true;
        } else {
            revert("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
        }
    }

    // Getter function for the cupcake balance of a user
    function getCupcakeBalanceFor(address userAddress) public view returns (uint) {
        return _cupcakeBalances[userAddress];
    }
}
```

Note that this smart contract is written in Solidity, a language that compiles to [EVM bytecode](https://blog.chain.link/what-are-abi-and-bytecode-in-solidity/). This means that it can be deployed to any Ethereum-compatible blockchain, including Ethereum mainnet, <a data-quicklook-from='arbitrum-one'>Arbitrum One</a>, and <a data-quicklook-from='arbitrum-nova'>Arbitrum Nova</a>.

Run `yarn hardhat compile` again. You should see `Compiled 1 Solidity file successfully` in the terminal output. You should also see a new `decentralized-cupcakes/artifacts/contracts/VendingMachine.sol` directory.

### Deploy the smart contract locally

To deploy our `VendingMachine` smart contract locally, we'll use two terminal windows and a wallet:

<!-- we do it in this order because we want to be able to say "here's your contract address; paste it here" instead of "here's your contract address, save it for later" -->
<!-- not confident that this is a good reason -->

1. We'll use the first terminal window to run Hardhat's built-in local Ethereum node
2. We'll then configure a wallet so we can interact with our smart contract after it's deployed to (1)
3. We'll then use the second terminal window to deploy our smart contract to (1)'s node

#### Run a local Ethereum network and node

Run `yarn hardhat node` from your `decentralized-cupcakes` directory to begin running a local Ethereum network powered by a single node. This will mimic Ethereum's behavior on your local machine by using Hardhat's built-in [Hardhat Network](https://hardhat.org/hardhat-network/docs/overview).

You should see something along the lines of `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/` in your terminal. You should also see a number of test accounts automatically generated for you:

```
...
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

:::caution Never share your private keys

Your Ethereum Mainnet wallet's private key is the password to all of your money. Never share it with anyone; avoid copying it to your clipboard.

:::

Note that in the context of this quickstart, "account" refers to a public wallet address and its associated private key[^5].

#### Configure Metamask

Next, open Metamask and create or import a wallet by following the displayed instructions. By default, Metamask will connect to Ethereum mainnet. To connect to our local "testnet", enable test networks for Metamask by clicking `Show/hide test networks` from the network selector dropdown. Then select the `Localhost 8545` network:

![Connect Metamask to Localhost 8545](./images/quickstart-localhost-metamask.png)

<!-- Note that if you'd like to host your local testnet on a different port, you can do so by running `yarn hardhat node --port 8546` instead. You'll then need to configure a `Localhost 8546` network in Metamask. -->

Your mainnet wallet won't have a balance on your local testnet's node, but we can import one of the test accounts into Metamask to gain access to 10,000 fake ETH. Copy the private key of one of the test accounts (it works with or without the `0x` prefix, so e.g. `0xac0..f80` or `ac0..f80`) and import it into Metamask:

![Connect Metamask to Localhost 8545](./images/quickstart-import-metamask.png)

You should see a balance of 10,000 ETH. Keep your private key handy; we'll use it again in a moment.

Next, click Metamask's network selector dropdown, and then click the `Add Network` button. Click "Add a network manually" and then provide the following information:

- Network Name: `Arbitrum Sepolia`
- New RPC URL: `https://sepolia-rollup.arbitrum.io/rpc`
- Chain ID: `421614`
- Currency Symbol: `ASPL`

As we interact with our cupcake vending machine, we'll use Metamask's network selector dropdown to determine which network our cupcake transactions are sent to. For now, we'll leave the network set to `Localhost 8545`.

#### Deploy the smart contract to your local testnet

From another terminal instance, run `yarn add --dev @nomicfoundation/hardhat-ethers ethers hardhat-deploy hardhat-deploy-ethers` to install additional dependencies needed for contract deployment. Then run `yarn hardhat run scripts/deploy.js --network localhost`. This command will deploy your smart contract to the local testnet's node. You should see something like `Cupcake vending machine deployed to 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` in your terminal. `0xe7...512` is the address of your smart contract in your local testnet.

<!-- // footnote about how addresses live in the "global state" of the network, which is mirrored across all nodes -->

Ensure that the `Localhost` network is selected within Metamask. Then copy and paste your **contract address** below and click `Get cupcake!`. You should be prompted to sign a transaction that gives you a cupcake.

<VendingMachine id="smart-local-cupcakes" type="web3-localhost" />

### What's going on here?

Our first `VendingMachine` is labeled `WEB2` because it demonstrates traditional n-tier web application architecture:

![Architecture diagram](./images/quickstart-vending-machine-architecture.png)

The `WEB3-LOCALHOST` architecture is similar to the `WEB2` architecture, with one key difference: with the `WEB3` version, **the business logic and data live in an (emulated for now) decentralized network of nodes** instead of a centralized network of servers.

Let's take a closer look at the differences between our `VendingMachine` implementations:

<!-- todo: enhance precision RE where things are stored / executed / hashed-and-stored / etc -->

<table>
  <thead style={{ verticalAlign: 'top' }}>
    <tr>
      <th></th>
      <th>
        <code>WEB2</code>
        <br />
        (the first one)
      </th>
      <th>
        <code>WEB3-LOCALHOST</code>
        <br />
        (the latest one)
      </th>
      <th>
        <code>WEB3-ARB-SEPOLIA</code>
        <br />
        (the next one)
      </th>
      <th>
        <code>WEB3-ARB-MAINNET</code>
        <br />
        (the final one)
      </th>
    </tr>
  </thead>
  <tbody style={{ verticalAlign: 'top' }}>
    <tr>
      <td>
        <strong>Data</strong> (cupcakes)
      </td>
      <td>
        Stored only in your <strong>browser</strong>. (Usually, stored by centralized
        infrastructure.)
      </td>
      <td>
        Stored on your <strong>device</strong> in an <strong>emulated Ethereum network</strong> (via
        smart contract).
      </td>
      <td>
        Stored on Ethereum's <strong>decentralized test network</strong> (via smart contract).
      </td>
      <td>
        Stored on Ethereum's <strong>decentralized mainnet network</strong> (via smart contract).
      </td>
    </tr>
    <tr>
      <td>
        <strong>Logic</strong> (vending)
      </td>
      <td>
        Served from <strong>Offchain's servers</strong>. Executed by your <strong>browser</strong>.
      </td>
      <td>
        Stored and executed by your <strong>locally emulated Ethereum network</strong> (via smart
        contract).
      </td>
      <td>
        Stored and executed by Arbitrum's <strong>decentralized test network</strong> (via smart
        contract).
      </td>
      <td>
        Stored and executed by Arbitrum's <strong>decentralized mainnet network</strong> (via smart
        contract).
      </td>
    </tr>
    <tr style={{ verticalAlign: 'middle' }}>
      <td>
        <strong>Presentation</strong> (UI)
      </td>
      <td colSpan="4" align="center">
        Served from <strong>Offchain's servers</strong>. Rendered and executed by your{' '}
        <strong>browser</strong>.
      </td>
    </tr>
    <tr>
      <td>
        <strong>Money</strong>
      </td>
      <td>
        Devs and users pay centralized service providers for server access using fiat currency.
      </td>
      <td>
        ← same, but only for the presentation-layer concerns (code that supports frontend UI/UX).
      </td>
      <td>
        ← same, but devs and users pay <strong>testnet $ETH</strong> to testnet validators.
      </td>
      <td>
        ← same, but instead of testnet $ETH, they use <strong>mainnet $ETH</strong>.
      </td>
    </tr>
  </tbody>
</table>

Next, we'll deploy our smart contract to a network of real nodes: Arbitrum's Sepolia testnet.

### Deploy the smart contract to the Arbitrum Sepolia testnet

We were able to deploy to a local testnet for free because we were using [Hardhat's built-in Ethereum network emulator](https://hardhat.org/hardhat-network/docs/overview#hardhat-network). Arbitrum's Sepolia testnet is powered by a real network of real nodes, so we'll need to pay a small transaction fee to deploy our smart contract. This fee can be paid with the Arbitrum Sepolia testnet's token, $ASPL.

<!-- todo: partialize this - duplicated in Orbit quickstart -->

:::info $ASPL IS SHORTHAND

"$ASPL" isn't a canonical term. It's just shorthand for "Arbitrum Sepolia testnet $ETH" that we use for convenience.

:::

First, update the `hardhat.config.js` file to specify the private key of the test account that you'll use to deploy your smart contract (and pay the transaction fee):

```javascript title="hardhat.config.js"
// ...
const SEPOLIA_TESTNET_PRIVATE_KEY = ''; // <- this should **not** begin with "0x"
// ...
accounts: [SEPOLIA_TESTNET_PRIVATE_KEY]; // <- uncomment this line
// ...
```

:::caution

Note that we're adding a private key to a config file. This is **not** a best practice; we're doing it here for convenience. Consider using environment variables when working on a real project.

:::

<!-- todo: partialize this - duplicated in Orbit quickstart -->

Next, let's deposit some $ASPL into the wallet corresponding to the private key we added to `hardhat.config.js`. At the time of this quickstart's writing, the easiest way to acquire $ASPL is to bridge Sepolia $ETH from Ethereum's L1 Sepolia network to Arbitrum's L2 Sepolia network:

1. Use an L1 Sepolia $ETH faucet like [sepoliafaucet.com](https://sepoliafaucet.com/) to acquire some testnet $ETH on L1 Sepolia.
2. Bridge your L1 Sepolia $ETH into Arbitrum L2 using [the Arbitrum bridge](https://bridge.arbitrum.io/).

Once you've acquired some $ASPL, you'll be able to deploy your smart contract to Arbitrum's Sepolia testnet by issuing the following command:

```bash
yarn hardhat run scripts/deploy.js --network arbitrumSepolia
```

This tells hardhat to deploy the compiled smart contract through the RPC endpoint corresponding to `arbitrumSepolia` in `hardhat.config.js`. You should see the following output:

```bash
Cupcake vending machine deployed to 0xff825139321bd8fB8b720BfFC5b9EfDB7d6e9AB3
```

Congratulations! You've just deployed **business logic and data** to Arbitrum Sepolia. This logic and data will be hashed and submitted within a transaction to Ethereum's L1 Sepolia network, and then it will be mirrored across all nodes in the Sepolia network[^6].

To view your smart contract in a blockchain explorer, visit `https://sepolia.arbiscan.io/address/0x...B3`, but replace the `0x...B3` part of the URL with the full address of your deployed smart contract.

Select `Arbitrum Sepolia` from Metamask's dropdown, paste your contract address into the `VendingMachine` below, and click `Get cupcake!`. You should be prompted to sign a transaction that gives you a cupcake.

<VendingMachine id="smart-sepolia-cupcakes" type="web3-arb-sepolia" />

### Deploy the smart contract to Arbitrum One Mainnet

Now that we've verified that our smart contract works on Arbitrum's Sepolia testnet, we're ready to deploy it to Arbitrum One Mainnet. This is the same process as deploying to Arbitrum's Sepolia testnet, except that we'll need to pay a transaction fee in real $ETH instead of $ASPL.

Expect to see inconsistent $ETH gas fees in this step - the [Gas and fees section](/how-arbitrum-works/gas-fees.md) contains more information about how gas fees are determined for Arbitrum transactions.

<!-- not sure if this is the best way to work through this step - optimized for quick, assumed user knows how to create a deployment account; or otherwise will be ok with having to ask chatgpt -->

First, update the `hardhat.config.js` file to specify the private key of the **one-time-use deployment account** that you'll use to deploy your smart contract (and pay the transaction fee):

```javascript title="hardhat.config.js"
// ...
const ARBITRUM_MAINNET_TEMPORARY_PRIVATE_KEY = ''; // <- this should **not** begin with "0x"
// ...
accounts: [ARBITRUM_MAINNET_TEMPORARY_PRIVATE_KEY]; // <- uncomment this line
// ...
```

:::caution

Note that we're adding a private key to a config file. This is **not** a best practice. Consider using environment variables instead.

:::

Next, deposit some $ETH into the wallet corresponding to the private key we added to `hardhat.config.js`. You'll then be able to deploy your smart contract to Arbitrum One Mainnet by issuing the following command:

```bash
yarn hardhat run scripts/deploy.js --network arbitrumOne
```

You should see the following output:

```bash
Cupcake vending machine deployed to 0xff825139321bd8fB8b720BfFC5b9EfDB7d6e9AB3
```

Congratulations! You've just deployed **business logic and data** to Ethereum's decentralized network of nodes by way of Arbitrum One[^2].

To view your smart contract in a blockchain explorer, visit `https://arbiscan.io/address/0x...B3`, but replace the `0x...B3` part of the URL with the full address of your deployed smart contract.

Select `Arbitrum One` from Metamask's dropdown, paste your contract address into the `VendingMachine` below, and click `Get cupcake!`. You should be prompted to sign a transaction that gives you an immutable cupcake.

<VendingMachine id="smart-mainnet-cupcakes" type="web3-arb-one" />

### Summary

In this quickstart, we:

- Identified **two business rules**: 1) fair and permissionless cupcake distribution, 2) immutable business logic and data.
- Identified a **challenge**: These rules are difficult to follow in a centralized application.
- Identified a **solution**: Arbitrum makes it easy for developers to decentralize business logic and data (using Ethereum mainnet as a settlement layer).
- Converted a vending machine's Javascript business logic into a **Solidity smart contract**.
- **Deployed our smart contract** to Hardhat's local development network, and then Arbitrum's Sepolia testnet, and then Arbitrum One Mainnet.

If you have any questions or feedback, reach out to us on [Discord](https://discord.gg/ZpZuw7p) and/or click the `Request an update` button at the top of this page - we're listening!

### Next steps

<!--todo: figure out what next steps they're actually looking for by performing content tests -->

- Visit [How to estimate gas](/build-decentralized-apps/02-how-to-estimate-gas.md) to learn how to estimate the gas cost of your smart contract transactions.
- Visit [RPC endpoints and providers](/build-decentralized-apps/reference/01-node-providers.md#rpc-endpoints) for a list of public chains that you can deploy your smart contracts to.

[^1]: The vending machine example was inspired by [Ethereum.org's "Introduction to Smart Contracts"](https://ethereum.org/en/developers/docs/smart-contracts/), which was inspired by [Nick Szabo's "From vending machines to smart contracts"](http://unenumerated.blogspot.com/2006/12/from-vending-machines-to-smart.html).
[^2]: Although application front-ends are usually hosted by centralized services, smart contracts allow the underlying logic and data to be partially or fully decentralized. These smart contracts are hosted and executed by Ethereum's public, decentralized network of nodes. Arbitrum has its own network of nodes that use advanced cryptography techniques to "batch process" Ethereum transactions and then submit them to Ethereum L1, which significantly reduces the cost of using Ethereum. All without requiring developers to compromise on security or decentralization.
[^3]: There are multiple types of Ethereum nodes. The ones that earn ETH for processing and validating transactions are called _validators_. See [Nodes and Networks](https://docs.prylabs.network/docs/concepts/nodes-networks) for a beginner-friendly introduction to Ethereum's node types.
[^4]: When our `VendingMachine` contract is deployed to Ethereum, it'll be hosted by Ethereum's decentralized network of nodes. Generally speaking, we won't be able to modify the contract's code after it's deployed.
[^5]: To learn more about how Ethereum wallets work, see [Ethereum.org's introduction to Ethereum wallets](https://ethereum.org/en/wallets/).
[^6]: Visit the [Gentle Introduction to Arbitrum](../intro/intro.md) for a beginner-friendly introduction to Arbitrum's rollup protocol.

<!-- TODOs

#### FAQs

 - Why do I need to sign a transaction to get a cupcake?
 - What's the difference between L1 and L2?
 - Will my wallet carry balances between networks? Layers?
 - How do wallets work?
 - How do I upgrade my smart contract?
 - What are people building on Arbitrum?
 - What if I didn't use an L2 scaling solution like Arbitrum?
 - Can I use uniswap to convert ETH into $AGOR?
 - How do people normally stage deployments of smart contracts?
 - What are some best practices for smart contract development?
 - Can I deploy to Mainnet first and then deploy to Arbitrum?
 - What's the difference between a smart contract and a dapp?
 - What's the difference between Arbitrum One and Arbitrum Nova?
 - Are these cupcakes "NFTs"? (no)
 - figure out where to store the samples

#### Code

 - live editor

#### Footnote drafts

[^5]: (footnote to elaborate on infeasibility vs impossibility, upgradeability).
[^6]: See https://hardhat.org/hardhat-network/docs/metamask-issue
[^6]: (windows-specific callouts)
[^7]: ABI explainer
[^6]: If you're using Windows,.
[^7]: ABI stands for "Application Binary Interface". It's a JSON file that describes the functions and events of a smart contract. It's used by frontend applications to interact with smart contracts. See [this article](https://ethereum.org/en/developers/docs/abi/) for a beginner-friendly introduction to ABI.

#### Optimizations

 - example Arbitrum goerli contract: 0xff825139321bd8fB8b720BfFC5b9EfDB7d6e9AB3
 - example Arbitrum One contract:
 - example Arbitrum Nova contract:
 - next docs to do / upgrade:
   - public chains and addresses
 - concept doc for this -> visualize the components, layers, data structures, information flows, procedure
 - consider using Docusaurus' live code editor to let users play with the code in the browser
 - Testing
 - Samples
 - Blockchain exploring
 - Architecting
 - Patterns
 - Tutorials
 - Differences between Ethereum and Arbitrum - op codes etc
 - Upgrading contracts
 - Oracles
 - One vs Nova
 - https://yos.io/2019/11/10/smart-contract-development-best-practices/
 - https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/4733
-->
