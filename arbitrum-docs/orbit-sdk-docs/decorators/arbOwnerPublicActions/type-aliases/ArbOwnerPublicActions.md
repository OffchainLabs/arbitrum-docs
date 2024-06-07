[Documentation](../../../README.md) / [decorators/arbOwnerPublicActions](../README.md) / ArbOwnerPublicActions

```ts
type ArbOwnerPublicActions<TChain>: object;
```

## Type parameters

| Type parameter                            | Value                  |
| :---------------------------------------- | :--------------------- |
| `TChain` _extends_ `Chain` \| `undefined` | `Chain` \| `undefined` |

## Type declaration

| Member                              | Type                                                                                                                                                                                                                                                                                                                 |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arbOwnerPrepareTransactionRequest` | \<`TFunctionName`\>(`args`: [`ArbOwnerPrepareTransactionRequestParameters`](../../../arbOwnerPrepareTransactionRequest/type-aliases/ArbOwnerPrepareTransactionRequestParameters.md)\<`TFunctionName`\>) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>                                 |
| `arbOwnerReadContract`              | \<`TFunctionName`\>(`args`: [`ArbOwnerReadContractParameters`](../../../arbOwnerReadContract/type-aliases/ArbOwnerReadContractParameters.md)\<`TFunctionName`\>) => `Promise`\<[`ArbOwnerReadContractReturnType`](../../../arbOwnerReadContract/type-aliases/ArbOwnerReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/arbOwnerPublicActions.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/decorators/arbOwnerPublicActions.ts#L15)
