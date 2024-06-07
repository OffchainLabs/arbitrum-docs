[Documentation](../../README.md) / [getValidators](../README.md) / GetValidatorsReturnType

```ts
type GetValidatorsReturnType: object;
```

## Type declaration

| Member       | Type        | Description                                                                                                                                                                                                                                                   |
| :----------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isAccurate` | `boolean`   | <p>If logs contain unknown signature, validators list might:</p><ul><li>contain false positives (validators that were removed, but returned as validator)</li><li>contain false negatives (validators that were added, but not present in the list)</li></ul> |
| `validators` | `Address`[] | List of validators for the given rollup                                                                                                                                                                                                                       |

## Source

[src/getValidators.ts:64](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/getValidators.ts#L64)
