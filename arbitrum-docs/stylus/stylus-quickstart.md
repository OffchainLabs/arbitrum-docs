---
title: 'Quickstart: Write a smart contract in Rust using Stylus'
description: 'Leads a developer from 0 to 1 writing and deploying a smart contract in Rust using Stylus'
author: chrisco512, anegg0
sme: chrisco512, anegg0
sidebar_position: 2
target_audience: Developers writing Stylus contracts in Rust using Stylus
---

import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

This guide will show you the basics of using Stylus to write and deploy a smart contract. We'll cover the following steps:

1. Setting up your development environment
2. Creating a new Stylus project
3. Checking the validity of your contract
4. Deploying your contract
5. Exporting your contract's ABIs

## Setting up your development environment

### Prerequisites

#### Rust toolchain

Follow the instructions on [Rust Lang’s installation page](https://www.rust-lang.org/tools/install) to get a full Rust toolchain installed on your system. Make sure after installation that you have access to the programs `rustup`, `rustc`, and `cargo` from your preferred terminal application.

#### VS Code

We recommend [VSCode](https://code.visualstudio.com/) as the IDE of choice for its excellent Rust support, but feel free to use another text editor or IDE if you’re comfortable with those.

Some helpful VS Code extensions for Rust development:

- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer): Provides advanced features like smart code completion and on-the-fly error checks.
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens): Immediately highlights errors and warnings in the code.
- [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml): Improves syntax highlighting and other features for TOML files, often used in Rust projects.
- [Dependi](https://marketplace.visualstudio.com/items?itemName=fill-labs.dependi): Helps manage Rust crate versions directly from the editor.
  
#### Developer wallet / account

You will often use crypto private keys as CLI arguments when sending transactions on Arbitrum networks, so we recommend creating an account specifically for development, one that doesn't hold any real assets.

If you’re using [MetaMask](https://metamask.io/), simply click the dropdown at the top middle of the plugin and then click “Add Account” to create a fresh account. It can be helpful to label the account as a dev wallet or “Stylus” for this purpose. You’ll need this newly created account’s private key (as well as some Sepolia ETH) for deploying a smart contract. [Follow the instructions on MetaMask’s website](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) to obtain your key.

### Sepolia ETH

Stylus settles directly to [Arbitrum Sepolia](./reference/testnet-information.md) testnet, so you will need at least one ETH to deploy contracts and send transactions. 

Follow these steps to acquire testnet ETH on the Stylus testnet:

For additional sources of testnet ETH, please use a faucet on Arbitrum Sepolia or Ethereum Sepolia:

[https://faucet.quicknode.com/arbitrum/sepolia](https://faucet.quicknode.com/arbitrum/sepolia)

[https://sepoliafaucet.com/](https://sepoliafaucet.com/)

[https://sepolia-faucet.pk910.de/](https://sepolia-faucet.pk910.de/)

## Creating a Stylus project with cargo-stylus

`cargo-stylus` is a CLI utility assisting with Arbitrum Stylus programs'
- Building
- Verifying
- Deploying  in Rust. This is available as a plugin to the standard `Cargo` tool used for developing Rust programs, integrating easily into common Rust workflows. Once [Rust has been installed](https://www.rust-lang.org/tools/install) on your system, install the Stylus CLI tool by running the following command:

```shell
cargo install --force cargo-stylus cargo-stylus-check
```

In addition, add WASM ([WebAssembly](https://webassembly.org/)) as a build target for your Rust compiler with the following command:

```shell
rustup target add wasm32-unknown-unknown
```

You should now have it available as a cargo command:

```shell
❯ cargo stylus --help
Cargo subcommand for developing Stylus projects

Usage: cargo stylus <COMMAND>

Commands:
  new         Create a new Rust project
  export-abi  Export a Solidity ABI
  check       Check a contract
  deploy      Deploy a contract
  replay      Replay a transaction in gdb
  trace       Trace a transaction
  c-gen       Generate C code
  help        Print this message or the help of the given subcommand(s)

Options:
  -h, --help     Print help
  -V, --version  Print version
```

### Overview

The cargo stylus command comes with useful commands such as `new`, `check` and `deploy`, and `export-abi` for developing and deploying Stylus programs to Arbitrum chains. Here's a common workflow:

Start a new Stylus project with

```shell
cargo stylus new <YOUR_PROJECT_NAME>
```

The command above generates a starter template which implements a Rust version of the Solidity `Counter` smart contract example. 
Alternatively, you can use `cargo stylus new --minimal <YOUR_PROJECT_NAME>` to create a more barebones example with a Stylus entrypoint locally, useful for projects that don’t need all the Solidity plumbing. Note that the term "minimal" refers to a contract that handles simple bytes in, bytes out operations. Hence, the `cargo stylus export-abi` command (introduced later) won't work with contracts that use the entrypoint style because they don't enforce the Solidity ABI.

Then, develop your Rust program normally and take advantage of all the features the [stylus-sdk](https://github.com/OffchainLabs/stylus-sdk-rs) has to offer.

### Checking if your Stylus project is valid

To check whether or not your program can be successfully **deployed and activated** onchain, use the `cargo stylus check` subcommand:

```shell
cargo stylus check
```

This command will attempt to verify that your program can be deployed and activated onchain without requiring a transaction by specifying a JSON-RPC endpoint. See `cargo stylus check --help` for more options.

If the command above fails, you'll see detailed information about why your WASM will be rejected:

```
Reading WASM file at bad-export.wat
Compressed WASM size: 55 B
Stylus checks failed: program predeployment check failed when checking against
ARB_WASM_ADDRESS 0x0000…0071: (code: -32000, message: program activation failed: failed to parse program)

Caused by:
    binary exports reserved symbol stylus_ink_left

Location:
    prover/src/binary.rs:493:9, data: None)

```

To read more about what counts as valid vs. invalid user WASM programs, see [VALID_WASM](https://github.com/OffchainLabs/cargo-stylus/blob/main/main/VALID_WASM.md). If your program succeeds, you'll see the following message:

```
Finished release [optimized] target(s) in 1.88s
Reading WASM file at hello-stylus/target/wasm32-unknown-unknown/release/hello-stylus.wasm
Compressed WASM size: 3 KB
Program succeeded Stylus onchain activation checks with Stylus version: 1
```

Note that running `cargo stylus check` may take a few minutes, especially on a fresh build. If you're running the check or deploy commands, a message at the start will inform you that this process might take some time. For faster checks, you can use the `--no-verify` option. Also, please ensure that Docker is up and running, as these commands are required to be executed properly.

Once you're ready to deploy your program onchain, you can use the `cargo stylus deploy` subcommand as follows. First, we can estimate the gas required to perform our deployment with:

```
cargo stylus deploy \
  --private-key-path=<PRIVKEY_FILE_PATH> \
  --estimate-gas-only
```

and see:

```
Compressed WASM size: 3 KB
Deploying program to address 0x457b1ba688e9854bdbed2f473f7510c476a3da09
Estimated gas: 12756792
```

Next, attempt an actual deployment. Two transactions will be sent onchain.

```
cargo stylus deploy \
  --private-key-path=<PRIVKEY_FILE_PATH>
```

and see:

```
Compressed WASM size: 3 KB
Deploying program to address 0x457b1ba688e9854bdbed2f473f7510c476a3da09
Estimated gas: 12756792
Submitting tx...
Confirmed tx 0x42db…7311, gas used 11657164
Activating program at address 0x457b1ba688e9854bdbed2f473f7510c476a3da09
Estimated gas: 14251759
Submitting tx...
Confirmed tx 0x0bdb…3307, gas used 14204908

```

More options exist for sending and outputting your transaction data. See `cargo stylus deploy --help` for more details.

## Exporting Solidity ABIs

Stylus Rust projects that use the [stylus-sdk](https://github.com/OffchainLabs/stylus-sdk-rs) have the option of exporting Solidity ABIs. The cargo stylus tool also makes this easy with the `export-abi` command:

`cargo stylus export-abi`
