---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: arbAggregatorActions()

> **arbAggregatorActions**\<`TTransport`, `TChain`\>(`client`): [`ArbAggregatorActions`](../type-aliases/ArbAggregatorActions.md)\<`TChain`\>

Returns an object with methods to interact with the ArbAggregator smart contract on the specified chain.

## Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

## Parameters

• **client**

The public client to use for interacting with the blockchain.

## Returns

[`ArbAggregatorActions`](../type-aliases/ArbAggregatorActions.md)\<`TChain`\>

An object containing methods to read from and prepare transaction requests for the ArbAggregator contract.

## Source

[src/decorators/arbAggregatorActions.ts:33](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/decorators/arbAggregatorActions.ts#L33)
