[Documentation](../../../README.md) / [utils/erc20](../README.md) / ApprovePrepareTransactionRequestProps

```ts
type ApprovePrepareTransactionRequestProps<TChain>: object;
```

## Type parameters

| Type parameter                            |
| :---------------------------------------- |
| `TChain` _extends_ `Chain` \| `undefined` |

## Type declaration

| Member         | Type                                    |
| :------------- | :-------------------------------------- |
| `address`      | `Address`                               |
| `amount`       | `bigint`                                |
| `owner`        | `Address`                               |
| `publicClient` | `PublicClient`\<`Transport`, `TChain`\> |
| `spender`      | `Address`                               |

## Source

[src/utils/erc20.ts:13](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/utils/erc20.ts#L13)
