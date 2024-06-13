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

• **TRollupAdminLogic** *extends* [`mainnet`](../chains.md#mainnet) \| `undefined`

• **TChain** *extends* [`mainnet`](../chains.md#mainnet) \| `undefined` = [`mainnet`](../chains.md#mainnet) \| `undefined`

#### Type declaration

##### rollupAdminLogicPrepareTransactionRequest()

> **rollupAdminLogicPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise` \<[`mainnet`](../chains.md#mainnet)\<`TChain`\> & `object`\>

###### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](../rollupAdminLogicReadContract.md#rollupadminlogicfunctionname)

###### Parameters

• **args**: `rollupAdminLogicPrepareTransactionRequestArgs`\<`TRollupAdminLogic`, `TFunctionName`\>

###### Returns

`Promise` \<[`mainnet`](../chains.md#mainnet)\<`TChain`\> & `object`\>

##### rollupAdminLogicReadContract()

> **rollupAdminLogicReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`RollupAdminLogicReadContractReturnType`](../rollupAdminLogicReadContract.md#rollupadminlogicreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

###### Type parameters

• **TFunctionName** *extends* [`RollupAdminLogicFunctionName`](../rollupAdminLogicReadContract.md#rollupadminlogicfunctionname)

###### Parameters

• **args**: `RollupAdminLogicReadContractArgs`\<`TRollupAdminLogic`, `TFunctionName`\>

###### Returns

`Promise` \<[`RollupAdminLogicReadContractReturnType`](../rollupAdminLogicReadContract.md#rollupadminlogicreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[decorators/rollupAdminLogicPublicActions.ts:31](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/decorators/rollupAdminLogicPublicActions.ts#L31)

## Functions

### rollupAdminLogicPublicActions()

> **rollupAdminLogicPublicActions**\<`TParams`, `TTransport`, `TChain`\>(`__namedParameters`): (`client`) => [`RollupAdminLogicActions`](rollupAdminLogicPublicActions.md#rollupadminlogicactionstrollupadminlogictchain)\<`TParams`\[`"rollup"`\], `TChain`\>

#### Type parameters

• **TParams** *extends* `object`

• **TTransport** *extends* `Transport` = `Transport`

• **TChain** *extends* `unknown` = `Chain`

#### Parameters

• **\_\_namedParameters**: `TParams`

#### Returns

`Function`

##### Parameters

• **client**: [`mainnet`](../chains.md#mainnet)\<`TTransport`, `TChain`\>

##### Returns

[`RollupAdminLogicActions`](rollupAdminLogicPublicActions.md#rollupadminlogicactionstrollupadminlogictchain)\<`TParams`\[`"rollup"`\], `TChain`\>

#### Source

[decorators/rollupAdminLogicPublicActions.ts:44](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/decorators/rollupAdminLogicPublicActions.ts#L44)
