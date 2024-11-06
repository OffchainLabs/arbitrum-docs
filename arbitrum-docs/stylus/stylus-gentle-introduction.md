---
title: 'A gentle introduction to Stylus'
description: 'An educational introduction that provides a high-level understanding of Stylus, a new way to write EVM-compatible smart contracts using your favorite programming languages.'
author: amarrazza
sme: amarrazza
target_audience: 'Developers who want to build on Arbitrum using popular programming languages, like Rust'
sidebar_position: 1
---

# A gentle introduction: Stylus

### In a nutshell:

- Stylus lets you write smart contracts in programming languages that compile to WASM, such as **Rust, C, C++, and many others** allowing you to tap into their ecosystem of libraries and tools. Rich language and tooling support already exists for Rust, try out the SDK and CLI with the [quickstart](https://docs.arbitrum.io/stylus/stylus-quickstart) today.
- Solidity contracts and Stylus contracts are <b>fully interoperable</b>. In Solidity, you can call a Rust program and vice versa, thanks to a second, coequal WASM virtual machine.
- Stylus contracts offer significantly <b>faster execution and lower gas fees </b> for memory and compute-intensive operations, thanks to the superior efficiency of <a data-quicklook-from="wasm">WASM</a> programs.

### What's Stylus?

Stylus is an upgrade to Arbitrum Nitro [(ArbOS 32)](https://docs.arbitrum.io/run-arbitrum-node/arbos-releases/arbos32), the tech stack powering Arbitrum One, Arbitrum Nova, and Arbitrum Orbit chains. This upgrade adds a second, coequal virtual machine to the EVM, where EVM contracts continue to behave exactly as they would in Ethereum. We call this paradigm **MultiVM** since **everything is entirely additive.**

![Stylus gives you MultiVM](./assets/stylus-multivm.jpg)

This second virtual machine executes WebAssembly (WASM) rather than EVM bytecode. WASM is a modern binary format popularized by its use in major web standards, browsers, and companies to speed up computation. WASM is built to be fast, portable, and human-readable. It has sandboxed execution environments for security and simplicity. Working with WASM is nothing new for Arbitrum chains. Ever since the [Nitro upgrade](https://medium.com/offchainlabs/arbitrum-nitro-one-small-step-for-l2-one-giant-leap-for-ethereum-bc9108047450), WASM has been a fundamental component of Arbitrum's fully functioning fraud proofs.

With a WASM VM, any programming language that can compile to WASM is within Stylus's scope. While many popular programming languages can be compiled into WASM, some compilers are more suitable for smart contract development than others, like Rust, C, and C++. Other languages like Go, Sway, Move, and Cairo can also be supported. Languages that include their own runtimes, like Python and Javascript, are more complex for Stylus to support, although not impossible. Compared to using Solidity, WASM programs are much more efficient for memory intensive applications. There are many reasons for this, including the decades of compiler development for Rust and C. WASM also has a faster runtime than the EVM, resulting in faster execution. Third-party [contribution](#contributing) in the form of libraries for new and existing languages is welcomed!

### Use Cases

While many developers will be drawn to new use cases, rebuilding existing applications in Stylus will also open the door to innovation and optimization. dApps have never been faster, cheaper, or safer. Stylus can be easily integrated into existing Solidity projects by calling a Stylus contract to optimize specific parts of your dApp or building the entire dApp with Stylus.It's impossible to list all of the use cases Stylus enables, think about the properties of all WASM compatible languages! That said, here are some ideas that are particularly exciting:

- <b>Efficient On-Chain Verification with ZK-Proofs</b>: Enable cost-effective onchain verification
  using zero-knowledge proving systems for privacy, interoperability, and more (see [case
  study](https://blog.arbitrum.io/renegade-stylus-case-study/)).
- <b>Advanced DeFi Instruments</b>: Power complex financial instruments and processes like synthetic
  assets, options, and futures with onchain computation via extending current protocols (ie. Uniswap
  V4 hooks) or building your own.
- <b>High-Performance On-Chain Logic</b>: Support memory and compute-intensive applications like
  onchain games and generative art either by writing all of the application in Stylus or enhance
  performance of existing Solidity contracts by optimizing specific parts.

### Getting Started

1. Utilize our [quickstart](https://docs.arbitrum.io/stylus/stylus-quickstart), [examples](https://docs.arbitrum.io/stylus/stylus-quickstart), and [tutorials](https://docs.arbitrum.io/stylus/stylus-quickstart) to help you start building.
2. Join our Stylus Developer [Telegram](https://t.me/arbitrum_stylus) group and [Arbitrum Discord](https://discord.gg/arbitrum) for support as well as the official Arbitrum ([@Arbitrum](https://twitter.com/arbitrum)) and Arbitrum Developers ([@ArbitrumDevs](https://twitter.com/ArbitrumDevs)) X accounts for announcements.
3. Check out the [Awesome Stylus](https://github.com/OffchainLabs/awesome-stylus) repository for various community contributed Stylus projects and tools, if you build something useful, we'd be happy to add it there.

### Contributing

Stylus is open to everyone, with a strong focus on delivering an exceptional programming experience. But the journey doesn't end here—developer feedback is crucial to enhancing Stylus’s tooling, documentation, and language features. By becoming an early adopter, you can explore its full potential and help shape its future. We’re actively seeking builders eager to push the limits of the EVM or develop tooling for Stylus. With over $5M in grant funding available through the Stylus Sprint, now’s the time to get involved!
