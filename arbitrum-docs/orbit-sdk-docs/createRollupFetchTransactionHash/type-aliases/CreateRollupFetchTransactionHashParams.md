[Documentation](../../README.md) / [createRollupFetchTransactionHash](../README.md) / CreateRollupFetchTransactionHashParams

```ts
type CreateRollupFetchTransactionHashParams<TChain>: object;
```

## Type parameters

| Type parameter                            |
| :---------------------------------------- |
| `TChain` _extends_ `Chain` \| `undefined` |

## Type declaration

| Member         | Type                                    |
| :------------- | :-------------------------------------- |
| `publicClient` | `PublicClient`\<`Transport`, `TChain`\> |
| `rollup`       | `Address`                               |

## Source

[src/createRollupFetchTransactionHash.ts:18](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/createRollupFetchTransactionHash.ts#L18)
