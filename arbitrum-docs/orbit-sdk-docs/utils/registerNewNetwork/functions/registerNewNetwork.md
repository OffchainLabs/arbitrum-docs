---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function registerNewNetwork(
  parentProvider: JsonRpcProvider,
  childProvider: JsonRpcProvider,
  rollupAddress: string,
): Promise<object>;
```

Registers a new network by creating parent and child networks based on the
provided providers and rollup address.

## Parameters

| Parameter        | Type              |
| :--------------- | :---------------- |
| `parentProvider` | `JsonRpcProvider` |
| `childProvider`  | `JsonRpcProvider` |
| `rollupAddress`  | `string`          |

## Returns

`Promise`\<`object`\>

| Member          | Type                       |
| :-------------- | :------------------------- |
| `childNetwork`  | `L2Network`                |
| `parentNetwork` | `L1Network` \| `L2Network` |

## Source

[src/utils/registerNewNetwork.ts:170](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/utils/registerNewNetwork.ts#L170)
