---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type CreateTokenBridgeTransactionReceipt: TransactionReceipt & object;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `getTokenBridgeContracts` | `Promise` \<[`TokenBridgeContracts`](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md)\> |
| `waitForRetryables` | `Promise` \<[`WaitForRetryablesResult`](WaitForRetryablesResult.md)\> |

## Source

[src/createTokenBridgePrepareTransactionReceipt.ts:60](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createTokenBridgePrepareTransactionReceipt.ts#L60)
