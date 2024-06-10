---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbOwnerReadContract<TChain, TFunctionName>(client: object, params: ArbOwnerReadContractParameters<TFunctionName>): Promise<ArbOwnerReadContractReturnType<TFunctionName>>
```

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
| `params` | [`ArbOwnerReadContractParameters`](../type-aliases/ArbOwnerReadContractParameters.md)\<`TFunctionName`\> |

## Returns

`Promise` \<[`ArbOwnerReadContractReturnType`](../type-aliases/ArbOwnerReadContractReturnType.md)\<`TFunctionName`\>\>

## Source

[src/arbOwnerReadContract.ts:16](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/arbOwnerReadContract.ts#L16)
