---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function registerNewNetwork(
   parentProvider: JsonRpcProvider, 
   childProvider: JsonRpcProvider, 
rollupAddress: string): Promise<object>
```

Registers a new network by creating parent and child networks based on the
provided providers and rollup address.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `parentProvider` | `JsonRpcProvider` |
| `childProvider` | `JsonRpcProvider` |
| `rollupAddress` | `string` |

## Returns

`Promise`\<`object`\>

| Member | Type |
| :------ | :------ |
| `childNetwork` | `L2Network` |
| `parentNetwork` | `L1Network` \| `L2Network` |

## Source

[src/utils/registerNewNetwork.ts:170](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/utils/registerNewNetwork.ts#L170)
