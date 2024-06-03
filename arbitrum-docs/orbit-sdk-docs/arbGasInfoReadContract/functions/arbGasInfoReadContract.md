---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbGasInfoReadContract<TChain, TFunctionName>(client: object, params: ArbGasInfoReadContractParameters<TFunctionName>): Promise<ArbGasInfoReadContractReturnType<TFunctionName>>
```

Reads data from the ArbGasInfo contract on a specified chain and returns the
result.

## Type parameters

| Type parameter |
| :------ |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |
| `TFunctionName` *extends* 
  \| `"getAmortizedCostCapBips"`
  \| `"getCurrentTxL1GasFees"`
  \| `"getGasAccountingParams"`
  \| `"getGasBacklog"`
  \| `"getGasBacklogTolerance"`
  \| `"getL1BaseFeeEstimate"`
  \| `"getL1BaseFeeEstimateInertia"`
  \| `"getL1FeesAvailable"`
  \| `"getL1GasPriceEstimate"`
  \| `"getL1PricingEquilibrationUnits"`
  \| `"getL1PricingFundsDueForRewards"`
  \| `"getL1PricingSurplus"`
  \| `"getL1PricingUnitsSinceUpdate"`
  \| `"getL1RewardRate"`
  \| `"getL1RewardRecipient"`
  \| `"getLastL1PricingSurplus"`
  \| `"getLastL1PricingUpdateTime"`
  \| `"getMinimumGasPrice"`
  \| `"getPerBatchGasCharge"`
  \| `"getPricesInArbGas"`
  \| `"getPricesInArbGasWithAggregator"`
  \| `"getPricesInWei"`
  \| `"getPricesInWeiWithAggregator"`
  \| `"getPricingInertia"` |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |
| `params` | `ArbGasInfoReadContractParameters`\<`TFunctionName`\> |

## Returns

`Promise`\<`ArbGasInfoReadContractReturnType`\<`TFunctionName`\>\>

## Source

[src/arbGasInfoReadContract.ts:20](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/arbGasInfoReadContract.ts#L20)
