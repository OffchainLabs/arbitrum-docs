---
id: arbitrum-quickstart
title: Get started with Arbitrum (Solidity, Hardhat)
sidebar_label: Quickstart (Solidity, Hardhat)
description: This quickstart will walk you through the process of deploying a simple Solidity contract to Ethereum mainnet, and then to Arbitrum.
author: symbolpunk
sme: dzgoldman
audience: web developers who haven't ever built on Ethereum/Arbitrum
task: deploy your first smart contract directly to L2
---

This quickstart is for developers who want to start building decentralized applications (dApps) using Arbitrum. It makes no assumptions about your prior experience with Ethereum or Arbitrum. If you're new to Ethereum, consider studying the [Ethereum documentation](https://ethereum.org/en/developers/docs/) before proceeding.


### What we're building

We're going to build a digital cupcake vending machine using Solidity smart contracts[^1]. Our vending machine will follow three rules:

1. The vending machine will distribute a cupcake to anyone who wants one.
2. The vending machine will not distribute a cupcake to someone who has recently received one.
3. The vending machine's rules can't be changed by anyone.

Here's our vending machine implemented with Javascript:

```js title="VendingMachine.js" live className="foo" id="bar"
function VendingMachineFactory(props) {
    class VendingMachine {
        // Internal memory of the vending machine
        cupcakeBalances = {};
        cupcakeDistributionTimes = {};

        // Vend a cupcake to the caller
        handleCupcakeButtonClick(userId) {
            if (this.cupcakeBalances[userId] === undefined) {
                this.cupcakeBalances[userId] = 0;
                this.cupcakeDistributionTimes[userId] = 0;
            }

            const fiveSeconds = 5000;
            const userCanReceiveCupcake = this.cupcakeDistributionTimes[userId] + fiveSeconds <= Date.now();
            if (!userCanReceiveCupcake) {
                console.error("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
                return false;
            } else {
                this.cupcakeBalances[userId]++;
                this.cupcakeDistributionTimes[userId] = Date.now();
                console.log(`Enjoy your cupcake, ${userId}!`);
                return true;
            }
        }

        getCupcakeBalance(userId) {
            return this.cupcakeBalances[userId];
        }
    }

    const vendingMachine = new VendingMachine();

    const handleButtonClick = () => {
        let gotCupcake = vendingMachine.handleCupcakeButtonClick("Bob");
        if (gotCupcake){
            const cupcake = document.getElementById("cupcake");
            cupcake.style.opacity = 1;

            setTimeout(() => {
                cupcake.style.transition = "opacity 5.5s";
                cupcake.style.opacity = 0;
            }, 0);

            setTimeout(() => {
                cupcake.style.transition = "opacity 0s";
                cupcake.style.opacity = 0;
            }, 5000);
        }
    };

    return (
        <div>
            <span id="cupcake" style={{ opacity: 0 }}> 🧁</span>
            <button onClick={handleButtonClick}>Cupcake please!</button>
        </div>
    );
}
```

Note that although this vending machine follows the first two rules, it doesn't follow the third rule (yet).


### Prerequisites

We'll be using VS Code to build our vending machine, and a Metamask wallet to test it:

