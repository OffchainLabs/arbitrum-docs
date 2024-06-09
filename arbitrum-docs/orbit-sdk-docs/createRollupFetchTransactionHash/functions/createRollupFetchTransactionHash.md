---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupFetchTransactionHash(__namedParameters: CreateRollupFetchTransactionHashParams): Promise<any>
```

createRollupFetchTransactionHash retrieves the transaction hash of the
RollupInitialized event for a specified rollup contract on a given chain. It
takes in the rollup contract address and a PublicClient, validates the parent
chain, and then fetches the RollupInitialized event logs to extract the
transaction hash. This function ensures that only one RollupInitialized event
is found for the specified rollup address before returning the transaction
hash.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | [`CreateRollupFetchTransactionHashParams`](../type-aliases/CreateRollupFetchTransactionHashParams.md) |

## Returns

`Promise`\<`any`\>

## Source

[src/createRollupFetchTransactionHash.ts:64](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createRollupFetchTransactionHash.ts#L64)
