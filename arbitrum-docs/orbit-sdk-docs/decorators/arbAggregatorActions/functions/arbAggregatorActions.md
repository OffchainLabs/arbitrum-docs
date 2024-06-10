---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbAggregatorActions<TTransport, TChain>(client: object): ArbAggregatorActions<TChain>
```

arbAggregatorActions returns an object with methods to interact with the
ArbAggregator smart contract on the specified chain.

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

[`ArbAggregatorActions`](../type-aliases/ArbAggregatorActions.md)\<`TChain`\>

## Source

[src/decorators/arbAggregatorActions.ts:31](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/decorators/arbAggregatorActions.ts#L31)
