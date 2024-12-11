---
title: 'Stylus Rust SDK advanced features'
description: 'Advanced features of the Stylus Rust SDK'
author: rachel-bousfield, jose-franco, mehdi-salehi
sme: rachel-bousfield, jose-franco, mehdi-salehi
sidebar_position: 1
target_audience: Developers using the Stylus Rust SDK to write and deploy smart contracts.
---

import StylusNoMultiInheritanceBannerPartial from '../partials/_stylus-no-multi-inheritance-banner-partial.mdx';

This document provides information about advanced features included in the [Stylus Rust SDK](https://github.com/OffchainLabs/stylus-sdk-rs), that are not described in the previous pages. For information about deploying Rust smart contracts, see the `cargo stylus` [CLI Tool](https://github.com/OffchainLabs/cargo-stylus). For a conceptual introduction to Stylus, see [Stylus: A Gentle Introduction](../stylus-gentle-introduction.md). To deploy your first Stylus smart contract using Rust, refer to the [Quickstart](../quickstart.mdx).

:::info

Many of the affordances use macros. Though this section details what each does, it may be helpful to use [`cargo expand`](https://crates.io/crates/cargo-expand) to see what they expand into if you’re doing advanced work in Rust.

:::

## Storage

This section provides extra information about how the Stylus Rust SDK handles storage. You can find more information and basic examples in [Variables](/stylus-by-example/basic_examples/variables.mdx).

Rust smart contracts may use state that persists across transactions. There’s two primary ways to define storage, depending on if you want to use Rust or Solidity definitions. Both are equivalent, and are up to the developer depending on their needs.

### [`#[storage]`][storage]

The [`#[storage]`][storage] macro allows a Rust struct to be used in persistent storage.

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

Any type implementing the [`StorageType`][StorageType] trait may be used as a field, including other structs, which will implement the trait automatically when [`#[storage]`][storage] is applied. You can even implement [`StorageType`][StorageType] yourself to define custom storage types. However, we’ve gone ahead and implemented the common ones.

| Type                                     | Info                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| [`StorageBool`][StorageBool]             | Stores a bool                                                                  |
| [`StorageAddress`][StorageAddress]       | Stores an Alloy [`Address`][Address]                                           |
| [`StorageUint`][StorageUint]             | Stores an Alloy [`Uint`][Uint]                                                 |
| [`StorageSigned`][StorageSigned]         | Stores an Alloy [`Signed`][Signed]                                             |
| [`StorageFixedBytes`][StorageFixedBytes] | Stores an Alloy [`FixedBytes`][FixedBytes]                                     |
| [`StorageBytes`][StorageBytes]           | Stores a Solidity bytes                                                        |
| [`StorageString`][StorageString]         | Stores a Solidity string                                                       |
| [`StorageVec`][StorageVec]               | Stores a vector of [`StorageType`][StorageType]                                |
| [`StorageMap`][StorageMap]               | Stores a mapping of [`StorageKey`][StorageKey] to [`StorageType`][StorageType] |
| [`StorageArray`][StorageArray]           | Stores a fixed-sized array of [`StorageType`][StorageType]                     |

Every [Alloy primitive][alloy_primitives] has a corresponding [`StorageType`][StorageType] implementation with the word `Storage` before it. This includes aliases, like [`StorageU256`][StorageUint256] and [`StorageB64`][StorageB64].

### [`sol_storage!`][sol_storage]

The types in [`#[storage]`][storage] are laid out in the EVM state trie exactly as they are in [Solidity][sol_abi]. This means that the fields of a struct definition will map to the same storage slots as they would in EVM programming languages.

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

The above will expand to the equivalent definitions in Rust, each structure implementing the [`StorageType`][StorageType] trait. Many contracts, like [our example ERC 20][erc20], do exactly this.

Because the layout is identical to [Solidity’s][sol_abi], existing Solidity smart contracts can upgrade to Rust without fear of storage slots not lining up. You simply copy-paste your type definitions.

:::warning Storage layout in contracts using inheritance

Note that one exception to this storage layout guarantee is contracts which utilize inheritance. The current solution in Stylus using `#[borrow]` and `#[inherits(...)]` packs nested (inherited) structs into their own slots. This is consistent with regular struct nesting in solidity, but not inherited structs. We plan to revisit this behavior in an upcoming release.

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
}
```

In Solidity, one has to be very careful about storage access patterns. Getting or setting the same value twice doubles costs, leading developers to avoid storage access at all costs. By contrast, the Stylus SDK employs an optimal storage-caching policy that avoids the underlying [`SLOAD`][SLOAD] or [`SSTORE`][SSTORE] operations.

:::tip

Stylus uses storage caching, so multiple accesses of the same variable is virtually free.

:::

However it must be said that storage is ultimately more expensive than memory. So if a value doesn’t need to be stored in state, you probably shouldn’t do it.

### Collections

Collections like [`StorageVec`][StorageVec] and [`StorageMap`][StorageMap] are dynamic and have methods like [`push`][StorageVec_push], [`insert`][StorageMap_insert], [`replace`][StorageMap_replace], and similar.

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

You may notice that some methods return types like [`StorageGuard`][StorageGuard] and [`StorageGuardMut`][StorageGuardMut]. This allows us to leverage the Rust borrow checker for storage mistakes, just like it does for memory. Here’s an example that will fail to compile.

```rust
fn mistake(vec: &mut StorageVec<StorageU64>) -> U64 {
    let value = vec.setter(0);
    let alias = vec.setter(0);
    value.set(32.into());
    alias.set(48.into());
    value.get() // uh, oh. what value should be returned?
}
```

Under the hood, [`vec.setter()`][StorageVec_setter] returns a [`StorageGuardMut`][StorageGuardMut] instead of a [`&mut StorageU64`][StorageU64]. Because the guard is bound to a [`&mut StorageVec`][StorageVec] lifetime, `value` and `alias` cannot be alive simultaneously. This causes the Rust compiler to reject the above code, saving you from entire classes of storage aliasing errors.

In this way the Stylus SDK safeguards storage access the same way Rust ensures memory safety. It should never be possible to alias Storage without `unsafe` Rust.

### [`SimpleStorageType`][SimpleStorageType]

You may run into scenarios where a collection’s methods like [`push`][StorageVec_push] and [`insert`][StorageMap_insert] aren’t available. This is because only primitives, which implement a special trait called [`SimpleStorageType`][SimpleStorageType], can be added to a collection by value. For nested collections, one instead uses the equivalent [`grow`][StorageVec_grow] and [`setter`][StorageVec_setter].

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

### [`Erase`][Erase] and [`#[derive(Erase)]`][derive_erase]

Some [`StorageType`][StorageType] values implement [`Erase`][Erase], which provides an [`erase()`][erase] method for clearing state. We’ve implemented [`Erase`][Erase] for all primitives, and for vectors of primitives, but not maps. This is because a solidity [`mapping`][mapping] does not provide iteration, and so it’s generally impossible to know which slots to set to zero.

Structs may also be [`Erase`][Erase] if all of the fields are. [`#[derive(Erase)]`][derive_erase] lets you do this automatically.

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

You can also implement [`Erase`][Erase] manually if desired. Note that the reason we care about [`Erase`][Erase] at all is that you get storage refunds when clearing state, lowering fees. There’s also minor implications for patterns using `unsafe` Rust.

### The storage cache

The Stylus SDK employs an optimal storage-caching policy that avoids the underlying [`SLOAD`][SLOAD] or [`SSTORE`][SSTORE] operations needed to get and set state. For the vast majority of use cases, this happens in the background and requires no input from the user.

However, developers working with `unsafe` Rust implementing their own custom [`StorageType`][StorageType] collections, the [`StorageCache`][StorageCache] type enables direct control over this data structure. Included are `unsafe` methods for manipulating the cache directly, as well as for bypassing it altogether.

### Immutables and [`PhantomData`][PhantomData]

So that generics are possible in [`sol_interface!`][sol_interface], [`core::marker::PhantomData`][PhantomData] implements [`StorageType`][StorageType] and takes up zero space, ensuring that it won’t cause storage slots to change. This can be useful when writing libraries.

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

The above allows consumers of `Erc20` to choose immutable constants via specialization. See our [WETH sample contract][erc20] for a full example of this feature.

## Functions

This section provides extra information about how the Stylus Rust SDK handles functions. You can find more information and basic examples in [Functions](/stylus-by-example/basic_examples/function.mdx), [Bytes in, bytes out programming](/stylus-by-example/basic_examples/bytes_in_bytes_out.mdx), [Inheritance](/stylus-by-example/basic_examples/inheritance.mdx) and [Sending ether](/stylus-by-example/basic_examples/sending_ether.mdx).

### Pure, View, and Write functions

For non-payable methods the [`#[public]`][public] macro can figure state mutability out for you based on the types of the arguments. Functions with `&self` will be considered `view`, those with `&mut self` will be considered `write`, and those with neither will be considered `pure`. Please note that `pure` and `view` functions may change the state of other contracts by calling into them, or even this one if the `reentrant` feature is enabled.

### [`#[entrypoint]`][entrypoint]

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

This is dangerous, and should be done only after careful review — ideally by 3rd party auditors. Numerous exploits and hacks have in Web3 are attributable to developers misusing or not fully understanding reentrant patterns.

If enabled, the Stylus SDK will flush the storage cache in between reentrant calls, persisting values to state that might be used by inner calls. Note that preventing storage invalidation is only part of the battle in the fight against exploits. You can tell if a call is reentrant via `msg::reentrant`, and condition your business logic accordingly.

### [`TopLevelStorage`][TopLevelStorage]

The [`#[entrypoint]`][entrypoint] macro will automatically implement the [`TopLevelStorage`][TopLevelStorage] trait for the annotated `struct`. The single type implementing [`TopLevelStorage`][TopLevelStorage] is special in that mutable access to it represents mutable access to the entire program’s state. This idea will become important when discussing calls to other programs in later sections.

### Inheritance, `#[inherit]`, and `#[borrow]`.

<StylusNoMultiInheritanceBannerPartial />

Composition in Rust follows that of Solidity. Types that implement [`Router`][Router], the trait that [`#[public]`][public] provides, can be connected via inheritance.

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

Because `Token` inherits `Erc20` in the above, if `Token` has the [`#[entrypoint]`][entrypoint], calls to the contract will first check if the requested method exists within `Token`. If a matching function is not found, it will then try the `Erc20`. Only after trying everything `Token` inherits will the call revert.

Note that because methods are checked in that order, if both implement the same method, the one in `Token` will override the one in `Erc20`, which won’t be callable. This allows for patterns where the developer imports a crate implementing a standard, like the ERC 20, and then adds or overrides just the methods they want to without modifying the imported `Erc20` type.

::::warning

Stylus does not currently contain explicit `override` or `virtual` keywords for explicitly marking override functions. It is important, therefore, to carefully ensure that contracts are only overriding the functions.

::::

Inheritance can also be chained. `#[inherit(Erc20, Erc721)]` will inherit both `Erc20` and `Erc721`, checking for methods in that order. `Erc20` and `Erc721` may also inherit other types themselves. Method resolution finds the first matching method by [Depth First Search](https://en.wikipedia.org/wiki/Depth-first_search).

Note that for the above to work, `Token` must implement [`Borrow<Erc20>`][Borrow]. You can implement this yourself, but for simplicity, [`#[storage]`][storage] and [`sol_storage!`][sol_storage] provide a `#[borrow]` annotation.

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

Just as with storage and functions, Stylus SDK calls are Solidity ABI equivalent. This means you never have to know the implementation details of other contracts to invoke them. You simply import the Solidity interface of the target contract, which can be auto-generated via the `cargo stylus` [CLI tool][abi_export].

:::tip

You can call contracts in any programming language with the Stylus SDK.

:::

### [`sol_interface!`][sol_interface]

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

For example, `IService` will have a `make_payment` method that accepts an [`Address`][Address] and returns a [`B256`][B256].

```rust
pub fn do_call(&mut self, account: IService, user: Address) -> Result<String, Error> {
    account.make_payment(self, user)  // note the snake case
}
```

Observe the casing change. [`sol_interface!`][sol_interface] computes the selector based on the exact name passed in, which should almost always be `CamelCase`. For aesthetics, the rust functions will instead use `snake_case`.

### Configuring gas and value with [`Call`][Call]

[`Call`][Call] lets you configure a call via optional configuration methods. This is similar to how one would configure opening a [`File`][File] in Rust.

```rust
pub fn do_call(account: IService, user: Address) -> Result<String, Error> {
    let config = Call::new_in()
        .gas(evm::gas_left() / 2)       // limit to half the gas left
        .value(msg::value());           // set the callvalue

    account.make_payment(config, user)
}
```

By default [`Call`][Call] supplies all gas remaining and zero value, which often means [`Call::new_in()`][Call_new_in] may be passed to the method directly. Additional configuration options are available in cases of reentrancy.

### Reentrant calls

Contracts that opt into reentrancy via the `reentrant` feature flag require extra care. When the `storage-cache` feature is enabled, cross-contract calls must [`flush`][StorageCache_flush] or [`clear`][StorageCache_clear] the [`StorageCache`][StorageCache] to safeguard state. This happens automatically via the type system.

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

In the above, we’re able to pass `&self` and `&mut self` because `Contract` implements [`TopLevelStorage`][TopLevelStorage], which means that a reference to it entails access to the entirety of the contract’s state. This is the reason it is sound to make a call, since it ensures all cached values are invalidated and/or persisted to state at the right time.

When writing Stylus libraries, a type might not be [`TopLevelStorage`][TopLevelStorage] and therefore `&self` or `&mut self` won’t work. Building a [`Call`][Call] from a generic parameter via [`new_in`][Call_new_in] is the usual solution.

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

Note that in the context of a [`#[public]`][public] call, the `&mut impl` argument will correctly distinguish the method as being `write` or [`payable`][payable]. This means you can write library code that will work regardless of whether the reentrant feature flag is enabled.

Note too that code that previously compiled with reentrancy disabled may require modification in order to type-check. This is done to ensure storage changes are persisted and that the storage cache is properly managed before calls.

### [`call`][fn_call], [`static_call`][fn_static_call], and [`delegate_call`][fn_delegate_call]

Though [`sol_interface!`][sol_interface] and [`Call`][Call] form the most common idiom to invoke other contracts, their underlying [`call`][fn_call] and [`static_call`][fn_static_call] are exposed for direct access.

```rust
let return_data = call(Call::new_in(self), contract, call_data)?;
```

In each case the calldata is supplied as a [`Vec<u8>`][Vec]. The return result is either the raw return data on success, or a call [`Error`][CallError] on failure.

[`delegate_call`][fn_delegate_call] is also available, though it's `unsafe` and doesn't have a richly-typed equivalent. This is because a delegate call must trust the other contract to uphold safety requirements. Though this function clears any cached values, the other contract may arbitrarily change storage, spend ether, and do other things one should never blindly allow other contracts to do.

### [`transfer_eth`][transfer_eth]

This method provides a convenient shorthand for transferring ether.

Note that this method invokes the other contract, which may in turn call others. All gas is supplied, which the recipient may burn. If this is not desired, the [`call`][fn_call] function may be used instead.

```rust
transfer_eth(recipient, value)?;                 // these two are equivalent

call(Call::new_in().value(value), recipient, &[])?; // these two are equivalent
```

### [`RawCall`][RawCall] and `unsafe` calls

Occasionally, an untyped call to another contract is necessary. [`RawCall`][RawCall] lets you configure an `unsafe` call by calling optional configuration methods. This is similar to how one would configure opening a [`File`][File] in Rust.

```rust
let data = RawCall::new_delegate()   // configure a delegate call
    .gas(2100)                       // supply 2100 gas
    .limit_return_data(0, 32)        // only read the first 32 bytes back
    .flush_storage_cache()           // flush the storage cache before the call
    .call(contract, calldata)?;      // do the call
```

Note that the [`call`][RawCall_call] method is `unsafe` when reentrancy is enabled. See [`flush_storage_cache`][RawCall_flush_storage_cache] and [`clear_storage_cache`][RawCall_clear_storage_cache] for more information.

## [`RawDeploy`][RawDeploy] and `unsafe` deployments

Right now the only way to deploy a contract from inside Rust is to use [`RawDeploy`][RawDeploy], similar to [`RawCall`][RawCall]. As with [`RawCall`][RawCall], this mechanism is inherently unsafe due to reentrancy concerns, and requires manual management of the [`StorageCache`][StorageCache].

Note that the EVM allows init code to make calls to other contracts, which provides a vector for reentrancy. This means that this technique may enable storage aliasing if used in the middle of a storage reference's lifetime and if reentrancy is allowed.

When configured with a `salt`, [`RawDeploy`][RawDeploy] will use [`CREATE2`][CREATE2] instead of the default [`CREATE`][CREATE], facilitating address determinism.

[abi_export]: https://github.com/OffchainLabs/cargo-stylus#exporting-solidity-abis
[StorageType]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html
[StorageKey]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageKey.html
[SimpleStorageType]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.SimpleStorageType.html
[TopLevelStorage]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.TopLevelStorage.html
[Erase]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.Erase.html
[erase]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.Erase.html#tymethod.erase
[StorageCache]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageCache.html
[StorageCache_flush]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageCache.html#method.flush
[StorageCache_clear]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageCache.html#method.clear
[EagerStorage]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.EagerStorage.html
[StorageBool]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageBool.html
[StorageAddress]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageAddress.html
[StorageUint]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageUint.html
[StorageUint256]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/type.StorageU256.html
[StorageU64]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/type.StorageU64.html
[StorageB64]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/type.StorageB64.html
[StorageSigned]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageSigned.html
[StorageFixedBytes]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageFixedBytes.html
[StorageBytes]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageBytes.html
[StorageString]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageString.html
[StorageVec]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html
[StorageMap]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageMap.html
[StorageArray]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageArray.html
[StorageGuard]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageGuard.html
[StorageGuardMut]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageGuardMut.html
[Address]: https://docs.rs/alloy-primitives/latest/alloy_primitives/struct.Address.html
[B256]: https://docs.rs/alloy-primitives/latest/alloy_primitives/aliases/type.B256.html
[Uint]: https://docs.rs/ruint/1.10.1/ruint/struct.Uint.html
[Signed]: https://docs.rs/alloy-primitives/latest/alloy_primitives/struct.Signed.html
[FixedBytes]: https://docs.rs/alloy-primitives/latest/alloy_primitives/struct.FixedBytes.html
[alloy_primitives]: https://docs.rs/alloy-primitives/latest/alloy_primitives/
[erc20]: https://github.com/OffchainLabs/stylus-sdk-rs/blob/stylus/examples/erc20/src/main.rs
[SLOAD]: https://www.evm.codes/#54
[SSTORE]: https://www.evm.codes/#55
[CREATE]: https://www.evm.codes/#f0
[CREATE2]: https://www.evm.codes/#f5
[StorageVec_push]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html#method.push
[StorageVec_grow]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html#method.grow
[StorageVec_setter]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html#method.setter
[StorageMap_insert]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageMap.html#method.insert
[StorageMap_replace]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageMap.html#method.replace
[Call]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html
[Call_new_in]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html#method.new_in
[CallError]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/enum.Error.html
[fn_call]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.call.html
[fn_static_call]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.static_call.html
[fn_delegate_call]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.delegate_call.html
[transfer_eth]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.transfer_eth.html
[Router]: https://docs.rs/stylus-sdk/latest/stylus_sdk/abi/trait.Router.html
[RawCall]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html
[RawCall_call]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html#method.call
[RawCall_flush_storage_cache]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html#method.flush_storage_cache
[RawCall_clear_storage_cache]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html#method.clear_storage_cache
[RawDeploy]: https://docs.rs/stylus-sdk/latest/stylus_sdk/deploy/struct.RawDeploy.html
[storage]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.storage.html
[sol_storage]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/macro.sol_storage.html
[sol_interface]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/macro.sol_interface.html
[derive_erase]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/derive.Erase.html
[public]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.public.html
[entrypoint]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.entrypoint.html
[PhantomData]: https://doc.rust-lang.org/core/marker/struct.PhantomData.html
[DerefMut]: https://doc.rust-lang.org/core/ops/trait.DerefMut.html
[Vec]: https://doc.rust-lang.org/alloc/vec/struct.Vec.html
[Borrow]: https://doc.rust-lang.org/core/borrow/trait.Borrow.html
[File]: https://doc.rust-lang.org/std/fs/struct.OpenOptions.html#examples
[sol_abi]: https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html
[pure]: https://docs.soliditylang.org/en/develop/contracts.html#pure-functions
[view]: https://docs.soliditylang.org/en/develop/contracts.html#view-functions
[payable]: https://docs.alchemy.com/docs/solidity-payable-functions
[mapping]: https://docs.soliditylang.org/en/latest/types.html#mapping-types
