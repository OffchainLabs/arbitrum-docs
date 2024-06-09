---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbGasInfoPublicActions<TTransport, TChain>(client: object): ArbGasInfoPublicActions<TChain>
```

Returns an object with a method `arbGasInfoReadContract` that allows for
reading contract information related to gas costs on the Arbitrum network.

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TTransport` *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> | `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> | `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |

## Returns

[`ArbGasInfoPublicActions`](../type-aliases/ArbGasInfoPublicActions.md)\<`TChain`\>

## Source

[src/decorators/arbGasInfoPublicActions.ts:20](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/decorators/arbGasInfoPublicActions.ts#L20)
