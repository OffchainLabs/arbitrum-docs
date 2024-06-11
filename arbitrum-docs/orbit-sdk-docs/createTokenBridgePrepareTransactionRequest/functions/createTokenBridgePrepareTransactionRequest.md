---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createTokenBridgePrepareTransactionRequest()

> **createTokenBridgePrepareTransactionRequest**(`createTokenBridgePrepareTransactionRequestParams`): `Promise`\<`any`\>

Creates a transaction request to prepare token bridge creation on the parent
chain. Returns the prepared transaction request along with the chain ID.

## Parameters

• **createTokenBridgePrepareTransactionRequestParams**

The parameters for preparing the transaction request.

• **createTokenBridgePrepareTransactionRequestParams.account**: \`0x$\{string\}\`

The account address.

• **createTokenBridgePrepareTransactionRequestParams.gasOverrides?**: [`TransactionRequestGasOverrides`](../../utils/gasOverrides/type-aliases/TransactionRequestGasOverrides.md)

Optional gas overrides for the transaction request.

• **createTokenBridgePrepareTransactionRequestParams.orbitChainPublicClient**

The public client for the orbit chain.

• **createTokenBridgePrepareTransactionRequestParams.params**

The parameters for the token bridge creation.

• **createTokenBridgePrepareTransactionRequestParams.params.rollup**: \`0x$\{string\}\`

• **createTokenBridgePrepareTransactionRequestParams.params.rollupOwner**: \`0x$\{string\}\`

• **createTokenBridgePrepareTransactionRequestParams.parentChainPublicClient**

The public client for the parent chain.

• **createTokenBridgePrepareTransactionRequestParams.retryableGasOverrides?**: [`TransactionRequestRetryableGasOverrides`](../type-aliases/TransactionRequestRetryableGasOverrides.md)

Optional gas overrides for retryable transactions.

• **createTokenBridgePrepareTransactionRequestParams.tokenBridgeCreatorAddressOverride?**: \`0x$\{string\}\`

Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.

## Returns

`Promise`\<`any`\>

The prepared transaction request and the chain ID.

## Example

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

## Source

[src/createTokenBridgePrepareTransactionRequest.ts:63](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridgePrepareTransactionRequest.ts#L63)
