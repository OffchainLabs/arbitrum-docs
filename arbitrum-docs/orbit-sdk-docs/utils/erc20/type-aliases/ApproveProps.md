[Documentation](../../../README.md) / [utils/erc20](../README.md) / ApproveProps

```ts
type ApproveProps<TChain>: object;
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
| `publicClient` | `PublicClient`\<`Transport`, `TChain`\> |
| `spender`      | `Address`                               |
| `walletClient` | `WalletClient`                          |

## Source

[src/utils/erc20.ts:38](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/utils/erc20.ts#L38)
