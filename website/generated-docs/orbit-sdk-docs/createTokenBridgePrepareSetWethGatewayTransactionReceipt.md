---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgePrepareSetWethGatewayTransactionReceipt

## Type Aliases

### CreateTokenBridgeSetWethGatewayTransactionReceipt\<TChain\>

> **CreateTokenBridgeSetWethGatewayTransactionReceipt**\<`TChain`\>: [`mainnet`](chains.md#mainnet) & `object`

#### Type declaration

##### waitForRetryables()

###### Parameters

• **params**: [`WaitForRetryablesParameters`](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#waitforretryablesparameterstchain)\<`TChain`\>

###### Returns

`Promise` \<[`WaitForRetryablesResult`](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#waitforretryablesresult)\>

#### Type parameters

• **TChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Source

[createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:20](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L20)

***

### WaitForRetryablesParameters\<TChain\>

> **WaitForRetryablesParameters**\<`TChain`\>: `object`

#### Type parameters

• **TChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Type declaration

##### orbitPublicClient

> **orbitPublicClient**: [`mainnet`](chains.md#mainnet) \<[`mainnet`](chains.md#mainnet), `TChain`\>

#### Source

[createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:14](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L14)

***

### WaitForRetryablesResult

> **WaitForRetryablesResult**: [[`mainnet`](chains.md#mainnet)]

#### Source

[createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:18](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L18)

## Functions

### createTokenBridgePrepareSetWethGatewayTransactionReceipt()

> **createTokenBridgePrepareSetWethGatewayTransactionReceipt**\<`TChain`\>(`txReceipt`): [`CreateTokenBridgeSetWethGatewayTransactionReceipt`](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#createtokenbridgesetwethgatewaytransactionreceipttchain)\<`TChain`\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **txReceipt**: `TransactionReceipt`

#### Returns

[`CreateTokenBridgeSetWethGatewayTransactionReceipt`](createTokenBridgePrepareSetWethGatewayTransactionReceipt.md#createtokenbridgesetwethgatewaytransactionreceipttchain)\<`TChain`\>

#### Source

[createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:27](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L27)
