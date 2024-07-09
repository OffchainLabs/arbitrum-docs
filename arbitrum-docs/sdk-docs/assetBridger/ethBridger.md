---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### EthBridger

Bridger for moving ETH back and forth between L1 to L2

#### Extends

- [`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams)\<`EthDepositParams` \| `EthDepositToParams` \| `L1ToL2TxReqAndSigner`, `EthWithdrawParams` \| `L2ToL1TxReqAndSigner`\>

#### Properties

| Property       | Modifier   | Type                                                                                                         | Description                                                                                                                                                                                                                                                           | Inherited from                                                                          |
| :------------- | :--------- | :----------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| `l1Network`    | `readonly` | [`L1Network`](../dataEntities/networks.md#l1network) \| [`L2Network`](../dataEntities/networks.md#l2network) | Parent chain for the given Arbitrum chain, can be an L1 or an L2                                                                                                                                                                                                      | [`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams).`l1Network`   |
| `nativeToken?` | `readonly` | `string`                                                                                                     | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address<br /><br />In case of a chain that uses an ERC-20 token from the parent chain as its native/gas token, this is the address of said token on the parent chain | [`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams).`nativeToken` |

#### Accessors

##### nativeTokenIsEth

```ts
get protected nativeTokenIsEth(): boolean
```

Whether the chain uses ETH as its native/gas token

###### Returns

`boolean`

###### Source

[assetBridger/assetBridger.ts:75](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/assetBridger.ts#L75)

#### Methods

##### approveGasToken()

```ts
approveGasToken(params: WithL1Signer<ApproveGasTokenParamsOrTxRequest>): Promise<TransactionResponse>
```

Approves the custom gas token to be spent by the Inbox on the parent chain.

###### Parameters

| Parameter | Type                                                 | Description |
| :-------- | :--------------------------------------------------- | :---------- |
| `params`  | `WithL1Signer`\<`ApproveGasTokenParamsOrTxRequest`\> |             |

###### Returns

`Promise`\<`TransactionResponse`\>

###### Source

[assetBridger/ethBridger.ts:219](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/ethBridger.ts#L219)

##### checkL1Network()

```ts
protected checkL1Network(sop: SignerOrProvider): Promise<void>
```

Check the signer/provider matches the l1Network, throws if not

###### Parameters

| Parameter | Type               | Description |
| :-------- | :----------------- | :---------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`checkL1Network`](assetBridger.md#checkl1network)

###### Source

[assetBridger/assetBridger.ts:59](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/assetBridger.ts#L59)

##### checkL2Network()

```ts
protected checkL2Network(sop: SignerOrProvider): Promise<void>
```

Check the signer/provider matches the l2Network, throws if not

###### Parameters

| Parameter | Type               | Description |
| :-------- | :----------------- | :---------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`checkL2Network`](assetBridger.md#checkl2network)

###### Source

[assetBridger/assetBridger.ts:67](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/assetBridger.ts#L67)

##### deposit()

```ts
deposit(params: EthDepositParams | L1ToL2TxReqAndSigner): Promise<L1EthDepositTransaction>
```

Deposit ETH from L1 onto L2

###### Parameters

| Parameter | Type                                         | Description |
| :-------- | :------------------------------------------- | :---------- |
| `params`  | `EthDepositParams` \| `L1ToL2TxReqAndSigner` |             |

###### Returns

`Promise`\<`L1EthDepositTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`deposit`](assetBridger.md#deposit)

###### Source

[assetBridger/ethBridger.ts:287](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/ethBridger.ts#L287)

##### depositTo()

```ts
depositTo(params: EthDepositToParams | L1ToL2TransactionRequest & object & object): Promise<L1ContractCallTransaction>
```

Deposit ETH from L1 onto a different L2 address

###### Parameters

| Parameter | Type                                                                                                                                       | Description |
| :-------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| `params`  | `EthDepositToParams` \| [`L1ToL2TransactionRequest`](../dataEntities/transactionRequest.md#l1tol2transactionrequest) & `object` & `object` |             |

###### Returns

`Promise`\<`L1ContractCallTransaction`\>

###### Source

[assetBridger/ethBridger.ts:339](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/ethBridger.ts#L339)

##### getApproveGasTokenRequest()

```ts
getApproveGasTokenRequest(params?: ApproveGasTokenParams): Required<Pick<TransactionRequest, "data" | "value" | "to">>
```

Creates a transaction request for approving the custom gas token to be spent by the inbox on the parent chain

###### Parameters

| Parameter | Type                    | Description |
| :-------- | :---------------------- | :---------- |
| `params`? | `ApproveGasTokenParams` |             |

###### Returns

`Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"to"`\>\>

###### Source

[assetBridger/ethBridger.ts:191](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/ethBridger.ts#L191)

##### getDepositRequest()

```ts
getDepositRequest(params: EthDepositRequestParams): Promise<OmitTyped<L1ToL2TransactionRequest, "retryableData">>
```

Gets tx request for depositing ETH or custom gas token

###### Parameters

| Parameter | Type                      | Description |
| :-------- | :------------------------ | :---------- |
| `params`  | `EthDepositRequestParams` |             |

###### Returns

`Promise` \<[`OmitTyped`](../utils/types.md#omittypedtk) \<[`L1ToL2TransactionRequest`](../dataEntities/transactionRequest.md#l1tol2transactionrequest), `"retryableData"`\>\>

###### Source

[assetBridger/ethBridger.ts:268](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/ethBridger.ts#L268)

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

[assetBridger/ethBridger.ts:241](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/ethBridger.ts#L241)

##### getDepositToRequest()

```ts
getDepositToRequest(params: EthDepositToRequestParams): Promise<L1ToL2TransactionRequest>
```

Get a transaction request for an ETH deposit to a different L2 address using Retryables

###### Parameters

| Parameter | Type                        | Description |
| :-------- | :-------------------------- | :---------- |
| `params`  | `EthDepositToRequestParams` |             |

###### Returns

`Promise` \<[`L1ToL2TransactionRequest`](../dataEntities/transactionRequest.md#l1tol2transactionrequest)\>

###### Source

[assetBridger/ethBridger.ts:312](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/ethBridger.ts#L312)

##### getWithdrawalRequest()

```ts
getWithdrawalRequest(params: EthWithdrawParams): Promise<L2ToL1TransactionRequest>
```

Get a transaction request for an eth withdrawal

###### Parameters

| Parameter | Type                | Description |
| :-------- | :------------------ | :---------- |
| `params`  | `EthWithdrawParams` |             |

###### Returns

`Promise` \<[`L2ToL1TransactionRequest`](../dataEntities/transactionRequest.md#l2tol1transactionrequest)\>

###### Source

[assetBridger/ethBridger.ts:370](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/ethBridger.ts#L370)

##### isApproveGasTokenParams()

```ts
private isApproveGasTokenParams(params: ApproveGasTokenParamsOrTxRequest): params is WithL1Signer<ApproveGasTokenParams>
```

Asserts that the provided argument is of type `ApproveGasTokenParams` and not `ApproveGasTokenTxRequest`.

###### Parameters

| Parameter | Type                               | Description |
| :-------- | :--------------------------------- | :---------- |
| `params`  | `ApproveGasTokenParamsOrTxRequest` |             |

###### Returns

`params is WithL1Signer<ApproveGasTokenParams>`

###### Source

[assetBridger/ethBridger.ts:181](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/ethBridger.ts#L181)

##### withdraw()

```ts
withdraw(params: L2ToL1TxReqAndSigner | EthWithdrawParams & object): Promise<L2ContractTransaction>
```

Withdraw ETH from L2 onto L1

###### Parameters

| Parameter | Type                                                     | Description |
| :-------- | :------------------------------------------------------- | :---------- |
| `params`  | `L2ToL1TxReqAndSigner` \| `EthWithdrawParams` & `object` |             |

###### Returns

`Promise`\<`L2ContractTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`withdraw`](assetBridger.md#withdraw)

###### Source

[assetBridger/ethBridger.ts:406](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/ethBridger.ts#L406)

##### fromProvider()

```ts
static fromProvider(l2Provider: Provider): Promise<EthBridger>
```

Instantiates a new EthBridger from an L2 Provider

###### Parameters

| Parameter    | Type       | Description |
| :----------- | :--------- | :---------- |
| `l2Provider` | `Provider` |             |

###### Returns

`Promise` \<[`EthBridger`](ethBridger.md#ethbridger)\>

###### Source

[assetBridger/ethBridger.ts:173](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/ethBridger.ts#L173)
