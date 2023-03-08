---
id: arbitrum-quickstart
title: Get started with Arbitrum (Solidity, Hardhat)
sidebar_label: Quickstart (Solidity, Hardhat)
description: This quickstart will walk you through the process of deploying a simple Solidity contract to Ethereum mainnet, and then to Arbitrum.
author: symbolpunk
sme: dzgoldman
audience: devs who haven't ever built on Ethereum/Arbitrum
task: deploy first smart contract direcly to L2
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
            throw new Error("You must wait at least 5 seconds before receiving another cupcake.");
        }

        this.cupcakeBalances[userId]++;
        this.cupcakeDistributionTimes[userId] = Date.now();
        console.log(`Enjoy your cupcake, ${userId}!`);
        }
    }

    const vendingMachine = new VendingMachine();

    const handleButtonClick = () => {
        vendingMachine.handleCupcakeButtonClick("Bob");

        const cupcake = document.getElementById("cupcake");
        cupcake.style.opacity = 1;

        setTimeout(() => {
            cupcake.style.transition = "opacity 5s";
            cupcake.style.opacity = 0;
        }, 0);

        setTimeout(() => {
            cupcake.style.transition = "opacity 0s";
            cupcake.style.opacity = 0;
        }, 5000);
    };

    return (
        <div>
            <button onClick={handleButtonClick}>Cupcake please!</button>
            <span id="cupcake" style={{ opacity: 0 }}> 🧁</span>
        </div>
    );
}
```


### Prerequisites

 - foundry?
   - maybe more advanced
   - but lots of new people are using it
 - hardhat will probably be more accessible to core dev community
 -  - maybe not? foundry may be trending such that it's more accessible now and in future
 - ethers?
 - hardhat?
 - could start with hardhat / ethers -> for some parts mention foundry?
   - aligned - could be similar enough to toggle using our widget


### Ethereum and Arbitrum in a nutshell

- Ethereum is a public, permissionaless, decentralized blockchain that runs smart contracts.
- Smart contracts are small programs that process transactions according to rules that developers specify with code.
- Developers can integrate smart contracts into their traditional applications (web2 apps).
- Decentralized applications (web3 apps / dApps) use smart contracts to provide decentralized end-user experiences.
- Decentralized end-user experiences allow users to carry their data and identity across applications, without having to trust anyone in particular. They just need to trust the code.
- Anyone can use any of Ethereum's clients (like Offchain's Prysm client) to run a validator node and earn rewards for processing transactions for the network.
- Arbitrum is a layer 2 scaling solution for Ethereum. It allows developers to build dApps that can process thousands of transactions per second, with low latency, low fees, and Ethereum-grade security guarantees.


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