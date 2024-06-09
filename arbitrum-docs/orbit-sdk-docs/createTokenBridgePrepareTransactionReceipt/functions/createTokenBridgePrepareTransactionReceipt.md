---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgePrepareTransactionReceipt(
  txReceipt: TransactionReceipt<bigint, number, 'success' | 'reverted', TransactionType>,
): CreateTokenBridgeTransactionReceipt;
```

Creates a transaction receipt with methods to wait for retryables and get
token bridge contracts.

## Parameters

| Parameter   | Type                                                                                       |
| :---------- | :----------------------------------------------------------------------------------------- |
| `txReceipt` | `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\> |

## Returns

[`CreateTokenBridgeTransactionReceipt`](../type-aliases/CreateTokenBridgeTransactionReceipt.md)

## Source

[src/createTokenBridgePrepareTransactionReceipt.ts:71](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createTokenBridgePrepareTransactionReceipt.ts#L71)
