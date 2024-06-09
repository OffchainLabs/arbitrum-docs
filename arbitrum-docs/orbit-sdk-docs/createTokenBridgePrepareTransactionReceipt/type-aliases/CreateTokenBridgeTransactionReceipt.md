---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type CreateTokenBridgeTransactionReceipt: TransactionReceipt & object;
```

## Type declaration

| Member                    | Type                                                                                                          |
| :------------------------ | :------------------------------------------------------------------------------------------------------------ |
| `getTokenBridgeContracts` | `Promise` \<[`TokenBridgeContracts`](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md)\> |
| `waitForRetryables`       | `Promise` \<[`WaitForRetryablesResult`](WaitForRetryablesResult.md)\>                                         |

## Source

[src/createTokenBridgePrepareTransactionReceipt.ts:60](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createTokenBridgePrepareTransactionReceipt.ts#L60)
