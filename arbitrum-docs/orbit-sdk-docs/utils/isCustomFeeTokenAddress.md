---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/isCustomFeeTokenAddress

## Functions

### isCustomFeeTokenAddress()

> **isCustomFeeTokenAddress**(`nativeToken`): nativeToken is \`0x$\{string\}\`

Returns true if the provided address is not undefined and not equal to
zeroAddress, indicating that it is a custom fee token address.

#### Parameters

• **nativeToken**: `undefined` \| \`0x$\{string\}\`

The address to check.

#### Returns

nativeToken is \`0x$\{string\}\`

- True if the address is a custom fee token address, false otherwise.

#### Source

[src/utils/isCustomFeeTokenAddress.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/isCustomFeeTokenAddress.ts#L10)
