# Phase 4: Create New Content - Implementation Guide

**Duration:** ~16 hours
**Files Modified:** 7 (rename troubleshooting + 6 diagrams)
**New Files:** 15 (3 fundamentals + 3 guides + 3 best-practices + 3 troubleshooting + 1 advanced + 2 interop)
**Diagrams Added:** 6

## Overview

Phase 4 fills critical documentation gaps identified in the analysis:
1. Developer onboarding content (choose-your-path, dev environment)
2. Interoperability guides (Rust ↔ Solidity)
3. Best practices (security, performance, gas optimization)
4. Troubleshooting (common errors, debugging)
5. Core concept diagrams for complex topics

## Pre-Phase 4 Checklist

- [ ] Phases 1-3 completed successfully
- [ ] Current build passes
- [ ] Tag `phase-3-complete` exists
- [ ] All previous diagrams render correctly

## Phase 4 Tasks

### Task 4.1: Create Fundamentals Content

#### fundamentals/choose-your-path.mdx

```bash
cat > docs/stylus/fundamentals/choose-your-path.mdx << 'EOF'
---
title: 'Choose your learning path'
description: 'Find the best Stylus learning path based on your background'
user_story: 'As a developer, I want to know the best way to learn Stylus based on my experience'
content_type: concept
sidebar_position: 0
---

# Choose your learning path

Your background determines the best way to learn Stylus. Choose your path below.

## I'm a Rust developer

**You're in great shape!** Stylus contracts are written in Rust, so you already know the language.

### What you need to learn

- How Ethereum smart contracts work
- How storage works in blockchain
- How to interact with other contracts
- Gas optimization for onchain code

### Recommended path

1. [Understand WebAssembly and Stylus](/stylus/concepts/webassembly)
2. [Build your first contract](/stylus/quickstart)
3. [Learn about storage](/stylus/fundamentals/data-types/storage)
4. [Call Solidity from Rust](/stylus/guides/call-solidity-from-rust)
5. [Optimize for gas](/stylus/best-practices/gas-optimization)

### Key insights

- **Familiar syntax**: Write normal Rust code with minimal blockchain-specific syntax
- **Memory safety**: Rust's borrow checker prevents common smart contract vulnerabilities
- **Performance**: WASM execution is significantly faster than EVM
- **Tooling**: Use cargo, rust-analyzer, and your favorite Rust tools

---

## I'm a Solidity developer

**Welcome!** You understand blockchain and smart contracts. Now learn Rust and leverage WASM performance.

### What you need to learn

- Rust language basics (ownership, borrowing, traits)
- Different memory and storage models
- Compilation to WASM instead of EVM opcodes
- Rust SDK equivalents for Solidity patterns

### Recommended path

1. [Compare VM differences](/stylus/concepts/vm-differences)
2. [Study Rust-to-Solidity differences](/stylus/advanced/rust-to-solidity-differences)
3. [Learn Rust basics](https://doc.rust-lang.org/book/)
4. [Build your first contract](/stylus/quickstart)
5. [Call Rust from Solidity](/stylus/guides/call-rust-from-solidity)

### Key insights

- **Familiar concepts**: Storage, events, modifiers, inheritance all have Rust equivalents
- **Better performance**: 10-100x gas savings for compute-heavy operations
- **Type safety**: Rust's type system catches errors at compile time
- **Interoperability**: Stylus and Solidity contracts call each other seamlessly

### Comparison table

| Concept | Solidity | Stylus (Rust) |
|---------|----------|---------------|
| State variable | `uint256 public count;` | `count: StorageU256` |
| Function | `function get() public view` | `pub fn get(&self) -> U256` |
| Event | `event Transfer(...)` | `#[event] struct Transfer` |
| Error | `error Unauthorized()` | `#[error] struct Unauthorized` |
| Modifier | `modifier onlyOwner` | Rust function or trait |
| Inheritance | `contract A is B` | Trait implementation |

---

## I'm new to blockchain development

**Exciting!** You're starting fresh with best-in-class tools.

### What you need to learn

