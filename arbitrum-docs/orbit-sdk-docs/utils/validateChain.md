[Documentation](../README.md) / utils/validateChain

## Functions

### validateChain()

```ts
function validateChain(chainIdOrPublicClient: number | object): ChainId
```

validateChain validates and returns a ChainId based on the provided
chain ID or PublicClient. It checks if the chain ID is valid by comparing it
against a list of supported chain IDs. If the chain ID is not valid, it
throws an error indicating that the chain is not supported.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `chainIdOrPublicClient` | `number` \| `object` |

#### Returns

`ChainId`

#### Source

[src/utils/validateChain.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/validateChain.ts#L17)
