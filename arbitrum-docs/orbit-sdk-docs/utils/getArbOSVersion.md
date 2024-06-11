---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/getArbOSVersion

## Functions

### getArbOSVersion()

> **getArbOSVersion**(`arbitrumPublicClient`): `Promise`\<`number`\>

Returns the the ArbOS version from the provider passed in parameter.

#### Parameters

• **arbitrumPublicClient**

viem public client

#### Returns

`Promise`\<`number`\>

the ArbOS version

#### Throws

if the provider is not an arbitrum chain

#### Source

[src/utils/getArbOSVersion.ts:11](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/getArbOSVersion.ts#L11)
