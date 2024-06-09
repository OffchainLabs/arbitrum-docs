---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function rollupAdminLogicPublicActions<TParams, TTransport, TChain>(__namedParameters: TParams): (client: PublicClient<TTransport, TChain>) => RollupAdminLogicActions<TParams["rollup"], TChain>
```

The function rollupAdminLogicPublicActions returns a [RollupAdminLogicActions](../type-aliases/RollupAdminLogicActions.md) object that contains two methods:
rollupAdminLogicReadContract and rollupAdminLogicPrepareTransactionRequest.
These methods allow interacting with the Rollup Admin Logic smart contract by
reading contract data and preparing transaction requests.

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TParams` *extends* `object` | - |
| `TTransport` *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> | `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> | `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `TParams` |

## Returns

`Function`

### Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `PublicClient`\<`TTransport`, `TChain`\> |

### Returns

[`RollupAdminLogicActions`](../type-aliases/RollupAdminLogicActions.md)\<`TParams`\[`"rollup"`\], `TChain`\>

## Source

[src/decorators/rollupAdminLogicPublicActions.ts:51](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/decorators/rollupAdminLogicPublicActions.ts#L51)
