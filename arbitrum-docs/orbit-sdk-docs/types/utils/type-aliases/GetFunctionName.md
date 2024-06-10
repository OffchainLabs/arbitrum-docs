---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type GetFunctionName<TAbi>: Extract<TAbi[number], object>["name"];
```

## Type parameters

| Type parameter |
| :------ |
| `TAbi` *extends* `Abi` |

## Source

[src/types/utils.ts:8](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/types/utils.ts#L8)
