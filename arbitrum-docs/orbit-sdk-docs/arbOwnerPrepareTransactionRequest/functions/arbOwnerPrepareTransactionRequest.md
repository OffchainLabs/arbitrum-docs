---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbOwnerPrepareTransactionRequest<TFunctionName, TChain>(client: object, params: ArbOwnerPrepareTransactionRequestParameters<TFunctionName>): Promise<any>
```

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* 
  \| `"addChainOwner"`
  \| `"getAllChainOwners"`
  \| `"getInfraFeeAccount"`
  \| `"getNetworkFeeAccount"`
  \| `"isChainOwner"`
  \| `"releaseL1PricerSurplusFunds"`
  \| `"removeChainOwner"`
  \| `"scheduleArbOSUpgrade"`
  \| `"setAmortizedCostCapBips"`
  \| `"setBrotliCompressionLevel"`
  \| `"setChainConfig"`
  \| `"setInfraFeeAccount"`
  \| `"setL1BaseFeeEstimateInertia"`
  \| `"setL1PricePerUnit"`
  \| `"setL1PricingEquilibrationUnits"`
  \| `"setL1PricingInertia"`
  \| `"setL1PricingRewardRate"`
  \| `"setL1PricingRewardRecipient"`
  \| `"setL2BaseFee"`
  \| `"setL2GasBacklogTolerance"`
  \| `"setL2GasPricingInertia"`
  \| `"setMaxTxGasLimit"`
  \| `"setMinimumL2BaseFee"`
  \| `"setNetworkFeeAccount"`
  \| `"setPerBatchGasCharge"`
  \| `"setSpeedLimit"` |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |
| `params` | [`ArbOwnerPrepareTransactionRequestParameters`](../type-aliases/ArbOwnerPrepareTransactionRequestParameters.md)\<`TFunctionName`\> |

## Returns

`Promise`\<`any`\>

## Source

[src/arbOwnerPrepareTransactionRequest.ts:70](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/arbOwnerPrepareTransactionRequest.ts#L70)
