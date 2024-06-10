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

[src/prepareKeyset.ts:23](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/prepareKeyset.ts#L23)