- VS Code: See [https://code.visualstudio.com/](https://code.visualstudio.com/) to install.
- Metamask: See [https://metamask.io/](https://metamask.io/) to install.

The code in this quickstart is tooling-agnostic, so feel free to use whatever tools/wallet you're most comfortable with. We'll install the rest of our dependencies as we go.


### Ethereum and Arbitrum in a nutshell

 - Ethereum is a decentralized blockchain that runs small programs called smart contracts.
 - Smart contracts allow decentralized apps (dApps) to process transactions according to pre-defined rules.
 - DApps let users carry their data and identity between applications without having to trust centralized service providers.
 - While traditional (web2) apps are hosted on centralized servers, decentralized (web3) apps are hosted by Ethereum's decentralized network of nodes.
 - People who run <a href='https://docs.prylabs.network/docs/concepts/nodes-networks'>Ethereum nodes</a> receive rewards for processing and validating transactions.
 - These transactions can be expensive for end-users. Layer 2 (L2) scaling solutions like Arbitrum can help reduce costs for end-users.
 - Arbitrum is a suite of L2 scaling solutions. It lets you to build dApps that can process thousands of transactions per second with low latency, low transaction costs, and high security standards.


### Review our dumb contract

The above vending machine is implemented as a Javascript class:

```js title="VendingMachine.js"
    class VendingMachine {
        // Internal memory of the vending machine
        cupcakeBalances = {};
        cupcakeDistributionTimes = {};

        // Vend a cupcake to the caller
        handleCupcakeButtonClick(userId) {
            if (this.cupcakeBalances[userId] === undefined) {
                this.cupcakeBalances[userId] = 0;
                this.cupcakeDistributionTimes[userId] = 0;
            }

            const fiveSeconds = 5000;
            const userCanReceiveCupcake = this.cupcakeDistributionTimes[userId] + fiveSeconds <= Date.now();
            if (!userCanReceiveCupcake) {
                console.error("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
                return false;
            } else {
                this.cupcakeBalances[userId]++;
                this.cupcakeDistributionTimes[userId] = Date.now();
                console.log(`Enjoy your cupcake, ${userId}!`);
                return true;
            }
        }

        getCupcakeBalance(userId) {
            return this.cupcakeBalances[userId];
        }
    }
```

We're calling it a "dumb contract" because it's hosted by a centralized server that we (Offchain Labs) control. This means that we can change the contract's rules to give our friends extra cupcakes. This is a problem because it means that you have to trust us, and we have to trust our hosting provider.

DApps solve this problem by using smart contracts to build end-user experiences that nobody in particular controls[^2]. Let's convert our dumb contract into a smart contract.


### Review our smart contract

Here is our vending machine's dumb Javascript contract implemented as a Solidity smart contract:

```solidity title="VendingMachine.sol"
pragma solidity ^0.8.0;

contract VendingMachine {
    // Internal storage of the vending machine
    mapping(address => uint) private _cupcakeBalances;
    mapping(address => uint) private _cupcakeDistributionTimes;

    function handleCupcakeButtonClick() public returns (bool) {
        uint fiveSeconds = 5 * 1 seconds;
        address userId = msg.sender;

        if (_cupcakeBalances[userId] == 0) {
            _cupcakeDistributionTimes[userId] = block.timestamp;
        }

        bool userCanReceiveCupcake = _cupcakeDistributionTimes[userId] + fiveSeconds <= block.timestamp;
        if (!userCanReceiveCupcake) {
            revert("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
        } else {
            _cupcakeBalances[userId]++;
            _cupcakeDistributionTimes[userId] = block.timestamp;
            return true;
        }
    }

    // Getter function for the cupcake balance of a user
    function getCupcakeBalance(address user) public view returns (uint) {
        return _cupcakeBalances[user];
    }
}
```


### Test our smart contract

Create a directory for your project and open it with VS Code. Then, use VS Code's integrated terminal to create a React app with `npx create-react-app react dapp`. When this command finishes, you should see a new `react-dapp` directory in your project directory.

Navigate into this directory and run `yarn start` to verify that your React app can be served locally. You should see a new browser window open with a React app that says "Edit `src/App.js` and save to reload." You can close this for now; we'll spin this back up later.

Next, install [ethers.js](https://docs.ethers.org/v5/) and [hardhat](https://hardhat.org/hardhat-runner/docs/getting-started#overview):

<!--todo: toggles for npm / yarn? -->
```
yarn add ethers hardhat @nomicfoundation/hardhat-toolbox
```

This installs three packages: `ethers` lets us interact with the Ethereum blockchain, `hardhat` lets us deploy and test our smart contracts, and `hardhat-toolbox` is a bundle of common Hardhat plugins that we'll use later.

Next, run `npx hardhat` to configure Hardhat for your project. Select `Create a JavaScript project` when prompted. Make sure you specify your `react-dapp` folder as the project root when asked.

At this point, you should see the following items in your `react-dapp` project directory (you may see others - these are the important ones):

| Item                | Description                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| `contracts/`        | Contains your smart contracts. You should see the `Lock.sol` contract here.                               |
| `public/`           | Contains web app artifacts.                                                                               |
| `scripts/`          | Contains scripts that you can use to interact with your smart contracts. You should see `deploy.js` here. |
| `src/`              | Contains web app artifacts.                                                                               |
| `test/`             | Contains test files for your smart contracts. `Lock.js` is the test we can use to test `Lock.sol`.        |
| `hardhat.config.js` | Contains the configuration settings for Hardhat.                                                          |


Run `npx hardhat compile` to compile your `contracts`. You may be prompted to install additional dependencies. Once this command finishes, you should see a new `.artifacts/` directory appear. This directory contains the compiled smart contracts.

Next, run `npx hardhat node` to start a local Ethereum node. This node will be used to simulate the Ethereum blockchain. You should see something along the lines of `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/` in your terminal. You should also see a number of test accounts automatically generated for you. We'll use these to test our smart contract.

From another terminal instance, run `npx hardhat run scripts/deploy.js --network localhost`. This command will deploy your smart contract to your local Ethereum node.

todo - may have to pin ethers.js to 5.7.2






----



and install Hardhat with `npm install --save-dev hardhat`. We'll also need a few other dependencies:

```bash



### Deploy a smart contract to Arbitrum L2




### Next steps / things to link
 - Testing
 - Blockchain exploring
 - Differences between Ethereum and Arbitrum - op codes etc
 - Upgrading contracts
 - Oracles
 - One vs Nova
 - https://yos.io/2019/11/10/smart-contract-development-best-practices/


[^1]: Inspired by [Ethereum.org's Introduction to Smart Contracts](https://ethereum.org/en/developers/docs/smart-contracts/), which was inspired by [Nick Szabo's From vending machines to smart contracts](http://unenumerated.blogspot.com/2006/12/from-vending-machines-to-smart.html).
[^2]: Although application front-ends are usually hosted by centralized services, smart contracts allow the underlying logic and data to be partially or fully decentralized. These smart contracts aren't hosted by an institution's private, centralized network of servers. Instead, they're hosted by Ethereum's public, decentralized network of nodes. This means that instead of trusting centralized service providers, we're trusting the open-source code that runs on Ethereum's nodes.