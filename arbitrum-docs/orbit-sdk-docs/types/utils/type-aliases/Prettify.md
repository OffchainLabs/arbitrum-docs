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
| :------ |
| `T` |

## Source

[src/types/utils.ts:4](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/types/utils.ts#L4)
