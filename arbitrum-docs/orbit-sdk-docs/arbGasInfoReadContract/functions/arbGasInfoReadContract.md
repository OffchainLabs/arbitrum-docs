---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: arbGasInfoReadContract()

> **arbGasInfoReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`ArbGasInfoReadContractReturnType`](../type-aliases/ArbGasInfoReadContractReturnType.md)\<`TFunctionName`\>\>

Reads data from the ArbGasInfo contract on a specified chain and returns the
result.

## Type parameters

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the chain, can be a specific chain or undefined.

• **TFunctionName** *extends* `"getAmortizedCostCapBips"` \| `"getCurrentTxL1GasFees"` \| `"getGasAccountingParams"` \| `"getGasBacklog"` \| `"getGasBacklogTolerance"` \| `"getL1BaseFeeEstimate"` \| `"getL1BaseFeeEstimateInertia"` \| `"getL1FeesAvailable"` \| `"getL1GasPriceEstimate"` \| `"getL1PricingEquilibrationUnits"` \| `"getL1PricingFundsDueForRewards"` \| `"getL1PricingSurplus"` \| `"getL1PricingUnitsSinceUpdate"` \| `"getL1RewardRate"` \| `"getL1RewardRecipient"` \| `"getLastL1PricingSurplus"` \| `"getLastL1PricingUpdateTime"` \| `"getMinimumGasPrice"` \| `"getPerBatchGasCharge"` \| `"getPricesInArbGas"` \| `"getPricesInArbGasWithAggregator"` \| `"getPricesInWei"` \| `"getPricesInWeiWithAggregator"` \| `"getPricingInertia"`

The name of the function to be called on the ArbGasInfo contract.

## Parameters

• **client**

The public client to interact with the blockchain.

• **params**: [`ArbGasInfoReadContractParameters`](../type-aliases/ArbGasInfoReadContractParameters.md)\<`TFunctionName`\>

The parameters for reading the contract.

## Returns

`Promise` \<[`ArbGasInfoReadContractReturnType`](../type-aliases/ArbGasInfoReadContractReturnType.md)\<`TFunctionName`\>\>

- The result of the contract call.

## Source

[src/arbGasInfoReadContract.ts:33](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/arbGasInfoReadContract.ts#L33)
