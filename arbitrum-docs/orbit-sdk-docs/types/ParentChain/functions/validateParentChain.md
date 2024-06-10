---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function validateParentChain<TTransport, TChain>(chainIdOrClient: number | Client<TTransport, TChain, undefined | Account<`0x${string}`>, undefined, undefined | object>): ParentChainId
```

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

[src/types/ParentChain.ts:24](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/types/ParentChain.ts#L24)
