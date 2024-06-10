---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbGasInfoReadContract<TChain, TFunctionName>(client: object, params: ArbGasInfoReadContractParameters<TFunctionName>): Promise<ArbGasInfoReadContractReturnType<TFunctionName>>
```

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
| `params` | [`ArbGasInfoReadContractParameters`](../type-aliases/ArbGasInfoReadContractParameters.md)\<`TFunctionName`\> |

## Returns

`Promise` \<[`ArbGasInfoReadContractReturnType`](../type-aliases/ArbGasInfoReadContractReturnType.md)\<`TFunctionName`\>\>

## Source

[src/arbGasInfoReadContract.ts:16](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/arbGasInfoReadContract.ts#L16)
