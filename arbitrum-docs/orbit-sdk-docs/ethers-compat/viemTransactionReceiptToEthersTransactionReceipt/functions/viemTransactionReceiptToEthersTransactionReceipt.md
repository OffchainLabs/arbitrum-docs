---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: viemTransactionReceiptToEthersTransactionReceipt()

> **viemTransactionReceiptToEthersTransactionReceipt**(`receipt`): [`CreateRollupPrepareConfigParams`](../../../index/variables/CreateRollupPrepareConfigParams.md)

Converts a Viem transaction receipt to an Ethers transaction receipt.

## Parameters

• **receipt**: `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\>

The transaction receipt object from Viem.

## Returns

[`CreateRollupPrepareConfigParams`](../../../index/variables/CreateRollupPrepareConfigParams.md)

- The converted transaction receipt object for Ethers.

## Source

[src/ethers-compat/viemTransactionReceiptToEthersTransactionReceipt.ts:34](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/ethers-compat/viemTransactionReceiptToEthersTransactionReceipt.ts#L34)
