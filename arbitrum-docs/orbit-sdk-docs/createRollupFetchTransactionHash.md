---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupFetchTransactionHash

## Type Aliases

### CreateRollupFetchTransactionHashParams

> **CreateRollupFetchTransactionHashParams**: `object`

#### Type declaration

##### publicClient

> **publicClient**: `PublicClient`

##### rollup

> **rollup**: `Address`

#### Source

[src/createRollupFetchTransactionHash.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupFetchTransactionHash.ts#L17)

## Functions

### createRollupFetchTransactionHash()

> **createRollupFetchTransactionHash**(`__namedParameters`): `Promise`\<`any`\>

createRollupFetchTransactionHash retrieves the transaction hash of the
RollupInitialized event for a specified rollup contract on a given chain. It
takes in the rollup contract address and a PublicClient, validates the parent
chain, and then fetches the RollupInitialized event logs to extract the
transaction hash. This function ensures that only one RollupInitialized event
is found for the specified rollup address before returning the transaction
hash.

#### Parameters

• **\_\_namedParameters**: [`CreateRollupFetchTransactionHashParams`](createRollupFetchTransactionHash.md#createrollupfetchtransactionhashparams)

#### Returns

`Promise`\<`any`\>

#### Source

[src/createRollupFetchTransactionHash.ts:65](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupFetchTransactionHash.ts#L65)
