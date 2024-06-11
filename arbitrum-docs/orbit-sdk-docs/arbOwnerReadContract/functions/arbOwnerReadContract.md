---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: arbOwnerReadContract()

> **arbOwnerReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`ArbOwnerReadContractReturnType`](../type-aliases/ArbOwnerReadContractReturnType.md)\<`TFunctionName`\>\>

Reads data from a contract owned by an arbitrary owner.

## Type parameters

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the blockchain chain.

• **TFunctionName** *extends* `"getAllChainOwners"` \| `"getInfraFeeAccount"` \| `"getNetworkFeeAccount"` \| `"isChainOwner"` \| `"getBrotliCompressionLevel"` \| `"getScheduledUpgrade"` \| `"rectifyChainOwner"`

The name of the function to call on the contract.

## Parameters

• **client**

The public client to use for reading the contract.

• **params**: [`ArbOwnerReadContractParameters`](../type-aliases/ArbOwnerReadContractParameters.md)\<`TFunctionName`\>

The parameters for reading the contract.

## Returns

`Promise` \<[`ArbOwnerReadContractReturnType`](../type-aliases/ArbOwnerReadContractReturnType.md)\<`TFunctionName`\>\>

- The result of reading the contract.

## Source

[src/arbOwnerReadContract.ts:32](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/arbOwnerReadContract.ts#L32)
