---
title: 'Quickstart: write a smart contract in Rust using Stylus'
description: 'Leads a developer from 0 to 1 writing and deploying a smart contract in Rust using Stylus'
author: chrisco512, anegg0
sme: chrisco512, anegg0
sidebar_position: 2
target_audience: Developers writing Stylus contracts in Rust using Stylus
---

import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.mdx';

<PublicPreviewBannerPartial />

This guide will get you started with <a data-quicklook-from="stylus">Stylus</a>' basics. We'll cover the following steps:

1. [Setting up your development environment](./stylus-quickstart#setting-up-your-development-environment)
2. [Creating a Stylus project with cargo stylus](./stylus-quickstart#creating-a-stylus-project-with-cargo-stylus)
3. [Checking the validity of your contract](./stylus-quickstart#checking-if-your-stylus-project-is-valid)
4. [Deploying your contract](./stylus-quickstart#deploying-your-contract)
5. [Exporting your contract's ABIs](./stylus-quickstart#exporting-solidity-abis)
6. [Calling your contract](./stylus-quickstart#calling-your-contract)
7. [Sending a transaction to your contract](./stylus-quickstart#sending-a-transaction-to-your-contract)
8. [Using scripts to interact with a contract](./stylus-quickstart#handling-contracts-interactions-with-a-script)

## Prerequisites

This guide assumes you are familiar with:

- [Rust](https://www.rust-lang.org/learn)
- [Solidity](https://docs.soliditylang.org/en/v0.8.9/)
- [Docker](https://www.docker.com)
- CLI commands (bash, zsh, etc.)

### Setting up your environment
#### 1. Rust toolchain

Follow the instructions on [Rust Lang’s installation page](https://www.rust-lang.org/tools/install) to install a complete Rust toolchain on your system. After installation, ensure you can access the programs `rustup`, `rustc`, and `cargo` from your preferred terminal application.

#### 2. VS Code

We recommend [VSCode](https://code.visualstudio.com/) as the IDE of choice for its excellent Rust support, but feel free to use another text editor or IDE if you’re comfortable with those.

Some helpful VS Code extensions for Rust development:

- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer): Provides advanced features like smart code completion and on-the-fly error checks
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens): Immediately highlights errors and warnings in your code
- [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml): Improves syntax highlighting and other features for TOML files, often used in Rust projects
- [Dependi](https://marketplace.visualstudio.com/items?itemName=fill-labs.dependi): Helps manage Rust crate versions directly from the editor

#### 3. Docker

The testnode we will use as well as some `cargo stylus` commands require Docker to operate.

You can download Docker from [Docker’s website](https://www.docker.com/products/docker-desktop).

#### 4. Foundry's Cast

[Foundry's Cast](https://book.getfoundry.sh/cast/) is a command-line tool that allows you to interact with your EVM contracts.

#### 5. Nitro testnode

Stylus is available on Arbitrum Sepolia, but we'll use nitro testnode which has a pre-funded wallet saving us the effort of wallet provisioning or running out of tokens to send transactions.

```shell title="Install your testnode"
git clone -b release --recurse-submodules https://github.com/OffchainLabs/nitro-testnode.git && cd nitro-testnode
```

```shell title="Launch your testnode"
./test-node.bash --init
```

The initialization part might take up to a few minutes, but you can move on to the next section while it launches.

```shell title="Re-use your testnode"
./test-node.bash
```

## Creating a Stylus project with cargo stylus

[cargo stylus](https://github.com/OffchainLabs/cargo-stylus/blob/main/main/VALID_WASM.md) is a CLI toolkit built to facilitate the development of Stylus contracts.

It is available as a plugin to the standard cargo tool used for developing Rust programs.

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

```shell title="cargo stylus --help returns:"
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

At this point, you can move on to the next step of this guide or develop your first Rust smart contract. Feel free to use the [Stylus Rust SDK reference section](./reference/overview) as a starting point; it offers many examples to help you quickly familiarize yourself with Stylus.

## Checking if your Stylus project is valid

By running `cargo stylus check` against your first contract, you can check if your program can be successfully **deployed and activated** onchain.

**Important:** Ensure your Docker service runs so this command works correctly.

```shell
cargo stylus check
```

`cargo stylus check` executes a dry run on your project by compiling your contract to WASM and verifying if it can be deployed and activated onchain.

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

The contract can fail the check for various reasons (on compile, deployment, etc...). Reading the [Invalid Stylus WASM Contracts explainer](https://github.com/OffchainLabs/cargo-stylus/blob/main/main/VALID_WASM.md) can help you understand what makes a WASM contract valid or not.

If your contract succeeds, you'll see something like this:

```shell
Finished release [optimized] target(s) in 1.88s
Reading WASM file at hello-stylus/target/wasm32-unknown-unknown/release/hello-stylus.wasm
Compressed WASM size: 3 KB
Program succeeded Stylus onchain activation checks with Stylus version: 1
```

Note that running `cargo stylus check` may take a few minutes, especially if you're verifying a contract for the first time.

See `cargo stylus check --help` for more options.

## Deploying your contract

Once you're ready to deploy your contract onchain, `cargo stylus deploy` will help you with the deployment and its gas estimation.

### Estimating gas

Note: For every transaction, we'll use the testnode pre-funded wallet, you can use `0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659` as your private key.

You can estimate the gas required to deploy your contract by running:

```shell
cargo stylus deploy \
  --endpoint='http://localhost:8547' \
  --private-key="0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659" \
  --estimate-gas
```

The command should return something like this:

```shell
deployment tx gas: 7123737
gas price: "0.100000000" gwei
deployment tx total cost: "0.000712373700000000" ETH
```

### Deployment

Let's move on to the contract's actual deployment. Two transactions will be sent onchain: the contract deployment and its [activation](stylus/stylus-gentle-introduction.md#activation).

```shell
cargo stylus deploy \
  --endpoint='http://localhost:8547' \
  --private-key="0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659"
```

Once the deployment and activations are successful, you'll see an output similar to this:

```shell
deployed code at address: 0x33f54de59419570a9442e788f5dd5cf635b3c7ac
deployment tx hash: 0xa55efc05c45efc63647dff5cc37ad328a47ba5555009d92ad4e297bf4864de36
wasm already activated!
```

Make sure to save the contract's deployment address for future interactions!

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

In this example, we'll use Foundry's Cast to send a call and then a transaction to our contract.

### Calling your contract

Our contract is a counter; in its initial state, it should store a counter value of `0`.
You can call your contract so it returns its current counter value by sending it the following command:

```shell title="Call to the function: number()(uint256)"
cast call --rpc-url 'http://localhost:8547' --private-key 0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659 \
[deployed-contract-address] "number()(uint256)"
```

Let's break down the command:

- `cast call` command sends a call to your contract
- The `--rpc-url` option is the `RPC URL` endpoint of our testnode: http://localhost:8547
- The `--private-key` option is the private key of our pre-funded development account. It corresponds to the address `0x3f1eae7d46d88f08fc2f8ed27fcb2ab183eb2d0e`
- The [deployed-contract-address] is the address we want to interact with, it's the address that was returned by `cargo stylus deploy`
- `number()(uint256)` is the function we want to call in Solidity-style signature. The function returns the counter's current value

```shell title="Calling 'number()(uint256)' returns:"
0
```

The `number()(uint256)` function returns a value of `0`, the contract's initial state.

### Sending a transaction to your contract

Let's increment the counter by sending a transaction to your contract's `increment()` function.
We'll use Cast's `send` command to send our transaction.

```shell title="Sending a transaction to the function: increment()"
cast send --rpc-url 'http://localhost:8547' --private-key 0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659 \
[deployed-contract-address] "increment()"
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

Our transactions returned a status of `1`, indicating success, and the counter has been incremented (you can verify this by calling your contract's `number()(uint256)` function again).

## Handling contracts interactions with a script

The `counter` example is nice as a warm up, but probably not something you'd need in production, so let's take things a bit further with a more complex contract: the `Vending Machine`.
The `Vending Machine` contract represents a cupcake vending machine that distributes cupcakes to users, ensuring they can only receive one every 5 seconds, and allows users to check their cupcake balance:

```solidity
// SPDX-License-Identifier: UNLICENSED
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

To play with this contract just clone the `stylus-quickstart-vending-machine` repository:

```shell
git clone git@github.com:OffchainLabs/stylus-quickstart-vending-machine.git && cd stylus-quickstart-vending-machine
```

You've already installed `cargo stylus`, and you've learned the basics, so you should be able to check this contract and deploy it.

Once done with the deployment, you can interact with the contract using the same commands as before, but the `stylus-quickstart-vending-machine` example also includes a Rust script that automates the interaction with the contract.

You'll find this `ethers-rs` script under `examples/vending_machine.rs`.

```rust
use ethers::{
    middleware::SignerMiddleware,
    prelude::abigen,
    providers::{Http, Middleware, Provider},
    signers::{LocalWallet, Signer},
    types::Address,
};
use eyre::eyre;
use std::io::{BufRead, BufReader};
use std::str::FromStr;
use std::sync::Arc;
use dotenv::dotenv;
use std::env;

/// Your private key file path.
const PRIV_KEY_PATH: &str = "PRIV_KEY_PATH";

/// Stylus RPC endpoint url.
const RPC_URL: &str = "RPC_URL";

/// Deployed contract address.
const STYLUS_CONTRACT_ADDRESS: &str = "STYLUS_CONTRACT_ADDRESS";
const USER_ADDRESS: &str = "USER_ADDRESS";

#[tokio::main]
async fn main() -> eyre::Result<()> {
    // Load environment variables from .env file
    dotenv().ok();

    // Debugging: Print environment variables
    println!("PRIV_KEY_PATH: {:?}", env::var(PRIV_KEY_PATH));
    println!("RPC_URL: {:?}", env::var(RPC_URL));
    println!("STYLUS_CONTRACT_ADDRESS: {:?}", env::var(STYLUS_CONTRACT_ADDRESS));
    println!("USER_ADDRESS: {:?}", env::var(USER_ADDRESS));

    let priv_key_path = env::var(PRIV_KEY_PATH).map_err(|_| eyre!("No {} env var set", PRIV_KEY_PATH))?;
    let rpc_url = env::var(RPC_URL).map_err(|_| eyre!("No {} env var set", RPC_URL))?;
    let contract_address = env::var(STYLUS_CONTRACT_ADDRESS)
        .map_err(|_| eyre!("No {} env var set", STYLUS_CONTRACT_ADDRESS))?;
    let user_address_str = env::var(USER_ADDRESS).map_err(|_| eyre!("No {} env var set", USER_ADDRESS))?;
    let user_address: Address = user_address_str.parse().map_err(|e| eyre!("Failed to parse user address: {}", e))?;

    abigen!( //abigen! macro is used to generate type-safe bindings to the VendingMachine contract based on its ABI
        VendingMachine,
        r#"[
            function giveCupcakeTo(address user_address) external returns (bool)
            function getCupcakeBalanceFor(address user_address) external view returns (uint256)
        ]"#
    );

    let provider = Provider::<Http>::try_from(rpc_url)?;
    let address: Address = contract_address.parse()?;

    let privkey = read_secret_from_file(&priv_key_path)?;
    println!("Private key read from file: {}", privkey); // Debugging line

    let wallet = LocalWallet::from_str(&privkey)?;
    let chain_id = provider.get_chainid().await?.as_u64();
    let client = Arc::new(SignerMiddleware::new(
        provider,
        wallet.clone().with_chain_id(chain_id),
    ));

    let vending_machine = VendingMachine::new(address, client);

    let balance = vending_machine.get_cupcake_balance_for(user_address).call().await?;
    println!("User cupcake balance = {:?}", balance);

    let tx_receipt = vending_machine.give_cupcake_to(user_address).send().await?.await?;
    match tx_receipt {
        Some(receipt) => {
            if receipt.status == Some(1.into()) {
                println!("Successfully gave cupcake to user via a tx");
            } else {
                println!("Failed to give cupcake to user, tx failed");
            }
        }
        None => {
            println!("Failed to get transaction receipt");
        }
    }

    let balance = vending_machine.get_cupcake_balance_for(user_address).call().await?;
    println!("New user cupcake balance = {:?}", balance);

    Ok(())
}

fn read_secret_from_file(fpath: &str) -> eyre::Result<String> {
    let f = std::fs::File::open(fpath)?;
    let mut buf_reader = BufReader::new(f);
    let mut secret = String::new();
    buf_reader.read_line(&mut secret)?;
    Ok(secret.trim().to_string())
}
```

As you can see in the code above, the script:

- Reads the private key from a file
- Connects to the nitro-testnode RPC endpoint
- Adds a cupcake to the user's balance
- Prints the user's cupcake balance

Remember: your contracts are also Ethereum ABI equivalent if using the Stylus SDK, meaning they can be called and transacted with using any other Ethereum tooling.

To run the example, set the following env vars or place them in a `.env` file this project, then:

```shell
STYLUS_CONTRACT_ADDRESS=<the onchain address of your deployed contract>
PRIV_KEY_PATH=<the file path for your priv key to transact with>
RPC_URL=http://localhost:8547
USER_ADDRESS=<the address of the user you want to interact with>
```

Alternatively, you can copy the `.env-sample` into a `.env` file:

```shell
cp .env-sample .env
```

Next, run:

```shell
cargo run --example vending_machine --target=<YOUR_ARCHITECTURE>
```

Where you can find `YOUR_ARCHITECTURE` by running `rustc -vV | grep host`. For M1 Apple computers, for example, this is `aarch64-apple-darwin` and for most Linux x86 it is `x86_64-unknown-linux-gnu`.

## Conclusion

Congratulations! You've successfully initialized, deployed, and interacted with your first contract using Stylus and Rust.

Feel free to explore the [Stylus Rust SDK reference](./reference/overview) for more information on using Stylus in your Arbitrum projects.
