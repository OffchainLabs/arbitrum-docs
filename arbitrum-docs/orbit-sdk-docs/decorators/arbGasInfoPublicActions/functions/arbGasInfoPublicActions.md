---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbGasInfoPublicActions<TTransport, TChain>(client: object): ArbGasInfoPublicActions<TChain>
```

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

[src/decorators/arbGasInfoPublicActions.ts:16](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/decorators/arbGasInfoPublicActions.ts#L16)
