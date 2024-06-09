---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function isCustomFeeTokenChain(__namedParameters: object): Promise<boolean>
```

Checks if the given rollup chain is a custom fee token chain by verifying the
existence of a native token on the bridge contract. Returns true if it is a
custom fee token chain, false otherwise.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `object` |
| `__namedParameters.parentChainPublicClient` | `object` |
| `__namedParameters.rollup` | \`0x$\{string\}\` |

## Returns

`Promise`\<`boolean`\>

## Source

[src/utils/isCustomFeeTokenChain.ts:8](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/utils/isCustomFeeTokenChain.ts#L8)
