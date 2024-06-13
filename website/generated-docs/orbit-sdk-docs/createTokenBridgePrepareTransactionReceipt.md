---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgePrepareTransactionReceipt

## Type Aliases

### CreateTokenBridgeTransactionReceipt\<TParentChain, TOrbitChain\>

> **CreateTokenBridgeTransactionReceipt**\<`TParentChain`, `TOrbitChain`\>: [`mainnet`](chains.md#mainnet) & `object`

#### Type declaration

##### getTokenBridgeContracts()

###### Parameters

• **parentChainPublicClient**: `GetTokenBridgeContractsParameters`\<`TParentChain`\>

###### Returns

`Promise` \<[`TokenBridgeContracts`](types/TokenBridgeContracts.md#tokenbridgecontracts)\>

##### waitForRetryables()

###### Parameters

• **params**: [`WaitForRetryablesParameters`](createTokenBridgePrepareTransactionReceipt.md#waitforretryablesparameterstorbitchain)\<`TOrbitChain`\>

###### Returns

`Promise` \<[`WaitForRetryablesResult`](createTokenBridgePrepareTransactionReceipt.md#waitforretryablesresult)\>

#### Type parameters

• **TParentChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

• **TOrbitChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Source

[createTokenBridgePrepareTransactionReceipt.ts:62](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareTransactionReceipt.ts#L62)

***

### WaitForRetryablesParameters\<TOrbitChain\>

> **WaitForRetryablesParameters**\<`TOrbitChain`\>: `object`

#### Type parameters

• **TOrbitChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Type declaration

##### orbitPublicClient

> **orbitPublicClient**: [`mainnet`](chains.md#mainnet) \<[`mainnet`](chains.md#mainnet), `TOrbitChain`\>

#### Source

[createTokenBridgePrepareTransactionReceipt.ts:52](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareTransactionReceipt.ts#L52)

***

### WaitForRetryablesResult

> **WaitForRetryablesResult**: [[`mainnet`](chains.md#mainnet), [`mainnet`](chains.md#mainnet)]

#### Source

[createTokenBridgePrepareTransactionReceipt.ts:56](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareTransactionReceipt.ts#L56)

## Functions

### createTokenBridgePrepareTransactionReceipt()

> **createTokenBridgePrepareTransactionReceipt**\<`TParentChain`, `TOrbitChain`\>(`txReceipt`): [`CreateTokenBridgeTransactionReceipt`](createTokenBridgePrepareTransactionReceipt.md#createtokenbridgetransactionreceipttparentchaintorbitchain)\<`TParentChain`, `TOrbitChain`\>

#### Type parameters

• **TParentChain** *extends* `unknown`

• **TOrbitChain** *extends* `unknown`

#### Parameters

• **txReceipt**: `TransactionReceipt`

#### Returns

[`CreateTokenBridgeTransactionReceipt`](createTokenBridgePrepareTransactionReceipt.md#createtokenbridgetransactionreceipttparentchaintorbitchain)\<`TParentChain`, `TOrbitChain`\>

#### Source

[createTokenBridgePrepareTransactionReceipt.ts:74](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareTransactionReceipt.ts#L74)
