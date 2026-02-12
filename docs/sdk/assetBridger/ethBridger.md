## Classes

### EthBridger

Defined in: assetBridger/ethBridger.ts:168

Bridger for moving either ETH or custom gas tokens back and forth between parent and child networks

#### Extends

- [`AssetBridger`](assetBridger.md#assetbridger)\<`EthDepositParams` \| `EthDepositToParams` \| `ParentToChildTxReqAndSigner`, `EthWithdrawParams` \| `ChildToParentTxReqAndSigner`\>

#### Properties

| Property                                | Modifier   | Type     | Description                                                                                                                                                                                                                                                    | Inherited from                                                                              | Defined in                      |
| --------------------------------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| <a id="nativetoken"></a> `nativeToken?` | `readonly` | `string` | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address In case of a chain that uses an ERC-20 token from the parent network as its native/gas token, this is the address of said token on the parent network | [`AssetBridger`](assetBridger.md#assetbridger).[`nativeToken`](assetBridger.md#nativetoken) | assetBridger/assetBridger.ts:40 |

#### Accessors

##### nativeTokenIsEth

###### Get Signature

```ts
get protected nativeTokenIsEth(): boolean;
```

Defined in: assetBridger/assetBridger.ts:72

Whether the chain uses ETH as its native/gas token

###### Returns

`boolean`

###### Inherited from

[`AssetBridger`](assetBridger.md#assetbridger).[`nativeTokenIsEth`](assetBridger.md#nativetokeniseth)

#### Methods

##### approveGasToken()

```ts
approveGasToken(params: WithParentSigner<ApproveGasTokenParamsOrTxRequest>): Promise<TransactionResponse>;
```

Defined in: assetBridger/ethBridger.ts:223

Approves the custom gas token to be spent by the Inbox on the parent network.

###### Parameters

| Parameter | Type                                                     | Description |
| --------- | -------------------------------------------------------- | ----------- |
| `params`  | `WithParentSigner`\<`ApproveGasTokenParamsOrTxRequest`\> |             |

###### Returns

`Promise`\<`TransactionResponse`\>

##### checkChildNetwork()

```ts
protected checkChildNetwork(sop: SignerOrProvider): Promise<void>;
```

Defined in: assetBridger/assetBridger.ts:61

Check the signer/provider matches the child network, throws if not

###### Parameters

| Parameter | Type               | Description |
| --------- | ------------------ | ----------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

[`AssetBridger`](assetBridger.md#assetbridger).[`checkChildNetwork`](assetBridger.md#checkchildnetwork)

##### checkParentNetwork()

```ts
protected checkParentNetwork(sop: SignerOrProvider): Promise<void>;
```

Defined in: assetBridger/assetBridger.ts:50

Check the signer/provider matches the parent network, throws if not

###### Parameters

| Parameter | Type               | Description |
| --------- | ------------------ | ----------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

[`AssetBridger`](assetBridger.md#assetbridger).[`checkParentNetwork`](assetBridger.md#checkparentnetwork)

##### deposit()

```ts
deposit(params: EthDepositParams | ParentToChildTxReqAndSigner): Promise<ParentEthDepositTransaction>;
```

Defined in: assetBridger/ethBridger.ts:291

Deposit ETH from Parent onto Child network

###### Parameters

| Parameter | Type                                                | Description |
| --------- | --------------------------------------------------- | ----------- |
| `params`  | `EthDepositParams` \| `ParentToChildTxReqAndSigner` |             |

###### Returns

`Promise`\<`ParentEthDepositTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridger).[`deposit`](assetBridger.md#deposit)

##### depositTo()

```ts
depositTo(params:
  | EthDepositToParams
| ParentToChildTransactionRequest & object & object): Promise<ParentContractCallTransaction>;
```

Defined in: assetBridger/ethBridger.ts:354

Deposit ETH from parent network onto a different child network address

###### Parameters

| Parameter | Type                                                                                                                                                        | Description |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `params`  | \| `EthDepositToParams` \| [`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest) & `object` & `object` |             |

###### Returns

`Promise`\<`ParentContractCallTransaction`\>

##### getApproveGasTokenRequest()

```ts
getApproveGasTokenRequest(params?: ApproveGasTokenParams): Required<Pick<TransactionRequest, "to" | "data" | "value">>;
```

Defined in: assetBridger/ethBridger.ts:195

Creates a transaction request for approving the custom gas token to be spent by the inbox on the parent network

###### Parameters

| Parameter | Type                    | Description |
| --------- | ----------------------- | ----------- |
| `params?` | `ApproveGasTokenParams` |             |

###### Returns

`Required`\<`Pick`\<`TransactionRequest`, `"to"` \| `"data"` \| `"value"`\>\>

##### getDepositRequest()

```ts
getDepositRequest(params: EthDepositRequestParams): Promise<OmitTyped<ParentToChildTransactionRequest, "retryableData">>;
```

Defined in: assetBridger/ethBridger.ts:272

Gets tx request for depositing ETH or custom gas token

###### Parameters

| Parameter | Type                      | Description |
| --------- | ------------------------- | ----------- |
| `params`  | `EthDepositRequestParams` |             |

###### Returns

`Promise`\<[`OmitTyped`](../utils/types.md#omittyped)\<[`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest), `"retryableData"`\>\>

##### getDepositToRequest()

```ts
getDepositToRequest(params: EthDepositToRequestParams): Promise<ParentToChildTransactionRequest>;
```

Defined in: assetBridger/ethBridger.ts:316

Get a transaction request for an ETH deposit to a different child network address using Retryables

###### Parameters

| Parameter | Type                        | Description |
| --------- | --------------------------- | ----------- |
| `params`  | `EthDepositToRequestParams` |             |

###### Returns

`Promise`\<[`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest)\>

##### getWithdrawalRequest()

```ts
getWithdrawalRequest(params: EthWithdrawParams): Promise<ChildToParentTransactionRequest>;
```

Defined in: assetBridger/ethBridger.ts:387

Get a transaction request for an eth withdrawal

###### Parameters

| Parameter | Type                | Description |
| --------- | ------------------- | ----------- |
| `params`  | `EthWithdrawParams` |             |

###### Returns

`Promise`\<[`ChildToParentTransactionRequest`](../dataEntities/transactionRequest.md#childtoparenttransactionrequest)\>

##### withdraw()

```ts
withdraw(params: ChildToParentTxReqAndSigner | EthWithdrawParams & object): Promise<ChildContractTransaction>;
```

Defined in: assetBridger/ethBridger.ts:423

Withdraw ETH from child network onto parent network

###### Parameters

| Parameter | Type                                                            | Description |
| --------- | --------------------------------------------------------------- | ----------- |
| `params`  | `ChildToParentTxReqAndSigner` \| `EthWithdrawParams` & `object` |             |

###### Returns

`Promise`\<`ChildContractTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridger).[`withdraw`](assetBridger.md#withdraw)

##### fromProvider()

```ts
static fromProvider(childProvider: Provider): Promise<EthBridger>;
```

Defined in: assetBridger/ethBridger.ts:177

Instantiates a new EthBridger from a child network Provider

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<[`EthBridger`](#ethbridger)\>
