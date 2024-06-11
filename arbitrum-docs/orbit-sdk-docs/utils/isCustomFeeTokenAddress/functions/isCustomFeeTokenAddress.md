---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: isCustomFeeTokenAddress()

> **isCustomFeeTokenAddress**(`nativeToken`): nativeToken is \`0x$\{string\}\`

Returns true if the provided address is not undefined and not equal to
zeroAddress, indicating that it is a custom fee token address.

## Parameters

• **nativeToken**: `undefined` \| \`0x$\{string\}\`

The address to check.

## Returns

nativeToken is \`0x$\{string\}\`

- True if the address is a custom fee token address, false otherwise.

## Source

[src/utils/isCustomFeeTokenAddress.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/utils/isCustomFeeTokenAddress.ts#L10)
