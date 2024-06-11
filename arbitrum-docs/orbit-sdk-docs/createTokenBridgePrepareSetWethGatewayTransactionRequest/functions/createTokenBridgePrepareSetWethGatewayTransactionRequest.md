---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createTokenBridgePrepareSetWethGatewayTransactionRequest()

> **createTokenBridgePrepareSetWethGatewayTransactionRequest**(`params`): `Promise`\<`any`\>

Creates a transaction request to set the WETH gateway on the parent chain
router for the TokenBridge. The request includes gas overrides for retryable
transactions and ensures that the WETH gateway is not already registered.
Returns the prepared transaction request with the chain ID.

## Parameters

• **params**

The parameters for preparing the transaction request

• **params.account**: \`0x$\{string\}\`

The account address

• **params.orbitChainPublicClient**

The orbit chain public client

• **params.parentChainPublicClient**

The parent chain public client

• **params.retryableGasOverrides?**: [`TransactionRequestRetryableGasOverrides`](../type-aliases/TransactionRequestRetryableGasOverrides.md)

Optional gas override options for retryable transactions

• **params.rollup**: \`0x$\{string\}\`

The rollup address

• **params.tokenBridgeCreatorAddressOverride?**: \`0x$\{string\}\`

Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.

## Returns

`Promise`\<`any`\>

The prepared transaction request with the chain ID

## Example

```ts
const transactionRequest = await createTokenBridgePrepareSetWethGatewayTransactionRequest({
  rollup: '0x123...',
  parentChainPublicClient,
  orbitChainPublicClient,
  account: '0xabc...',
  retryableGasOverrides: {
    gasLimit: { base: 1000000n, percentIncrease: 10 },
    maxFeePerGas: { base: 1000000000n, percentIncrease: 20 },
    maxSubmissionCost: { base: 100000000000000n, percentIncrease: 15 }
  },
  tokenBridgeCreatorAddressOverride: '0xdef...'
});
```

## Source

[src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts:122](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts#L122)
