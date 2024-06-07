[Documentation](../../README.md) / [createTokenBridgePrepareTransactionRequest](../README.md) / TransactionRequestRetryableGasOverrides

```ts
type TransactionRequestRetryableGasOverrides: object;
```

## Type declaration

| Member                          | Type                                                                                |
| :------------------------------ | :---------------------------------------------------------------------------------- |
| `maxGasForContracts`            | [`GasOverrideOptions`](../../utils/gasOverrides/type-aliases/GasOverrideOptions.md) |
| `maxGasForFactory`              | [`GasOverrideOptions`](../../utils/gasOverrides/type-aliases/GasOverrideOptions.md) |
| `maxGasPrice`                   | `bigint`                                                                            |
| `maxSubmissionCostForContracts` | [`GasOverrideOptions`](../../utils/gasOverrides/type-aliases/GasOverrideOptions.md) |
| `maxSubmissionCostForFactory`   | [`GasOverrideOptions`](../../utils/gasOverrides/type-aliases/GasOverrideOptions.md) |

## Source

[src/createTokenBridgePrepareTransactionRequest.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/createTokenBridgePrepareTransactionRequest.ts#L17)
