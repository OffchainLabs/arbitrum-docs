---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ArbOwnerReadContractParameters<TFunctionName>: object & GetFunctionArgs<ArbOwnerPublicAbi, TFunctionName>;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `functionName` | `TFunctionName` |

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* [`ArbOwnerPublicFunctionName`](ArbOwnerPublicFunctionName.md) |

## Source

[src/arbOwnerReadContract.ts:9](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/arbOwnerReadContract.ts#L9)
