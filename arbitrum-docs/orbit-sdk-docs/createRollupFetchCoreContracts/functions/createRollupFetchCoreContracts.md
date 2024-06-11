---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createRollupFetchCoreContracts()

> **createRollupFetchCoreContracts**(`createRollupFetchCoreContractsParams`): `Promise` \<[`CoreContracts`](../../types/CoreContracts/type-aliases/CoreContracts.md)\>

Creates and fetches core contracts for a specified rollup using the provided
public client. This function retrieves the transaction hash and prepares the
transaction receipt to return the core contracts. Returns a CoreContracts.

## Parameters

• **createRollupFetchCoreContractsParams**: [`CreateRollupFetchCoreContractsParams`](../type-aliases/CreateRollupFetchCoreContractsParams.md)

The parameters for fetching core contracts

## Returns

`Promise` \<[`CoreContracts`](../../types/CoreContracts/type-aliases/CoreContracts.md)\>

- The core contracts

## Example

```ts
const coreContracts = await createRollupFetchCoreContracts({
  rollup: '0x1234567890abcdef1234567890abcdef12345678',
  publicClient: viemPublicClient,
});
```

## Source

[src/createRollupFetchCoreContracts.ts:30](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createRollupFetchCoreContracts.ts#L30)
