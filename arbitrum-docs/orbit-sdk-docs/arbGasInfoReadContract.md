---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# arbGasInfoReadContract

## Type Aliases

### ArbGasInfoAbi

> **ArbGasInfoAbi**: *typeof* [`abi`](contracts.md#abi-1)

#### Source

[src/arbGasInfoReadContract.ts:6](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbGasInfoReadContract.ts#L6)

***

### ArbGasInfoFunctionName

> **ArbGasInfoFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`ArbGasInfoAbi`](arbGasInfoReadContract.md#arbgasinfoabi)\>

#### Source

[src/arbGasInfoReadContract.ts:7](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbGasInfoReadContract.ts#L7)

***

### ArbGasInfoReadContractParameters\<TFunctionName\>

> **ArbGasInfoReadContractParameters**\<`TFunctionName`\>: `object` & `GetFunctionArgs` \<[`ArbGasInfoAbi`](arbGasInfoReadContract.md#arbgasinfoabi), `TFunctionName`\>

#### Type declaration

##### functionName

> **functionName**: `TFunctionName`

The name of the function to be called on the ArbGasInfo contract.

#### Type parameters

• **TFunctionName** *extends* [`ArbGasInfoFunctionName`](arbGasInfoReadContract.md#arbgasinfofunctionname)

#### Source

[src/arbGasInfoReadContract.ts:9](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbGasInfoReadContract.ts#L9)

***

### ArbGasInfoReadContractReturnType\<TFunctionName\>

> **ArbGasInfoReadContractReturnType**\<`TFunctionName`\>: `ReadContractReturnType` \<[`ArbGasInfoAbi`](arbGasInfoReadContract.md#arbgasinfoabi), `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbGasInfoFunctionName`](arbGasInfoReadContract.md#arbgasinfofunctionname)

#### Source

[src/arbGasInfoReadContract.ts:16](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbGasInfoReadContract.ts#L16)

## Functions

### arbGasInfoReadContract()

> **arbGasInfoReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`ArbGasInfoReadContractReturnType`](arbGasInfoReadContract.md#arbgasinforeadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

Reads data from the ArbGasInfo contract on a specified chain and returns the
result.

#### Type parameters

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the chain, can be a specific chain or undefined.

• **TFunctionName** *extends* `"getAmortizedCostCapBips"` \| `"getCurrentTxL1GasFees"` \| `"getGasAccountingParams"` \| `"getGasBacklog"` \| `"getGasBacklogTolerance"` \| `"getL1BaseFeeEstimate"` \| `"getL1BaseFeeEstimateInertia"` \| `"getL1FeesAvailable"` \| `"getL1GasPriceEstimate"` \| `"getL1PricingEquilibrationUnits"` \| `"getL1PricingFundsDueForRewards"` \| `"getL1PricingSurplus"` \| `"getL1PricingUnitsSinceUpdate"` \| `"getL1RewardRate"` \| `"getL1RewardRecipient"` \| `"getLastL1PricingSurplus"` \| `"getLastL1PricingUpdateTime"` \| `"getMinimumGasPrice"` \| `"getPerBatchGasCharge"` \| `"getPricesInArbGas"` \| `"getPricesInArbGasWithAggregator"` \| `"getPricesInWei"` \| `"getPricesInWeiWithAggregator"` \| `"getPricingInertia"`

The name of the function to be called on the ArbGasInfo contract.

#### Parameters

• **client**

The public client to interact with the blockchain.

• **params**: [`ArbGasInfoReadContractParameters`](arbGasInfoReadContract.md#arbgasinforeadcontractparameterstfunctionname)\<`TFunctionName`\>

The parameters for reading the contract.

#### Returns

`Promise` \<[`ArbGasInfoReadContractReturnType`](arbGasInfoReadContract.md#arbgasinforeadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

- The result of the contract call.

#### Source

[src/arbGasInfoReadContract.ts:33](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbGasInfoReadContract.ts#L33)
