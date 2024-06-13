---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgeFetchTokenBridgeContracts

## Type Aliases

### CreateTokenBridgeFetchTokenBridgeContractsParams\<TChain\>

> **CreateTokenBridgeFetchTokenBridgeContractsParams**\<`TChain`\>: [`Prettify`](types/utils.md#prettifyt) \<[`WithTokenBridgeCreatorAddressOverride`](types/createTokenBridgeTypes.md#withtokenbridgecreatoraddressoverridet)\<`object`\>\>

#### Type parameters

• **TChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Source

[createTokenBridgeFetchTokenBridgeContracts.ts:10](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgeFetchTokenBridgeContracts.ts#L10)

## Functions

### createTokenBridgeFetchTokenBridgeContracts()

> **createTokenBridgeFetchTokenBridgeContracts**\<`TChain`\>(`__namedParameters`): `Promise` \<[`TokenBridgeContracts`](types/TokenBridgeContracts.md#tokenbridgecontracts)\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.inbox**: `Address`

• **\_\_namedParameters.parentChainPublicClient**: `PublicClient`\<`Transport`, `TChain`\>

• **\_\_namedParameters.tokenBridgeCreatorAddressOverride?**: `any`

Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise` \<[`TokenBridgeContracts`](types/TokenBridgeContracts.md#tokenbridgecontracts)\>

#### Source

[createTokenBridgeFetchTokenBridgeContracts.ts:18](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgeFetchTokenBridgeContracts.ts#L18)
