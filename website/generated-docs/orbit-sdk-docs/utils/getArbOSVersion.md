---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/getArbOSVersion

## Functions

### getArbOSVersion()

> **getArbOSVersion**\<`TChain`\>(`arbitrumPublicClient`): `Promise`\<`number`\>

Returns the the ArbOS version from the provider passed in parameter.

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **arbitrumPublicClient**: `PublicClient`\<`Transport`, `TChain`\>

viem public client

#### Returns

`Promise`\<`number`\>

the ArbOS version

#### Throws

if the provider is not an arbitrum chain

#### Source

[utils/getArbOSVersion.ts:11](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/utils/getArbOSVersion.ts#L11)
