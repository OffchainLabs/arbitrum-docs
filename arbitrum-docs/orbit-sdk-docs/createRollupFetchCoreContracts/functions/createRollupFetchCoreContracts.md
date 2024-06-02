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

| Parameter           | Type                                   |
| :------------------ | :------------------------------------- |
| `__namedParameters` | `CreateRollupFetchCoreContractsParams` |

## Returns

`Promise`\<`CoreContracts`\>

## Source

[src/createRollupFetchCoreContracts.ts:18](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createRollupFetchCoreContracts.ts#L18)
