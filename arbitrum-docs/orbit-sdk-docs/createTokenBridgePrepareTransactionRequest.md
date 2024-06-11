---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgePrepareTransactionRequest

## Type Aliases

### CreateTokenBridgePrepareTransactionRequestParams

> **CreateTokenBridgePrepareTransactionRequestParams**: [`Prettify`](types/utils.md#prettifyt) \<[`WithTokenBridgeCreatorAddressOverride`](types/createTokenBridgeTypes.md#withtokenbridgecreatoraddressoverridet)\<`object`\>\>

#### Source

[src/createTokenBridgePrepareTransactionRequest.ts:25](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareTransactionRequest.ts#L25)

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

[src/createTokenBridgePrepareTransactionRequest.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareTransactionRequest.ts#L17)

## Functions

### createTokenBridgePrepareTransactionRequest()

> **createTokenBridgePrepareTransactionRequest**(`createTokenBridgePrepareTransactionRequestParams`): `Promise`\<`any`\>

Creates a transaction request to prepare token bridge creation on the parent
chain. Returns the prepared transaction request along with the chain ID.

#### Parameters

• **createTokenBridgePrepareTransactionRequestParams**

The parameters for preparing the transaction request.

• **createTokenBridgePrepareTransactionRequestParams.account**: \`0x$\{string\}\`

The account address.

• **createTokenBridgePrepareTransactionRequestParams.gasOverrides?**: [`TransactionRequestGasOverrides`](utils/gasOverrides.md#transactionrequestgasoverrides)

Optional gas overrides for the transaction request.

• **createTokenBridgePrepareTransactionRequestParams.orbitChainPublicClient**

The public client for the orbit chain.

• **createTokenBridgePrepareTransactionRequestParams.params**

The parameters for the token bridge creation.

• **createTokenBridgePrepareTransactionRequestParams.params.rollup**: \`0x$\{string\}\`

• **createTokenBridgePrepareTransactionRequestParams.params.rollupOwner**: \`0x$\{string\}\`

• **createTokenBridgePrepareTransactionRequestParams.parentChainPublicClient**

The public client for the parent chain.

• **createTokenBridgePrepareTransactionRequestParams.retryableGasOverrides?**: [`TransactionRequestRetryableGasOverrides`](createTokenBridgePrepareTransactionRequest.md#transactionrequestretryablegasoverrides)

Optional gas overrides for retryable transactions.

• **createTokenBridgePrepareTransactionRequestParams.tokenBridgeCreatorAddressOverride?**: \`0x$\{string\}\`

Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise`\<`any`\>

The prepared transaction request and the chain ID.

#### Example

```ts
const { request, chainId } = await createTokenBridgePrepareTransactionRequest({
  params: { rollup: '0x...', rollupOwner: '0x...' },
  parentChainPublicClient,
  orbitChainPublicClient,
  account: '0x...',
  gasOverrides: { gasLimit: { base: 21000n, percentIncrease: 20 } },
  retryableGasOverrides: { maxSubmissionCostForFactory: { base: 1000n, percentIncrease: 10 } },
});
```

#### Source

[src/createTokenBridgePrepareTransactionRequest.ts:63](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareTransactionRequest.ts#L63)
