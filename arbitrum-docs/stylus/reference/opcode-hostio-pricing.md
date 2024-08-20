---
title: 'Opcode and host I/O pricing'
description: 'A reference of how much opcodes and host I/Os cost in Stylus, with measurements in ink and gas.'
author: rachel-bousfield
sme: rachel-bousfield
target_audience: 'Developers deploying smart contracts using Stylus.'
sidebar_position: 3
---

This reference provides the latest gas and ink costs for specific WASM opcodes and host I/Os when using Stylus. For a conceptual introduction to Stylus gas and ink, see [Gas and ink (Stylus)](/stylus/concepts/stylus-gas).

import PublicPreviewBannerPartial from '../../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

## Opcode costs

The Stylus VM charges for WASM opcodes according to the following table, which was determined via a conservative statistical analysis and is expected to change as Stylus matures. Prices may fluctuate across upgrades as our analysis evolves and optimizations are made.

| Hex    | Opcode        | Ink          | Gas            | Notes                          |
| ------ | ------------- | ------------ | -------------- | ------------------------------ |
| 0x00   | Unreachable   | 1            | 0.0001         |                                |
| 0x01   | Nop           | 1            | 0.0001         |                                |
| 0x02   | Block         | 1            | 0.0001         |                                |
| 0x03   | Loop          | 1            | 0.0001         |                                |
| 0x04   | If            | 765          | 0.0765         |                                |
| 0x05   | Else          | 1            | 0.0001         |                                |
| 0x0b   | End           | 1            | 0.0001         |                                |
| 0x0c   | Br            | 765          | 0.0765         |                                |
| 0x0d   | BrIf          | 765          | 0.0765         |                                |
| 0x0e   | BrTable       | 2400 + 325x  | 0.24 + 0.0325x | Cost varies with table size    |
| 0x0f   | Return        | 1            | 0.0001         |                                |
| 0x10   | Call          | 3800         | 0.38           |                                |
| 0x11   | CallIndirect  | 13610 + 650x | 1.361 + 0.065x | Cost varies with no. of args   |
| 0x1a   | Drop          | 9            | 0.0009         |                                |
| 0x1b   | Select        | 1250         | 0.125          |                                |
| 0x20   | LocalGet      | 75           | 0.0075         |                                |
| 0x21   | LocalSet      | 210          | 0.0210         |                                |
| 0x22   | LocalTee      | 75           | 0.0075         |                                |
| 0x23   | GlobalGet     | 225          | 0.0225         |                                |
| 0x24   | GlobalSet     | 575          | 0.0575         |                                |
| 0x28   | I32Load       | 670          | 0.067          |                                |
| 0x29   | I64Load       | 680          | 0.068          |                                |
| 0x2c   | I32Load8S     | 670          | 0.067          |                                |
| 0x2d   | I32Load8U     | 670          | 0.067          |                                |
| 0x2e   | I32Load16S    | 670          | 0.067          |                                |
| 0x2f   | I32Load16U    | 670          | 0.067          |                                |
| 0x30   | I64Load8S     | 680          | 0.068          |                                |
| 0x31   | I64Load8U     | 680          | 0.068          |                                |
| 0x32   | I64Load16S    | 680          | 0.068          |                                |
| 0x33   | I64Load16U    | 680          | 0.068          |                                |
| 0x34   | I64Load32S    | 680          | 0.068          |                                |
| 0x35   | I64Load32U    | 680          | 0.068          |                                |
| 0x36   | I32Store      | 825          | 0.0825         |                                |
| 0x37   | I64Store      | 950          | 0.095          |                                |
| 0x3a   | I32Store8     | 825          | 0.0825         |                                |
| 0x3b   | I32Store16    | 825          | 0.0825         |                                |
| 0x3c   | I64Store8     | 950          | 0.095          |                                |
| 0x3d   | I64Store16    | 950          | 0.095          |                                |
| 0x3e   | I64Store32    | 950          | 0.095          |                                |
| 0x3f   | MemorySize    | 3000         | 0.3            |                                |
| 0x40   | MemoryGrow    | 8050         | 0.805          |                                |
| 0x41   | I32Const      | 1            | 0.0001         |                                |
| 0x42   | I64Const      | 1            | 0.0001         |                                |
| 0x45   | I32Eqz        | 170          | 0.017          |                                |
| 0x46   | I32Eq         | 170          | 0.017          |                                |
| 0x47   | I32Ne         | 170          | 0.017          |                                |
| 0x48   | I32LtS        | 170          | 0.017          |                                |
| 0x49   | I32LtU        | 170          | 0.017          |                                |
| 0x4a   | I32GtS        | 170          | 0.017          |                                |
| 0x4b   | I32GtU        | 170          | 0.017          |                                |
| 0x4c   | I32LeS        | 170          | 0.017          |                                |
| 0x4d   | I32LeU        | 170          | 0.017          |                                |
| 0x4e   | I32GeS        | 170          | 0.017          |                                |
| 0x4f   | I32GeU        | 170          | 0.017          |                                |
| 0x50   | I64Eqz        | 225          | 0.0225         |                                |
| 0x51   | I64Eq         | 225          | 0.0225         |                                |
| 0x52   | I64Ne         | 225          | 0.0225         |                                |
| 0x53   | I64LtS        | 225          | 0.0225         |                                |
| 0x54   | I64LtU        | 225          | 0.0225         |                                |
| 0x55   | I64GtS        | 225          | 0.0225         |                                |
| 0x56   | I64GtU        | 225          | 0.0225         |                                |
| 0x57   | I64LeS        | 225          | 0.0225         |                                |
| 0x58   | I64LeU        | 225          | 0.0225         |                                |
| 0x59   | I64GeS        | 225          | 0.0225         |                                |
| 0x5a   | I64GeU        | 225          | 0.0225         |                                |
| 0x67   | I32Clz        | 210          | 0.021          |                                |
| 0x68   | I32Ctz        | 210          | 0.021          |                                |
| 0x69   | I32Popcnt     | 2650         | 0.265          |                                |
| 0x6a   | I32Add        | 70           | 0.007          |                                |
| 0x6b   | I32Sub        | 70           | 0.007          |                                |
| 0x6c   | I32Mul        | 160          | 0.016          |                                |
| 0x6d   | I32DivS       | 1120         | 0.112          |                                |
| 0x6e   | I32DivU       | 1120         | 0.112          |                                |
| 0x6f   | I32RemS       | 1120         | 0.112          |                                |
| 0x70   | I32RemU       | 1120         | 0.112          |                                |
| 0x71   | I32And        | 70           | 0.007          |                                |
| 0x72   | I32Or         | 70           | 0.007          |                                |
| 0x73   | I32Xor        | 70           | 0.007          |                                |
| 0x74   | I32Shl        | 70           | 0.007          |                                |
| 0x75   | I32ShrS       | 70           | 0.007          |                                |
| 0x76   | I32ShrU       | 70           | 0.007          |                                |
| 0x77   | I32Rotl       | 70           | 0.007          |                                |
| 0x78   | I32Rotr       | 70           | 0.007          |                                |
| 0x79   | I64Clz        | 210          | 0.021          |                                |
| 0x7a   | I64Ctz        | 210          | 0.012          |                                |
| 0x7b   | I64Popcnt     | 6000         | 0.6            |                                |
| 0x7c   | I64Add        | 100          | 0.01           |                                |
| 0x7d   | I64Sub        | 100          | 0.01           |                                |
| 0x7e   | I64Mul        | 160          | 0.016          |                                |
| 0x7f   | I64DivS       | 1270         | 0.127          |                                |
| 0x80   | I64DivU       | 1270         | 0.127          |                                |
| 0x81   | I64RemS       | 1270         | 0.127          |                                |
| 0x82   | I64RemU       | 1270         | 0.127          |                                |
| 0x83   | I64And        | 100          | 0.01           |                                |
| 0x84   | I64Or         | 100          | 0.01           |                                |
| 0x85   | I64Xor        | 100          | 0.01           |                                |
| 0x86   | I64Shl        | 100          | 0.01           |                                |
| 0x87   | I64ShrS       | 100          | 0.01           |                                |
| 0x88   | I64ShrU       | 100          | 0.01           |                                |
| 0x89   | I64Rotl       | 100          | 0.01           |                                |
| 0x8a   | I64Rotr       | 100          | 0.01           |                                |
| 0xa7   | I32WrapI64    | 100          | 0.01           |                                |
| 0xac   | I64ExtendI32S | 100          | 0.01           |                                |
| 0xad   | I64ExtendI32U | 100          | 0.01           |                                |
| 0xc0   | I32Extend8S   | 100          | 0.01           |                                |
| 0xc1   | I32Extend16S  | 100          | 0.01           |                                |
| 0xc2   | I64Extend8S   | 100          | 0.01           |                                |
| 0xc3   | I64Extend16S  | 100          | 0.01           |                                |
| 0xc4   | I64Extend32S  | 100          | 0.01           |                                |
| 0xfc0a | MemoryCopy    | 950 + 100x  | 0.095 + 0.01x   | Cost varies with no. of bytes  |
| 0xfc0b | MemoryFill    | 950 + 100x  | 0.095 + 0.01x   | Cost varies with no. of bytes  |

