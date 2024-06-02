---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function sanitizePrivateKey(privateKey: string): `0x${string}`
```

SanitizePrivateKey sanitizes a private key string by ensuring it starts with
'0x' and returns a `0x${string}`.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `privateKey` | `string` |

## Returns

\`0x$\{string\}\`

## Source

[src/utils/sanitizePrivateKey.ts:5](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/utils/sanitizePrivateKey.ts#L5)
