[Documentation](../../README.md) / [createRollupFetchCoreContracts](../README.md) / CreateRollupFetchCoreContractsParams

```ts
type CreateRollupFetchCoreContractsParams<TChain>: object;
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

[src/createRollupFetchCoreContracts.ts:7](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/createRollupFetchCoreContracts.ts#L7)
