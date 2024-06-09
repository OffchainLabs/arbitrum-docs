---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function viemTransactionReceiptToEthersTransactionReceipt(
  receipt: TransactionReceipt<bigint, number, 'success' | 'reverted', TransactionType>,
): EthersTransactionReceipt;
```

Converts a Viem transaction receipt to an Ethers transaction receipt.

## Parameters

| Parameter | Type                                                                                       |
| :-------- | :----------------------------------------------------------------------------------------- |
| `receipt` | `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\> |

## Returns

`EthersTransactionReceipt`

## Source

[src/ethers-compat/viemTransactionReceiptToEthersTransactionReceipt.ts:23](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/ethers-compat/viemTransactionReceiptToEthersTransactionReceipt.ts#L23)
