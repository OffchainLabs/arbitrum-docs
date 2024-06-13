---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridge

## Type Aliases

### CreateTokenBridgeParams\<TParentChain, TOrbitChain\>

> **CreateTokenBridgeParams**\<`TParentChain`, `TOrbitChain`\>: [`WithTokenBridgeCreatorAddressOverride`](types/createTokenBridgeTypes.md#withtokenbridgecreatoraddressoverridet)\<`object`\>

#### Type declaration

##### account

> **account**: [`mainnet`](chains.md#mainnet)

##### gasOverrides?

> `optional` **gasOverrides**: [`TransactionRequestGasOverrides`](utils/gasOverrides.md#transactionrequestgasoverrides)

##### nativeTokenAddress?

> `optional` **nativeTokenAddress**: [`mainnet`](chains.md#mainnet)

##### orbitChainPublicClient

> **orbitChainPublicClient**: [`mainnet`](chains.md#mainnet) \<[`mainnet`](chains.md#mainnet), `TOrbitChain`\>

##### parentChainPublicClient

> **parentChainPublicClient**: [`mainnet`](chains.md#mainnet) \<[`mainnet`](chains.md#mainnet), `TParentChain`\>

##### retryableGasOverrides?

> `optional` **retryableGasOverrides**: [`TransactionRequestRetryableGasOverrides`](createTokenBridgePrepareTransactionRequest.md#transactionrequestretryablegasoverrides)

##### rollupAddress

> **rollupAddress**: [`mainnet`](chains.md#mainnet)

##### rollupOwner

> **rollupOwner**: [`mainnet`](chains.md#mainnet)

##### setWethGatewayGasOverrides?

> `optional` **setWethGatewayGasOverrides**: [`TransactionRequestRetryableGasOverrides`](createTokenBridgePrepareSetWethGatewayTransactionRequest.md#transactionrequestretryablegasoverrides)

#### Type parameters

• **TParentChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

• **TOrbitChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Source

[createTokenBridge.ts:41](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridge.ts#L41)

***

### CreateTokenBridgeResults\<TParentChain, TOrbitChain\>

> **CreateTokenBridgeResults**\<`TParentChain`, `TOrbitChain`\>: `object`

#### Type parameters

• **TParentChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

• **TOrbitChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Type declaration

##### retryables

> **retryables**: [`WaitForRetryablesResult`](createTokenBridgePrepareTransactionReceipt.md#waitforretryablesresult)

Retryable transaction receipts of createTokenBridgePrepareTransactionReceipt ([WaitForRetryablesResult](createTokenBridgePrepareTransactionReceipt.md#waitforretryablesresult))

##### setWethGateway?

> `optional` **setWethGateway**: `object`

Optional: createTokenBridgePrepareSetWethGatewayTransaction's result

##### setWethGateway.retryables

> **retryables**: [[`mainnet`](chains.md#mainnet)]

Retryable transaction receipt of createTokenBridgePrepareSetWethGatewayTransactionReceipt ([WaitForRetryablesResult](createTokenBridgePrepareTransactionReceipt.md#waitforretryablesresult))

##### setWethGateway.transaction

> **transaction**: [`mainnet`](chains.md#mainnet)

Transaction of createTokenBridgePrepareSetWethGatewayTransactionReceipt ([Transaction](chains.md#mainnet))

##### setWethGateway.transactionReceipt

> **transactionReceipt**: [`CreateTokenBridgeSetWethGatewayTransactionReceipt`](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#createtokenbridgesetwethgatewaytransactionreceipttchain)\<`TOrbitChain`\>

Transaction receipt of createTokenBridgePrepareSetWethGatewayTransactionReceipt ([createTokenBridgePrepareSetWethGatewayTransactionReceipt](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#createtokenbridgepreparesetwethgatewaytransactionreceipt))

##### tokenBridgeContracts

> **tokenBridgeContracts**: [`TokenBridgeContracts`](types/TokenBridgeContracts.md#tokenbridgecontracts)

Core token bridge contracts ([TokenBridgeContracts](types/TokenBridgeContracts.md#tokenbridgecontracts))

##### transaction

> **transaction**: [`mainnet`](chains.md#mainnet)

Transaction of createTokenBridgePrepareTransactionRequest

##### transactionReceipt

> **transactionReceipt**: [`CreateTokenBridgeTransactionReceipt`](createTokenBridgePrepareTransactionReceipt.md#createtokenbridgetransactionreceipttparentchaintorbitchain)\<`TParentChain`, `TOrbitChain`\>

Transaction receipt of createTokenBridgePrepareTransactionReceipt ([CreateTokenBridgeTransactionReceipt](createTokenBridgePrepareTransactionReceipt.md#createtokenbridgetransactionreceipttparentchaintorbitchain))

#### Source

[createTokenBridge.ts:56](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridge.ts#L56)

## Functions

### createTokenBridge()

> **createTokenBridge**\<`TParentChain`, `TOrbitChain`\>(`createTokenBridgeParams`): `Promise` \<[`CreateTokenBridgeResults`](createTokenBridge.md#createtokenbridgeresultstparentchaintorbitchain)\<`TParentChain`, `TOrbitChain`\>\>

Performs the transactions to deploy the token bridge core contracts

For chain with custom gas token, it checks the custom gas token allowance
token allowance and approve if necessary.

Returns the token bridge core contracts.

#### Type parameters

• **TParentChain** *extends* `unknown`

• **TOrbitChain** *extends* `unknown`

#### Parameters

• **createTokenBridgeParams**: [`CreateTokenBridgeParams`](createTokenBridge.md#createtokenbridgeparamstparentchaintorbitchain)\<`TParentChain`, `TOrbitChain`\>

#### Returns

`Promise` \<[`CreateTokenBridgeResults`](createTokenBridge.md#createtokenbridgeresultstparentchaintorbitchain)\<`TParentChain`, `TOrbitChain`\>\>

Promise<[CreateTokenBridgeResults](createTokenBridge.md#createtokenbridgeresultstparentchaintorbitchain)>

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

[createTokenBridge.ts:160](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridge.ts#L160)
