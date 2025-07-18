---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### EthBridger

Bridger for moving either ETH or custom gas tokens back and forth between parent and child networks

#### Extends

- [`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams)\<`EthDepositParams` \| `EthDepositToParams` \| `ParentToChildTxReqAndSigner`, `EthWithdrawParams` \| `ChildToParentTxReqAndSigner`\>

#### Properties

| Property       | Modifier   | Type     | Description                                                                                                                                                                                                                                                               | Inherited from                                                                          |
| :------------- | :--------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------- |
| `nativeToken?` | `readonly` | `string` | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address<br /><br />In case of a chain that uses an ERC-20 token from the parent network as its native/gas token, this is the address of said token on the parent network | [`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams).`nativeToken` |

#### Accessors

##### nativeTokenIsEth

```ts
get protected nativeTokenIsEth(): boolean
```

Whether the chain uses ETH as its native/gas token

###### Returns

`boolean`

###### Source

[assetBridger/assetBridger.ts:72](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/assetBridger.ts#L72)

#### Methods

##### approveGasToken()

```ts
approveGasToken(params: WithParentSigner<ApproveGasTokenParamsOrTxRequest>): Promise<TransactionResponse>
```

Approves the custom gas token to be spent by the Inbox on the parent network.

###### Parameters

| Parameter | Type                                                     | Description |
| :-------- | :------------------------------------------------------- | :---------- |
| `params`  | `WithParentSigner`\<`ApproveGasTokenParamsOrTxRequest`\> |             |

###### Returns

`Promise`\<`TransactionResponse`\>

###### Source

[assetBridger/ethBridger.ts:223](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/ethBridger.ts#L223)

##### checkChildNetwork()

```ts
protected checkChildNetwork(sop: SignerOrProvider): Promise<void>
```

Check the signer/provider matches the child network, throws if not

###### Parameters

| Parameter | Type               | Description |
| :-------- | :----------------- | :---------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`checkChildNetwork`](assetBridger.md#checkchildnetwork)

###### Source

[assetBridger/assetBridger.ts:61](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/assetBridger.ts#L61)

##### checkParentNetwork()

```ts
protected checkParentNetwork(sop: SignerOrProvider): Promise<void>
```

Check the signer/provider matches the parent network, throws if not

###### Parameters

| Parameter | Type               | Description |
| :-------- | :----------------- | :---------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`checkParentNetwork`](assetBridger.md#checkparentnetwork)

###### Source

[assetBridger/assetBridger.ts:50](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/assetBridger.ts#L50)

##### deposit()

```ts
deposit(params: EthDepositParams | ParentToChildTxReqAndSigner): Promise<ParentEthDepositTransaction>
```

Deposit ETH from Parent onto Child network

###### Parameters

| Parameter | Type                                                | Description |
| :-------- | :-------------------------------------------------- | :---------- |
| `params`  | `EthDepositParams` \| `ParentToChildTxReqAndSigner` |             |

###### Returns

`Promise`\<`ParentEthDepositTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`deposit`](assetBridger.md#deposit)

###### Source

[assetBridger/ethBridger.ts:291](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/ethBridger.ts#L291)

##### depositTo()

```ts
depositTo(params: EthDepositToParams | ParentToChildTransactionRequest & object & object): Promise<ParentContractCallTransaction>
```

Deposit ETH from parent network onto a different child network address

###### Parameters

| Parameter | Type                                                                                                                                                     | Description |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| `params`  | `EthDepositToParams` \| [`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest) & `object` & `object` |             |

###### Returns

`Promise`\<`ParentContractCallTransaction`\>

###### Source

[assetBridger/ethBridger.ts:354](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/ethBridger.ts#L354)

##### getApproveGasTokenRequest()

```ts
getApproveGasTokenRequest(params?: ApproveGasTokenParams): Required<Pick<TransactionRequest, "data" | "value" | "to">>
```

Creates a transaction request for approving the custom gas token to be spent by the inbox on the parent network

###### Parameters

| Parameter | Type                    | Description |
| :-------- | :---------------------- | :---------- |
| `params`? | `ApproveGasTokenParams` |             |

###### Returns

`Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"to"`\>\>

###### Source

[assetBridger/ethBridger.ts:195](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/ethBridger.ts#L195)

##### getDepositRequest()

```ts
getDepositRequest(params: EthDepositRequestParams): Promise<OmitTyped<ParentToChildTransactionRequest, "retryableData">>
```

Gets tx request for depositing ETH or custom gas token

###### Parameters

| Parameter | Type                      | Description |
| :-------- | :------------------------ | :---------- |
| `params`  | `EthDepositRequestParams` |             |

###### Returns

`Promise` \<[`OmitTyped`](../utils/types.md#omittypedtk) \<[`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest), `"retryableData"`\>\>

###### Source

[assetBridger/ethBridger.ts:272](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/ethBridger.ts#L272)

##### getDepositRequestData()

```ts
private getDepositRequestData(params: EthDepositRequestParams): string
```

Gets transaction calldata for a tx request for depositing ETH or custom gas token

###### Parameters

| Parameter | Type                      | Description |
| :-------- | :------------------------ | :---------- |
| `params`  | `EthDepositRequestParams` |             |

###### Returns

`string`

###### Source

[assetBridger/ethBridger.ts:245](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/ethBridger.ts#L245)

##### getDepositToRequest()

```ts
getDepositToRequest(params: EthDepositToRequestParams): Promise<ParentToChildTransactionRequest>
```

Get a transaction request for an ETH deposit to a different child network address using Retryables

###### Parameters

| Parameter | Type                        | Description |
| :-------- | :-------------------------- | :---------- |
| `params`  | `EthDepositToRequestParams` |             |

###### Returns

`Promise` \<[`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest)\>

###### Source

[assetBridger/ethBridger.ts:316](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/ethBridger.ts#L316)

##### getWithdrawalRequest()

```ts
getWithdrawalRequest(params: EthWithdrawParams): Promise<ChildToParentTransactionRequest>
```

Get a transaction request for an eth withdrawal

###### Parameters

| Parameter | Type                | Description |
| :-------- | :------------------ | :---------- |
| `params`  | `EthWithdrawParams` |             |

###### Returns

`Promise` \<[`ChildToParentTransactionRequest`](../dataEntities/transactionRequest.md#childtoparenttransactionrequest)\>

###### Source

[assetBridger/ethBridger.ts:387](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/ethBridger.ts#L387)

##### isApproveGasTokenParams()

```ts
private isApproveGasTokenParams(params: ApproveGasTokenParamsOrTxRequest): params is WithParentSigner<ApproveGasTokenParams>
```

Asserts that the provided argument is of type `ApproveGasTokenParams` and not `ApproveGasTokenTxRequest`.

###### Parameters

| Parameter | Type                               | Description |
| :-------- | :--------------------------------- | :---------- |
| `params`  | `ApproveGasTokenParamsOrTxRequest` |             |

###### Returns

`params is WithParentSigner<ApproveGasTokenParams>`

###### Source

[assetBridger/ethBridger.ts:185](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/ethBridger.ts#L185)

##### withdraw()

```ts
withdraw(params: ChildToParentTxReqAndSigner | EthWithdrawParams & object): Promise<ChildContractTransaction>
```

Withdraw ETH from child network onto parent network

###### Parameters

| Parameter | Type                                                            | Description |
| :-------- | :-------------------------------------------------------------- | :---------- |
| `params`  | `ChildToParentTxReqAndSigner` \| `EthWithdrawParams` & `object` |             |

###### Returns

`Promise`\<`ChildContractTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`withdraw`](assetBridger.md#withdraw)

###### Source

[assetBridger/ethBridger.ts:423](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/ethBridger.ts#L423)

##### fromProvider()

```ts
static fromProvider(childProvider: Provider): Promise<EthBridger>
```

Instantiates a new EthBridger from a child network Provider

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise` \<[`EthBridger`](ethBridger.md#ethbridger)\>

###### Source

[assetBridger/ethBridger.ts:177](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/ethBridger.ts#L177)
