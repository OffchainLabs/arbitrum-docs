[Documentation](README.md) / createRollupGetMaxDataSize

## Functions

### createRollupGetMaxDataSize()

```ts
function createRollupGetMaxDataSize(
  parentChainId: 1 | 1337 | 17000 | 42161 | 42170 | 412346 | 421614 | 11155111,
): bigint;
```

Returns the maximum data size allowed for a rollup chain based on the
provided parent chain ID.

#### Parameters

| Parameter       | Type                                                                                    |
| :-------------- | :-------------------------------------------------------------------------------------- |
| `parentChainId` | \| `1` \| `1337` \| `17000` \| `42161` \| `42170` \| `412346` \| `421614` \| `11155111` |

#### Returns

`bigint`

#### Source

[src/createRollupGetMaxDataSize.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createRollupGetMaxDataSize.ts#L17)
