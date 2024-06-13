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

[arbGasInfoReadContract.ts:6](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbGasInfoReadContract.ts#L6)

***

### ArbGasInfoFunctionName

> **ArbGasInfoFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi) \<[`ArbGasInfoAbi`](arbGasInfoReadContract.md#arbgasinfoabi)\>

#### Source

[arbGasInfoReadContract.ts:7](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbGasInfoReadContract.ts#L7)

***

### ArbGasInfoReadContractParameters\<TFunctionName\>

> **ArbGasInfoReadContractParameters**\<`TFunctionName`\>: `object` & [`mainnet`](chains.md#mainnet) \<[`ArbGasInfoAbi`](arbGasInfoReadContract.md#arbgasinfoabi), `TFunctionName`\>

#### Type declaration

##### functionName

> **functionName**: `TFunctionName`

#### Type parameters

• **TFunctionName** *extends* [`ArbGasInfoFunctionName`](arbGasInfoReadContract.md#arbgasinfofunctionname)

#### Source

[arbGasInfoReadContract.ts:9](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbGasInfoReadContract.ts#L9)

***

### ArbGasInfoReadContractReturnType\<TFunctionName\>

> **ArbGasInfoReadContractReturnType**\<`TFunctionName`\>: [`mainnet`](chains.md#mainnet) \<[`ArbGasInfoAbi`](arbGasInfoReadContract.md#arbgasinfoabi), `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbGasInfoFunctionName`](arbGasInfoReadContract.md#arbgasinfofunctionname)

#### Source

[arbGasInfoReadContract.ts:13](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbGasInfoReadContract.ts#L13)

## Functions

### arbGasInfoReadContract()

> **arbGasInfoReadContract**\<`TChain`, `TFunctionName`\>(`client`, `params`): `Promise` \<[`ArbGasInfoReadContractReturnType`](arbGasInfoReadContract.md#arbgasinforeadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Type parameters

• **TChain** *extends* `unknown`

• **TFunctionName** *extends* `"getAmortizedCostCapBips"` \| `"getCurrentTxL1GasFees"` \| `"getGasAccountingParams"` \| `"getGasBacklog"` \| `"getGasBacklogTolerance"` \| `"getL1BaseFeeEstimate"` \| `"getL1BaseFeeEstimateInertia"` \| `"getL1FeesAvailable"` \| `"getL1GasPriceEstimate"` \| `"getL1PricingEquilibrationUnits"` \| `"getL1PricingFundsDueForRewards"` \| `"getL1PricingSurplus"` \| `"getL1PricingUnitsSinceUpdate"` \| `"getL1RewardRate"` \| `"getL1RewardRecipient"` \| `"getLastL1PricingSurplus"` \| `"getLastL1PricingUpdateTime"` \| `"getMinimumGasPrice"` \| `"getPerBatchGasCharge"` \| `"getPricesInArbGas"` \| `"getPricesInArbGasWithAggregator"` \| `"getPricesInWei"` \| `"getPricesInWeiWithAggregator"` \| `"getPricingInertia"`

#### Parameters

• **client**: `PublicClient`\<`Transport`, `TChain`\>

• **params**: `any`

#### Returns

`Promise` \<[`ArbGasInfoReadContractReturnType`](arbGasInfoReadContract.md#arbgasinforeadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[arbGasInfoReadContract.ts:16](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbGasInfoReadContract.ts#L16)
