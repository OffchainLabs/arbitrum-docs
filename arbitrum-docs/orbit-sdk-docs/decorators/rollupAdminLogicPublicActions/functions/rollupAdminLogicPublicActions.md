---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: rollupAdminLogicPublicActions()

> **rollupAdminLogicPublicActions**\<`TParams`, `TTransport`, `TChain`\>(`params`): (`client`) => [`RollupAdminLogicActions`](../type-aliases/RollupAdminLogicActions.md)\<`TParams`\[`"rollup"`\], `TChain`\>

The function rollupAdminLogicPublicActions returns a [RollupAdminLogicActions](../type-aliases/RollupAdminLogicActions.md) object that contains two methods:
rollupAdminLogicReadContract and rollupAdminLogicPrepareTransactionRequest.
These methods allow interacting with the Rollup Admin Logic smart contract by
reading contract data and preparing transaction requests.

## Type parameters

• **TParams** *extends* `object`

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `Chain`\<`undefined` \| `ChainFormatters`\>

## Parameters

• **params**: `TParams`

The parameters for the function.

## Returns

`Function`

- A function that takes a PublicClient and returns RollupAdminLogicActions.

### Parameters

• **client**: `PublicClient`\<`TTransport`, `TChain`\>

### Returns

[`RollupAdminLogicActions`](../type-aliases/RollupAdminLogicActions.md)\<`TParams`\[`"rollup"`\], `TChain`\>

## Source

[src/decorators/rollupAdminLogicPublicActions.ts:71](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/decorators/rollupAdminLogicPublicActions.ts#L71)
