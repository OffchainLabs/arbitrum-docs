---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# arbAggregatorPrepareTransactionRequest

## Type Aliases

### ArbAggregatorEncodeFunctionDataParameters\<TFunctionName\>

> **ArbAggregatorEncodeFunctionDataParameters**\<`TFunctionName`\>: `EncodeFunctionDataParameters`\<`ArbAggregatorAbi`, `TFunctionName`\>

#### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorPrepareTransactionRequestFunctionName`](arbAggregatorPrepareTransactionRequest.md#arbaggregatorpreparetransactionrequestfunctionname)

#### Source

[src/arbAggregatorPrepareTransactionRequest.ts:16](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbAggregatorPrepareTransactionRequest.ts#L16)

***

### ArbAggregatorPrepareTransactionRequestFunctionName

> **ArbAggregatorPrepareTransactionRequestFunctionName**: [`GetFunctionName`](types/utils.md#getfunctionnametabi)\<`ArbAggregatorAbi`\>

#### Source

[src/arbAggregatorPrepareTransactionRequest.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbAggregatorPrepareTransactionRequest.ts#L15)

***

### ArbAggregatorPrepareTransactionRequestParameters\<TFunctionName\>

> **ArbAggregatorPrepareTransactionRequestParameters**\<`TFunctionName`\>: `Omit`\<`ArbAggregatorPrepareFunctionDataParameters`\<`TFunctionName`\>, `"abi"`\> & `object`

#### Type declaration

##### account

> **account**: `Address`

#### Type parameters

• **TFunctionName** *extends* [`ArbAggregatorPrepareTransactionRequestFunctionName`](arbAggregatorPrepareTransactionRequest.md#arbaggregatorpreparetransactionrequestfunctionname)

#### Source

[src/arbAggregatorPrepareTransactionRequest.ts:88](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbAggregatorPrepareTransactionRequest.ts#L88)

## Functions

### arbAggregatorPrepareTransactionRequest()

> **arbAggregatorPrepareTransactionRequest**\<`TFunctionName`, `TChain`\>(`client`, `params`): `Promise`\<`any`\>

Prepares a transaction request for the ArbAggregator contract function specified by the given function name.
It generates the necessary data and value for the transaction based on the input parameters and prepares the
transaction request using the provided client and account information.

#### Type parameters

• **TFunctionName** *extends* `"addBatchPoster"` \| `"getBatchPosters"` \| `"getDefaultAggregator"` \| `"getFeeCollector"` \| `"getPreferredAggregator"` \| `"getTxBaseFee"` \| `"setFeeCollector"` \| `"setTxBaseFee"`

The name of the function to prepare the transaction request for.

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

The type of the chain.

#### Parameters

• **client**

The public client used to prepare the transaction request.

• **params**: [`ArbAggregatorPrepareTransactionRequestParameters`](arbAggregatorPrepareTransactionRequest.md#arbaggregatorpreparetransactionrequestparameterstfunctionname)\<`TFunctionName`\>

The parameters for preparing the transaction request.

#### Returns

`Promise`\<`any`\>

The prepared transaction request including the chain ID.

#### Throws

If the client.chain is undefined.

#### Example

```ts
const client = new PublicClient(...);
const params = {
  functionName: 'someFunction',
  args: [arg1, arg2],
  upgradeExecutor: '0xExecutorAddress',
  account: '0xAccountAddress',
};
const request = await arbAggregatorPrepareTransactionRequest(client, params);
```

#### Source

[src/arbAggregatorPrepareTransactionRequest.ts:120](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/arbAggregatorPrepareTransactionRequest.ts#L120)
