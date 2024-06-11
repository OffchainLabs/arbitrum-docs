---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridge

## Type Aliases

### CreateTokenBridgeParams

> **CreateTokenBridgeParams**: [`WithTokenBridgeCreatorAddressOverride`](types/createTokenBridgeTypes.md#withtokenbridgecreatoraddressoverridet)\<`object`\>

#### Type declaration

##### account

> **account**: `PrivateKeyAccount`

##### gasOverrides?

> `optional` **gasOverrides**: [`TransactionRequestGasOverrides`](utils/gasOverrides.md#transactionrequestgasoverrides)

##### nativeTokenAddress?

> `optional` **nativeTokenAddress**: `Address`

##### orbitChainPublicClient

> **orbitChainPublicClient**: `PublicClient`

##### parentChainPublicClient

> **parentChainPublicClient**: `PublicClient`

##### retryableGasOverrides?

> `optional` **retryableGasOverrides**: [`TransactionRequestRetryableGasOverrides`](createTokenBridgePrepareTransactionRequest.md#transactionrequestretryablegasoverrides)

##### rollupAddress

> **rollupAddress**: `Address`

##### rollupOwner

> **rollupOwner**: `Address`

##### setWethGatewayGasOverrides?

> `optional` **setWethGatewayGasOverrides**: [`TransactionRequestRetryableGasOverrides`](createTokenBridgePrepareSetWethGatewayTransactionRequest.md#transactionrequestretryablegasoverrides)

#### Source

[src/createTokenBridge.ts:40](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridge.ts#L40)

***

### CreateTokenBridgeResults

> **CreateTokenBridgeResults**: `object`

#### Type declaration

##### retryables

> **retryables**: [`WaitForRetryablesResult`](createTokenBridgePrepareTransactionReceipt.md#waitforretryablesresult)

Retryable transaction receipts of createTokenBridgePrepareTransactionReceipt ([WaitForRetryablesResult](createTokenBridgePrepareTransactionReceipt.md#waitforretryablesresult))

##### setWethGateway?

> `optional` **setWethGateway**: `object`

Optional: createTokenBridgePrepareSetWethGatewayTransaction's result

##### setWethGateway.retryables

> **retryables**: [`TransactionReceipt`]

Retryable transaction receipt of createTokenBridgePrepareSetWethGatewayTransactionReceipt ([WaitForRetryablesResult](createTokenBridgePrepareTransactionReceipt.md#waitforretryablesresult))

##### setWethGateway.transaction

> **transaction**: `Transaction`

Transaction of createTokenBridgePrepareSetWethGatewayTransactionReceipt (Transaction)

##### setWethGateway.transactionReceipt

> **transactionReceipt**: [`CreateTokenBridgeSetWethGatewayTransactionReceipt`](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#createtokenbridgesetwethgatewaytransactionreceipt)

Transaction receipt of createTokenBridgePrepareSetWethGatewayTransactionReceipt ([createTokenBridgePrepareSetWethGatewayTransactionReceipt](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#createtokenbridgepreparesetwethgatewaytransactionreceipt))

##### tokenBridgeContracts

> **tokenBridgeContracts**: [`TokenBridgeContracts`](types/TokenBridgeContracts.md#tokenbridgecontracts)

Core token bridge contracts ([TokenBridgeContracts](types/TokenBridgeContracts.md#tokenbridgecontracts))

##### transaction

> **transaction**: `Transaction`

Transaction of createTokenBridgePrepareTransactionRequest

##### transactionReceipt

> **transactionReceipt**: [`CreateTokenBridgeTransactionReceipt`](createTokenBridgePrepareTransactionReceipt.md#createtokenbridgetransactionreceipt)

Transaction receipt of createTokenBridgePrepareTransactionReceipt ([CreateTokenBridgeTransactionReceipt](createTokenBridgePrepareTransactionReceipt.md#createtokenbridgetransactionreceipt))

#### Source

[src/createTokenBridge.ts:51](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridge.ts#L51)

## Functions

### createTokenBridge()

> **createTokenBridge**(`createTokenBridgeParams`): `Promise` \<[`CreateTokenBridgeResults`](createTokenBridge.md#createtokenbridgeresults)\>

Performs the transactions to deploy the token bridge core contracts

For chain with custom gas token, it checks the custom gas token allowance
token allowance and approve if necessary.

Returns the token bridge core contracts.

#### Parameters

• **createTokenBridgeParams**: [`CreateTokenBridgeParams`](createTokenBridge.md#createtokenbridgeparams)

The parameters for creating the token bridge

#### Returns

`Promise` \<[`CreateTokenBridgeResults`](createTokenBridge.md#createtokenbridgeresults)\>

- The result of the token bridge creation

#### Example

```ts
const tokenBridgeCreator = await deployTokenBridgeCreator({
  publicClient: l2Client,
});

const tokenBridgeContracts = await createTokenBridge({
  rollupOwner: rollupOwner.address,
  rollupAddress: rollupAddress,
  account: deployer,
  parentChainPublicClient: l1Client,
  orbitChainPublicClient: l2Client,
  tokenBridgeCreatorAddressOverride: tokenBridgeCreator,
  gasOverrides: {
    gasLimit: {
      base: 6_000_000n,
    },
  },
  retryableGasOverrides: {
    maxGasForFactory: {
      base: 20_000_000n,
    },
    maxGasForContracts: {
      base: 20_000_000n,
    },
    maxSubmissionCostForFactory: {
      base: 4_000_000_000_000n,
    },
    maxSubmissionCostForContracts: {
      base: 4_000_000_000_000n,
    },
  },
  setWethGatewayGasOverrides: {
    gasLimit: {
      base: 100_000n,
    },
  },
});
```

#### Source

[src/createTokenBridge.ts:147](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridge.ts#L147)
