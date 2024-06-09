---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function getClientVersion(publicClientOrRpcUrl: string | object): Promise<string>;
```

Returns the client version of the provided PublicClient or RPC URL.

## Parameters

| Parameter              | Type                 |
| :--------------------- | :------------------- |
| `publicClientOrRpcUrl` | `string` \| `object` |

## Returns

`Promise`\<`string`\>

## Source

[src/utils/getClientVersion.ts:10](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/utils/getClientVersion.ts#L10)
