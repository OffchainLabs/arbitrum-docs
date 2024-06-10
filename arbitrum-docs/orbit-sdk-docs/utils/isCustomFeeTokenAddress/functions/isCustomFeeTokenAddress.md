---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function isCustomFeeTokenAddress(nativeToken: undefined | `0x${string}`): nativeToken is `0x${string}`
```

Returns true if the provided address is not undefined and not equal to
zeroAddress, indicating that it is a custom fee token address.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `nativeToken` | `undefined` \| \`0x$\{string\}\` |

## Returns

nativeToken is \`0x$\{string\}\`

## Source

[src/utils/isCustomFeeTokenAddress.ts:7](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/utils/isCustomFeeTokenAddress.ts#L7)
