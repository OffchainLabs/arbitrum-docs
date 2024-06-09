---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type Prettify<T>: { [K in keyof T]: T[K] } & object;
```

## Type parameters

| Type parameter |
| :------------- |
| `T`            |

## Source

[src/types/utils.ts:4](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/types/utils.ts#L4)
