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
a ParentChainPublicClient.

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

`ParentChainPublicClient`

## Source

[src/types/ParentChain.ts:47](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/types/ParentChain.ts#L47)
