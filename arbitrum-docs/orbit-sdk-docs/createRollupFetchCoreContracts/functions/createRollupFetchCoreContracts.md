---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupFetchCoreContracts(
  __namedParameters: CreateRollupFetchCoreContractsParams,
): Promise<CoreContracts>;
```

Creates and fetches core contracts for a specified rollup using the provided
public client. This function retrieves the transaction hash and prepares the
transaction receipt to return the core contracts. Returns a CoreContracts.

## Parameters

| Parameter           | Type                                                                                              |
| :------------------ | :------------------------------------------------------------------------------------------------ |
| `__namedParameters` | [`CreateRollupFetchCoreContractsParams`](../type-aliases/CreateRollupFetchCoreContractsParams.md) |

## Returns

`Promise` \<[`CoreContracts`](../../types/CoreContracts/type-aliases/CoreContracts.md)\>

## Source

[src/createRollupFetchCoreContracts.ts:18](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createRollupFetchCoreContracts.ts#L18)
