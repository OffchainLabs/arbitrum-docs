---
id: recommended-libraries
title: Recommended Libraries
sidebar_label: Use Rust Crates
---

# Recommended libraries

## Using public Rust crates

Rust provides a package registry at [crates.io](https://crates.io/), which lets developers conveniently access a plethora of open source libraries to utilize as dependencies in their code. Stylus Rust contracts can take advantage of these crates to simplify their development workflow.

While **crates.io** is a fantastic resource, many of these libraries were not designed with the constraints of a blockchain environment in mind. Some produce large binaries that exceed the 24KB compressed size limit of WASM smart contracts on Arbitrum. Many also take advantage of unsupported features such as:

- Random numbers
- Multi threading
- Floating point numbers and operations

Using the standard Rust library often bloats contract sizes beyond the maximum size. For this reason, libraries designated as `no_std` are typically much stronger candidates for usage as a smart contract dependency. **crates.io** has a special tag for marking crates as `no_std`; however, it's not universally used. Still, it can be a good starting point for locating supported libraries. See ["No standard library"](https://crates.io/categories/no-std) crates for more details.

## Curated crates

To save developers time on smart contract development for common dependencies, we've curated a list of crates and utilities that we found helpful. Keep in mind that we have not audited this code, and you should always be mindful about pulling dependencies into your codebase, whether they've been audited or not. We provide this list for you to use at your discretion and risk.

- [`rust_decimal`](https://crates.io/crates/rust_decimal): Decimal number implementation written in pure Rust. Suitable for financial and fixed-precision calculations
- [`special`](https://crates.io/crates/special): The package provides special functions, which are mathematical functions with special names due to their common usage, such as `sin`, `ln`, `tan`, etc.
- [`hashbrown`](https://crates.io/crates/hashbrown): Rust port of Google's SwissTable hash map
- [`time`](https://crates.io/crates/time): Date and time library
- [`hex`](https://crates.io/crates/hex): Encoding and decoding data into/from hexadecimal representation

We'll be adding more libraries to this list as we find them. Feel free to suggest an edit if you know of any great crates that would be generally useful here.
