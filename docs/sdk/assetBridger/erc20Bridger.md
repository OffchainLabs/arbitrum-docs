---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### AdminErc20Bridger

Admin functionality for the token bridge

#### Extends

- [`Erc20Bridger`](erc20Bridger.md#erc20bridger)

#### Constructors

##### new AdminErc20Bridger()

```ts
new AdminErc20Bridger(childNetwork: ArbitrumNetwork): AdminErc20Bridger
```

Bridger for moving ERC20 tokens back and forth between parent-to-child

###### Parameters

| Parameter      | Type                                                             |
| :------------- | :--------------------------------------------------------------- |
| `childNetwork` | [`ArbitrumNetwork`](../dataEntities/networks.md#arbitrumnetwork) |

###### Returns

[`AdminErc20Bridger`](erc20Bridger.md#adminerc20bridger)

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`constructor`](erc20Bridger.md#constructors-1)

###### Source

[assetBridger/erc20Bridger.ts:205](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L205)

#### Properties

| Property       | Modifier   | Type     | Description                                                                                                                                                                                                                                                               | Inherited from                                               |
| :------------- | :--------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------- |
| `nativeToken?` | `readonly` | `string` | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address<br /><br />In case of a chain that uses an ERC-20 token from the parent network as its native/gas token, this is the address of said token on the parent network | [`Erc20Bridger`](erc20Bridger.md#erc20bridger).`nativeToken` |

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
approveGasToken(params: ApproveParamsOrTxRequest): Promise<ContractTransaction>
```

Approves the custom gas token to be spent by the relevant gateway on the parent network

###### Parameters

| Parameter | Type                       | Description |
| :-------- | :------------------------- | :---------- |
| `params`  | `ApproveParamsOrTxRequest` |             |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`approveGasToken`](erc20Bridger.md#approvegastoken-1)

###### Source

[assetBridger/erc20Bridger.ts:276](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L276)

##### approveToken()

```ts
approveToken(params: ApproveParamsOrTxRequest): Promise<ContractTransaction>
```

Approve tokens for deposit to the bridge. The tokens will be approved for the relevant gateway.

###### Parameters

| Parameter | Type                       | Description |
| :-------- | :------------------------- | :---------- |
| `params`  | `ApproveParamsOrTxRequest` |             |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`approveToken`](erc20Bridger.md#approvetoken-1)

###### Source

[assetBridger/erc20Bridger.ts:339](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L339)

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

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`checkChildNetwork`](erc20Bridger.md#checkchildnetwork-1)

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

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`checkParentNetwork`](erc20Bridger.md#checkparentnetwork-1)

###### Source

[assetBridger/assetBridger.ts:50](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/assetBridger.ts#L50)

##### deposit()

```ts
deposit(params: Erc20DepositParams | ParentToChildTxReqAndSignerProvider): Promise<ParentContractCallTransaction>
```

Execute a token deposit from parent to child network

###### Parameters

| Parameter | Type                                                          | Description |
| :-------- | :------------------------------------------------------------ | :---------- |
| `params`  | `Erc20DepositParams` \| `ParentToChildTxReqAndSignerProvider` |             |

###### Returns

`Promise`\<`ParentContractCallTransaction`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`deposit`](erc20Bridger.md#deposit-1)

###### Source

[assetBridger/erc20Bridger.ts:769](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L769)

##### getApproveGasTokenRequest()

```ts
getApproveGasTokenRequest(params: ProviderTokenApproveParams): Promise<Required<Pick<TransactionRequest, "data" | "value" | "to">>>
```

Creates a transaction request for approving the custom gas token to be spent by the relevant gateway on the parent network

###### Parameters

| Parameter | Type                         | Description |
| :-------- | :--------------------------- | :---------- |
| `params`  | `ProviderTokenApproveParams` |             |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"to"`\>\>\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getApproveGasTokenRequest`](erc20Bridger.md#getapprovegastokenrequest-1)

###### Source

[assetBridger/erc20Bridger.ts:260](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L260)

##### getApproveTokenRequest()

```ts
getApproveTokenRequest(params: ProviderTokenApproveParams): Promise<Required<Pick<TransactionRequest, "data" | "value" | "to">>>
```

Get a tx request to approve tokens for deposit to the bridge.
The tokens will be approved for the relevant gateway.

###### Parameters

| Parameter | Type                         | Description |
| :-------- | :--------------------------- | :---------- |
| `params`  | `ProviderTokenApproveParams` |             |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"to"`\>\>\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getApproveTokenRequest`](erc20Bridger.md#getapprovetokenrequest-1)

###### Source

[assetBridger/erc20Bridger.ts:306](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L306)

##### getChildErc20Address()

```ts
getChildErc20Address(erc20ParentAddress: string, parentProvider: Provider): Promise<string>
```

Get the corresponding child network token address for the provided parent network token

###### Parameters

| Parameter            | Type       | Description |
| :------------------- | :--------- | :---------- |
| `erc20ParentAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getChildErc20Address`](erc20Bridger.md#getchilderc20address-1)

###### Source

[assetBridger/erc20Bridger.ts:491](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L491)

##### getChildGatewayAddress()

```ts
getChildGatewayAddress(erc20ParentAddress: string, childProvider: Provider): Promise<string>
```

Get the address of the child gateway for this token

###### Parameters

| Parameter            | Type       | Description |
| :------------------- | :--------- | :---------- |
| `erc20ParentAddress` | `string`   |             |
| `childProvider`      | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getChildGatewayAddress`](erc20Bridger.md#getchildgatewayaddress-1)

###### Source

[assetBridger/erc20Bridger.ts:244](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L244)

##### getChildGatewaySetEvents()

```ts
getChildGatewaySetEvents(
   childProvider: Provider,
   filter: object,
customNetworkChildGatewayRouter?: string): Promise<object[]>
```

Get all the gateway set events on the child gateway router

###### Parameters

| Parameter                          | Type       | Description                                                 |
| :--------------------------------- | :--------- | :---------------------------------------------------------- |
| `childProvider`                    | `Provider` | The provider for the child network                          |
| `filter`                           | `object`   | An object containing fromBlock and toBlock to filter events |
| `filter.fromBlock`                 | `BlockTag` | -                                                           |
| `filter.toBlock`?                  | `BlockTag` | -                                                           |
| `customNetworkChildGatewayRouter`? | `string`   | Optional address of the custom network child gateway router |

###### Returns

`Promise`\<`object`[]\>

An array of GatewaySetEvent event arguments

###### Throws

If the network is custom and customNetworkChildGatewayRouter is not provided

###### Source

[assetBridger/erc20Bridger.ts:1233](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L1233)

##### getChildTokenContract()

```ts
getChildTokenContract(childProvider: Provider, childTokenAddr: string): L2GatewayToken
```

Get the child network token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesn't
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `childProvider`  | `Provider` |             |
| `childTokenAddr` | `string`   |             |

###### Returns

`L2GatewayToken`

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getChildTokenContract`](erc20Bridger.md#getchildtokencontract-1)

###### Source

[assetBridger/erc20Bridger.ts:462](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L462)

##### getDepositRequest()

```ts
getDepositRequest(params: DepositRequest): Promise<ParentToChildTransactionRequest>
```

Get the arguments for calling the deposit function

###### Parameters

| Parameter | Type             | Description |
| :-------- | :--------------- | :---------- |
| `params`  | `DepositRequest` |             |

###### Returns

`Promise` \<[`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest)\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getDepositRequest`](erc20Bridger.md#getdepositrequest-1)

###### Source

[assetBridger/erc20Bridger.ts:655](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L655)

##### getParentErc20Address()

```ts
getParentErc20Address(erc20ChildChainAddress: string, childProvider: Provider): Promise<string>
```

Get the corresponding parent network address for the provided child network token
Validates the returned address against the child network router to ensure it is correctly mapped to the provided erc20ChildChainAddress

###### Parameters

| Parameter                | Type       | Description |
| :----------------------- | :--------- | :---------- |
| `erc20ChildChainAddress` | `string`   |             |
| `childProvider`          | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getParentErc20Address`](erc20Bridger.md#getparenterc20address-1)

###### Source

[assetBridger/erc20Bridger.ts:514](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L514)

##### getParentGatewayAddress()

```ts
getParentGatewayAddress(erc20ParentAddress: string, parentProvider: Provider): Promise<string>
```

Get the address of the parent gateway for this token

###### Parameters

| Parameter            | Type       | Description |
| :------------------- | :--------- | :---------- |
| `erc20ParentAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getParentGatewayAddress`](erc20Bridger.md#getparentgatewayaddress-1)

###### Source

[assetBridger/erc20Bridger.ts:226](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L226)

##### getParentGatewaySetEvents()

```ts
getParentGatewaySetEvents(parentProvider: Provider, filter: object): Promise<object[]>
```

Get all the gateway set events on the Parent gateway router

###### Parameters

| Parameter          | Type       | Description                                                 |
| :----------------- | :--------- | :---------------------------------------------------------- |
| `parentProvider`   | `Provider` | The provider for the parent network                         |
| `filter`           | `object`   | An object containing fromBlock and toBlock to filter events |
| `filter.fromBlock` | `BlockTag` | -                                                           |
| `filter.toBlock`   | `BlockTag` | -                                                           |

###### Returns

`Promise`\<`object`[]\>

An array of GatewaySetEvent event arguments

###### Source

[assetBridger/erc20Bridger.ts:1207](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L1207)

##### getParentTokenContract()

```ts
getParentTokenContract(parentProvider: Provider, parentTokenAddr: string): ERC20
```

Get the parent token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesnt
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter         | Type       | Description |
| :---------------- | :--------- | :---------- |
| `parentProvider`  | `Provider` |             |
| `parentTokenAddr` | `string`   |             |

###### Returns

`ERC20`

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getParentTokenContract`](erc20Bridger.md#getparenttokencontract-1)

###### Source

[assetBridger/erc20Bridger.ts:478](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L478)

##### getWithdrawalEvents()

```ts
getWithdrawalEvents(
   childProvider: Provider,
   gatewayAddress: string,
   filter: object,
   parentTokenAddress?: string,
   fromAddress?: string,
toAddress?: string): Promise<object & object[]>
```

Get the child network events created by a withdrawal

###### Parameters

| Parameter             | Type       | Description |
| :-------------------- | :--------- | :---------- |
| `childProvider`       | `Provider` |             |
| `gatewayAddress`      | `string`   |             |
| `filter`              | `object`   |             |
| `filter.fromBlock`    | `BlockTag` | -           |
| `filter.toBlock`?     | `BlockTag` | -           |
| `parentTokenAddress`? | `string`   |             |
| `fromAddress`?        | `string`   |             |
| `toAddress`?          | `string`   | -           |

###### Returns

`Promise`\<`object` & `object`[]\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getWithdrawalEvents`](erc20Bridger.md#getwithdrawalevents-1)

###### Source

[assetBridger/erc20Bridger.ts:367](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L367)

##### getWithdrawalRequest()

```ts
getWithdrawalRequest(params: Erc20WithdrawParams): Promise<ChildToParentTransactionRequest>
```

Get the arguments for calling the token withdrawal function

###### Parameters

| Parameter | Type                  | Description |
| :-------- | :-------------------- | :---------- |
| `params`  | `Erc20WithdrawParams` |             |

###### Returns

`Promise` \<[`ChildToParentTransactionRequest`](../dataEntities/transactionRequest.md#childtoparenttransactionrequest)\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getWithdrawalRequest`](erc20Bridger.md#getwithdrawalrequest-1)

###### Source

[assetBridger/erc20Bridger.ts:826](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L826)

##### isDepositDisabled()

```ts
isDepositDisabled(parentTokenAddress: string, parentProvider: Provider): Promise<boolean>
```

Whether the token has been disabled on the router

###### Parameters

| Parameter            | Type       | Description |
| :------------------- | :--------- | :---------- |
| `parentTokenAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`isDepositDisabled`](erc20Bridger.md#isdepositdisabled-1)

###### Source

[assetBridger/erc20Bridger.ts:560](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L560)

##### isRegistered()

```ts
isRegistered(params: object): Promise<boolean>
```

Checks if the token has been properly registered on both gateways. Mostly useful for tokens that use a custom gateway.

###### Parameters

| Parameter                   | Type       | Description |
| :-------------------------- | :--------- | :---------- |
| `params`                    | `object`   |             |
| `params.childProvider`      | `Provider` |             |
| `params.erc20ParentAddress` | `string`   |             |
| `params.parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`isRegistered`](erc20Bridger.md#isregistered-1)

###### Source

[assetBridger/erc20Bridger.ts:924](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L924)

##### registerCustomToken()

```ts
registerCustomToken(
   parentTokenAddress: string,
   childTokenAddress: string,
   parentSigner: Signer,
childProvider: Provider): Promise<ParentContractTransaction<ParentTransactionReceipt>>
```

Register a custom token on the Arbitrum bridge
See https://developer.offchainlabs.com/docs/bridging_assets#the-arbitrum-generic-custom-gateway for more details

###### Parameters

| Parameter            | Type       | Description                                                                                                                                                                                 |
| :------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `parentTokenAddress` | `string`   | Address of the already deployed parent token. Must inherit from https://developer.offchainlabs.com/docs/sol_contract_docs/md_docs/arb-bridge-peripherals/tokenbridge/ethereum/icustomtoken. |
| `childTokenAddress`  | `string`   | Address of the already deployed child token. Must inherit from https://developer.offchainlabs.com/docs/sol_contract_docs/md_docs/arb-bridge-peripherals/tokenbridge/arbitrum/iarbtoken.     |
| `parentSigner`       | `Signer`   | The signer with the rights to call `registerTokenOnL2` on the parent token                                                                                                                  |
| `childProvider`      | `Provider` | Arbitrum rpc provider                                                                                                                                                                       |

###### Returns

`Promise`\<`ParentContractTransaction`\<`ParentTransactionReceipt`\>\>

###### Source

[assetBridger/erc20Bridger.ts:1035](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L1035)

##### setGateways()

```ts
setGateways(
   parentSigner: Signer,
   childProvider: Provider,
   tokenGateways: TokenAndGateway[],
options?: GasOverrides): Promise<ParentContractCallTransaction>
```

Register the provided token addresses against the provided gateways

###### Parameters

| Parameter       | Type                | Description |
| :-------------- | :------------------ | :---------- |
| `parentSigner`  | `Signer`            |             |
| `childProvider` | `Provider`          |             |
| `tokenGateways` | `TokenAndGateway`[] |             |
| `options`?      | `GasOverrides`      | -           |

###### Returns

`Promise`\<`ParentContractCallTransaction`\>

###### Source

[assetBridger/erc20Bridger.ts:1266](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L1266)

##### withdraw()

```ts
withdraw(params: ChildToParentTxReqAndSigner | OmitTyped<Erc20WithdrawParams, "from"> & object): Promise<ChildContractTransaction>
```

Withdraw tokens from child to parent network

###### Parameters

| Parameter | Type                                                                                                                        | Description |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------- | :---------- |
| `params`  | `ChildToParentTxReqAndSigner` \| [`OmitTyped`](../utils/types.md#omittypedtk)\<`Erc20WithdrawParams`, `"from"`\> & `object` |             |

###### Returns

`Promise`\<`ChildContractTransaction`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`withdraw`](erc20Bridger.md#withdraw-1)

###### Source

[assetBridger/erc20Bridger.ts:889](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L889)

##### fromProvider()

```ts
static fromProvider(childProvider: Provider): Promise<Erc20Bridger>
```

Instantiates a new Erc20Bridger from a child provider

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise` \<[`Erc20Bridger`](erc20Bridger.md#erc20bridger)\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`fromProvider`](erc20Bridger.md#fromprovider-1)

###### Source

[assetBridger/erc20Bridger.ts:216](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L216)

---

### Erc20Bridger

Bridger for moving ERC20 tokens back and forth between parent-to-child

#### Extends

- [`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams)\<`Erc20DepositParams` \| `ParentToChildTxReqAndSignerProvider`, [`OmitTyped`](../utils/types.md#omittypedtk)\<`Erc20WithdrawParams`, `"from"`\> \| [`ChildToParentTransactionRequest`](../dataEntities/transactionRequest.md#childtoparenttransactionrequest)\>

#### Extended by

- [`AdminErc20Bridger`](erc20Bridger.md#adminerc20bridger)

#### Constructors

##### new Erc20Bridger()

```ts
new Erc20Bridger(childNetwork: ArbitrumNetwork): Erc20Bridger
```

Bridger for moving ERC20 tokens back and forth between parent-to-child

###### Parameters

| Parameter      | Type                                                             |
| :------------- | :--------------------------------------------------------------- |
| `childNetwork` | [`ArbitrumNetwork`](../dataEntities/networks.md#arbitrumnetwork) |

###### Returns

[`Erc20Bridger`](erc20Bridger.md#erc20bridger)

###### Overrides

AssetBridger\<
Erc20DepositParams \| ParentToChildTxReqAndSignerProvider,
OmitTyped\<Erc20WithdrawParams, 'from'\> \| ChildToParentTransactionRequest
\>.constructor

###### Source

[assetBridger/erc20Bridger.ts:205](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L205)

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
approveGasToken(params: ApproveParamsOrTxRequest): Promise<ContractTransaction>
```

Approves the custom gas token to be spent by the relevant gateway on the parent network

###### Parameters

| Parameter | Type                       | Description |
| :-------- | :------------------------- | :---------- |
| `params`  | `ApproveParamsOrTxRequest` |             |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Source

[assetBridger/erc20Bridger.ts:276](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L276)

##### approveToken()

```ts
approveToken(params: ApproveParamsOrTxRequest): Promise<ContractTransaction>
```

Approve tokens for deposit to the bridge. The tokens will be approved for the relevant gateway.

###### Parameters

| Parameter | Type                       | Description |
| :-------- | :------------------------- | :---------- |
| `params`  | `ApproveParamsOrTxRequest` |             |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Source

[assetBridger/erc20Bridger.ts:339](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L339)

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
deposit(params: Erc20DepositParams | ParentToChildTxReqAndSignerProvider): Promise<ParentContractCallTransaction>
```

Execute a token deposit from parent to child network

###### Parameters

| Parameter | Type                                                          | Description |
| :-------- | :------------------------------------------------------------ | :---------- |
| `params`  | `Erc20DepositParams` \| `ParentToChildTxReqAndSignerProvider` |             |

###### Returns

`Promise`\<`ParentContractCallTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`deposit`](assetBridger.md#deposit)

###### Source

[assetBridger/erc20Bridger.ts:769](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L769)

##### getApproveGasTokenRequest()

```ts
getApproveGasTokenRequest(params: ProviderTokenApproveParams): Promise<Required<Pick<TransactionRequest, "data" | "value" | "to">>>
```

Creates a transaction request for approving the custom gas token to be spent by the relevant gateway on the parent network

###### Parameters

| Parameter | Type                         | Description |
| :-------- | :--------------------------- | :---------- |
| `params`  | `ProviderTokenApproveParams` |             |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"to"`\>\>\>

###### Source

[assetBridger/erc20Bridger.ts:260](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L260)

##### getApproveTokenRequest()

```ts
getApproveTokenRequest(params: ProviderTokenApproveParams): Promise<Required<Pick<TransactionRequest, "data" | "value" | "to">>>
```

Get a tx request to approve tokens for deposit to the bridge.
The tokens will be approved for the relevant gateway.

###### Parameters

| Parameter | Type                         | Description |
| :-------- | :--------------------------- | :---------- |
| `params`  | `ProviderTokenApproveParams` |             |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"to"`\>\>\>

###### Source

[assetBridger/erc20Bridger.ts:306](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L306)

##### getChildErc20Address()

```ts
getChildErc20Address(erc20ParentAddress: string, parentProvider: Provider): Promise<string>
```

Get the corresponding child network token address for the provided parent network token

###### Parameters

| Parameter            | Type       | Description |
| :------------------- | :--------- | :---------- |
| `erc20ParentAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/erc20Bridger.ts:491](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L491)

##### getChildGatewayAddress()

```ts
getChildGatewayAddress(erc20ParentAddress: string, childProvider: Provider): Promise<string>
```

Get the address of the child gateway for this token

###### Parameters

| Parameter            | Type       | Description |
| :------------------- | :--------- | :---------- |
| `erc20ParentAddress` | `string`   |             |
| `childProvider`      | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/erc20Bridger.ts:244](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L244)

##### getChildTokenContract()

```ts
getChildTokenContract(childProvider: Provider, childTokenAddr: string): L2GatewayToken
```

Get the child network token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesn't
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `childProvider`  | `Provider` |             |
| `childTokenAddr` | `string`   |             |

###### Returns

`L2GatewayToken`

###### Source

[assetBridger/erc20Bridger.ts:462](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L462)

##### getDepositRequest()

```ts
getDepositRequest(params: DepositRequest): Promise<ParentToChildTransactionRequest>
```

Get the arguments for calling the deposit function

###### Parameters

| Parameter | Type             | Description |
| :-------- | :--------------- | :---------- |
| `params`  | `DepositRequest` |             |

###### Returns

`Promise` \<[`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest)\>

###### Source

[assetBridger/erc20Bridger.ts:655](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L655)

##### getDepositRequestCallValue()

```ts
private getDepositRequestCallValue(depositParams: OmitTyped<ParentToChildMessageGasParams, "deposit">): BigNumber | BigNumber
```

Get the call value for the deposit transaction request

###### Parameters

| Parameter       | Type                                                                                         | Description |
| :-------------- | :------------------------------------------------------------------------------------------- | :---------- |
| `depositParams` | [`OmitTyped`](../utils/types.md#omittypedtk)\<`ParentToChildMessageGasParams`, `"deposit"`\> |             |

###### Returns

`BigNumber` \| `BigNumber`

###### Source

[assetBridger/erc20Bridger.ts:593](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L593)

##### getDepositRequestOutboundTransferInnerData()

```ts
private getDepositRequestOutboundTransferInnerData(depositParams: OmitTyped<ParentToChildMessageGasParams, "deposit">, decimals: number): string
```

Get the `data` param for call to `outboundTransfer`

###### Parameters

| Parameter       | Type                                                                                         | Description |
| :-------------- | :------------------------------------------------------------------------------------------- | :---------- |
| `depositParams` | [`OmitTyped`](../utils/types.md#omittypedtk)\<`ParentToChildMessageGasParams`, `"deposit"`\> |             |
| `decimals`      | `number`                                                                                     | -           |

###### Returns

`string`

###### Source

[assetBridger/erc20Bridger.ts:616](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L616)

##### getParentErc20Address()

```ts
getParentErc20Address(erc20ChildChainAddress: string, childProvider: Provider): Promise<string>
```

Get the corresponding parent network address for the provided child network token
Validates the returned address against the child network router to ensure it is correctly mapped to the provided erc20ChildChainAddress

###### Parameters

| Parameter                | Type       | Description |
| :----------------------- | :--------- | :---------- |
| `erc20ChildChainAddress` | `string`   |             |
| `childProvider`          | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/erc20Bridger.ts:514](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L514)

##### getParentGatewayAddress()

```ts
getParentGatewayAddress(erc20ParentAddress: string, parentProvider: Provider): Promise<string>
```

Get the address of the parent gateway for this token

###### Parameters

| Parameter            | Type       | Description |
| :------------------- | :--------- | :---------- |
| `erc20ParentAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/erc20Bridger.ts:226](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L226)

##### getParentTokenContract()

```ts
getParentTokenContract(parentProvider: Provider, parentTokenAddr: string): ERC20
```

Get the parent token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesnt
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter         | Type       | Description |
| :---------------- | :--------- | :---------- |
| `parentProvider`  | `Provider` |             |
| `parentTokenAddr` | `string`   |             |

###### Returns

`ERC20`

###### Source

[assetBridger/erc20Bridger.ts:478](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L478)

##### getWithdrawalEvents()

```ts
getWithdrawalEvents(
   childProvider: Provider,
   gatewayAddress: string,
   filter: object,
   parentTokenAddress?: string,
   fromAddress?: string,
toAddress?: string): Promise<object & object[]>
```

Get the child network events created by a withdrawal

###### Parameters

| Parameter             | Type       | Description |
| :-------------------- | :--------- | :---------- |
| `childProvider`       | `Provider` |             |
| `gatewayAddress`      | `string`   |             |
| `filter`              | `object`   |             |
| `filter.fromBlock`    | `BlockTag` | -           |
| `filter.toBlock`?     | `BlockTag` | -           |
| `parentTokenAddress`? | `string`   |             |
| `fromAddress`?        | `string`   |             |
| `toAddress`?          | `string`   | -           |

###### Returns

`Promise`\<`object` & `object`[]\>

###### Source

[assetBridger/erc20Bridger.ts:367](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L367)

##### getWithdrawalRequest()

```ts
getWithdrawalRequest(params: Erc20WithdrawParams): Promise<ChildToParentTransactionRequest>
```

Get the arguments for calling the token withdrawal function

###### Parameters

| Parameter | Type                  | Description |
| :-------- | :-------------------- | :---------- |
| `params`  | `Erc20WithdrawParams` |             |

###### Returns

`Promise` \<[`ChildToParentTransactionRequest`](../dataEntities/transactionRequest.md#childtoparenttransactionrequest)\>

###### Source

[assetBridger/erc20Bridger.ts:826](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L826)

##### isDepositDisabled()

```ts
isDepositDisabled(parentTokenAddress: string, parentProvider: Provider): Promise<boolean>
```

Whether the token has been disabled on the router

###### Parameters

| Parameter            | Type       | Description |
| :------------------- | :--------- | :---------- |
| `parentTokenAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

###### Source

[assetBridger/erc20Bridger.ts:560](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L560)

##### isRegistered()

```ts
isRegistered(params: object): Promise<boolean>
```

Checks if the token has been properly registered on both gateways. Mostly useful for tokens that use a custom gateway.

###### Parameters

| Parameter                   | Type       | Description |
| :-------------------------- | :--------- | :---------- |
| `params`                    | `object`   |             |
| `params.childProvider`      | `Provider` |             |
| `params.erc20ParentAddress` | `string`   |             |
| `params.parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

###### Source

[assetBridger/erc20Bridger.ts:924](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L924)

##### isWethGateway()

```ts
private isWethGateway(gatewayAddress: string, parentProvider: Provider): Promise<boolean>
```

Is this a known or unknown WETH gateway

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `gatewayAddress` | `string`   |             |
| `parentProvider` | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

###### Source

[assetBridger/erc20Bridger.ts:436](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L436)

##### looksLikeWethGateway()

```ts
private looksLikeWethGateway(potentialWethGatewayAddress: string, parentProvider: Provider): Promise<boolean>
```

Does the provided address look like a weth gateway

###### Parameters

| Parameter                     | Type       | Description |
| :---------------------------- | :--------- | :---------- |
| `potentialWethGatewayAddress` | `string`   |             |
| `parentProvider`              | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

###### Source

[assetBridger/erc20Bridger.ts:406](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L406)

##### withdraw()

```ts
withdraw(params: ChildToParentTxReqAndSigner | OmitTyped<Erc20WithdrawParams, "from"> & object): Promise<ChildContractTransaction>
```

Withdraw tokens from child to parent network

###### Parameters

| Parameter | Type                                                                                                                        | Description |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------- | :---------- |
| `params`  | `ChildToParentTxReqAndSigner` \| [`OmitTyped`](../utils/types.md#omittypedtk)\<`Erc20WithdrawParams`, `"from"`\> & `object` |             |

###### Returns

`Promise`\<`ChildContractTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`withdraw`](assetBridger.md#withdraw)

###### Source

[assetBridger/erc20Bridger.ts:889](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L889)

##### fromProvider()

```ts
static fromProvider(childProvider: Provider): Promise<Erc20Bridger>
```

Instantiates a new Erc20Bridger from a child provider

###### Parameters

| Parameter       | Type       | Description |
| :-------------- | :--------- | :---------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise` \<[`Erc20Bridger`](erc20Bridger.md#erc20bridger)\>

###### Source

[assetBridger/erc20Bridger.ts:216](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/erc20Bridger.ts#L216)
