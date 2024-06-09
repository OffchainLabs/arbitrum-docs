---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function validateParentChainPublicClient<TTransport, TChain>(publicClient: object): ParentChainPublicClient
```

Validates the parent chain of a PublicClient to ensure it is
supported. If the parent chain is not supported, an error is thrown. Returns
a [ParentChainPublicClient](../type-aliases/ParentChainPublicClient.md).

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

[src/types/ParentChain.ts:47](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/types/ParentChain.ts#L47)
