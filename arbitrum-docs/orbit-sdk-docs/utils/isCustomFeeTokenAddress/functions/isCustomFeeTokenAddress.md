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

[src/utils/isCustomFeeTokenAddress.ts:7](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/utils/isCustomFeeTokenAddress.ts#L7)
