[Documentation](../../../README.md) / [decorators/rollupAdminLogicPublicActions](../README.md) / RollupAdminLogicActions

```ts
type RollupAdminLogicActions<TRollupAdminLogic, TChain>: object;
```

## Type parameters

| Type parameter                                         | Value                  |
| :----------------------------------------------------- | :--------------------- |
| `TRollupAdminLogic` _extends_ `Address` \| `undefined` | -                      |
| `TChain` _extends_ `Chain` \| `undefined`              | `Chain` \| `undefined` |

## Type declaration

| Member                                      | Type                                                                                                                                                                                                                                                                                |
| :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rollupAdminLogicPrepareTransactionRequest` | \<`TFunctionName`\>(`args`: `rollupAdminLogicPrepareTransactionRequestArgs`\<`TRollupAdminLogic`, `TFunctionName`\>) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>                                                                                   |
| `rollupAdminLogicReadContract`              | \<`TFunctionName`\>(`args`: `RollupAdminLogicReadContractArgs`\<`TRollupAdminLogic`, `TFunctionName`\>) => `Promise`\<[`RollupAdminLogicReadContractReturnType`](../../../rollupAdminLogicReadContract/type-aliases/RollupAdminLogicReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/rollupAdminLogicPublicActions.ts:31](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/decorators/rollupAdminLogicPublicActions.ts#L31)
