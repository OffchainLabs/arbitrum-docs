---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ArbGasInfoPublicActions<TChain>: object;
```

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TChain` *extends* `Chain` \| `undefined` | `Chain` \| `undefined` |

## Type declaration

| Member | Type |
| :------ | :------ |
| `arbGasInfoReadContract` | \<`TFunctionName`\>(`args`: [`ArbGasInfoReadContractParameters`](../../../arbGasInfoReadContract/type-aliases/ArbGasInfoReadContractParameters.md)\<`TFunctionName`\>) => `Promise` \<[`ArbGasInfoReadContractReturnType`](../../../arbGasInfoReadContract/type-aliases/ArbGasInfoReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/arbGasInfoPublicActions.ts:10](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/decorators/arbGasInfoPublicActions.ts#L10)
