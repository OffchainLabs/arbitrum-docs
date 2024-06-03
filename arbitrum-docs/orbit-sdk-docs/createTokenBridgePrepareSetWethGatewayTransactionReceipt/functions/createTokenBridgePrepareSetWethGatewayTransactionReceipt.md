---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgePrepareSetWethGatewayTransactionReceipt(txReceipt: TransactionReceipt<bigint, number, "success" | "reverted", TransactionType>): CreateTokenBridgeSetWethGatewayTransactionReceipt
```

Creates a token bridge transaction receipt for setting up the WETH gateway,
including a method to wait for retryable messages on the Orbit chain.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `txReceipt` | `TransactionReceipt`\<`bigint`, `number`, `"success"` \| `"reverted"`, `TransactionType`\> |

## Returns

`CreateTokenBridgeSetWethGatewayTransactionReceipt`

## Source

[src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:28](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L28)
