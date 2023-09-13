# Stylus Gas Costs

Stylus introduces new pricing models for WASM programs. Intended for high-compute applications, Stylus makes the following more affordable:

- Compute, which is generally **10-100x** cheaper depending on the program. This is primarily due to the efficiency of the WASM runtime relative to the EVM, and the quality of the code produced by Rust, C, and C++ compilers. Another factor that matters is the quality of the code itself. For example, highly optimized and audited C libraries that implement a particular cryptographic operation are usually deployable without modification and perform exceptionally well. The fee reduction may be smaller for highly optimized Solidity that makes heavy use of native precompiles vs an unoptimized Stylus equivalent that doesn't do the same.
- Memory, which is **100-500x** cheaper due to Stylus's novel exponential pricing mechanism intended to address Vitalik's concerns with the EVM's per-call, [quadratic memory pricing policy](https://notes.ethereum.org/@vbuterin/proposals_to_adjust_memory_gas_costs). For the first time ever, high-memory applications are possible on an EVM-equivalent chain.
- Storage, for which the Rust SDK promotes better access patterns and type choices. Note that while the underlying `[SLOAD](https://www.evm.codes/#54)` and `[SSTORE](https://www.evm.codes/#55)` operations cost as they do in the EVM, the Rust SDK implements an optimal caching policy that minimizes their use. Exact savings depends on the program.
- VM affordances, including common operations like `keccak` and reentrancy detection. No longer is it expensive to make safety the default.

There are, however, minor overheads to using Stylus that may matter to your application:

- The first time a WASM is deployed, it must be *activated*. This is generally a few million gas, though to avoid testnet DoS, we've set it to a fixed 14 million. Note that you do not have to activate future copies of the same program. For example, the same NFT template can be deployed many times without paying this cost more than once. We will soon make the fees paid depend on the program, so that the gas used is based on the complexity of the WASM instead of this very conservative, worst-case estimate.
- Calling a Stylus program costs 128-2048 gas. We're working with Wasmer to improve setup costs, but there will likely always be some amount of gas one pays to jump into WASM execution. This means that if a contract does next to nothing, it may be cheaper in Solidity. However if a contract starts doing interesting work, the dynamic fees will quickly make up for this fixed-cost overhead.

Though conservative bounds have been chosen for testnet, all of this is subject to change as pricing models mature and further optimizations are made. Since gas numbers will vary across updates, it may make more sense to clock the time it takes to perform an operation rather than going solely by the numbers reported in receipts.

# Ink and gas

Because WASM opcodes are orders of magnitude faster than their EVM counterparts, almost every operation that Stylus does costs less than `1 gas`. “Fractional gas” isn’t an EVM concept, so the Stylus VM introduces a new unit of payment known as ink that’s orders of magnitude smaller.

```jsx
1 gas = 10,000 ink
```

## Intuition

To build intuition for why this is the case, consider the `ADD` instruction. 

1. Pop two items of the simulated stack

### In the EVM

1. Pay for gas, requiring multiple look-ups of an in-memory table
2. Consider tracing, even if disabled
3. Add them together
4. Push the result

### In the Stylus VM

1. Execute a single x86 or ARM `ADD` instruction

Note that unlike the EVM, which charges for gas before running each opcode, the Stylus VM strategically charges for many opcodes all at once. This cuts fees considerably, since the VM only rarely needs to execute gas charging logic. Additionally, gas charging happens *inside the program*, removing the need for an in-memory table. 

## The ink price

The ink price, which measures the amount of ink a single EVM gas buys, is configurable by the chain owner. By default, the exchange rate is `1:10000`, but this may be adjusted as the EVM and Stylus VM improve over time.

For example, if the Stylus VM becomes 2x faster, instead of cutting the nominal cost of each operation 2x, the ink price may instead be doubled, allowing 1 EVM gas to buy twice as much ink. This provides an elegant mechanism for smoothly repricing resources between the two VMs as each makes independent progress.

## User Experience

It is important to note that users never need to worry about this notion of ink. Receipts will always be measured in gas, with the exchange rate applied automatically under the hood as the VMs pass execution back and forth.

However, developers optimizing contracts may choose to measure performance in ink to pin down the exact cost of executing various routines. The `[ink_left](https://docs.rs/stylus-sdk/0.3.0/stylus_sdk/evm/fn.ink_left.html)` function exposes this value, and various methods throughout the Rust SDK optionally accept ink amounts too.

# Opcode table

The Stylus VM charges for WASM opcodes according to the following table, which was determined via a conservative statistical analysis and is expected to change for Stylus mainnet. Prices may fluctuate across upgrades as our analysis matures and optimizations are made.

