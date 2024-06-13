---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgePrepareSetWethGatewayTransactionRequest

## Type Aliases

### CreateTokenBridgePrepareRegisterWethGatewayTransactionRequestParams\<TParentChain, TOrbitChain\>

> **CreateTokenBridgePrepareRegisterWethGatewayTransactionRequestParams**\<`TParentChain`, `TOrbitChain`\>: [`Prettify`](types/utils.md#prettifyt) \<[`WithTokenBridgeCreatorAddressOverride`](types/createTokenBridgeTypes.md#withtokenbridgecreatoraddressoverridet)\<`object`\>\>

#### Type parameters

• **TParentChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

• **TOrbitChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Source

[createTokenBridgePrepareSetWethGatewayTransactionRequest.ts:21](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts#L21)

***

### TransactionRequestRetryableGasOverrides

> **TransactionRequestRetryableGasOverrides**: `object`

#### Type declaration

##### gasLimit?

> `optional` **gasLimit**: [`GasOverrideOptions`](utils/gasOverrides.md#gasoverrideoptions)

##### maxFeePerGas?

> `optional` **maxFeePerGas**: [`GasOverrideOptions`](utils/gasOverrides.md#gasoverrideoptions)

##### maxSubmissionCost?

> `optional` **maxSubmissionCost**: [`GasOverrideOptions`](utils/gasOverrides.md#gasoverrideoptions)

#### Source

[createTokenBridgePrepareSetWethGatewayTransactionRequest.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts#L15)

## Functions

### createTokenBridgePrepareSetWethGatewayTransactionRequest()

> **createTokenBridgePrepareSetWethGatewayTransactionRequest**\<`TParentChain`, `TOrbitChain`\>(`__namedParameters`): `Promise`\<`any`\>

#### Type parameters

• **TParentChain** *extends* `unknown`

• **TOrbitChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.account**: `Address`

• **\_\_namedParameters.orbitChainPublicClient**: `PublicClient`\<`Transport`, `TOrbitChain`\>

• **\_\_namedParameters.parentChainPublicClient**: `PublicClient`\<`Transport`, `TParentChain`\>

• **\_\_namedParameters.retryableGasOverrides?**: [`TransactionRequestRetryableGasOverrides`](createTokenBridgePrepareSetWethGatewayTransactionRequest.md#transactionrequestretryablegasoverrides)

• **\_\_namedParameters.rollup**: `Address`

• **\_\_namedParameters.tokenBridgeCreatorAddressOverride?**: `any`

Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise`\<`any`\>

#### Source

[createTokenBridgePrepareSetWethGatewayTransactionRequest.ts:95](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts#L95)
