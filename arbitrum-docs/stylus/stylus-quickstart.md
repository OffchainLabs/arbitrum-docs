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
2. [Creating a Stylus project with cargo stylus](./stylus-quickstart#creating-a-stylus-project-with-cargo-stylus)
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

Some `cargo stylus` commands require Docker to operate. You can download Docker from [Docker’s website](https://www.docker.com/products/docker-desktop).

#### Foundry's Cast

[Foundry's Cast](https://book.getfoundry.sh/cast/) is a command-line tool that allows you to interact with your EVM contracts.
### Nitro testnode

```shell
  `git clone -b release --recurse-submodules https://github.com/OffchainLabs/nitro-testnode.git && cd nitro-testnode`
```
```shell
./test-node.bash --init
```
```bash
```shell
./test-node.bash
```
## Creating a Stylus project with cargo stylus

cargo stylus is a CLI toolkit built to facilitate Stylus contracts development.

It is available as a plugin to the standard `cargo` tool used for developing Rust programs.

### Installing cargo stylus

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
    prover/src/binary.rs:493:9, data: None
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

Once you're ready to deploy your program on-chain, `cargo stylus deploy` will help you with the estimation of the deployment's gas cost, as well as with the deployment itself.

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

Next, you can attempt an actual deployment. Two transactions will be sent on-chain: the contract deployment and its activation.

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

Make sure to save the contract address for future interactions.

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

Ensure you save the console output to a file that you'll be able to use with your <a data-quicklook-from="dapp"><a data-quicklook-from="dapp">dApp</a></a>.

## Interacting with your Stylus contract

Stylus contracts are EVM-compatible, you can interact with them with your tool of choice, such as [Hardhat](https://hardhat.org/), [Foundry's Cast](https://book.getfoundry.sh/cast/), or any other Ethereum-compatible tool.

In this example, we'll use Foundry's Cast to send  a call and then a transaction to our contract.

### Calling your contract

Our contract is a counter, in its initial state it should store a counter value of `0`.
To make sure, you can call your contract so it returns its current counter value by sending it the following command:


```shell title="Call to the function: number()(uint256)"
cast call --rpc-url 'http://localhost:8547' --private-key 0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659 /
[your-deployed-contract-address] "number()(uint256)"
```
Let's break down the command:

- Casts's `call` command sends a call to your contract
- The `--rpc-url` option is the `RPC URL` endpoint of our testnode. 
- The `--private-key` option is the private key of our pre-funded development account. It corresponds to the address `0x3f1eae7d46d88f08fc2f8ed27fcb2ab183eb2d0e`.
- The deployed contract address is the address we want to interact with
- The function we want to call is `number()(uint256)`, in Solidity-style signature. The function returns the current value of the counter. 

```shell title="Call returns:"
0
```

Our counter now displays a value of `0`, that's the contract's initial state.

### Sending a transaction to your contract

Now, let's increment the counter by sending a transaction to the `increment()` function.
We'll use Cast's `send` command to send a transaction to our contract.

```shell title="Sending a transaction to the function: increment()"
cast send --rpc-url 'http://localhost:8547' --private-key 0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659 
0x11b57fe348584f042e436c6bf7c3c3def171de49 "increment()"
```

```shell title="Transaction returns:"
blockHash               0xfaa2cce3b9995f3f2e2a2f192dc50829784da9ca4b7a1ad21665a25b3b161f7c
blockNumber             20
contractAddress         
cumulativeGasUsed       97334
effectiveGasPrice       100000000
from                    0x3f1Eae7D46d88F08fc2F8ed27FCb2AB183EB2d0E
gasUsed                 97334
logs                    []
logsBloom               0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                    
status                  1 (success)
transactionHash         0x28c6ba8a0b9915ed3acc449cf6c645ecc406a4b19278ec1eb67f5a7091d18f6b
transactionIndex        1
type                    2
blobGasPrice            
blobGasUsed             
authorizationList       
to                      0x11B57FE348584f042E436c6Bf7c3c3deF171de49
gasUsedForL1             "0x0"
l1BlockNumber             "0x1223"
```
Our transactions returned a status of `1`, indicating success, and the counter has been incremented (you can verify this calling your contract's `number()(uint256)` function again).


=======
Ensure you save the console output to a file that you'll be able to use with your <a data-quicklook-from="dapp"><a data-quicklook-from="dapp">dApp</a></a>.

## Interacting with your Stylus contract

Stylus contracts are EVM-compatible, you can interact with them with your tool of choice, such as [Hardhat](https://hardhat.org/), [Foundry's Cast](https://book.getfoundry.sh/cast/), or any other Ethereum-compatible tool.

In this example, we'll use Foundry's Cast to send  a call and then a transaction to our contract.



### Calling your contract

Our contract is a counter, in its initial state it should store a counter value of `0`.
To make sure, you can call your contract so it returns its current counter value by sending it the following command:


```shell title="Call to the function: number()(uint256)"
cast call --rpc-url 'http://localhost:8547' --private-key 0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659 /
[your-deployed-contract-address] "number()(uint256)"
```
Let's break down the command:

- Casts's `call` command sends a call to your contract
- The `--rpc-url` option is the `RPC URL` endpoint of our testnode. 
- The `--private-key` option is the private key of our pre-funded development account. It corresponds to the address `0x3f1eae7d46d88f08fc2f8ed27fcb2ab183eb2d0e`.
- The deployed contract address is the address we want to interact with
- The function we want to call is `number()(uint256)`, in Solidity-style signature. The function returns the current value of the counter. 

```shell title="Call returns:"
0
```

Our counter now displays a value of `0`, that's the contract's initial state.

### Sending a transaction to your contract

Now, let's increment the counter by sending a transaction to the `increment()` function.
We'll use Cast's `send` command to send a transaction to our contract.

```shell title="Sending a transaction to the function: increment()"
cast send --rpc-url 'http://localhost:8547' --private-key 0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659 
0x11b57fe348584f042e436c6bf7c3c3def171de49 "increment()"
```

```shell title="Transaction returns:"
blockHash               0xfaa2cce3b9995f3f2e2a2f192dc50829784da9ca4b7a1ad21665a25b3b161f7c
blockNumber             20
contractAddress         
cumulativeGasUsed       97334
effectiveGasPrice       100000000
from                    0x3f1Eae7D46d88F08fc2F8ed27FCb2AB183EB2d0E
gasUsed                 97334
logs                    []
logsBloom               0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                    
status                  1 (success)
transactionHash         0x28c6ba8a0b9915ed3acc449cf6c645ecc406a4b19278ec1eb67f5a7091d18f6b
transactionIndex        1
type                    2
blobGasPrice            
blobGasUsed             
authorizationList       
to                      0x11B57FE348584f042E436c6Bf7c3c3deF171de49
gasUsedForL1             "0x0"
l1BlockNumber             "0x1223"
```
Our transactions returned a status of `1`, indicating success, and the counter has been incremented (you can verify this calling your contract's `number()(uint256)` function again).


>>>>>>> Stashed changes

Feel free to explore the [Stylus Rust SDK reference](./reference/overview) for more information on using Stylus in your Arbitrum projects.
