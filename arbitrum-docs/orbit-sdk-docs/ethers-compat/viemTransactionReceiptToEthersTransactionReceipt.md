---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# ethers-compat/viemTransactionReceiptToEthersTransactionReceipt

## Functions

### viemTransactionReceiptToEthersTransactionReceipt()

> **viemTransactionReceiptToEthersTransactionReceipt**(`receipt`): [`CreateRollupPrepareConfigParams`](../module_index.md#createrollupprepareconfigparams)

Converts a Viem transaction receipt to an Ethers transaction receipt.

#### Parameters

• **receipt**: `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\>

The transaction receipt object from Viem.

#### Returns

[`CreateRollupPrepareConfigParams`](../module_index.md#createrollupprepareconfigparams)

- The converted transaction receipt object for Ethers.

#### Source

[src/ethers-compat/viemTransactionReceiptToEthersTransactionReceipt.ts:34](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/ethers-compat/viemTransactionReceiptToEthersTransactionReceipt.ts#L34)
