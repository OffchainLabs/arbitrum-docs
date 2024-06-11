---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: arbGasInfoPublicActions()

> **arbGasInfoPublicActions**\<`TTransport`, `TChain`\>(`client`): [`ArbGasInfoPublicActions`](../type-aliases/ArbGasInfoPublicActions.md)\<`TChain`\>

Returns an object with a method `arbGasInfoReadContract` that allows for
reading contract information related to gas costs on the Arbitrum network.

## Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

The type of transport used by the PublicClient.

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of chain, can be defined or undefined.

## Parameters

• **client**

The public client for the specified transport and chain.

## Returns

[`ArbGasInfoPublicActions`](../type-aliases/ArbGasInfoPublicActions.md)\<`TChain`\>

An object containing the `arbGasInfoReadContract` method.

## Source

[src/decorators/arbGasInfoPublicActions.ts:25](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/decorators/arbGasInfoPublicActions.ts#L25)
