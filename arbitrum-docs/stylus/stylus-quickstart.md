---
title: 'Quickstart: write a smart contract in Rust using Stylus'
description: 'Leads a developer from 0 to 1 writing and deploying a smart contract in Rust using Stylus'
author: chrisco512, anegg0
sme: chrisco512, anegg0
sidebar_position: 2
target_audience: Developers writing Stylus contracts in Rust using Stylus
---

import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

This guide will get you started with <a data-quicklook-from="stylus">Stylus</a>' basics. We'll cover the following steps:

1. [Setting up your development environment](./stylus-quickstart#setting-up-your-development-environment)
2. [Creating a Stylus project with cargo Stylus](./stylus-quickstart#creating-a-stylus-project-with-cargo stylus)
3. [Checking the validity of your contract](./stylus-quickstart#checking-if-your-stylus-project-is-valid)
4. [Deploying your contract](./stylus-quickstart#deploying-your-contract)
5. [Exporting your contract's ABIs](./stylus-quickstart#exporting-solidity-abis)

## Setting up your development environment

### Prerequisites

#### Rust toolchain

Follow the instructions on [Rust Lang’s installation page](https://www.rust-lang.org/tools/install) to install a complete Rust toolchain on your system. After installation, ensure you have access to the programs `rustup`, `rustc`, and `cargo` from your preferred terminal application.

#### VS Code

We recommend [VSCode](https://code.visualstudio.com/) as the IDE of choice for its excellent Rust support, but feel free to use another text editor or IDE if you’re comfortable with those.

Some helpful VS Code extensions for Rust development:

- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer): Provides advanced features like smart code completion and on-the-fly error checks
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens): Immediately highlights errors and warnings in your code
- [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml): Improves syntax highlighting and other features for TOML files, often used in Rust projects
- [Dependi](https://marketplace.visualstudio.com/items?itemName=fill-labs.dependi): Helps manage Rust crate versions directly from the editor

#### Docker

Some `cargo stylus` commands requires Docker to operate. You can download Docker from [Docker’s website](https://www.docker.com/products/docker-desktop).

#### Developer wallet/account

We recommend creating an account specifically for development that doesn't hold any real assets.

##### Creating a new account

If you’re using [MetaMask](https://metamask.io/), click the dropdown at the top middle of the plugin and then click “Add Account” to create a fresh account.
Labeling the account as a dev wallet or “Stylus” can be helpful. You’ll need this newly created account’s private key. [Follow the instructions on MetaMask’s website](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) to obtain your key.

##### Storing your private key

You might also want to add your developer's private key to your environment variables for easier and safer access with `export PRIVKEY_FILE_PATH=<path-of-your-private-key>` 

#### Arbitrum Sepolia ETH

We will interact with the [Arbitrum Sepolia](./reference/testnet-information.md) testnet, so you will need a small amount of Sepolia ETH to deploy contracts and send transactions. 

To add Arb Sepolia ETH to your wallet you can request it from these faucets:
- [Alchemy's faucet](https://www.alchemy.com/faucets/arbitrum-sepolia)
- [Quicknode's faucet](https://faucet.quicknode.com/arbitrum/sepolia) 

## Creating a Stylus project with cargo Stylus

cargo stylus is a CLI toolkit built to facilitate Stylus contracts development.

It is available as a plugin to the standard `cargo` tool used for developing Rust programs.

### Installing cargo Stylus

In your terminal, run:

```shell
cargo install --force cargo-stylus
```

Add WASM ([WebAssembly](https://webassembly.org/)) as a build target for your Rust compiler with the following command:

```shell
rustup target add wasm32-unknown-unknown
```

You can verify that cargo stylus is installed by running `cargo stylus --help` in your terminal, which will return a list of helpful commands, we will use some of them in this guide:

```shell
Cargo command for developing Stylus projects

Usage: cargo stylus <COMMAND>

Commands:
  new         Create a new Stylus project
  init        Initializes a Stylus project in the current directory
  export-abi  Export a Solidity ABI
  activate    Activate an already deployed contract [aliases: a]
  cache       Cache a contract using the Stylus CacheManager for Arbitrum chains
  check       Check a contract [aliases: c]
  deploy      Deploy a contract [aliases: d]
  verify      Verify the deployment of a Stylus contract [aliases: v]
  cgen        Generate c code bindings for a Stylus contract
  replay      Replay a transaction in gdb [aliases: r]
  trace       Trace a transaction [aliases: t]
  help        Print this message or the help of the given command(s)

Options:
  -h, --help     Print help
  -V, --version  Print version
```

### Creating a project

Let's create our first Stylus project by running:

```shell
cargo stylus new <YOUR_PROJECT_NAME>
```

`cargo stylus new` generates a starter template that implements a Rust version of the [Solidity `Counter` smart contract example](https://github.com/OffchainLabs/counter_contract/blob/master/contracts/Counter.sol).

At this point, you can move on to the next step of this guide or develop your first Rust smart contract. Feel free to use the [Stylus Rust SDK reference](./reference/overview) as a starting point, it offers many examples to quickly familiarize yourself with Stylus.

## Checking if your Stylus project is valid

By running `cargo stylus check` against your first contract, you can check if your program can be successfully **deployed and activated** on-chain.

**Important:** Ensure your Docker service is running for this command to work correctly.

```shell
cargo stylus check
```

`cargo stylus check` executes a dry-run on your project by compiling your contract to WASM and verifying if it can be deployed and activated onchain.

If the command above fails, you'll see detailed information about why your contract would be rejected:

```shell
Reading WASM file at bad-export.wat
Compressed WASM size: 55 B
Stylus checks failed: program pre-deployment check failed when checking against
ARB_WASM_ADDRESS 0x0000…0071: (code: -32000, message: program activation failed: failed to parse program)

Caused by:
    binary exports reserved symbol stylus_ink_left

Location:
    prover/src/binary.rs:493:9, data: None)
```

The program can fail the check for various reasons (on compile, deployment, etc...). Reading the [Invalid Stylus WASM Contracts explainer](https://github.com/OffchainLabs/cargo-stylus/blob/main/main/VALID_WASM.md) can help you understand what makes a WASM contract valid or not.

If your program succeeds, you'll see something like this:

```shell
Finished release [optimized] target(s) in 1.88s
Reading WASM file at hello-stylus/target/wasm32-unknown-unknown/release/hello-stylus.wasm
Compressed WASM size: 3 KB
Program succeeded Stylus onchain activation checks with Stylus version: 1
```

Note that running `cargo stylus check` may take a few minutes, especially if you're verifying a contract for the first time.

See `cargo stylus check --help` for more options.

## Deploying your contract

Once you're ready to deploy your program onchain, `cargo stylus deploy` will help you with the estimation of the deployment's gas cost, as well as with the deployment itself.

### Estimating gas

First, you can estimate the gas required to perform your contract's deployment by running:

```shell
cargo stylus deploy \
  --private-key-path=$PRIV_KEY_PATH \
  --estimate-gas
```

The command should return something like this:

```shell
deployment tx gas: 7123737
gas price: "0.100000000" gwei
deployment tx total cost: "0.000712373700000000" ETH
```

### Deployment

Next, you can attempt an actual deployment. Two transactions will be sent onchain: the contract deployment and its activation.

```shell
cargo stylus deploy \
  --private-key-path=$PRIV_KEY_PATH
```

Once the deployment is successful, you'll see an output similar to this:

```shell
deployed code at address: 0x33f54de59419570a9442e788f5dd5cf635b3c7ac
deployment tx hash: 0xa55efc05c45efc63647dff5cc37ad328a47ba5555009d92ad4e297bf4864de36
wasm already activated!
```

More options are available for sending and outputting your transaction data. See `cargo stylus deploy --help` for more details.

## Exporting the Solidity ABI interface

The cargo stylus tool makes it easy to export your contract's ABI using `cargo stylus export-abi`.

This command returns the Solidity ABI interface of your smart contract. If you have been running `cargo stylus new` without modifying the output, `cargo stylus export-abi` will return:

```shell
/**
 * This file was automatically generated by Stylus and represents a Rust program.
 * For more information, please see [The Stylus SDK](https://github.com/OffchainLabs/stylus-sdk-rs).
 */

// SPDX-License-Identifier: MIT-OR-APACHE-2.0
pragma solidity ^0.8.23;

interface ICounter {
    function number() external view returns (uint256);

    function setNumber(uint256 new_number) external;

    function mulNumber(uint256 new_number) external;

    function addNumber(uint256 new_number) external;

    function increment() external;
}
```

Ensure you save the console output to a file that you'll be able to use with your <a data-quicklook-from="dapp">dApp</a>.

Feel free to explore the [Stylus Rust SDK reference](./reference/overview) for more information on using Stylus in your Arbitrum projects.
