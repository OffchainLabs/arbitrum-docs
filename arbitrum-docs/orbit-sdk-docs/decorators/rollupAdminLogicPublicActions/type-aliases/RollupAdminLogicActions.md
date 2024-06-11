---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Type alias: RollupAdminLogicActions\<TRollupAdminLogic, TChain\>

> **RollupAdminLogicActions**\<`TRollupAdminLogic`, `TChain`\>: `object`

## Type parameters

• **TRollupAdminLogic** *extends* `Address` \| `undefined`

• **TChain** *extends* `Chain` \| `undefined` = `Chain` \| `undefined`

## Type declaration

### rollupAdminLogicPrepareTransactionRequest()

> **rollupAdminLogicPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

Prepares a transaction request for the Rollup Admin Logic smart contract.

#### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](../../../rollupAdminLogicReadContract/type-aliases/RollupAdminLogicFunctionName.md)

#### Parameters

• **args**: `rollupAdminLogicPrepareTransactionRequestArgs`\<`TRollupAdminLogic`, `TFunctionName`\>

The arguments for preparing the transaction request.

#### Returns

`Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

### rollupAdminLogicReadContract()

> **rollupAdminLogicReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`RollupAdminLogicReadContractReturnType`](../../../rollupAdminLogicReadContract/type-aliases/RollupAdminLogicReadContractReturnType.md)\<`TFunctionName`\>\>

Reads data from the Rollup Admin Logic smart contract.

#### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](../../../rollupAdminLogicReadContract/type-aliases/RollupAdminLogicFunctionName.md)

#### Parameters

• **args**: `RollupAdminLogicReadContractArgs`\<`TRollupAdminLogic`, `TFunctionName`\>

The arguments for reading the contract.

#### Returns

`Promise` \<[`RollupAdminLogicReadContractReturnType`](../../../rollupAdminLogicReadContract/type-aliases/RollupAdminLogicReadContractReturnType.md)\<`TFunctionName`\>\>

## Source

[src/decorators/rollupAdminLogicPublicActions.ts:31](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/decorators/rollupAdminLogicPublicActions.ts#L31)
