---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createRollupFetchTransactionHash()

> **createRollupFetchTransactionHash**(`__namedParameters`): `Promise`\<`any`\>

createRollupFetchTransactionHash retrieves the transaction hash of the
RollupInitialized event for a specified rollup contract on a given chain. It
takes in the rollup contract address and a PublicClient, validates the parent
chain, and then fetches the RollupInitialized event logs to extract the
transaction hash. This function ensures that only one RollupInitialized event
is found for the specified rollup address before returning the transaction
hash.

## Parameters

• **\_\_namedParameters**: [`CreateRollupFetchTransactionHashParams`](../type-aliases/CreateRollupFetchTransactionHashParams.md)

## Returns

`Promise`\<`any`\>

## Source

[src/createRollupFetchTransactionHash.ts:65](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createRollupFetchTransactionHash.ts#L65)
