---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type RollupAdminLogicActions<TRollupAdminLogic, TChain>: object;
```

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TRollupAdminLogic` *extends* `Address` \| `undefined` | - |
| `TChain` *extends* `Chain` \| `undefined` | `Chain` \| `undefined` |

## Type declaration

| Member | Type |
| :------ | :------ |
| `rollupAdminLogicPrepareTransactionRequest` | \<`TFunctionName`\>(`args`: `rollupAdminLogicPrepareTransactionRequestArgs`\<`TRollupAdminLogic`, `TFunctionName`\>) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\> |
| `rollupAdminLogicReadContract` | \<`TFunctionName`\>(`args`: `RollupAdminLogicReadContractArgs`\<`TRollupAdminLogic`, `TFunctionName`\>) => `Promise` \<[`RollupAdminLogicReadContractReturnType`](../../../rollupAdminLogicReadContract/type-aliases/RollupAdminLogicReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/rollupAdminLogicPublicActions.ts:31](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/decorators/rollupAdminLogicPublicActions.ts#L31)
