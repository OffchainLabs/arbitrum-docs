[Documentation](README.md) / createRollupDefaults

## Variables

### defaults

```ts
const defaults: object;
```

defaults contains default values for various configurations such as
nativeToken, deployFactoriesToL2, and maxFeePerGasForRetryables.

#### Type declaration

| Member                      | Type                                           | Value       |
| :-------------------------- | :--------------------------------------------- | :---------- |
| `deployFactoriesToL2`       | `boolean`                                      | true        |
| `maxFeePerGasForRetryables` | `bigint`                                       | ...         |
| `nativeToken`               | `"0x0000000000000000000000000000000000000000"` | zeroAddress |

#### Source

[src/createRollupDefaults.ts:7](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createRollupDefaults.ts#L7)
