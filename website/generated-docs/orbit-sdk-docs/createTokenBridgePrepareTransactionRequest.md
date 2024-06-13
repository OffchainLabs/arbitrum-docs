---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgePrepareTransactionRequest

## Type Aliases

### CreateTokenBridgePrepareTransactionRequestParams\<TParentChain, TOrbitChain\>

> **CreateTokenBridgePrepareTransactionRequestParams**\<`TParentChain`, `TOrbitChain`\>: [`Prettify`](types/utils.md#prettifyt) \<[`WithTokenBridgeCreatorAddressOverride`](types/createTokenBridgeTypes.md#withtokenbridgecreatoraddressoverridet)\<`object`\>\>

#### Type parameters

• **TParentChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

• **TOrbitChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Source

[createTokenBridgePrepareTransactionRequest.ts:25](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareTransactionRequest.ts#L25)

***

### TransactionRequestRetryableGasOverrides

> **TransactionRequestRetryableGasOverrides**: `object`

#### Type declaration

##### maxGasForContracts?

> `optional` **maxGasForContracts**: [`GasOverrideOptions`](utils/gasOverrides.md#gasoverrideoptions)

##### maxGasForFactory?

> `optional` **maxGasForFactory**: [`GasOverrideOptions`](utils/gasOverrides.md#gasoverrideoptions)

##### maxGasPrice?

> `optional` **maxGasPrice**: `bigint`

##### maxSubmissionCostForContracts?

> `optional` **maxSubmissionCostForContracts**: [`GasOverrideOptions`](utils/gasOverrides.md#gasoverrideoptions)

##### maxSubmissionCostForFactory?

> `optional` **maxSubmissionCostForFactory**: [`GasOverrideOptions`](utils/gasOverrides.md#gasoverrideoptions)

#### Source

[createTokenBridgePrepareTransactionRequest.ts:17](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareTransactionRequest.ts#L17)

## Functions

### createTokenBridgePrepareTransactionRequest()

> **createTokenBridgePrepareTransactionRequest**\<`TParentChain`, `TOrbitChain`\>(`__namedParameters`): `Promise`\<`any`\>

#### Type parameters

• **TParentChain** *extends* `unknown`

• **TOrbitChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.account**: `Address`

• **\_\_namedParameters.gasOverrides?**: [`TransactionRequestGasOverrides`](utils/gasOverrides.md#transactionrequestgasoverrides)

• **\_\_namedParameters.orbitChainPublicClient**: `PublicClient`\<`Transport`, `TOrbitChain`\>

• **\_\_namedParameters.params**

• **\_\_namedParameters.params.rollup**: `Address`

• **\_\_namedParameters.params.rollupOwner**: `Address`

• **\_\_namedParameters.parentChainPublicClient**: `PublicClient`\<`Transport`, `TParentChain`\>

• **\_\_namedParameters.retryableGasOverrides?**: [`TransactionRequestRetryableGasOverrides`](createTokenBridgePrepareTransactionRequest.md#transactionrequestretryablegasoverrides)

• **\_\_namedParameters.tokenBridgeCreatorAddressOverride?**: `any`

Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise`\<`any`\>

#### Source

[createTokenBridgePrepareTransactionRequest.ts:39](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareTransactionRequest.ts#L39)
