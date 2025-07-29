---
title: 'Stylus Rust SDK advanced features'
description: 'Advanced features of the Stylus Rust SDK'
author: rachel-bousfield, jose-franco, mehdi-salehi
sme: rachel-bousfield, jose-franco, mehdi-salehi
sidebar_position: 1
target_audience: Developers using the Stylus Rust SDK to write and deploy smart contracts.
---

import StylusNoMultiInheritanceBannerPartial from '../partials/_stylus-no-multi-inheritance-banner-partial.mdx';

This document provides information about advanced features included in the [Stylus Rust SDK](https://github.com/OffchainLabs/stylus-sdk-rs), that are not described in the previous pages. For information about deploying Rust smart contracts, see the `cargo stylus` [CLI Tool](https://github.com/OffchainLabs/cargo-stylus). For a conceptual introduction to Stylus, see [Stylus: A Gentle Introduction](../gentle-introduction.mdx). To deploy your first Stylus smart contract using Rust, refer to the [Quickstart](../quickstart.mdx).

:::info

Many of the affordances use macros. Though this section details what each does, it may be helpful to use [`cargo expand`](https://crates.io/crates/cargo-expand) to see what they expand into if you’re doing advanced work in Rust.

:::

## Storage

This section provides extra information about how the Stylus Rust SDK handles storage. You can find more information and basic examples in [Variables](https://stylus-by-example.org/basic_examples/variables).

Rust smart contracts may use state that persists across transactions. There’s two primary ways to define storage, depending on if you want to use Rust or Solidity definitions. Both are equivalent, and are up to the developer depending on their needs.

### [`#[storage]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.storage.html)

The [`#[storage]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.storage.html) macro allows a Rust struct to be used in persistent storage.

```rust
#[storage]
pub struct Contract {
    owner: StorageAddress,
    active: StorageBool,
    sub_struct: SubStruct,
}

#[storage]
pub struct SubStruct {
    // types implementing the `StorageType` trait.
}
```

Any type implementing the [`StorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html) trait may be used as a field, including other structs, which will implement the trait automatically when [`#[storage]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.storage.html) is applied. You can even implement [`StorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html) yourself to define custom storage types. However, we’ve gone ahead and implemented the common ones.

| Type | Info |
| ---- | ---- |

| [`StorageBool`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageBool.html) | Stores a bool |
| [`StorageAddress`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageAddress.html) | Stores an Alloy [`Address`](https://docs.rs/alloy-primitives/latest/alloy_primitives/struct.Address.html) |
| [`StorageUint`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageUint.html) | Stores an Alloy [`Uint`](https://docs.rs/ruint/1.10.1/ruint/struct.Uint.html) |
| [`StorageSigned`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageSigned.html) | Stores an Alloy [`Signed`](https://docs.rs/alloy-primitives/latest/alloy_primitives/struct.Signed.html) |
| [`StorageFixedBytes`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageFixedBytes.html) | Stores an Alloy [`FixedBytes`](https://docs.rs/alloy-primitives/latest/alloy_primitives/struct.FixedBytes.html) |
| [`StorageBytes`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageBytes.html) | Stores a Solidity bytes |
| [`StorageString`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageString.html) | Stores a Solidity string |
| [`StorageVec`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html) | Stores a vector of [`StorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html) |
| [`StorageMap`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageMap.html) | Stores a mapping of [`StorageKey`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageKey.html) to [`StorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html) |
| [`StorageArray`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageArray.html) | Stores a fixed-sized array of [`StorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html) |

Every [Alloy primitive](https://docs.rs/alloy-primitives/latest/alloy_primitives/) has a corresponding [`StorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html) implementation with the word `Storage` before it. This includes aliases, like [`StorageU256`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/type.StorageU256.html) and [`StorageB64`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/type.StorageB64.html).

### [`sol_storage!`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/macro.sol_storage.html)

The types in [`#[storage]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.storage.html) are laid out in the EVM state trie exactly as they are in [Solidity](https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html). This means that the fields of a struct definition will map to the same storage slots as they would in EVM programming languages.

Because of this, it is often nice to define your types using Solidity syntax, which makes that guarantee easier to see. For example, the earlier Rust struct can re-written to:

```rust
sol_storage! {
    pub struct Contract {
        address owner;                      // becomes a StorageAddress
        bool active;                        // becomes a StorageBool
        SubStruct sub_struct,
    }

    pub struct SubStruct {
        // other solidity fields, such as
        mapping(address => uint) balances;  // becomes a StorageMap
        Delegate delegates[];               // becomes a StorageVec
    }
}
```

The above will expand to the equivalent definitions in Rust, each structure implementing the [`StorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html) trait. Many contracts, like [our example `ERC-20`](https://github.com/OffchainLabs/stylus-sdk-rs/blob/stylus/examples/erc20/src/main.rs), do exactly this.

Because the layout is identical to [Solidity’s](https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html), existing Solidity smart contracts can upgrade to Rust without fear of storage slots not lining up. You simply copy-paste your type definitions.

:::warning Storage layout in contracts using inheritance

One exception to this storage layout guarantee is contracts which utilize inheritance. The current solution in Stylus using `#[borrow]` and `#[inherits(...)]` packs nested (inherited) structs into their own slots. This is consistent with regular struct nesting in solidity, but not inherited structs. We plan to revisit this behavior in an upcoming release.

:::

:::tip
Existing Solidity smart contracts can upgrade to Rust if they use proxy patterns.
:::

Consequently, the order of fields will affect the JSON ABIs produced that explorers and tooling might use. Most developers won’t need to worry about this though and can freely order their types when working on a Rust contract from scratch.

### Reading and writing storage

You can access storage types via getters and setters. For example, the `Contract` struct from earlier might access its `owner` address as follows.

```rust
impl Contract {
    /// Gets the owner from storage.
    pub fn owner(&self) -> Address {
        self.owner.get()
    }

    /// Updates the owner in storage
    pub fn set_owner(&mut self, new_owner: Address) {
        if msg::sender() == self.owner.get() { // we'll discuss msg::sender later
            self.owner.set(new_owner);
        }
    }

    /// Unlike other storage type, stringStorage needs to
    /// use `.set_str()` and `.get_string()` to set and get.
    pub fn set_base_uri(&mut self, base_uri: String) {
        self.base_uri.set_str(base_uri);
    }

    pub fn get_base_uri(&self) -> String {
        self.base_uri.get_string()
    }
}
```

In Solidity, one has to be very careful about storage access patterns. Getting or setting the same value twice doubles costs, leading developers to avoid storage access at all costs. By contrast, the Stylus SDK employs an optimal storage-caching policy that avoids the underlying [`SLOAD`](https://www.evm.codes/#54) or [`SSTORE`](https://www.evm.codes/#55) operations.

:::tip

Stylus uses storage caching, so multiple accesses of the same variable is virtually free.

:::

However it must be said that storage is ultimately more expensive than memory. So if a value doesn’t need to be stored in state, you probably shouldn’t do it.

### Collections

Collections like [`StorageVec`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html) and [`StorageMap`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageMap.html) are dynamic and have methods like [`push`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html#method.push), [`insert`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageMap.html#method.insert), [`replace`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageMap.html#method.replace), and similar.

```rust
impl SubStruct {
   pub fn add_delegate(&mut self, delegate: Address) {
        self.delegates.push(delegate);
    }

    pub fn track_balance(&mut self, address: Address) {
        self.balances.insert(address, address.balance());
    }
}
```

You may notice that some methods return types like [`StorageGuard`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageGuard.html) and [`StorageGuardMut`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageGuardMut.html). This allows us to leverage the Rust borrow checker for storage mistakes, just like it does for memory. Here’s an example that will fail to compile.

```rust
fn mistake(vec: &mut StorageVec<StorageU64>) -> U64 {
    let value = vec.setter(0);
    let alias = vec.setter(0);
    value.set(32.into());
    alias.set(48.into());
    value.get() // uh, oh. what value should be returned?
}
```

Under the hood, [`vec.setter()`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html#method.setter) returns a [`StorageGuardMut`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageGuardMut.html) instead of a [`&mut StorageU64`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/type.StorageU64.html). Because the guard is bound to a [`&mut StorageVec`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html) lifetime, `value` and `alias` cannot be alive simultaneously. This causes the Rust compiler to reject the above code, saving you from entire classes of storage aliasing errors.

In this way the Stylus SDK safeguards storage access the same way Rust ensures memory safety. It should never be possible to alias Storage without `unsafe` Rust.

### [`SimpleStorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.SimpleStorageType.html)

You may run into scenarios where a collection’s methods like [`push`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html#method.push) and [`insert`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageMap.html#method.insert) aren’t available. This is because only primitives, which implement a special trait called [`SimpleStorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.SimpleStorageType.html), can be added to a collection by value. For nested collections, one instead uses the equivalent [`grow`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html#method.grow) and [`setter`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html#method.setter).

```rust
fn nested_vec(vec: &mut StorageVec<StorageVec<StorageU8>>) {
    let mut inner = vec.grow();  // adds a new element accessible via `inner`
    inner.push(0.into());        // inner is a guard to a StorageVec<StorageU8>
}

fn nested_map(map: &mut StorageMap<u32, StorageVec<U8>>) {
    let mut slot = map.setter(0);
    slot.push(0);
}
```

### [`Erase`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.Erase.html) and [`#[derive(Erase)]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/derive.Erase.html)

Some [`StorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html) values implement [`Erase`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.Erase.html), which provides an [`erase()`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.Erase.html#tymethod.erase) method for clearing state. We’ve implemented [`Erase`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.Erase.html) for all primitives, and for vectors of primitives, but not maps. This is because a solidity [`mapping`](https://docs.soliditylang.org/en/latest/types.html#mapping-types) does not provide iteration, and so it’s generally impossible to know which slots to set to zero.

Structs may also be [`Erase`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.Erase.html) if all of the fields are. [`#[derive(Erase)]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/derive.Erase.html) lets you do this automatically.

```rust
sol_storage! {
    #[derive(Erase)]
    pub struct Contract {
        address owner;              // can erase primitive
        uint256[] hashes;           // can erase vector of primitive
    }

    pub struct NotErase {
        mapping(address => uint) balances; // can't erase a map
        mapping(uint => uint)[] roots;     // can't erase vector of maps
    }
}
```

You can also implement [`Erase`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.Erase.html) manually if desired. Note that the reason we care about [`Erase`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.Erase.html) at all is that you get storage refunds when clearing state, lowering fees. There’s also minor implications for patterns using `unsafe` Rust.

### The storage cache

The Stylus SDK employs an optimal storage-caching policy that avoids the underlying [`SLOAD`](https://www.evm.codes/#54) or [`SSTORE`](https://www.evm.codes/#55) operations needed to get and set state. For the vast majority of use cases, this happens in the background and requires no input from the user.

However, developers working with `unsafe` Rust implementing their own custom [`StorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html) collections, the [`StorageCache`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageCache.html) type enables direct control over this data structure. Included are `unsafe` methods for manipulating the cache directly, as well as for bypassing it altogether.

### Immutables and [`PhantomData`](https://doc.rust-lang.org/core/marker/struct.PhantomData.html)

So that generics are possible in [`sol_interface!`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/macro.sol_interface.html), [`core::marker::PhantomData`](https://doc.rust-lang.org/core/marker/struct.PhantomData.html) implements [`StorageType`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html) and takes up zero space, ensuring that it won’t cause storage slots to change. This can be useful when writing libraries.

```rust
pub trait Erc20Params {
    const NAME: &'static str;
    const SYMBOL: &'static str;
    const DECIMALS: u8;
}

sol_storage! {
    pub struct Erc20<T> {
        mapping(address => uint256) balances;
        PhantomData<T> phantom;
    }
}
```

The above allows consumers of `Erc20` to choose immutable constants via specialization. See our [`WETH` sample contract](https://github.com/OffchainLabs/stylus-sdk-rs/blob/stylus/examples/erc20/src/main.rs) for a full example of this feature.

## Functions

This section provides extra information about how the Stylus Rust SDK handles functions. You can find more information and basic examples in [Functions](https://stylus-by-example.org/basic_examples/function), [Bytes in, bytes out programming](https://stylus-by-example.org/basic_examples/bytes_in_bytes_out), [Inheritance](https://stylus-by-example.org/basic_examples/inheritance) and [Sending ether](https://stylus-by-example.org/basic_examples/sending_ether).

### Pure, View, and Write functions

For non-payable methods the [`#[public]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.public.html) macro can figure state mutability out for you based on the types of the arguments. Functions with `&self` will be considered `view`, those with `&mut self` will be considered `write`, and those with neither will be considered `pure`. Please note that `pure` and `view` functions may change the state of other contracts by calling into them, or even this one if the `reentrant` feature is enabled.

### [`#[entrypoint]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.entrypoint.html)

This macro allows you to define the entrypoint, which is where Stylus execution begins. Without it, the contract will fail to pass `cargo stylus check`. Most commonly, the macro is used to annotate the top level storage struct.

```rust
sol_storage! {
    #[entrypoint]
    pub struct Contract {
        ...
    }

    // only one entrypoint is allowed
    pub struct SubStruct {
        ...
    }
}
```

The above will make the public methods of `Contract` the first to consider during invocation.

### Reentrancy

If a contract calls another that then calls the first, it is said to be reentrant. By default, all Stylus contracts revert when this happens. However, you can opt out of this behavior by enabling the `reentrant` feature flag.

```rust
stylus-sdk = { version = "0.6.0", features = ["reentrant"] }
```

This is dangerous, and should be done only after careful review––ideally by third-party auditors. Numerous exploits and hacks have in Web3 are attributable to developers misusing or not fully understanding reentrant patterns.

If enabled, the Stylus SDK will flush the storage cache in between reentrant calls, persisting values to state that might be used by inner calls. Note that preventing storage invalidation is only part of the battle in the fight against exploits. You can tell if a call is reentrant via `msg::reentrant`, and condition your business logic accordingly.

### [`TopLevelStorage`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.TopLevelStorage.html)

The [`#[entrypoint]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.entrypoint.html) macro will automatically implement the [`TopLevelStorage`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.TopLevelStorage.html) trait for the annotated `struct`. The single type implementing [`TopLevelStorage`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.TopLevelStorage.html) is special in that mutable access to it represents mutable access to the entire program’s state. This idea will become important when discussing calls to other programs in later sections.

### Inheritance, `#[inherit]`, and `#[borrow]`.

<StylusNoMultiInheritanceBannerPartial />

Composition in Rust follows that of Solidity. Types that implement [`Router`](https://docs.rs/stylus-sdk/latest/stylus_sdk/abi/trait.Router.html), the trait that [`#[public]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.public.html) provides, can be connected via inheritance.

```rust
#[public]
#[inherit(Erc20)]
impl Token {
    pub fn mint(&mut self, amount: U256) -> Result<(), Vec<u8>> {
        ...
    }
}

#[public]
impl Erc20 {
    pub fn balance_of() -> Result<U256> {
        ...
    }
}
```

Because `Token` inherits `Erc20` in the above, if `Token` has the [`#[entrypoint]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.entrypoint.html), calls to the contract will first check if the requested method exists within `Token`. If a matching function is not found, it will then try the `Erc20`. Only after trying everything `Token` inherits will the call revert.

Note that because methods are checked in that order, if both implement the same method, the one in `Token` will override the one in `Erc20`, which won’t be callable. This allows for patterns where the developer imports a crate implementing a standard, like the `ERC-20`, and then adds or overrides just the methods they want to without modifying the imported `Erc20` type.

::::warning

Stylus does not currently contain explicit `override` or `virtual` keywords for explicitly marking override functions. It is important, therefore, to carefully ensure that contracts are only overriding the functions.

::::

Inheritance can also be chained. `#[inherit(Erc20, Erc721)]` will inherit both `Erc20` and `Erc721`, checking for methods in that order. `Erc20` and `Erc721` may also inherit other types themselves. Method resolution finds the first matching method by [Depth First Search](https://en.wikipedia.org/wiki/Depth-first_search).

For the above to work, `Token` must implement [`Borrow<Erc20>`](https://doc.rust-lang.org/core/borrow/trait.Borrow.html). You can implement this yourself, but for simplicity, [`#[storage]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.storage.html) and [`sol_storage!`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/macro.sol_storage.html) provide a `#[borrow]` annotation.

```rust
sol_storage! {
    #[entrypoint]
    pub struct Token {
        #[borrow]
        Erc20 erc20;
        ...
    }

    pub struct Erc20 {
        ...
    }
}
```

## Calls

Just as with storage and functions, Stylus SDK calls are Solidity ABI equivalent. This means you never have to know the implementation details of other contracts to invoke them. You simply import the Solidity interface of the target contract, which can be auto-generated via the `cargo stylus` [CLI tool](https://github.com/OffchainLabs/cargo-stylus#exporting-solidity-abis).

:::tip

You can call contracts in any programming language with the Stylus SDK.

:::

### [`sol_interface!`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/macro.sol_interface.html)

This macro defines a `struct` for each of the Solidity interfaces provided.

```rust
sol_interface! {
    interface IService {
        function makePayment(address user) payable returns (string);
        function getConstant() pure returns (bytes32)
    }

    interface ITree {
        // other interface methods
    }
}
```

The above will define `IService` and `ITree` for calling the methods of the two contracts.

::::info

Currently only functions are supported, and any other items in the interface will cause an error.

::::

For example, `IService` will have a `make_payment` method that accepts an [`Address`](https://docs.rs/alloy-primitives/latest/alloy_primitives/struct.Address.html) and returns a [`B256`](https://docs.rs/alloy-primitives/latest/alloy_primitives/aliases/type.B256.html).

```rust
pub fn do_call(&mut self, account: IService, user: Address) -> Result<String, Error> {
    account.make_payment(self, user)  // note the snake case
}
```

Observe the casing change. [`sol_interface!`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/macro.sol_interface.html) computes the selector based on the exact name passed in, which should almost always be `CamelCase`. For aesthetics, the rust functions will instead use `snake_case`.

### Configuring gas and value with [`Call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html)

[`Call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html) lets you configure a call via optional configuration methods. This is similar to how one would configure opening a [`File`](https://doc.rust-lang.org/std/fs/struct.OpenOptions.html#examples) in Rust.

```rust
pub fn do_call(account: IService, user: Address) -> Result<String, Error> {
    let config = Call::new_in()
        .gas(evm::gas_left() / 2)       // limit to half the gas left
        .value(msg::value());           // set the callvalue

    account.make_payment(config, user)
}
```

By default [`Call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html) supplies all gas remaining and zero value, which often means [`Call::new_in()`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html#method.new_in) may be passed to the method directly. Additional configuration options are available in cases of reentrancy.

### Reentrant calls

Contracts that opt into reentrancy via the `reentrant` feature flag require extra care. When the `storage-cache` feature is enabled, cross-contract calls must [`flush`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageCache.html#method.flush) or [`clear`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageCache.html#method.clear) the [`StorageCache`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageCache.html) to safeguard state. This happens automatically via the type system.

```rust
sol_interface! {
    interface IMethods {
        function pureFoo() external pure;
        function viewFoo() external view;
        function writeFoo() external;
        function payableFoo() external payable;
    }
}

#[public]
impl Contract {
    pub fn call_pure(&self, methods: IMethods) -> Result<(), Vec<u8>> {
        Ok(methods.pure_foo(self)?)    // `pure` methods might lie about not being `view`
    }

    pub fn call_view(&self, methods: IMethods) -> Result<(), Vec<u8>> {
        Ok(methods.view_foo(self)?)
    }

    pub fn call_write(&mut self, methods: IMethods) -> Result<(), Vec<u8>> {
        methods.view_foo(self)?;       // allows `pure` and `view` methods too
        Ok(methods.write_foo(self)?)
    }

    #[payable]
    pub fn call_payable(&mut self, methods: IMethods) -> Result<(), Vec<u8>> {
        methods.write_foo(Call::new_in(self))?;   // these are the same
        Ok(methods.payable_foo(self)?)            // ------------------
    }
}
```

In the above, we’re able to pass `&self` and `&mut self` because `Contract` implements [`TopLevelStorage`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.TopLevelStorage.html), which means that a reference to it entails access to the entirety of the contract’s state. This is the reason it is sound to make a call, since it ensures all cached values are invalidated and/or persisted to state at the right time.

When writing Stylus libraries, a type might not be [`TopLevelStorage`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.TopLevelStorage.html) and therefore `&self` or `&mut self` won’t work. Building a [`Call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html) from a generic parameter via [`new_in`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html#method.new_in) is the usual solution.

```rust
pub fn do_call(
    storage: &mut impl TopLevelStorage,  // can be generic, but often just &mut self
    account: IService,                   // serializes as an Address
    user: Address,
) -> Result<String, Error> {

    let config = Call::new_in(storage)   // take exclusive access to all contract storage
        .gas(evm::gas_left() / 2)        // limit to half the gas left
        .value(msg::value());            // set the callvalue

    account.make_payment(config, user)   // note the snake case
}
```

In the context of a [`#[public]`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.public.html) call, the `&mut impl` argument will correctly distinguish the method as being `write` or [`payable`](https://docs.alchemy.com/docs/solidity-payable-functions). This means you can write library code that will work regardless of whether the reentrant feature flag is enabled.

Also, that code that previously compiled with reentrancy disabled may require modification in order to type-check. This is done to ensure storage changes are persisted and that the storage cache is properly managed before calls.

### [`call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.call.html), [`static_call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.static_call.html), and [`delegate_call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.delegate_call.html)

Though [`sol_interface!`](https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/macro.sol_interface.html) and [`Call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html) form the most common idiom to invoke other contracts, their underlying [`call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.call.html) and [`static_call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.static_call.html) are exposed for direct access.

```rust
let return_data = call(Call::new_in(self), contract, call_data)?;
```

In each case the calldata is supplied as a [`Vec<u8>`](https://doc.rust-lang.org/alloc/vec/struct.Vec.html). The return result is either the raw return data on success, or a call [`Error`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/enum.Error.html) on failure.

[`delegate_call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.delegate_call.html) is also available, though it's `unsafe` and doesn't have a richly-typed equivalent. This is because a delegate call must trust the other contract to uphold safety requirements. Though this function clears any cached values, the other contract may arbitrarily change storage, spend ether, and do other things one should never blindly allow other contracts to do.

### [`transfer_eth`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.transfer_eth.html)

This method provides a convenient shorthand for transferring ether.

:::note
This method invokes the other contract, which may in turn call others. All gas is supplied, which the recipient may burn. If this is not desired, the [`call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.call.html) function may be used instead.
:::

```rust
transfer_eth(recipient, value)?;                 // these two are equivalent

call(Call::new_in().value(value), recipient, &[])?; // these two are equivalent
```

### [`RawCall`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html) and `unsafe` calls

Occasionally, an untyped call to another contract is necessary. [`RawCall`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html) lets you configure an `unsafe` call by calling optional configuration methods. This is similar to how one would configure opening a [`File`](https://doc.rust-lang.org/std/fs/struct.OpenOptions.html#examples) in Rust.

```rust
let data = RawCall::new_delegate()   // configure a delegate call
    .gas(2100)                       // supply 2100 gas
    .limit_return_data(0, 32)        // only read the first 32 bytes back
    .flush_storage_cache()           // flush the storage cache before the call
    .call(contract, calldata)?;      // do the call
```

:::note
The [`call`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html#method.call) method is `unsafe` when reentrancy is enabled. See [`flush_storage_cache`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html#method.flush_storage_cache) and [`clear_storage_cache`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html#method.clear_storage_cache) for more information.
:::

## [`RawDeploy`](https://docs.rs/stylus-sdk/latest/stylus_sdk/deploy/struct.RawDeploy.html) and `unsafe` deployments

Right now the only way to deploy a contract from inside Rust is to use [`RawDeploy`](https://docs.rs/stylus-sdk/latest/stylus_sdk/deploy/struct.RawDeploy.html), similar to [`RawCall`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html). As with [`RawCall`](https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html), this mechanism is inherently unsafe due to reentrancy concerns, and requires manual management of the [`StorageCache`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageCache.html).

:::note
That the EVM allows init code to make calls to other contracts, which provides a vector for reentrancy. This means that this technique may enable storage aliasing if used in the middle of a storage reference's lifetime and if reentrancy is allowed.
:::

When configured with a `salt`, [`RawDeploy`](https://docs.rs/stylus-sdk/latest/stylus_sdk/deploy/struct.RawDeploy.html) will use [`CREATE2`](https://www.evm.codes/#f5) instead of the default [`CREATE`](https://www.evm.codes/#f0), facilitating address determinism.
