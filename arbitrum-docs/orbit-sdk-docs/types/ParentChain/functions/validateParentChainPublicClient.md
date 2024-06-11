---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: validateParentChainPublicClient()

> **validateParentChainPublicClient**\<`TTransport`, `TChain`\>(`publicClient`): [`ParentChainPublicClient`](../type-aliases/ParentChainPublicClient.md)

Validates the parent chain of a PublicClient to ensure it is
supported. If the parent chain is not supported, an error is thrown. Returns
a [ParentChainPublicClient](../type-aliases/ParentChainPublicClient.md).

## Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

## Parameters

• **publicClient**

## Returns

[`ParentChainPublicClient`](../type-aliases/ParentChainPublicClient.md)

## Source

[src/types/ParentChain.ts:47](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/types/ParentChain.ts#L47)
