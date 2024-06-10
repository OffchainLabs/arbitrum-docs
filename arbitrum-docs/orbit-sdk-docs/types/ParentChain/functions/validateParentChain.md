---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function validateParentChain<TTransport, TChain>(chainIdOrClient: number | Client<TTransport, TChain, undefined | Account<`0x${string}`>, undefined, undefined | object>): ParentChainId
```

Validates the provided parent chain ID to ensure it is supported by the
system. If the parent chain ID is not valid, an error is thrown with a
corresponding message. Returns the validated parent chain ID.

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TTransport` *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> | `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> | `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `chainIdOrClient` | `number` \| `Client`\<`TTransport`, `TChain`, `undefined` \| `Account`\<\`0x$\{string\}\`\>, `undefined`, `undefined` \| `object`\> |

## Returns

[`ParentChainId`](../type-aliases/ParentChainId.md)

## Source

[src/types/ParentChain.ts:29](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/types/ParentChain.ts#L29)