- Blockchain fundamentals (accounts, transactions, state)
- Smart contract concepts (storage, events, gas)
- Rust programming language
- Arbitrum and Ethereum basics

### Recommended path

1. [Learn Ethereum basics](https://ethereum.org/en/developers/docs/)
2. [Learn Rust](https://doc.rust-lang.org/book/)
3. [Understand Stylus introduction](/stylus/gentle-introduction)
4. [Build your first contract](/stylus/quickstart)
5. [Explore examples](https://github.com/OffchainLabs/stylus-by-example)

### Resources

- [Ethereum docs](https://ethereum.org/en/developers/)
- [The Rust Book](https://doc.rust-lang.org/book/)
- [Arbitrum docs](/arbitrum-ethereum-differences)
- [Stylus by Example](https://github.com/OffchainLabs/stylus-by-example)

---

## Quick reference

No matter your path, bookmark these resources:

- **API Reference**: [Rust SDK](/stylus/reference/rust-sdk/)
- **CLI Reference**: [cargo-stylus commands](/stylus/cli-tools/commands-reference)
- **Examples**: [Stylus by Example](https://github.com/OffchainLabs/stylus-by-example)
- **Help**: [Troubleshooting](/stylus/troubleshooting/faq)
EOF
```

#### fundamentals/development-environment.mdx

```bash
cat > docs/stylus/fundamentals/development-environment.mdx << 'EOF'
---
title: 'Development environment setup'
description: 'Configure your IDE and tools for Stylus development'
user_story: 'As a developer, I want to set up an efficient development environment'
content_type: how-to
sidebar_position: 2
---

# Development environment setup

This guide helps you configure a productive development environment for Stylus.

## VS Code setup

Visual Studio Code is the recommended IDE for Stylus development.

### Install VS Code

Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Required extensions

Install these extensions:

```shell
# rust-analyzer (Rust language support)
code --install-extension rust-lang.rust-analyzer

# Even Better TOML (Cargo.toml support)
code --install-extension tamasfe.even-better-toml

# CodeLLDB (Rust debugger)
code --install-extension vadimcn.vscode-lldb
```

### Recommended extensions

```shell
# Error Lens (inline error messages)
code --install-extension usernamehw.errorlens

# Crates (Cargo.toml dependency management)
code --install-extension serayuzgur.crates

# GitLens (Git integration)
code --install-extension eamodio.gitlens
```

### VS Code settings

Add to `.vscode/settings.json` in your project:

```json
{
  "rust-analyzer.checkOnSave.command": "clippy",
  "rust-analyzer.cargo.features": "all",
  "editor.formatOnSave": true,
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  }
}
```

## IntelliJ IDEA / CLion setup

JetBrains IDEs offer excellent Rust support.

### Install Rust plugin

1. Open Settings → Plugins
2. Search for "Rust"
3. Install and restart

### Configure Rust toolchain

1. Settings → Languages & Frameworks → Rust
2. Select Toolchain location
3. Enable external linter: Clippy

## Command-line tools

### cargo-watch

Auto-rebuild on file changes:

```shell
cargo install cargo-watch

# Use it
cargo watch -x check -x test
```

### cargo-expand

View macro expansions:

```shell
cargo install cargo-expand

# Use it
cargo expand
```

### cargo-audit

Check for security vulnerabilities:

```shell
cargo install cargo-audit

# Use it
cargo audit
```

## Debugger setup

### VS Code debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Debug unit tests",
      "cargo": {
        "args": [
          "test",
          "--no-run",
          "--lib"
        ]
      },
      "args": [],
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

Set breakpoints and press F5 to debug.

## Testing environment

### Set up test RPC

Use a local Nitro node for testing:

```shell
# Start in one terminal
docker run -p 8547:8547 offchainlabs/nitro-node:latest --dev

# Add to .env
LOCAL_RPC_URL=http://localhost:8547
```

### Configure test accounts

```shell
# Generate test private key (DO NOT use in production!)
openssl rand -hex 32

# Add to .env
PRIVATE_KEY=your_generated_key_here
```

## Environment variables

Create `.env` in your project root:

```shell
# Network configuration
LOCAL_RPC_URL=http://localhost:8547
TESTNET_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
MAINNET_RPC_URL=https://arb1.arbitrum.io/rpc

# Deployment
PRIVATE_KEY=your_private_key_here

# Verification
ARBISCAN_API_KEY=your_api_key_here
```

**⚠️ Security:** Never commit `.env` to version control!

Add to `.gitignore`:

```
.env
.env.*
!.env.example
```

## Productivity tips

### Use cargo aliases

Add to `~/.cargo/config.toml`:

```toml
[alias]
st = "stylus"
sc = "stylus check"
sd = "stylus deploy"
```

Usage:

```shell
cargo st check
cargo sc  # shorthand
```

### Shell completions

```shell
# Bash
cargo stylus completions bash > ~/.bash_completions/cargo-stylus

# Zsh
cargo stylus completions zsh > ~/.zsh/completions/_cargo-stylus
```

## Troubleshooting

### rust-analyzer is slow

Increase memory limit in VS Code settings:

```json
{
  "rust-analyzer.server.extraEnv": {
    "RA_LOG": "info"
  }
}
```

### Clippy too strict

Configure in `Cargo.toml`:

```toml
[lints.clippy]
too_many_arguments = "allow"
```

## Next steps

- [Create your first project](/stylus/quickstart)
- [Learn about testing](/stylus/fundamentals/testing-contracts)
- [Explore CLI tools](/stylus/cli-tools/overview)
EOF
```

### Task 4.2: Create Guides Content

#### guides/call-solidity-from-rust.mdx

```bash
cat > docs/stylus/guides/call-solidity-from-rust.mdx << 'EOF'
---
title: 'Call Solidity contracts from Rust'
description: 'Learn how to call Solidity contracts from your Stylus contracts'
user_story: 'As a Stylus developer, I want to call existing Solidity contracts'
content_type: how-to
---

# Call Solidity contracts from Rust

Stylus contracts can seamlessly call Solidity contracts using the `sol_interface!` macro.

## Overview

The `sol_interface!` macro generates Rust bindings from Solidity interface definitions, enabling type-safe contract calls.

## Basic example

### Step 1: Define the Solidity interface

```rust
use stylus_sdk::prelude::*;
use stylus_sdk::alloy_primitives::{Address, U256};

sol_interface! {
    interface IERC20 {
        function balanceOf(address account) external view returns (uint256);
        function transfer(address to, uint256 amount) external returns (bool);
        function approve(address spender, uint256 amount) external returns (bool);
    }
}
```

### Step 2: Call the contract

```rust
#[external]
impl MyContract {
    pub fn check_balance(&self, token: Address, account: Address) -> Result<U256, Vec<u8>> {
        let erc20 = IERC20::new(token);
        let balance = erc20.balance_of(self, account)?;
        Ok(balance)
    }

    pub fn transfer_tokens(
        &mut self,
        token: Address,
        to: Address,
        amount: U256
    ) -> Result<bool, Vec<u8>> {
        let erc20 = IERC20::new(token);
        let success = erc20.transfer(self, to, amount)?;
        Ok(success)
    }
}
```

## View vs mutating calls

### View calls (read-only)

Use `Call::new()` for functions that don't modify state:

```rust
let balance = erc20.balance_of(self, account)?;
```

### Mutating calls

Use `Call::new_mutating()` for state-changing functions:

```rust
let success = erc20.transfer(self, to, amount)?;
```

### Payable calls

Use `Call::new_payable()` for functions requiring ETH:

```rust
let call = Call::new_payable(value);
contract.deposit(call)?;
```

## Advanced patterns

### Custom gas limits

```rust
let balance = erc20.balance_of(self, account)
    .gas(100_000)?;  // Custom gas limit
```

### Handling return values

```rust
match erc20.transfer(self, to, amount) {
    Ok(success) => {
        if success {
            // Transfer succeeded
        } else {
            // Transfer failed
        }
    }
    Err(e) => {
        // Call reverted
    }
}
```

### Multiple calls in one function

```rust
pub fn complex_operation(&mut self, token: Address) -> Result<(), Vec<u8>> {
    let erc20 = IERC20::new(token);

    // Read balance
    let balance = erc20.balance_of(self, msg::sender())?;

    // Approve
    erc20.approve(self, some_spender, balance)?;

    // Transfer
    erc20.transfer(self, some_recipient, balance / 2)?;

    Ok(())
}
```

## Complete example

```rust
use stylus_sdk::prelude::*;
use stylus_sdk::alloy_primitives::{Address, U256};

sol_interface! {
    interface IUniswapV2Router {
        function swapExactTokensForTokens(
            uint amountIn,
            uint amountOutMin,
            address[] calldata path,
            address to,
            uint deadline
        ) external returns (uint[] memory amounts);
    }
}

#[storage]
pub struct TokenSwapper {
    router: StorageAddress,
}

#[external]
impl TokenSwapper {
    pub fn swap(
        &mut self,
        token_in: Address,
        token_out: Address,
        amount_in: U256,
        amount_out_min: U256
    ) -> Result<Vec<U256>, Vec<u8>> {
        let router_addr = self.router.get();
        let router = IUniswapV2Router::new(router_addr);

        let path = vec![token_in, token_out];
        let deadline = block::timestamp() + 300; // 5 minutes

        let amounts = router.swap_exact_tokens_for_tokens(
            self,
            amount_in,
            amount_out_min,
            path,
            msg::sender(),
            deadline
        )?;

        Ok(amounts)
    }
}
```

## See also

- [Call Rust from Solidity](./call-rust-from-solidity)
- [Importing interfaces](./importing-interfaces)
- [SDK call reference](/stylus/reference/rust-sdk/calls)
EOF
```

#### guides/call-rust-from-solidity.mdx

```bash
cat > docs/stylus/guides/call-rust-from-solidity.mdx << 'EOF'
---
title: 'Call Rust contracts from Solidity'
description: 'Learn how to call Stylus contracts from Solidity'
user_story: 'As a Solidity developer, I want to call Stylus contracts'
content_type: how-to
---

# Call Rust contracts from Solidity

Solidity contracts can call Stylus contracts just like any other contract.

## Overview

Once deployed, Stylus contracts expose a standard Ethereum ABI that Solidity can interact with.

## Step 1: Export ABI from Rust

Use `cargo stylus` to export your contract's ABI:

```shell
cargo stylus export-abi
```

This generates a Solidity interface:

```solidity
interface ICounter {
    function number() external view returns (uint256);
    function increment() external;
    function setNumber(uint256 newNumber) external;
}
```

## Step 2: Create Solidity interface

Save the interface to a file:

```solidity
// ICounter.sol
pragma solidity ^0.8.0;

interface ICounter {
    function number() external view returns (uint256);
    function increment() external;
    function setNumber(uint256 newNumber) external;
}
```

## Step 3: Call from Solidity

```solidity
// CounterCaller.sol
pragma solidity ^0.8.0;

import "./ICounter.sol";

contract CounterCaller {
    ICounter public counter;

    constructor(address _counter) {
        counter = ICounter(_counter);
    }

    function getCount() public view returns (uint256) {
        return counter.number();
    }

    function incrementCounter() public {
        counter.increment();
    }

    function setCount(uint256 newNumber) public {
        counter.setNumber(newNumber);
    }
}
```

## Advanced patterns

### Handling return values

```solidity
function safeIncrement() public returns (bool) {
    try counter.increment() {
        return true;
    } catch {
        return false;
    }
}
```

### Passing complex types

**Rust side:**

```rust
#[external]
impl MyContract {
    pub fn process_data(&self, data: Vec<U256>) -> Result<U256, Vec<u8>> {
        Ok(data.iter().sum())
    }
}
```

**Solidity side:**

```solidity
function callProcess(uint256[] memory data) public returns (uint256) {
    return myContract.processData(data);
}
```

### Events from Stylus contracts

Stylus contracts emit standard Ethereum events:

**Rust:**

```rust
#[derive(SolidityEvent)]
pub struct Transfer {
    from: Address,
    to: Address,
    amount: U256,
}
```

**Solidity:**

```solidity
interface IToken {
    event Transfer(address indexed from, address indexed to, uint256 amount);
}

// Listen for events
IToken token = IToken(stylusTokenAddress);
// Events work automatically
```

## Complete example

**Stylus Contract (Rust):**

```rust
use stylus_sdk::prelude::*;
use stylus_sdk::alloy_primitives::U256;

#[storage]
pub struct Calculator {
    result: StorageU256,
}

#[external]
impl Calculator {
    pub fn add(&mut self, a: U256, b: U256) -> U256 {
        let sum = a + b;
        self.result.set(sum);
        sum
    }

    pub fn get_result(&self) -> U256 {
        self.result.get()
    }
}
```

**Solidity Caller:**

```solidity
pragma solidity ^0.8.0;

interface ICalculator {
    function add(uint256 a, uint256 b) external returns (uint256);
    function getResult() external view returns (uint256);
}

contract MathContract {
    ICalculator public calc;

    constructor(address _calc) {
        calc = ICalculator(_calc);
    }

    function compute(uint256 x, uint256 y) public returns (uint256) {
        uint256 result = calc.add(x, y);
        require(result == calc.getResult(), "Mismatch");
        return result;
    }
}
```

## Deployment workflow

1. Deploy Stylus contract
2. Export ABI: `cargo stylus export-abi`
3. Create Solidity interface
4. Deploy Solidity contract with Stylus address
5. Call Stylus from Solidity

## See also

- [Call Solidity from Rust](./call-solidity-from-rust)
- [Exporting ABI](./exporting-abi)
- [Importing interfaces](./importing-interfaces)
EOF
```

#### guides/create-project.mdx

```bash
cat > docs/stylus/guides/create-project.mdx << 'EOF'
---
title: 'Create a Stylus project'
description: 'Initialize a new Stylus project with cargo-stylus'
user_story: 'As a developer, I want to create a new Stylus project'
content_type: how-to
---

# Create a Stylus project

Learn how to create and configure a new Stylus project.

## Using cargo-stylus new

The fastest way to create a project:

```shell
cargo stylus new my-project
cd my-project
```

This creates a complete project with:
- `src/lib.rs` - Contract code
- `Cargo.toml` - Dependencies
- `.gitignore` - Git configuration

## Manual project setup

Alternatively, create a project manually:

```shell
cargo new --lib my-project
cd my-project
```

Update `Cargo.toml`:

```toml
[package]
name = "my-project"
version = "0.1.0"
edition = "2021"

[dependencies]
stylus-sdk = "0.5"
alloy-primitives = "0.7"
alloy-sol-types = "0.7"

[dev-dependencies]
tokio = { version = "1.12", features = ["macros", "full"] }

[features]
export-abi = ["stylus-sdk/export-abi"]

[lib]
crate-type = ["lib", "cdylib"]
```

## Project structure

```
my-project/
├── Cargo.toml          # Project configuration
├── Cargo.lock          # Locked dependencies
├── src/
│   └── lib.rs          # Your contract code
└── .gitignore
```

## Next steps

- [Understand project structure](/stylus/fundamentals/project-structure)
- [Build your first contract](/stylus/quickstart)
- [Learn about testing](/stylus/fundamentals/testing-contracts)
EOF
```

### Task 4.3: Create Best Practices Content

Due to length, I'll provide templates. You'll need to expand these based on research and examples:

#### best-practices/security.mdx

```mdx
---
title: 'Security best practices'
description: 'Security patterns and audit checklist for Stylus contracts'
user_story: 'As a developer, I want to write secure Stylus contracts'
content_type: reference
---

# Security best practices

[TO BE EXPANDED - ~300 lines covering:]
- Common vulnerabilities in Stylus
- Reentrancy protection patterns
- Input validation
- Safe arithmetic
- Access control patterns
- Audit checklist
```

#### best-practices/performance.mdx

```mdx
---
title: 'Performance optimization'
description: 'WASM-specific optimizations and profiling techniques'
user_story: 'As a developer, I want to optimize my Stylus contracts'
content_type: reference
---

# Performance optimization

[TO BE EXPANDED - ~250 lines covering:]
- WASM-specific optimizations
- Storage access patterns
- Memory management strategies
- Profiling and benchmarking
```

#### best-practices/gas-optimization.mdx

```mdx
---
title: 'Gas optimization'
description: 'Gas-efficient coding techniques for Stylus'
user_story: 'As a developer, I want to minimize gas costs'
content_type: reference
---

# Gas optimization

[TO BE EXPANDED - ~200 lines covering:]
- Gas cost comparison (Stylus vs Solidity)
- Optimization techniques for WASM
- Storage vs memory tradeoffs
- Real-world examples with metrics
```

### Task 4.4: Create Troubleshooting Content

#### troubleshooting/faq.mdx

```bash
# Rename existing troubleshooting file
mv docs/stylus/troubleshooting-building-stylus.md docs/stylus/troubleshooting/faq.mdx

# Update frontmatter
# Add: content_type: faq
```

#### troubleshooting/common-errors.mdx

```mdx
---
title: 'Common errors'
description: 'Solutions to frequently encountered errors'
user_story: 'As a developer, I want to quickly resolve common errors'
content_type: troubleshooting
---

# Common errors

[TO BE EXPANDED - Problem-solution format for:]
- Compilation errors
- Deployment errors
- Runtime errors
```

#### troubleshooting/debugging-guide.mdx

```mdx
---
title: 'Debugging guide'
description: 'Systematic debugging strategies for Stylus'
user_story: 'As a developer, I want to debug my contracts effectively'
content_type: how-to
---

# Debugging guide

[TO BE EXPANDED covering:]
- Systematic debugging approach
- Using replay for transaction debugging
- Local testing strategies
- Logging best practices
```

### Task 4.5: Create Advanced Content

#### advanced/memory-management.mdx

```mdx
---
title: 'Memory management'
description: 'WASM memory model and performance optimization'
user_story: 'As a developer, I want to understand WASM memory management'
content_type: concept
---

# Memory management

[TO BE EXPANDED covering:]
- WASM memory model
- Performance optimization
- Memory profiling
- Best practices
```

### Task 4.6: Add Core Concept Diagrams

Add these 6 diagrams to existing files:

**Diagram #1: Contract Lifecycle** (gentle-introduction.mdx)
**Diagram #2: Deployment & Activation** (concepts/activation.mdx)
**Diagram #4: EVM vs WASM Architecture** (concepts/vm-differences.mdx)
**Diagram #5: Contract Call Flow** (guides/importing-interfaces.mdx)
**Diagram #6: Ink to Gas Conversion** (concepts/gas-metering.mdx)
**Diagram #9: Deployment Workflows** (cli-tools/check-and-deploy.mdx)

[See main implementation guide for diagram code]

### Task 4.7: Update Sidebars

Add new sections to sidebars.js:

```javascript
{
  type: 'category',
  label: 'Best practices',
  items: [
    'stylus/best-practices/security',
    'stylus/best-practices/performance',
    'stylus/best-practices/gas-optimization',
  ],
},
{
  type: 'category',
  label: 'Troubleshooting',
  items: [
    'stylus/troubleshooting/faq',
    'stylus/troubleshooting/common-errors',
    'stylus/troubleshooting/debugging-guide',
  ],
},
```

### Task 4.8: Commit Phase 4

```bash
git add -A
git commit -m "docs(stylus): Phase 4 - Create New Content

- Add choose-your-path and development-environment to fundamentals
- Create interoperability guides (Rust ↔ Solidity)
- Add best-practices section (security, performance, gas)
- Create troubleshooting section (faq, errors, debugging)
- Add advanced memory-management guide
- Add 6 core concept diagrams (#1, #2, #4, #5, #6, #9)

New files: 15
Diagrams added: 6"

git tag phase-4-complete
```

## Phase 4 Success Criteria

- [ ] ✅ All new content files created
- [ ] ✅ 6 diagrams render correctly
- [ ] ✅ Build passes
- [ ] ✅ Sidebar navigation updated
- [ ] ✅ Changes committed and tagged

## Next Phase

Continue to Phase 5 for expansion, polish, and comprehensive validation.
