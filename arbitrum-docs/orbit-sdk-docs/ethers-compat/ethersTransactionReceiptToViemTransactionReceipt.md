---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# ethers-compat/ethersTransactionReceiptToViemTransactionReceipt

## Functions

### ethersTransactionReceiptToViemTransactionReceipt()

> **ethersTransactionReceiptToViemTransactionReceipt**(`receipt`): `ViemTransactionReceipt`

Converts an Ethereum transaction receipt (from `EthersTransactionReceipt`) to
a Viem transaction receipt (to `ViemTransactionReceipt`). This function maps
the fields from the Ethereum receipt to the corresponding fields in the Viem
receipt, including conversion of data types where necessary.

#### Parameters

• **receipt**: `EthersTransactionReceipt`

The Ethereum transaction receipt to convert.

#### Returns

`ViemTransactionReceipt`

The converted Viem transaction receipt.

#### Source

[src/ethers-compat/ethersTransactionReceiptToViemTransactionReceipt.ts:44](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/ethers-compat/ethersTransactionReceiptToViemTransactionReceipt.ts#L44)
