---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: isCustomFeeTokenChain()

> **isCustomFeeTokenChain**(`params`): `Promise`\<`boolean`\>

Checks if the given rollup chain is a custom fee token chain by verifying the
existence of a native token on the bridge contract. Returns true if it is a
custom fee token chain, false otherwise.

## Parameters

• **params**

The parameters for the function

• **params.parentChainPublicClient**

The public client for the parent chain

• **params.rollup**: \`0x$\{string\}\`

The address of the rollup

## Returns

`Promise`\<`boolean`\>

- Returns a promise that resolves to true if the rollup chain is a custom fee token chain, false otherwise

## Source

[src/utils/isCustomFeeTokenChain.ts:14](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/utils/isCustomFeeTokenChain.ts#L14)
