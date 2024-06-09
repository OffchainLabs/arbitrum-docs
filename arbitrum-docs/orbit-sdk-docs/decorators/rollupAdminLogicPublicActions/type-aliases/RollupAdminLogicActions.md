---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type RollupAdminLogicActions<TRollupAdminLogic, TChain>: object;
```

## Type parameters

| Type parameter                                         | Value                  |
| :----------------------------------------------------- | :--------------------- |
| `TRollupAdminLogic` _extends_ `Address` \| `undefined` | -                      |
| `TChain` _extends_ `Chain` \| `undefined`              | `Chain` \| `undefined` |

## Type declaration

| Member                                      | Type                                                                                                                                                                                                                                                                                 |
| :------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rollupAdminLogicPrepareTransactionRequest` | \<`TFunctionName`\>(`args`: `rollupAdminLogicPrepareTransactionRequestArgs`\<`TRollupAdminLogic`, `TFunctionName`\>) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>                                                                                    |
| `rollupAdminLogicReadContract`              | \<`TFunctionName`\>(`args`: `RollupAdminLogicReadContractArgs`\<`TRollupAdminLogic`, `TFunctionName`\>) => `Promise` \<[`RollupAdminLogicReadContractReturnType`](../../../rollupAdminLogicReadContract/type-aliases/RollupAdminLogicReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/rollupAdminLogicPublicActions.ts:31](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/decorators/rollupAdminLogicPublicActions.ts#L31)