| Hex | Opcode | Ink | Gas | Notes |
| --- | --- | --- | --- | --- |
| 0x00 | Unreachable | 1 | 0.0001 |  |
| 0x01 | Nop | 1 | 0.0001 |  |
| 0x02 | Block | 1 | 0.0001 |  |
| 0x03 | Loop | 1 | 0.0001 |  |
| 0x04 | If | 2400 | 0.24 |  |
| 0x05 | Else | 1 | 0.0001 |  |
| 0x0b | End | 1 | 0.0001 |  |
| 0x0c | Br | 2400 | 0.24 |  |
| 0x0d | BrIf | 2400 | 0.24 |  |
| 0x0e | BrTable | 2400 + 325x | 0.24 + 0.0325x | Cost varies with table size |
| 0x0f | Return | 1 | 0.0001 |  |
| 0x10 | Call | 13750 | 1.375 |  |
| 0x11 | CallIndirect | 13610 + 650x | 1.361 + 0.065x | Cost varies with no. of args |
| 0x1a | Drop | 1 | 0.0001 |  |
| 0x1b | Select | 4000 | 0.4 | Large optimization opportunity |
| 0x20 | LocalGet | 200 | 0.02 |  |
| 0x21 | LocalSet | 375 | 0.0375 |  |
| 0x22 | LocalTee | 200 | 0.02 |  |
| 0x23 | GlobalGet | 300 | 0.03 |  |
| 0x24 | GlobalSet | 990 | 0.099 |  |
| 0x28 | I32Load | 2200 | 0.22 |  |
| 0x29 | I64Load | 2750 | 0.275 |  |
| 0x2c | I32Load8S | 2200 | 0.22 |  |
| 0x2d | I32Load8U | 2200 | 0.22 |  |
| 0x2e | I32Load16S | 2200 | 0.22 |  |
| 0x2f | I32Load16U | 2200 | 0.22 |  |
| 0x30 | I64Load8S | 2750 | 0.275 |  |
| 0x31 | I64Load8U | 2750 | 0.275 |  |
| 0x32 | I64Load16S | 2750 | 0.275 |  |
| 0x33 | I64Load16U | 2750 | 0.275 |  |
| 0x34 | I64Load32S | 2750 | 0.275 |  |
| 0x35 | I64Load32U | 2750 | 0.275 |  |
| 0x36 | I32Store | 2400 | 0.24 |  |
| 0x37 | I64Store | 3100 | 0.31 |  |
| 0x3a | I32Store8 | 2400 | 0.24 |  |
| 0x3b | I32Store16 | 2400 | 0.24 |  |
| 0x3c | I64Store8 | 3100 | 0.31 |  |
| 0x3d | I64Store16 | 3100 | 0.31 |  |
| 0x3e | I64Store32 | 3100 | 0.31 |  |
| 0x3f | MemorySize | 13500 | 1.35 |  |
| 0x40 | MemoryGrow | 1 | 0.0001 |  |
| 0x41 | I32Const | 1 | 0.0001 |  |
| 0x42 | I64Const | 1 | 0.0001 |  |
| 0x45 | I32Eqz | 570 | 0.057 |  |
| 0x46 | I32Eq | 570 | 0.057 |  |
| 0x47 | I32Ne | 570 | 0.057 |  |
| 0x48 | I32LtS | 570 | 0.057 |  |
| 0x49 | I32LtU | 570 | 0.057 |  |
| 0x4a | I32GtS | 570 | 0.057 |  |
| 0x4b | I32GtU | 570 | 0.057 |  |
| 0x4c | I32LeS | 570 | 0.057 |  |
| 0x4d | I32LeU | 570 | 0.057 |  |
| 0x4e | I32GeS | 570 | 0.057 |  |
| 0x4f | I32GeU | 570 | 0.057 |  |
| 0x50 | I64Eqz | 760 | 0.076 |  |
| 0x51 | I64Eq | 760 | 0.076 |  |
| 0x52 | I64Ne | 760 | 0.076 |  |
| 0x53 | I64LtS | 760 | 0.076 |  |
| 0x54 | I64LtU | 760 | 0.076 |  |
| 0x55 | I64GtS | 760 | 0.076 |  |
| 0x56 | I64GtU | 760 | 0.076 |  |
| 0x57 | I64LeS | 760 | 0.076 |  |
| 0x58 | I64LeU | 760 | 0.076 |  |
| 0x59 | I64GeS | 760 | 0.076 |  |
| 0x5a | I64GeU | 760 | 0.076 |  |
| 0x67 | I32Clz | 750 | 0.075 |  |
| 0x68 | I32Ctz | 750 | 0.075 |  |
| 0x69 | I32Popcnt | 500 | 0.05 |  |
| 0x6a | I32Add | 200 | 0.02 |  |
| 0x6b | I32Sub | 200 | 0.02 |  |
| 0x6c | I32Mul | 550 | 0.055 |  |
| 0x6d | I32DivS | 2500 | 0.25 |  |
| 0x6e | I32DivU | 2500 | 0.25 |  |
| 0x6f | I32RemS | 2500 | 0.25 |  |
| 0x70 | I32RemU | 2500 | 0.25 |  |
| 0x71 | I32And | 200 | 0.02 |  |
| 0x72 | I32Or | 200 | 0.02 |  |
| 0x73 | I32Xor | 200 | 0.02 |  |
| 0x74 | I32Shl | 200 | 0.02 |  |
| 0x75 | I32ShrS | 200 | 0.02 |  |
| 0x76 | I32ShrU | 200 | 0.02 |  |
| 0x77 | I32Rotl | 200 | 0.02 |  |
| 0x78 | I32Rotr | 200 | 0.02 |  |
| 0x79 | I64Clz | 750 | 0.075 |  |
| 0x7a | I64Ctz | 750 | 0.075 |  |
| 0x7b | I64Popcnt | 750 | 0.075 |  |
| 0x7c | I64Add | 200 | 0.02 |  |
| 0x7d | I64Sub | 200 | 0.02 |  |
| 0x7e | I64Mul | 550 | 0.055 |  |
| 0x7f | I64DivS | 2900 | 0.29 |  |
| 0x80 | I64DivU | 2900 | 0.29 |  |
| 0x81 | I64RemS | 2900 | 0.29 |  |
| 0x82 | I64RemU | 2900 | 0.29 |  |
| 0x83 | I64And | 200 | 0.02 |  |
| 0x84 | I64Or | 200 | 0.02 |  |
| 0x85 | I64Xor | 200 | 0.02 |  |
| 0x86 | I64Shl | 200 | 0.02 |  |
| 0x87 | I64ShrS | 200 | 0.02 |  |
| 0x88 | I64ShrU | 200 | 0.02 |  |
| 0x89 | I64Rotl | 200 | 0.02 |  |
| 0x8a | I64Rotr | 200 | 0.02 |  |
| 0xa7 | I32WrapI64 | 200 | 0.02 |  |
| 0xac | I64ExtendI32S | 200 | 0.02 |  |
| 0xad | I64ExtendI32U | 200 | 0.02 |  |
| 0xc0 | I32Extend8S | 200 | 0.02 |  |
| 0xc1 | I32Extend16S | 200 | 0.02 |  |
| 0xc2 | I64Extend8S | 200 | 0.02 |  |
| 0xc3 | I64Extend16S | 200 | 0.02 |  |
| 0xc4 | I64Extend32S | 200 | 0.02 |  |
| 0xfc0a | MemoryCopy | 3100 + 125x | 0.31 + 0.0125x | Cost varies with no. of bytes |
| 0xfc0b | MemoryFill | 3100 + 125x | 0.31 + 0.0125x | Cost varies with no. of bytes |

