[Documentation](../README.md) / utils/registerNewNetwork

## Functions

### registerNewNetwork()

```ts
function registerNewNetwork(
   parentProvider: JsonRpcProvider, 
   childProvider: JsonRpcProvider, 
rollupAddress: string): Promise<object>
```

Registers a new network by creating and adding the parent and child networks.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `parentProvider` | `JsonRpcProvider` |
| `childProvider` | `JsonRpcProvider` |
| `rollupAddress` | `string` |

#### Returns

`Promise`\<`object`\>

| Member | Type |
| :------ | :------ |
| `childNetwork` | `L2Network` |
| `parentNetwork` | `L1Network` \| `L2Network` |

#### Source

[src/utils/registerNewNetwork.ts:167](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/registerNewNetwork.ts#L167)
