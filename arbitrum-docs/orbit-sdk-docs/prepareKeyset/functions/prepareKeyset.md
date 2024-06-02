---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function prepareKeyset(publicKeys: string[], assumedHonest: number): `0x${string}`
```

Prepares a keyset by encoding the assumed honest value, number of committee
members, and public keys into a single hexadecimal string.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `publicKeys` | `string`[] |
| `assumedHonest` | `number` |

## Returns

\`0x$\{string\}\`

## Source

[src/prepareKeyset.ts:23](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/prepareKeyset.ts#L23)
