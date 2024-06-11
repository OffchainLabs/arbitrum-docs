---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/getClientVersion

## Functions

### getClientVersion()

> **getClientVersion**(`publicClientOrRpcUrl`): `Promise`\<`string`\>

Returns the client version of the provided PublicClient or RPC URL.

#### Parameters

• **publicClientOrRpcUrl**: `string` \| `object`

The PublicClient instance or RPC URL string.

#### Returns

`Promise`\<`string`\>

- A promise that resolves to the client version string.

#### Throws

- Throws an error if the RPC URL is invalid.

#### Source

[src/utils/getClientVersion.ts:16](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/getClientVersion.ts#L16)
