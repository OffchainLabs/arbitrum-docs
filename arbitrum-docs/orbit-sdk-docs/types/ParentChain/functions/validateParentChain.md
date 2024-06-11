---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: validateParentChain()

> **validateParentChain**\<`TTransport`, `TChain`\>(`chainIdOrClient`): [`ParentChainId`](../type-aliases/ParentChainId.md)

Validates the provided parent chain ID to ensure it is supported by the
system. If the parent chain ID is not valid, an error is thrown with a
corresponding message. Returns the validated parent chain ID.

## Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

## Parameters

• **chainIdOrClient**: `number` \| `Client`\<`TTransport`, `TChain`, `undefined` \| `Account`\<\`0x$\{string\}\`\>, `undefined`, `undefined` \| `object`\>

## Returns

[`ParentChainId`](../type-aliases/ParentChainId.md)

## Source

[src/types/ParentChain.ts:29](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/types/ParentChain.ts#L29)