# VM affordances

Certain operations require suspending WASM execution so that the Stylus VM can perform tasks natively in the host. This costs about `1.25 gas` to do. Though we’ll publish a full specification later, the following table details the costs of simple operations that run in the host.

Note that the values in this table were determined via a conservative statistical analysis and are expected to change for Stylus mainnet. Prices may fluctuate across upgrades as our analysis matures and optimizations are made.

| Host I/O | Ink | Gas | Notes |
| --- | --- | --- | --- |
| read_args | 12513 + 18287b | 1.2513 + 1.8287b | b = bytes after first 32 |
| write_result | 12513 + 40423b | 12513 + 4.0423b | b = bytes after first 32 |
| keccak | 281040 + 41920w | 28.104 + 4.192w | Due to a pricing mistake, keccak will soon be ~8 gas cheaper!
w = EVM words |
| block_basefee | 22137 | 2.2137 |  |
| block_coinbase | 22137 | 2.2137 |  |
| block_gas_limit | 12513 | 1.2513 |  |
| block_number | 12513 | 1.2513 |  |
| block_timestmap | 12513 | 1.2513 |  |
| chain_id | 12513 | 1.2513 |  |
| contract_address | 22137 | 2.2137 |  |
| evm_gas_left | 12513 | 1.2513 |  |
| evm_ink_left | 12513 | 1.2513 |  |
| msg_reentrant | 12513 | 1.2513 |  |
| msg_sender | 22137 | 2.2137 |  |
| msg_value | 22137 | 2.2137 |  |
| return_data_size | 12513 | 1.2513 |  |
| tx_ink_price | 12513 | 1.2513 |  |
| tx_gas_price | 22137 | 2.2137 |  |
| tx_origin | 22137 | 2.2137 |  |
| console_log_text | 0 | 0 | debug-only |
| console_log | 0 | 0 | debug-only |
| console_tee | 0 | 0 | debug-only |
| null_host | 0 | 0 | debug-only |

For some opcodes, the value in the table may be larger than its EVM equivalent. In the vast majority of real-world cases, the Stylus VM will still perform better. For example, getting the raw `msg::value` costs `0.2137` more gas in Stylus than it does in the EVM. But the moment one takes that value and does anything with it, Stylus becomes much cheaper. Recall that a single EVM `ADD` instruction costs `3 gas`, during which `150` WASM `ADD` instructions may run.
