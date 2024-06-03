---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbOwnerReadContract<TChain, TFunctionName>(client: object, params: ArbOwnerReadContractParameters<TFunctionName>): Promise<ArbOwnerReadContractReturnType<TFunctionName>>
```

Reads data from a contract owned by an arbitrary owner.

## Type parameters

| Type parameter |
| :------ |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |
| `TFunctionName` *extends* 
  \| `"getAllChainOwners"`
  \| `"getInfraFeeAccount"`
  \| `"getNetworkFeeAccount"`
  \| `"isChainOwner"`
  \| `"getBrotliCompressionLevel"`
  \| `"getScheduledUpgrade"`
  \| `"rectifyChainOwner"` |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |
| `params` | `ArbOwnerReadContractParameters`\<`TFunctionName`\> |

## Returns

`Promise`\<`ArbOwnerReadContractReturnType`\<`TFunctionName`\>\>

## Source

[src/arbOwnerReadContract.ts:17](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/arbOwnerReadContract.ts#L17)
