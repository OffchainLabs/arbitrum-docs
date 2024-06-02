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

`ArbGasInfoPublicActions`\<`TChain`\>

## Source

[src/decorators/arbGasInfoPublicActions.ts:20](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/decorators/arbGasInfoPublicActions.ts#L20)
