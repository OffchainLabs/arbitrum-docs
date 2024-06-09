---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ArbOwnerReadContractParameters<TFunctionName>: object & GetFunctionArgs<ArbOwnerPublicAbi, TFunctionName>;
```

## Type declaration

| Member         | Type            |
| :------------- | :-------------- |
| `functionName` | `TFunctionName` |

## Type parameters

| Type parameter                                                                          |
| :-------------------------------------------------------------------------------------- |
| `TFunctionName` _extends_ [`ArbOwnerPublicFunctionName`](ArbOwnerPublicFunctionName.md) |

## Source

[src/arbOwnerReadContract.ts:9](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/arbOwnerReadContract.ts#L9)
