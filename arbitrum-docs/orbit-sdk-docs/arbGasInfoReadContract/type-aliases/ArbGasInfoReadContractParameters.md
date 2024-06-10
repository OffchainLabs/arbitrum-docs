---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ArbGasInfoReadContractParameters<TFunctionName>: object & GetFunctionArgs<ArbGasInfoAbi, TFunctionName>;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `functionName` | `TFunctionName` |

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* [`ArbGasInfoFunctionName`](ArbGasInfoFunctionName.md) |

## Source

[src/arbGasInfoReadContract.ts:9](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/arbGasInfoReadContract.ts#L9)
