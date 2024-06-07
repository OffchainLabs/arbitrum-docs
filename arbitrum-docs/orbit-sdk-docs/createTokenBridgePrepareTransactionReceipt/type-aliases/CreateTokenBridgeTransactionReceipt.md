[Documentation](../../README.md) / [createTokenBridgePrepareTransactionReceipt](../README.md) / CreateTokenBridgeTransactionReceipt

```ts
type CreateTokenBridgeTransactionReceipt<TParentChain, TOrbitChain>: TransactionReceipt & object;
```

## Type declaration

| Member                    | Type                                                                                                         |
| :------------------------ | :----------------------------------------------------------------------------------------------------------- |
| `getTokenBridgeContracts` | `Promise`\<[`TokenBridgeContracts`](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md)\> |
| `waitForRetryables`       | `Promise`\<[`WaitForRetryablesResult`](WaitForRetryablesResult.md)\>                                         |

## Type parameters

| Type parameter                                  |
| :---------------------------------------------- |
| `TParentChain` _extends_ `Chain` \| `undefined` |
| `TOrbitChain` _extends_ `Chain` \| `undefined`  |

## Source

[src/createTokenBridgePrepareTransactionReceipt.ts:62](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/createTokenBridgePrepareTransactionReceipt.ts#L62)
