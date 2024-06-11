---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupPrepareTransactionRequest

## Type Aliases

### CreateRollupPrepareTransactionRequestParams

> **CreateRollupPrepareTransactionRequestParams**: [`Prettify`](types/utils.md#prettifyt) \<[`WithRollupCreatorAddressOverride`](types/createRollupTypes.md#withrollupcreatoraddressoverridet)\<`object`\>\>

#### Source

[src/createRollupPrepareTransactionRequest.ts:30](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareTransactionRequest.ts#L30)

## Functions

### createRollupPrepareTransactionRequest()

> **createRollupPrepareTransactionRequest**(`createRollupPrepareTransactionRequestParams`): `Promise`\<`any`\>

Prepares a transaction request to create a rollup chain on the specified
parent chain. The function validates the input parameters, including the
batch poster address and validator addresses, and checks if the native token
is allowed based on the chain configuration. It then encodes the function
data using the rollup creator ABI and prepares the transaction request with
the necessary data, value, and gas limits. Returns the prepared transaction
request along with the chain ID.

#### Parameters

• **createRollupPrepareTransactionRequestParams**

The parameters for preparing the transaction request

• **createRollupPrepareTransactionRequestParams.account**: \`0x$\{string\}\`

The account address

• **createRollupPrepareTransactionRequestParams.gasOverrides?**: [`TransactionRequestGasOverrides`](utils/gasOverrides.md#transactionrequestgasoverrides)

Optional gas overrides for the transaction request

• **createRollupPrepareTransactionRequestParams.params**: [`CreateRollupParams`](types/createRollupTypes.md#createrollupparams)

The parameters for creating the rollup

• **createRollupPrepareTransactionRequestParams.publicClient**

The public client

• **createRollupPrepareTransactionRequestParams.rollupCreatorAddressOverride?**: \`0x$\{string\}\`

Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise`\<`any`\>

The prepared transaction request and the chain ID

#### Throws

If the batch poster address or validator addresses are invalid, or if the native token is not allowed

#### Example

```ts
const transactionRequest = await createRollupPrepareTransactionRequest({
  params: createRollupParams,
  account: '0xYourAccountAddress',
  publicClient: yourPublicClientInstance,
  gasOverrides: { gasLimit: { base: 500000, percentIncrease: 20 } },
  rollupCreatorAddressOverride: '0xOverrideAddress',
});
```

#### Source

[src/createRollupPrepareTransactionRequest.ts:67](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareTransactionRequest.ts#L67)
