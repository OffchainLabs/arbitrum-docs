---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function arbOwnerPrepareTransactionRequest<TFunctionName, TChain>(
  client: object,
  params: ArbOwnerPrepareTransactionRequestParameters<TFunctionName>,
): Promise<any>;
```

Prepares a transaction request for executing a function on the ArbOwner
contract.

## Type parameters

| Type parameter |
| :------------- |

| `TFunctionName` _extends_
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
| `TChain` _extends_ `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type                                                                                                                               |
| :-------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `client`  | `object`                                                                                                                           |
| `params`  | [`ArbOwnerPrepareTransactionRequestParameters`](../type-aliases/ArbOwnerPrepareTransactionRequestParameters.md)\<`TFunctionName`\> |

## Returns

`Promise`\<`any`\>

## Source

[src/arbOwnerPrepareTransactionRequest.ts:74](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/arbOwnerPrepareTransactionRequest.ts#L74)
