[Documentation](README.md) / getDefaultConfirmPeriodBlocks

## Functions

### getDefaultConfirmPeriodBlocks()

```ts
function getDefaultConfirmPeriodBlocks(
  parentChainIdOrPublicClient:
    | 1
    | 421614
    | 1337
    | 412346
    | 42161
    | 42170
    | 11155111
    | 17000
    | object,
): bigint;
```

Returns the default confirmation period blocks based on the provided
ParentChainId or PublicClient.

#### Parameters

| Parameter                     | Type                                                                                                |
| :---------------------------- | :-------------------------------------------------------------------------------------------------- |
| `parentChainIdOrPublicClient` | \| `1` \| `421614` \| `1337` \| `412346` \| `42161` \| `42170` \| `11155111` \| `17000` \| `object` |

#### Returns

`bigint`

#### Source

[src/getDefaultConfirmPeriodBlocks.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/getDefaultConfirmPeriodBlocks.ts#L10)
