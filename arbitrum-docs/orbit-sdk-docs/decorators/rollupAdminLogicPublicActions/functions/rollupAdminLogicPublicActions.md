---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function rollupAdminLogicPublicActions<TParams, TTransport, TChain>(__namedParameters: TParams): (client: PublicClient<TTransport, TChain>) => RollupAdminLogicActions<TParams["rollup"], TChain>
```

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

[src/decorators/rollupAdminLogicPublicActions.ts:44](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/decorators/rollupAdminLogicPublicActions.ts#L44)
