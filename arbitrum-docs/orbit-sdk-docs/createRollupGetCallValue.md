[Documentation](README.md) / createRollupGetCallValue

## Functions

### createRollupGetCallValue()

```ts
function createRollupGetCallValue(params: CreateRollupParams): bigint;
```

createRollupGetCallValue calculates the call value needed for creating
retryable tickets in a rollup. It returns a BigInt representing the
calculated call value based on the provided parameters. The call value is
determined based on whether factories are deployed to Layer 2 and if a custom
fee token is used for payment.

#### Parameters

| Parameter | Type                 |
| :-------- | :------------------- |
| `params`  | `CreateRollupParams` |

#### Returns

`bigint`

#### Source

[src/createRollupGetCallValue.ts:12](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createRollupGetCallValue.ts#L12)
