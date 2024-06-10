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

[src/utils/registerNewNetwork.ts:166](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/utils/registerNewNetwork.ts#L166)
