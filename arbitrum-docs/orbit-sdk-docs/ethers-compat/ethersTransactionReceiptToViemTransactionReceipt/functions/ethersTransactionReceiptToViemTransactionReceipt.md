---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: ethersTransactionReceiptToViemTransactionReceipt()

> **ethersTransactionReceiptToViemTransactionReceipt**(`receipt`): `ViemTransactionReceipt`

Converts an Ethereum transaction receipt (from `EthersTransactionReceipt`) to
a Viem transaction receipt (to `ViemTransactionReceipt`). This function maps
the fields from the Ethereum receipt to the corresponding fields in the Viem
receipt, including conversion of data types where necessary.

## Parameters

• **receipt**: `EthersTransactionReceipt`

The Ethereum transaction receipt to convert.

## Returns

`ViemTransactionReceipt`

The converted Viem transaction receipt.

## Source

[src/ethers-compat/ethersTransactionReceiptToViemTransactionReceipt.ts:44](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/ethers-compat/ethersTransactionReceiptToViemTransactionReceipt.ts#L44)