## Host I/O costs

Certain operations require suspending WASM execution so that the Stylus VM can perform tasks natively in the host. This costs about `0.84 gas` to do. Though we’ll publish a full specification later, the following table details the costs of simple operations that run in the host.

Note that the values in this table were determined via a conservative statistical analysis and are expected to change as Stylus matures. Prices may fluctuate across upgrades as our analysis evolves and optimizations are made.

| Host I/O         | Ink             | Gas            | Notes                      |
| ---------------- | --------------- | -------------- | -------------------------- |
| read_args        | 8400 + 5040b    | 0.84 + 0.504b  | `b` = bytes after first 32 |
| write_result     | 8400 + 16381b   | 0.84 + 1.6381b | `b` = bytes after first 32 |
| keccak           | 121800 + 21000w | 12.18 + 2.1w   | `w` = EVM words            |
| block_basefee    | 13440           | 1.344          |                            |
| block_coinbase   | 13440           | 1.344          |                            |
| block_gas_limit  | 8400            | 0.84           |                            |
| block_number     | 8400            | 0.84           |                            |
| block_timestmap  | 8400            | 0.84           |                            |
| chain_id         | 8400            | 0.84           |                            |
| contract_address | 13440           | 1.344          |                            |
| evm_gas_left     | 8400            | 0.84           |                            |
| evm_ink_left     | 8400            | 0.84           |                            |
| msg_reentrant    | 8400            | 0.84           |                            |
| msg_sender       | 13440           | 1.344          |                            |
| msg_value        | 13440           | 1.344          |                            |
| return_data_size | 8400            | 0.84           |                            |
| tx_ink_price     | 8400            | 0.84           |                            |
| tx_gas_price     | 13440           | 1.344          |                            |
| tx_origin        | 13440           | 1.344          |                            |
| console_log_text | 0               | 0              | debug-only                 |
| console_log      | 0               | 0              | debug-only                 |
| console_tee      | 0               | 0              | debug-only                 |
| null_host        | 0               | 0              | debug-only                 |

### See also

- [Gas and ink (Stylus)](/stylus/concepts/stylus-gas): A conceptual introduction to the "gas" and "ink" primitives
