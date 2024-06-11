---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# decorators/rollupAdminLogicPublicActions

## Type Aliases

### RollupAdminLogicActions\<TRollupAdminLogic, TChain\>

> **RollupAdminLogicActions**\<`TRollupAdminLogic`, `TChain`\>: `object`

#### Type parameters

• **TRollupAdminLogic** *extends* `Address` \| `undefined`

• **TChain** *extends* `Chain` \| `undefined` = `Chain` \| `undefined`

#### Type declaration

##### rollupAdminLogicPrepareTransactionRequest()

> **rollupAdminLogicPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

Prepares a transaction request for the Rollup Admin Logic smart contract.

###### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](../rollupAdminLogicReadContract.md#rollupadminlogicfunctionname)

###### Parameters

• **args**: `rollupAdminLogicPrepareTransactionRequestArgs`\<`TRollupAdminLogic`, `TFunctionName`\>

The arguments for preparing the transaction request.

###### Returns

`Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

##### rollupAdminLogicReadContract()

> **rollupAdminLogicReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`RollupAdminLogicReadContractReturnType`](../rollupAdminLogicReadContract.md#rollupadminlogicreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

Reads data from the Rollup Admin Logic smart contract.

###### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](../rollupAdminLogicReadContract.md#rollupadminlogicfunctionname)

###### Parameters

• **args**: `RollupAdminLogicReadContractArgs`\<`TRollupAdminLogic`, `TFunctionName`\>

The arguments for reading the contract.

###### Returns

`Promise` \<[`RollupAdminLogicReadContractReturnType`](../rollupAdminLogicReadContract.md#rollupadminlogicreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[src/decorators/rollupAdminLogicPublicActions.ts:31](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/decorators/rollupAdminLogicPublicActions.ts#L31)

## Functions

### rollupAdminLogicPublicActions()

> **rollupAdminLogicPublicActions**\<`TParams`, `TTransport`, `TChain`\>(`params`): (`client`) => [`RollupAdminLogicActions`](rollupAdminLogicPublicActions.md#rollupadminlogicactionstrollupadminlogictchain)\<`TParams`\[`"rollup"`\], `TChain`\>

The function rollupAdminLogicPublicActions returns a [RollupAdminLogicActions](rollupAdminLogicPublicActions.md#rollupadminlogicactionstrollupadminlogictchain) object that contains two methods:
rollupAdminLogicReadContract and rollupAdminLogicPrepareTransactionRequest.
These methods allow interacting with the Rollup Admin Logic smart contract by
reading contract data and preparing transaction requests.

#### Type parameters

• **TParams** *extends* `object`

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `Chain`\<`undefined` \| `ChainFormatters`\>

#### Parameters

• **params**: `TParams`

The parameters for the function.

#### Returns

`Function`

- A function that takes a PublicClient and returns RollupAdminLogicActions.

##### Parameters

• **client**: `PublicClient`\<`TTransport`, `TChain`\>

##### Returns

[`RollupAdminLogicActions`](rollupAdminLogicPublicActions.md#rollupadminlogicactionstrollupadminlogictchain)\<`TParams`\[`"rollup"`\], `TChain`\>

#### Source

[src/decorators/rollupAdminLogicPublicActions.ts:71](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/decorators/rollupAdminLogicPublicActions.ts#L71)
