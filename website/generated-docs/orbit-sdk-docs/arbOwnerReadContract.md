---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# arbOwnerReadContract

## Type Aliases

### ArbOwnerPublicAbi

> **ArbOwnerPublicAbi**: *typeof* [`abi`](contracts.md#abi-3)

#### Source

[arbOwnerReadContract.ts:6](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbOwnerReadContract.ts#L6)

***

### ArbOwnerPublicFunctionName

> **ArbOwnerPublicFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`ArbOwnerPublicAbi`](arbOwnerReadContract.md#arbownerpublicabi)\>

#### Source

[arbOwnerReadContract.ts:7](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbOwnerReadContract.ts#L7)

***

### ArbOwnerReadContractParameters\<TFunctionName\>

> **ArbOwnerReadContractParameters**\<`TFunctionName`\>: `object` & [`mainnet`](chains.md#mainnet) \<[`ArbOwnerPublicAbi`](arbOwnerReadContract.md#arbownerpublicabi), `TFunctionName`\>

#### Type declaration

##### functionName

> **functionName**: `TFunctionName`

#### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPublicFunctionName`](arbOwnerReadContract.md#arbownerpublicfunctionname)

#### Source

[arbOwnerReadContract.ts:9](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbOwnerReadContract.ts#L9)

***

### ArbOwnerReadContractReturnType\<TFunctionName\>

> **ArbOwnerReadContractReturnType**\<`TFunctionName`\>: [`mainnet`](chains.md#mainnet) \<[`ArbOwnerPublicAbi`](arbOwnerReadContract.md#arbownerpublicabi), `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPublicFunctionName`](arbOwnerReadContract.md#arbownerpublicfunctionname)

#### Source

[arbOwnerReadContract.ts:13](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbOwnerReadContract.ts#L13)

## Functions

### arbOwnerReadContract()

> **arbOwnerReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`ArbOwnerReadContractReturnType`](arbOwnerReadContract.md#arbownerreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Type parameters

• **TChain** *extends* `unknown`

• **TFunctionName** *extends* `"getAllChainOwners"` \| `"getInfraFeeAccount"` \| `"getNetworkFeeAccount"` \| `"isChainOwner"` \| `"getBrotliCompressionLevel"` \| `"getScheduledUpgrade"` \| `"rectifyChainOwner"`

#### Parameters

• **client**: `PublicClient`\<`Transport`, `TChain`\>

• **params**: `any`

#### Returns

`Promise` \<[`ArbOwnerReadContractReturnType`](arbOwnerReadContract.md#arbownerreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[arbOwnerReadContract.ts:16](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbOwnerReadContract.ts#L16)
