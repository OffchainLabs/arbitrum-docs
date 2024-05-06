---
title: 'Quickstart: Write a smart contract in Rust using Stylus'
description: 'Leads a developer from 0 to 1 writing and deploying a smart contract in Rust using Stylus'
author: chrisco512
sme: chrisco512
sidebar_position: 2
target_audience: Developers writing Stylus contracts in Rust using Stylus
---

import PublicPreviewBannerPartial from './partials/_stylus-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

## Prerequisites

### Rust toolchain

Follow the instructions on [Rust Lang’s installation page](https://www.rust-lang.org/tools/install) to get a full Rust toolchain installed on your system. Make sure after installation that you have access to the programs `rustup`, `rustc`, and `cargo` from your preferred command line terminal (programs should be added to your system’s PATH, more instructions available on Rust’s website)

### VS Code

We recommend VSCode as the IDE of choice for developing Stylus contracts for its excellent Rust support. See **[code.visualstudio.com](https://code.visualstudio.com/)** to install. Feel free to use another text editor or IDE if you’re comfortable with those.

Some helpful VSCode extensions for Rust development:

- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer): Provides advanced features like smart code completion and on-the-fly error checks.
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens): Immediately highlights errors and warnings in the code.
- [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml): Improves syntax highlighting and other features for TOML files, often used in Rust projects.
- [crates](https://marketplace.visualstudio.com/items?itemName=serayuzgur.crates): Helps manage Rust crate versions directly from the editor.


### Setting Up a Developer Wallet

When working on a testnet, it's important to use a separate wallet that holds no real assets. This is because you'll often need to input private keys into your command line to manage transactions, and you should never use personal accounts for development purposes. **_So avoid using personal accounts for development_**.

If you're using [MetaMask](https://metamask.io/), here’s how to set up a new account:

1. Open MetaMask and click the dropdown menu at the top middle of the plugin.
2. Select “Add Account” to create a new wallet. Consider naming it something like "dev wallet" or "Stylus" to remind you of its purpose.
3. You'll need the private key of this new account—and some testnet ETH (like Sepolia ETH) if you plan to deploy smart contracts. To get your private key, follow the steps provided on [MetaMask’s support page](https://support.metamask.io/ko/managing-my-wallet/secret-recovery-phrase-and-private-keys/how-to-export-an-accounts-private-key/).

This setup ensures that your real assets are safe while you develop and test on Arbitrum.

![Stylus Wallet](./assets/stylus-wallet.png)

:::caution

**_Never share your “secret recovery phrase” with anyone_**. Never enter it anywhere. A _private key_ is valid for an individual account only, but a _secret recovery phrase_ can be used to gain access to ALL accounts in your wallet.

:::

You will need to add Arbitrum Sepolia as a custom network in MetaMask to interact with the Stylus testnet. In your MetaMask plugin, click the network dropdown on the top left and select "Add Network". Fill in the following details:

- **Network Name**: Arbitrum Sepolia
- **New RPC URL**: `https://sepolia-rollup.arbitrum.io/rpc`
- **Chain ID**: 421614
- **Currency Symbol**: ETH
- **Block Explorer URL**: `https://sepolia.arbiscan.io`

Click "Save" to add the network.


### Testnet ETH

To work on the Stylus testnet, which directly integrates with the [Arbitrum Sepolia](/build-decentralized-apps/03-public-chains.md#arbitrum-sepolia) testnet, you'll need testnet ETH. Here’s how to get it:

1. Go to [Bware Labs' faucet for the Arbitrum Stylus Testnet](https://bwarelabs.com/faucets/arbitrum-stylus-testnet).
2. Enter your wallet address in the provided text field.
3. Click **`Claim`**. There might be an option to perform an additional step for more testnet tokens.
4. After these steps, you should see Sepolia ETH in your Stylus testnet wallet.

If you need more testnet ETH, consider using other faucets for the Arbitrum Sepolia or Ethereum Sepolia networks:

- [QuickNode Faucet for Arbitrum Sepolia](https://faucet.quicknode.com/arbitrum/sepolia)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Sepolia Faucet by PK910](https://sepolia-faucet.pk910.de/)


## Your First Stylus Program

`cargo-stylus` is a command-line tool that simplifies the process of building, verifying, and deploying Arbitrum Stylus programs written in Rust. It functions as a plugin to Cargo, the standard build tool for Rust, allowing seamless integration into existing Rust workflows.

### Installation

Ensure that Rust is installed on your system. You can install it from [the Rust installation page](https://www.rust-lang.org/tools/install).

Next, install the `cargo-stylus` tool by executing the following command in your terminal:

```bash
RUSTFLAGS="-C link-args=-rdynamic" cargo install --force cargo-stylus
```

To prepare your Rust environment for building [WebAssembly (WASM)](https://webassembly.org/) modules, add WASM as a build target with this command:

```bash
rustup target add wasm32-unknown-unknown
```

After installation, `cargo-stylus` is accessible through the cargo command. To view the available options and commands, use:


```bash
cargo stylus --help
```

This will display the following usage options:


```plaintext
Cargo command for developing Arbitrum Stylus projects

Usage: cargo stylus <COMMAND>

Commands:
  new         Create a new Rust project
  export-abi  Export a Solidity ABI
  check       Check that a contract can be activated onchain
  deploy      Deploy a stylus contract
  replay      Replay a transaction in gdb
  trace       Trace a transaction
  help        Print this message or the help of the given subcommand(s)

Options:
  -h, --help     Print help
  -V, --version  Print version
```

### Creating a new Stylus project

The cargo stylus command comes with useful commands such as `new`, `check` and `deploy`, and `export-abi` for developing and deploying Stylus programs to Arbitrum chains. Here's a common workflow:

Start a new Stylus project with

```bash
cargo stylus new <YOUR_PROJECT_NAME>
```

This command clones a local copy of the [stylus-hello-world](https://github.com/OffchainLabs/stylus-hello-world) repository, which contains a Rust implementation of the Solidity `Counter` smart contract example. For further details, refer to the [README](https://github.com/OffchainLabs/stylus-hello-world/blob/main/README.md) in the `stylus-hello-world` repository.

For a simpler setup, especially suitable for projects that do not require the full capabilities of Solidity, you can create a minimal project structure using:

```bash
cargo stylus new --minimal <YOUR_PROJECT_NAME>
```

This creates a project with just the essential Stylus entrypoint locally.

Continue to develop your Rust program using the features provided in the [[stylus-sdk](https://github.com/OffchainLabs/stylus-sdk-rs)]. 

### Checking Program Validity

Before deploying your program onchain, ensure its it works:

```bash
cargo stylus check
```

This command verifies that your program can be deployed and activated onchain without a transaction, by connecting to a specified JSON-RPC endpoint. The defalt endpoint is the Arbitrum Stylus testnet: `https://stylus-testnet.arbitrum.io/rpc`.

For additional options, consult the help guide:

```bash
cargo stylus check --help
```

A successful validation will display something like:

```
Finished `release` profile [optimized] target(s) in 0.20s

Reading WASM file at [YOUR-DIRECTORY]/target/wasm32-unknown-unknown/release/deps/stylus_hello_world.wasm
Uncompressed WASM size: 25.0 KB
Compressed WASM size to be deployed onchain: 9.0 KB
Connecting to Stylus RPC endpoint: https://stylus-testnet.arbitrum.io/rpc
Program succeeded Stylus onchain activation checks with Stylus version: 1
```

If the check fails, the output provides detailed error information, such as:

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

For guidelines on what constitutes a valid or invalid WASM program, refer to [VALID_WASM](https://github.com/OffchainLabs/cargo-stylus/blob/main/VALID_WASM.md). 


### Deploying Your Program

Once validated, you can deploy your program using the `cargo stylus deploy` subcommand. Start by estimating the gas required for deployment. `--private-key-path` is a text file containing your private key. You could also use the `--private-key` flag to input your private key directly but this is not recommended for security reasons. 

```bash
cargo stylus deploy \
  --private-key-path=<PRIVKEY_FILE_PATH> \
  --estimate-gas-only
```

The output might look like this:

```bash
Compressed WASM size: 3 KB
Deploying program to address 0x457b1ba688e9854bdbed2f473f7510c476a3da09
Estimated gas: 12756792
```

To proceed with the deployment, two transactions will be sent onchain:

```bash
cargo stylus deploy \
  --private-key-path=<PRIVKEY_FILE_PATH>
```

You'll see details about the deployment process, such as:

```bash
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

For further deployment options and transaction details, consult `cargo stylus deploy --help`.


## Deploying Non-Rust WASM Projects

The Stylus CLI tool supports deploying WebAssembly (WASM) projects, including those not compiled from Rust. You can deploy any WASM file by using the `--wasm-file-path` flag with Stylus CLI commands.

### Supporting Various WASM Sources

The tool isn't limited to Rust-compiled WASMs. It can deploy WASM files written in other programming languages like C, or even WebAssembly Text [(WAT)](https://www.webassemblyman.com/wat_webassembly_text_format.html) files. This flexibility allows for deploying standalone WASM files that do not require Rust compilation.

For instance, a simple WAT module like this:

```wasm
(module
    (type $t0 (func (param i32) (result i32)))
    (func $add_one (export "add_one") (type $t0) (param $p0 i32) (result i32)
        get_local $p0
        i32.const 1
        i32.add))
```
can be saved as `add.wat`. You can then check or deploy it using commands like:

```bash
cargo stylus check --wasm-file-path=add.wat
```

and

```bash
cargo stylus deploy --priv-key-path=<YOUR PRIV KEY FILE PATH> --wasm-file-path=add.wat
```

### Exporting Solidity ABIs from Rust Projects

If you're working with Stylus Rust projects that utilize the [stylus-sdk](https://github.com/OffchainLabs/stylus-sdk-rs), you also have the option to export Solidity ABIs. This can be done easily using the `export-abi` command provided by the Stylus CLI tool:

```bash
cargo stylus export-abi
```

This feature supports seamless integration of Rust-based smart contracts with other Ethereum tools and frameworks, which often rely on Solidity ABIs to interact with various contracts.
