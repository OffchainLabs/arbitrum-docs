---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# arbOwnerPrepareTransactionRequest

## Type Aliases

### ArbOwnerEncodeFunctionDataParameters\<TFunctionName\>

> **ArbOwnerEncodeFunctionDataParameters**\<`TFunctionName`\>: `EncodeFunctionDataParameters`\<`ArbOwnerAbi`, `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPrepareTransactionRequestFunctionName`](arbOwnerPrepareTransactionRequest.md#arbownerpreparetransactionrequestfunctionname)

#### Source

[src/arbOwnerPrepareTransactionRequest.ts:16](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbOwnerPrepareTransactionRequest.ts#L16)

***

### ArbOwnerPrepareFunctionDataParameters\<TFunctionName\>

> **ArbOwnerPrepareFunctionDataParameters**\<`TFunctionName`\>: [`ArbOwnerEncodeFunctionDataParameters`](arbOwnerPrepareTransactionRequest.md#arbownerencodefunctiondataparameterstfunctionname)\<`TFunctionName`\> & `object`

#### Type declaration

##### abi

> **abi**: `ArbOwnerAbi`

##### upgradeExecutor

> **upgradeExecutor**: `Address` \| `false`

#### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPrepareTransactionRequestFunctionName`](arbOwnerPrepareTransactionRequest.md#arbownerpreparetransactionrequestfunctionname)

#### Source

[src/arbOwnerPrepareTransactionRequest.ts:40](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbOwnerPrepareTransactionRequest.ts#L40)

***

### ArbOwnerPrepareTransactionRequestFunctionName

> **ArbOwnerPrepareTransactionRequestFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi)\<`ArbOwnerAbi`\>

#### Source

[src/arbOwnerPrepareTransactionRequest.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbOwnerPrepareTransactionRequest.ts#L15)

***

### ArbOwnerPrepareTransactionRequestParameters\<TFunctionName\>

> **ArbOwnerPrepareTransactionRequestParameters**\<`TFunctionName`\>: `Omit` \<[`ArbOwnerPrepareFunctionDataParameters`](arbOwnerPrepareTransactionRequest.md#arbownerpreparefunctiondataparameterstfunctionname)\<`TFunctionName`\>, `"abi"`\> & `object`

#### Type declaration

##### account

> **account**: `Address`

#### Type parameters

• **TFunctionName** *extends* [`ArbOwnerPrepareTransactionRequestFunctionName`](arbOwnerPrepareTransactionRequest.md#arbownerpreparetransactionrequestfunctionname)

#### Source

[src/arbOwnerPrepareTransactionRequest.ts:86](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbOwnerPrepareTransactionRequest.ts#L86)

## Functions

### arbOwnerPrepareTransactionRequest()

> **arbOwnerPrepareTransactionRequest**\<`TFunctionName`, `TChain`\>(`client`, `params`): `Promise`\<`any`\>

Prepares a transaction request for executing a function on the ArbOwner contract.

#### Type parameters

• **TFunctionName** *extends* `"addChainOwner"` \| `"getAllChainOwners"` \| `"getInfraFeeAccount"` \| `"getNetworkFeeAccount"` \| `"isChainOwner"` \| `"releaseL1PricerSurplusFunds"` \| `"removeChainOwner"` \| `"scheduleArbOSUpgrade"` \| `"setAmortizedCostCapBips"` \| `"setBrotliCompressionLevel"` \| `"setChainConfig"` \| `"setInfraFeeAccount"` \| `"setL1BaseFeeEstimateInertia"` \| `"setL1PricePerUnit"` \| `"setL1PricingEquilibrationUnits"` \| `"setL1PricingInertia"` \| `"setL1PricingRewardRate"` \| `"setL1PricingRewardRecipient"` \| `"setL2BaseFee"` \| `"setL2GasBacklogTolerance"` \| `"setL2GasPricingInertia"` \| `"setMaxTxGasLimit"` \| `"setMinimumL2BaseFee"` \| `"setNetworkFeeAccount"` \| `"setPerBatchGasCharge"` \| `"setSpeedLimit"`

The name of the function to execute.

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the chain.

#### Parameters

• **client**

The public client to use for the transaction.

• **params**: [`ArbOwnerPrepareTransactionRequestParameters`](arbOwnerPrepareTransactionRequest.md#arbownerpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

The parameters for preparing the transaction request.

#### Returns

`Promise`\<`any`\>

The prepared transaction request including the chain ID.

#### Throws

Will throw an error if the client chain is undefined.

#### Source

[src/arbOwnerPrepareTransactionRequest.ts:106](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbOwnerPrepareTransactionRequest.ts#L106)
