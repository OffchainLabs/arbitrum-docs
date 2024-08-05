### How does Stylus manage security issues in smart contracts when interacting with so many different languages?
<p>
All languages are compiled to WASM for them to be able to work with Stylus. So it just needs to verify that the produced WASM programs behave as they should inside the new virtual machine.
</p>

<p>

</p>


### Is there any analogue of the fallback function from Solidity in the Rust Stylus SDK?
<p>
Currently there isn't any analogue. However, you can use a minimal entrypoint and perform raw delegate calls, forwarding your calldata. You can find more information in <a href="https://docs.arbitrum.io/stylus/reference/rust-sdk-guide#bytes-in-bytes-out-programming">Bytes-in, bytes-out programming</a> and <a href="https://docs.arbitrum.io/stylus/reference/rust-sdk-guide#call-static_call-and-delegate_call">call, static_call and delegate_call</a>.
</p>

<p>

</p>


### Why are constructors not yet supported for Stylus contracts?
<p>
Constructors use EVM bytecode to initialize state. While one could add EVM bytecode manually to their Stylus deployment, we don't allow WASM execution in the constructor so there's no way to express this in the SDK.
</p>

<p>
We're working on models that will make init easier, so there might be better solutions available in the future. For now, we suggest calling an init method after deploying.
</p>

<p>

</p>


### Is it possible to verify Stylus contracts on the block explorer?
<p>
Currently it is not possible to verify contracts compiled to WASM on the block explorer, but we are actively working with providers to have the verification process ready for when Stylus reaches mainnet-ready status.
</p>

<p>

</p>


### Do Stylus contracts compile down to EVM bytecode like prior other attempts?
<p>
No. Stylus contracts are compiled down to WASM. The user writes a program in Rust / C / C++ which is then compiled down to WebAssembly.
</p>

<p>

</p>


### How is a Stylus contract deployed?
<p>
Stylus contracts are deployed on chain as a blob of bytes, just like EVM ones. The only difference is that when the contract is executed, instead of invoking the EVM, we invoke a separate WASM runtime. Note that a special EOF-inspired prefix distinguishes Stylus contracts from traditional EVM contracts: when a contract's bytecode starts with the magic <code>0xEF000000</code> prefix, it's a Stylus WASM contract.
</p>

<p>

</p>


### Is there a new transaction type to deploy Stylus contracts?
<p>
You deploy a Stylus contract the same way that Solidity contracts are deployed. There are no special transaction types. As a UX note: a WASM will revert until a special instrumentation operation is performed by a call to the new  <code>ArbWasm</code> precompile, which readies the program for calls on-chain.
</p>

<p>
You can find instructions for deploying a Stylus contract in our <a href="https://docs.arbitrum.io/stylus/stylus-quickstart#checking-your-stylus-project-is-valid">Quickstart</a>.
</p>


### Do Stylus contracts use a different type of ABI?
<p>
Stylus contracts use solidity ABIs. Methods, signatures, logs, calls, etc. work exactly as in the EVM. From a user's / explorer's perspective, it all just looks and behaves like solidity.
</p>

<p>

</p>


### Does the Stylus SDK for Rust support custom data structures?
<p>
For in-memory usage, you should be able to use any implementation of custom data structures without problems.
</p>

<p>
For storage usage, it might be a bit more complicated. Stylus uses the EVM storage system, so you'll need to define the data structure on top of it. However, in the SDK there's a storage trait that custom types can implement to back their collections with the EVM state trie. The SDK macros are compatible with them too, although fundamentally it's still a global key-value system.
</p>

<p>
You can read more about it in the <a href="https://docs.arbitrum.io/stylus/reference/rust-sdk-guide#storage">Stylus Rust SDK page</a>.
</p>

<p>
As an alternative solution, you can use <a href="https://docs.arbitrum.io/stylus/reference/rust-sdk-guide#bytes-in-bytes-out-programming">entrypoint-style contracts</a> for your custom data structures.
</p>

<p>

</p>

<p>

</p>

### Is there anything special I need to do whenever Stylus gets upgraded on the chain I'm deployed on?
<p>
Stylus smart contracts will need to be re-activated once per year (365 days) or whenever an upgrade to Stylus is rolled out (which will always involve an ArbOS upgrade), even if they are in the cache. This re-activation can be done using [cargo-stylus](https://github.com/OffchainLabs/cargo-stylus), specifically the `cargo stylus activate --address=$ADDR` sub-command. `cargo-stylus` is a cargo sub-command for building, verifying, and deploying Arbitrum Stylus WASM contracts in Rust. Note that the gas fee required to make this call will depend on the current demand for Stylus contract activations at any given moment in time. It is recommended that you estimate the gas and then use that value, or a value slightly higher, to re-activate your Stylus contract.
</p>

<p>
To stay up to date with proposals, timelines, and statuses of network upgrades to Arbitrum One and Nova, we recommend you subscribe to the <a href="https://t.me/arbitrumnodeupgrade">Arbitrum Node Upgrade Announcement channel on Telegram</a>, join both the #dev-announcements and #node-runners Discord channels in the <a href="https://discord.com/invite/arbitrum">Arbitrum Discord server</a>, and follow the official Arbitrum <a href="https://x.com/ArbitrumDevs">Arbitrum Developers X accounts</a>.
</p>

### Why do I get an error "no library targets found in package" when trying to compile an old example?
<p>
Some of the first Stylus examples were built and deployed using a previous version of <a href="https://github.com/OffchainLabs/cargo-stylus">cargo-stylus</a> (<code>0.1.x</code>). In that version, Stylus projects were structured as regular Rust binaries.
</p>

<p>
Since <a href="https://github.com/OffchainLabs/cargo-stylus/releases/tag/v0.2.1">cargo-stylus v0.2.1</a>, Stylus projects are structured as libraries, so when trying to compile old projects you might get an error <code>no library targets found in package</code>.
</p>

<p>
To solve this, it's usually enough to rename the <code>main.rs</code> file to a <code>lib.rs</code> file.
</p>

<p>

</p>


### How can I generate the ABI of my Stylus contract?
<p>
The <a href="https://github.com/OffchainLabs/cargo-stylus/tree/main#exporting-solidity-abis">cargo-stylus tool</a> has a command that allows you to export the ABI of your Stylus contract: <code>cargo stylus export-abi</code>.
</p>

<p>
If you're using the Stylus Rust SDK, you'll need to enable the export-abi feature in your Cargo.toml file like so:
</p>

```rust
[features]
export-abi = ["stylus-sdk/export-abi"]
```
<p>
You'll also need to have a <code>main.rs</code> file that selects that feature.
</p>

<p>
This is an example of a main.rs file that allows you to export the abi of the <a href="https://github.com/OffchainLabs/stylus-hello-world">stylus-hello-world</a> example project:
</p>

```rust
#![cfg_attr(not(feature = "export-abi"), no_main)]

#[cfg(feature = "export-abi")]
fn main() {
    stylus_hello_world::main();
}
```
<p>

</p>

