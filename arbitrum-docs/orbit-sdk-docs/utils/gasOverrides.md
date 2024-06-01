[Documentation](../README.md) / utils/gasOverrides

## Functions

### applyPercentIncrease()

```ts
function applyPercentIncrease(__namedParameters: object): bigint
```

applyPercentIncrease calculates the new gas limit by applying a percentage
increase to the base gas limit provided.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `object` |
| `__namedParameters.base` | `bigint` |
| `__namedParameters.percentIncrease`? | `bigint` |

#### Returns

`bigint`

#### Source

[src/utils/gasOverrides.ts:14](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/gasOverrides.ts#L14)
