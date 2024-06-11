---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/isCustomFeeTokenChain

## Functions

### isCustomFeeTokenChain()

> **isCustomFeeTokenChain**(`params`): `Promise`\<`boolean`\>

Checks if the given rollup chain is a custom fee token chain by verifying the
existence of a native token on the bridge contract. Returns true if it is a
custom fee token chain, false otherwise.

#### Parameters

• **params**

The parameters for the function

• **params.parentChainPublicClient**

The public client for the parent chain

• **params.rollup**: \`0x$\{string\}\`

The address of the rollup

#### Returns

`Promise`\<`boolean`\>

- Returns a promise that resolves to true if the rollup chain is a custom fee token chain, false otherwise

#### Source

[src/utils/isCustomFeeTokenChain.ts:14](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/isCustomFeeTokenChain.ts#L14)
