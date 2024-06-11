---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupFetchCoreContracts

## Type Aliases

### CreateRollupFetchCoreContractsParams

> **CreateRollupFetchCoreContractsParams**: `object`

#### Type declaration

##### publicClient

> **publicClient**: `PublicClient`

##### rollup

> **rollup**: `Address`

#### Source

[src/createRollupFetchCoreContracts.ts:7](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupFetchCoreContracts.ts#L7)

## Functions

### createRollupFetchCoreContracts()

> **createRollupFetchCoreContracts**(`createRollupFetchCoreContractsParams`): `Promise` \<[`CoreContracts`](types/CoreContracts.md#corecontracts)\>

Creates and fetches core contracts for a specified rollup using the provided
public client. This function retrieves the transaction hash and prepares the
transaction receipt to return the core contracts. Returns a CoreContracts.

#### Parameters

• **createRollupFetchCoreContractsParams**: [`CreateRollupFetchCoreContractsParams`](createRollupFetchCoreContracts.md#createrollupfetchcorecontractsparams)

The parameters for fetching core contracts

#### Returns

`Promise` \<[`CoreContracts`](types/CoreContracts.md#corecontracts)\>

- The core contracts

#### Example

```ts
const coreContracts = await createRollupFetchCoreContracts({
  rollup: '0x1234567890abcdef1234567890abcdef12345678',
  publicClient: viemPublicClient,
});
```

#### Source

[src/createRollupFetchCoreContracts.ts:30](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupFetchCoreContracts.ts#L30)
