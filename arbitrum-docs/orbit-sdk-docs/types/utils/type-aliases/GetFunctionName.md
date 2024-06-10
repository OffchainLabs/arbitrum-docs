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

[src/types/utils.ts:8](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/types/utils.ts#L8)
