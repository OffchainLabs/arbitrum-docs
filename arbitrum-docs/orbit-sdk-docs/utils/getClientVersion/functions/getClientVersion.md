---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: getClientVersion()

> **getClientVersion**(`publicClientOrRpcUrl`): `Promise`\<`string`\>

Returns the client version of the provided PublicClient or RPC URL.

## Parameters

• **publicClientOrRpcUrl**: `string` \| `object`

The PublicClient instance or RPC URL string.

## Returns

`Promise`\<`string`\>

- A promise that resolves to the client version string.

## Throws

- Throws an error if the RPC URL is invalid.

## Source

[src/utils/getClientVersion.ts:16](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/utils/getClientVersion.ts#L16)
