---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# arbOwnerPrepareTransactionRequest

## Type Aliases

### ArbOwnerEncodeFunctionDataParameters\<TFunctionName\>

> **ArbOwnerEncodeFunctionDataParameters**\<`TFunctionName`\>: [`mainnet`](chains.md#mainnet)\<`ArbOwnerAbi`, `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPrepareTransactionRequestFunctionName`](arbOwnerPrepareTransactionRequest.md#arbownerpreparetransactionrequestfunctionname)

#### Source

[arbOwnerPrepareTransactionRequest.ts:16](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbOwnerPrepareTransactionRequest.ts#L16)

***

### ArbOwnerPrepareTransactionRequestFunctionName

> **ArbOwnerPrepareTransactionRequestFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi)\<`ArbOwnerAbi`\>

#### Source

[arbOwnerPrepareTransactionRequest.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbOwnerPrepareTransactionRequest.ts#L15)

***

### ArbOwnerPrepareTransactionRequestParameters\<TFunctionName\>

> **ArbOwnerPrepareTransactionRequestParameters**\<`TFunctionName`\>: `Omit`\<`ArbOwnerPrepareFunctionDataParameters`\<`TFunctionName`\>, `"abi"`\> & `object`

#### Type declaration

##### account

> **account**: [`mainnet`](chains.md#mainnet)

#### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPrepareTransactionRequestFunctionName`](arbOwnerPrepareTransactionRequest.md#arbownerpreparetransactionrequestfunctionname)

#### Source

[arbOwnerPrepareTransactionRequest.ts:64](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbOwnerPrepareTransactionRequest.ts#L64)

## Functions

### arbOwnerPrepareTransactionRequest()

> **arbOwnerPrepareTransactionRequest**\<`TFunctionName`, `TChain`\>(`client`, `params`): `Promise`\<`any`\>

#### Type parameters

• **TFunctionName** *extends* `"addChainOwner"` \| `"getAllChainOwners"` \| `"getInfraFeeAccount"` \| `"getNetworkFeeAccount"` \| `"isChainOwner"` \| `"releaseL1PricerSurplusFunds"` \| `"removeChainOwner"` \| `"scheduleArbOSUpgrade"` \| `"setAmortizedCostCapBips"` \| `"setBrotliCompressionLevel"` \| `"setChainConfig"` \| `"setInfraFeeAccount"` \| `"setL1BaseFeeEstimateInertia"` \| `"setL1PricePerUnit"` \| `"setL1PricingEquilibrationUnits"` \| `"setL1PricingInertia"` \| `"setL1PricingRewardRate"` \| `"setL1PricingRewardRecipient"` \| `"setL2BaseFee"` \| `"setL2GasBacklogTolerance"` \| `"setL2GasPricingInertia"` \| `"setMaxTxGasLimit"` \| `"setMinimumL2BaseFee"` \| `"setNetworkFeeAccount"` \| `"setPerBatchGasCharge"` \| `"setSpeedLimit"`

• **TChain** *extends* `unknown`

#### Parameters

• **client**: `PublicClient`\<`Transport`, `TChain`\>

• **params**: [`ArbOwnerPrepareTransactionRequestParameters`](arbOwnerPrepareTransactionRequest.md#arbownerpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

#### Returns

`Promise`\<`any`\>

#### Source

[arbOwnerPrepareTransactionRequest.ts:70](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/arbOwnerPrepareTransactionRequest.ts#L70)
