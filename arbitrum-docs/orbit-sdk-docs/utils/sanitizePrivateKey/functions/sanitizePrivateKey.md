---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function sanitizePrivateKey(privateKey: string): `0x${string}`;
```

SanitizePrivateKey sanitizes a private key string by ensuring it starts with
'0x' and returns a `0x${string}`.

## Parameters

| Parameter    | Type     |
| :----------- | :------- |
| `privateKey` | `string` |

## Returns

\`0x$\{string\}\`

## Source

[src/utils/sanitizePrivateKey.ts:5](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/utils/sanitizePrivateKey.ts#L5)
