[Documentation](README.md) / arbOwnerPrepareTransactionRequest

## Functions

### arbOwnerPrepareTransactionRequest()

```ts
function arbOwnerPrepareTransactionRequest<TFunctionName, TChain>(client: object, params: ArbOwnerPrepareTransactionRequestParameters<TFunctionName>): Promise<object | object | object>
```

Prepares a transaction request for the arbOwner contract on the specified
chain using the provided client and parameters.

#### Type parameters

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
| `TChain` *extends* `undefined` \| `Chain` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |
| `params` | `ArbOwnerPrepareTransactionRequestParameters`\<`TFunctionName`\> |

#### Returns

`Promise`\<`object` \| `object` \| `object`\>

#### Source

[src/arbOwnerPrepareTransactionRequest.ts:74](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/arbOwnerPrepareTransactionRequest.ts#L74)
