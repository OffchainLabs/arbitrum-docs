---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function validateParentChainPublicClient<TTransport, TChain>(publicClient: object): ParentChainPublicClient
```

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TTransport` *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> | `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> | `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `publicClient` | `object` |

## Returns

[`ParentChainPublicClient`](../type-aliases/ParentChainPublicClient.md)

## Source

[src/types/ParentChain.ts:37](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/types/ParentChain.ts#L37)
