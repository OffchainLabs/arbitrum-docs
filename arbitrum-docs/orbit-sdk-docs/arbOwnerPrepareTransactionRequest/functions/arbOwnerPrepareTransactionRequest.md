---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: arbOwnerPrepareTransactionRequest()

> **arbOwnerPrepareTransactionRequest**\<`TFunctionName`, `TChain`\>(`client`, `params`): `Promise`\<`any`\>

Prepares a transaction request for executing a function on the ArbOwner contract.

## Type parameters

• **TFunctionName** *extends* `"addChainOwner"` \| `"getAllChainOwners"` \| `"getInfraFeeAccount"` \| `"getNetworkFeeAccount"` \| `"isChainOwner"` \| `"releaseL1PricerSurplusFunds"` \| `"removeChainOwner"` \| `"scheduleArbOSUpgrade"` \| `"setAmortizedCostCapBips"` \| `"setBrotliCompressionLevel"` \| `"setChainConfig"` \| `"setInfraFeeAccount"` \| `"setL1BaseFeeEstimateInertia"` \| `"setL1PricePerUnit"` \| `"setL1PricingEquilibrationUnits"` \| `"setL1PricingInertia"` \| `"setL1PricingRewardRate"` \| `"setL1PricingRewardRecipient"` \| `"setL2BaseFee"` \| `"setL2GasBacklogTolerance"` \| `"setL2GasPricingInertia"` \| `"setMaxTxGasLimit"` \| `"setMinimumL2BaseFee"` \| `"setNetworkFeeAccount"` \| `"setPerBatchGasCharge"` \| `"setSpeedLimit"`

The name of the function to execute.

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the chain.

## Parameters

• **client**

The public client to use for the transaction.

• **params**: [`ArbOwnerPrepareTransactionRequestParameters`](../type-aliases/ArbOwnerPrepareTransactionRequestParameters.md)\<`TFunctionName`\>

The parameters for preparing the transaction request.

## Returns

`Promise`\<`any`\>

The prepared transaction request including the chain ID.

## Throws

Will throw an error if the client chain is undefined.

## Source

[src/arbOwnerPrepareTransactionRequest.ts:106](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/arbOwnerPrepareTransactionRequest.ts#L106)
