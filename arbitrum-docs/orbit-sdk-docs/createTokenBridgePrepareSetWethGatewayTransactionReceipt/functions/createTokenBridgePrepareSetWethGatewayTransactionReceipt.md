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

[src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:28](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L28)
