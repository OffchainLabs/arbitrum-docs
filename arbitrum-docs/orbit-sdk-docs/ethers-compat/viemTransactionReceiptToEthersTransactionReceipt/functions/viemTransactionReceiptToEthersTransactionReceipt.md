---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function viemTransactionReceiptToEthersTransactionReceipt(receipt: TransactionReceipt<bigint, number, "success" | "reverted", TransactionType>): EthersTransactionReceipt
```

## Parameters

| Parameter | Type |
| :------ | :------ |
| `receipt` | `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\> |

## Returns

`EthersTransactionReceipt`

## Source

[src/ethers-compat/viemTransactionReceiptToEthersTransactionReceipt.ts:22](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/ethers-compat/viemTransactionReceiptToEthersTransactionReceipt.ts#L22)
