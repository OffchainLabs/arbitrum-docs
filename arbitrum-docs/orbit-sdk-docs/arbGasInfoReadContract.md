[Documentation](README.md) / arbGasInfoReadContract

## Functions

### arbGasInfoReadContract()

```ts
function arbGasInfoReadContract<TChain, TFunctionName>(
  client: object,
  params: ArbGasInfoReadContractParameters<TFunctionName>,
): Promise<ArbGasInfoReadContractReturnType<TFunctionName>>;
```

Reads data from the ArbGasInfo smart contract on the specified chain and
returns the result as per the provided function name.

#### Type parameters

| Type parameter                            |
| :---------------------------------------- |
| `TChain` _extends_ `undefined` \| `Chain` |

| `TFunctionName` _extends_
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

#### Parameters

| Parameter | Type                                                  |
| :-------- | :---------------------------------------------------- |
| `client`  | `object`                                              |
| `params`  | `ArbGasInfoReadContractParameters`\<`TFunctionName`\> |

#### Returns

`Promise`\<`ArbGasInfoReadContractReturnType`\<`TFunctionName`\>\>

#### Source

[src/arbGasInfoReadContract.ts:20](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/arbGasInfoReadContract.ts#L20)
