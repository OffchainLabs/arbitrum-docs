---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgePrepareTransactionReceipt(txReceipt: TransactionReceipt<bigint, number, "success" | "reverted", TransactionType>): CreateTokenBridgeTransactionReceipt
```

Creates a transaction receipt with methods to wait for retryables and get
token bridge contracts.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `txReceipt` | `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\> |

## Returns

`CreateTokenBridgeTransactionReceipt`

## Source

[src/createTokenBridgePrepareTransactionReceipt.ts:71](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createTokenBridgePrepareTransactionReceipt.ts#L71)
