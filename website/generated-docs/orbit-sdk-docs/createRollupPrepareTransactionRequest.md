---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupPrepareTransactionRequest

## Type Aliases

### CreateRollupPrepareTransactionRequestParams\<TChain\>

> **CreateRollupPrepareTransactionRequestParams**\<`TChain`\>: [`Prettify`](types/utils.md#prettifyt) \<[`WithRollupCreatorAddressOverride`](types/createRollupTypes.md#withrollupcreatoraddressoverridet)\<`object`\>\>

#### Type parameters

• **TChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Source

[createRollupPrepareTransactionRequest.ts:30](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupPrepareTransactionRequest.ts#L30)

## Functions

### createRollupPrepareTransactionRequest()

> **createRollupPrepareTransactionRequest**\<`TChain`\>(`__namedParameters`): `Promise`\<`any`\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.account**: `Address`

• **\_\_namedParameters.gasOverrides?**: [`TransactionRequestGasOverrides`](utils/gasOverrides.md#transactionrequestgasoverrides)

• **\_\_namedParameters.params**: [`CreateRollupParams`](types/createRollupTypes.md#createrollupparams)

• **\_\_namedParameters.publicClient**: `PublicClient`\<`Transport`, `TChain`\>

• **\_\_namedParameters.rollupCreatorAddressOverride?**: `any`

Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise`\<`any`\>

#### Source

[createRollupPrepareTransactionRequest.ts:40](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupPrepareTransactionRequest.ts#L40)
