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

[src/arbOwnerReadContract.ts:6](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbOwnerReadContract.ts#L6)

***

### ArbOwnerPublicFunctionName

> **ArbOwnerPublicFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`ArbOwnerPublicAbi`](arbOwnerReadContract.md#arbownerpublicabi)\>

#### Source

[src/arbOwnerReadContract.ts:7](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbOwnerReadContract.ts#L7)

***

### ArbOwnerReadContractParameters\<TFunctionName\>

> **ArbOwnerReadContractParameters**\<`TFunctionName`\>: `object` & `GetFunctionArgs` \<[`ArbOwnerPublicAbi`](arbOwnerReadContract.md#arbownerpublicabi), `TFunctionName`\>

#### Type declaration

##### functionName

> **functionName**: `TFunctionName`

The name of the function to call on the contract.

#### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPublicFunctionName`](arbOwnerReadContract.md#arbownerpublicfunctionname)

#### Source

[src/arbOwnerReadContract.ts:9](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbOwnerReadContract.ts#L9)

***

### ArbOwnerReadContractReturnType\<TFunctionName\>

> **ArbOwnerReadContractReturnType**\<`TFunctionName`\>: `ReadContractReturnType` \<[`ArbOwnerPublicAbi`](arbOwnerReadContract.md#arbownerpublicabi), `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPublicFunctionName`](arbOwnerReadContract.md#arbownerpublicfunctionname)

#### Source

[src/arbOwnerReadContract.ts:16](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbOwnerReadContract.ts#L16)

## Functions

### arbOwnerReadContract()

> **arbOwnerReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`ArbOwnerReadContractReturnType`](arbOwnerReadContract.md#arbownerreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

Reads data from a contract owned by an arbitrary owner.

#### Type parameters

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the blockchain chain.

• **TFunctionName** *extends* `"getAllChainOwners"` \| `"getInfraFeeAccount"` \| `"getNetworkFeeAccount"` \| `"isChainOwner"` \| `"getBrotliCompressionLevel"` \| `"getScheduledUpgrade"` \| `"rectifyChainOwner"`

The name of the function to call on the contract.

#### Parameters

• **client**

The public client to use for reading the contract.

• **params**: [`ArbOwnerReadContractParameters`](arbOwnerReadContract.md#arbownerreadcontractparameterstfunctionname)\<`TFunctionName`\>

The parameters for reading the contract.

#### Returns

`Promise` \<[`ArbOwnerReadContractReturnType`](arbOwnerReadContract.md#arbownerreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

- The result of reading the contract.

#### Source

[src/arbOwnerReadContract.ts:32](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbOwnerReadContract.ts#L32)
