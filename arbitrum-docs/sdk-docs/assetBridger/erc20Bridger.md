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
new AdminErc20Bridger(l2Network: L2Network): AdminErc20Bridger
```

Bridger for moving ERC20 tokens back and forth between L1 to L2

###### Parameters

| Parameter   | Type                                                 |
| :---------- | :--------------------------------------------------- |
| `l2Network` | [`L2Network`](../dataEntities/networks.md#l2network) |

###### Returns

[`AdminErc20Bridger`](erc20Bridger.md#adminerc20bridger)

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`constructor`](erc20Bridger.md#constructors-1)

###### Source

[assetBridger/erc20Bridger.ts:187](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L187)

#### Properties

| Property       | Modifier   | Type                                                                                                         | Description                                                                                                                                                                                                                                                           | Inherited from                                               |
| :------------- | :--------- | :----------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| `l1Network`    | `readonly` | [`L1Network`](../dataEntities/networks.md#l1network) \| [`L2Network`](../dataEntities/networks.md#l2network) | Parent chain for the given Arbitrum chain, can be an L1 or an L2                                                                                                                                                                                                      | [`Erc20Bridger`](erc20Bridger.md#erc20bridger).`l1Network`   |
| `nativeToken?` | `readonly` | `string`                                                                                                     | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address<br /><br />In case of a chain that uses an ERC-20 token from the parent chain as its native/gas token, this is the address of said token on the parent chain | [`Erc20Bridger`](erc20Bridger.md#erc20bridger).`nativeToken` |

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
approveGasToken(params: ApproveParamsOrTxRequest): Promise<ContractTransaction>
```

Approves the custom gas token to be spent by the relevant gateway on the parent chain

###### Parameters

| Parameter | Type                       | Description |
| :-------- | :------------------------- | :---------- |
| `params`  | `ApproveParamsOrTxRequest` |             |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`approveGasToken`](erc20Bridger.md#approvegastoken-1)

###### Source

[assetBridger/erc20Bridger.ts:256](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L256)

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

[assetBridger/erc20Bridger.ts:317](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L317)

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

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`checkL1Network`](erc20Bridger.md#checkl1network-1)

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

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`checkL2Network`](erc20Bridger.md#checkl2network-1)

###### Source

[assetBridger/assetBridger.ts:67](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/assetBridger.ts#L67)

##### deposit()

```ts
deposit(params: Erc20DepositParams | L1ToL2TxReqAndSignerProvider): Promise<L1ContractCallTransaction>
```

Execute a token deposit from L1 to L2

###### Parameters

| Parameter | Type                                                   | Description |
| :-------- | :----------------------------------------------------- | :---------- |
| `params`  | `Erc20DepositParams` \| `L1ToL2TxReqAndSignerProvider` |             |

###### Returns

`Promise`\<`L1ContractCallTransaction`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`deposit`](erc20Bridger.md#deposit-1)

###### Source

[assetBridger/erc20Bridger.ts:723](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L723)

##### getApproveGasTokenRequest()

```ts
getApproveGasTokenRequest(params: ProviderTokenApproveParams): Promise<Required<Pick<TransactionRequest, "data" | "value" | "to">>>
```

Creates a transaction request for approving the custom gas token to be spent by the relevant gateway on the parent chain

###### Parameters

| Parameter | Type                         | Description |
| :-------- | :--------------------------- | :---------- |
| `params`  | `ProviderTokenApproveParams` |             |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"to"`\>\>\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getApproveGasTokenRequest`](erc20Bridger.md#getapprovegastokenrequest-1)

###### Source

[assetBridger/erc20Bridger.ts:240](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L240)

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

[assetBridger/erc20Bridger.ts:284](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L284)

##### getDepositRequest()

```ts
getDepositRequest(params: DepositRequest): Promise<L1ToL2TransactionRequest>
```

Get the arguments for calling the deposit function

###### Parameters

| Parameter | Type             | Description |
| :-------- | :--------------- | :---------- |
| `params`  | `DepositRequest` |             |

###### Returns

`Promise` \<[`L1ToL2TransactionRequest`](../dataEntities/transactionRequest.md#l1tol2transactionrequest)\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getDepositRequest`](erc20Bridger.md#getdepositrequest-1)

###### Source

[assetBridger/erc20Bridger.ts:617](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L617)

##### getL1ERC20Address()

```ts
getL1ERC20Address(erc20L2Address: string, l2Provider: Provider): Promise<string>
```

Get the corresponding L1 for the provided L2 token
Validates the returned address against the l2 router to ensure it is correctly mapped to the provided erc20L2Address

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `erc20L2Address` | `string`   |             |
| `l2Provider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getL1ERC20Address`](erc20Bridger.md#getl1erc20address-1)

###### Source

[assetBridger/erc20Bridger.ts:487](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L487)

##### getL1GatewayAddress()

```ts
getL1GatewayAddress(erc20L1Address: string, l1Provider: Provider): Promise<string>
```

Get the address of the l1 gateway for this token

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `erc20L1Address` | `string`   |             |
| `l1Provider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getL1GatewayAddress`](erc20Bridger.md#getl1gatewayaddress-1)

###### Source

[assetBridger/erc20Bridger.ts:206](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L206)

##### getL1GatewaySetEvents()

```ts
getL1GatewaySetEvents(l1Provider: Provider, filter: object): Promise<object[]>
```

Get all the gateway set events on the L1 gateway router

###### Parameters

| Parameter          | Type       | Description |
| :----------------- | :--------- | :---------- |
| `l1Provider`       | `Provider` |             |
| `filter`           | `object`   | -           |
| `filter.fromBlock` | `BlockTag` | -           |
| `filter.toBlock`   | `BlockTag` | -           |

###### Returns

`Promise`\<`object`[]\>

###### Source

[assetBridger/erc20Bridger.ts:1115](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L1115)

##### getL1TokenContract()

```ts
getL1TokenContract(l1Provider: Provider, l1TokenAddr: string): ERC20
```

Get the L1 token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesnt
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter     | Type       | Description |
| :------------ | :--------- | :---------- |
| `l1Provider`  | `Provider` |             |
| `l1TokenAddr` | `string`   |             |

###### Returns

`ERC20`

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getL1TokenContract`](erc20Bridger.md#getl1tokencontract-1)

###### Source

[assetBridger/erc20Bridger.ts:454](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L454)

##### getL2ERC20Address()

```ts
getL2ERC20Address(erc20L1Address: string, l1Provider: Provider): Promise<string>
```

Get the corresponding L2 for the provided L1 token

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `erc20L1Address` | `string`   |             |
| `l1Provider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getL2ERC20Address`](erc20Bridger.md#getl2erc20address-1)

###### Source

[assetBridger/erc20Bridger.ts:464](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L464)

##### getL2GatewayAddress()

```ts
getL2GatewayAddress(erc20L1Address: string, l2Provider: Provider): Promise<string>
```

Get the address of the l2 gateway for this token

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `erc20L1Address` | `string`   |             |
| `l2Provider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getL2GatewayAddress`](erc20Bridger.md#getl2gatewayaddress-1)

###### Source

[assetBridger/erc20Bridger.ts:224](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L224)

##### getL2GatewaySetEvents()

```ts
getL2GatewaySetEvents(
   l2Provider: Provider,
   filter: object,
customNetworkL2GatewayRouter?: string): Promise<object[]>
```

Get all the gateway set events on the L2 gateway router

###### Parameters

| Parameter                       | Type       |
| :------------------------------ | :--------- |
| `l2Provider`                    | `Provider` |
| `filter`                        | `object`   |
| `filter.fromBlock`              | `BlockTag` |
| `filter.toBlock`?               | `BlockTag` |
| `customNetworkL2GatewayRouter`? | `string`   |

###### Returns

`Promise`\<`object`[]\>

###### Source

[assetBridger/erc20Bridger.ts:1138](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L1138)

##### getL2TokenContract()

```ts
getL2TokenContract(l2Provider: Provider, l2TokenAddr: string): L2GatewayToken
```

Get the L2 token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesnt
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter     | Type       | Description |
| :------------ | :--------- | :---------- |
| `l2Provider`  | `Provider` |             |
| `l2TokenAddr` | `string`   |             |

###### Returns

`L2GatewayToken`

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getL2TokenContract`](erc20Bridger.md#getl2tokencontract-1)

###### Source

[assetBridger/erc20Bridger.ts:438](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L438)

##### getL2WithdrawalEvents()

```ts
getL2WithdrawalEvents(
   l2Provider: Provider,
   gatewayAddress: string,
   filter: object,
   l1TokenAddress?: string,
   fromAddress?: string,
toAddress?: string): Promise<object & object[]>
```

Get the L2 events created by a withdrawal

###### Parameters

| Parameter          | Type       | Description |
| :----------------- | :--------- | :---------- |
| `l2Provider`       | `Provider` |             |
| `gatewayAddress`   | `string`   |             |
| `filter`           | `object`   |             |
| `filter.fromBlock` | `BlockTag` | -           |
| `filter.toBlock`?  | `BlockTag` | -           |
| `l1TokenAddress`?  | `string`   |             |
| `fromAddress`?     | `string`   |             |
| `toAddress`?       | `string`   | -           |

###### Returns

`Promise`\<`object` & `object`[]\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getL2WithdrawalEvents`](erc20Bridger.md#getl2withdrawalevents-1)

###### Source

[assetBridger/erc20Bridger.ts:343](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L343)

##### getWithdrawalRequest()

```ts
getWithdrawalRequest(params: Erc20WithdrawParams): Promise<L2ToL1TransactionRequest>
```

Get the arguments for calling the token withdrawal function

###### Parameters

| Parameter | Type                  | Description |
| :-------- | :-------------------- | :---------- |
| `params`  | `Erc20WithdrawParams` |             |

###### Returns

`Promise` \<[`L2ToL1TransactionRequest`](../dataEntities/transactionRequest.md#l2tol1transactionrequest)\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`getWithdrawalRequest`](erc20Bridger.md#getwithdrawalrequest-1)

###### Source

[assetBridger/erc20Bridger.ts:759](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L759)

##### isRegistered()

```ts
isRegistered(__namedParameters: object): Promise<boolean>
```

Checks if the token has been properly registered on both gateways. Mostly useful for tokens that use a custom gateway.

###### Parameters

| Parameter                          | Type       |
| :--------------------------------- | :--------- |
| `__namedParameters`                | `object`   |
| `__namedParameters.erc20L1Address` | `string`   |
| `__namedParameters.l1Provider`     | `Provider` |
| `__namedParameters.l2Provider`     | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`isRegistered`](erc20Bridger.md#isregistered-1)

###### Source

[assetBridger/erc20Bridger.ts:852](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L852)

##### l1TokenIsDisabled()

```ts
l1TokenIsDisabled(l1TokenAddress: string, l1Provider: Provider): Promise<boolean>
```

Whether the token has been disabled on the router

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `l1TokenAddress` | `string`   |             |
| `l1Provider`     | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`l1TokenIsDisabled`](erc20Bridger.md#l1tokenisdisabled-1)

###### Source

[assetBridger/erc20Bridger.ts:526](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L526)

##### registerCustomToken()

```ts
registerCustomToken(
   l1TokenAddress: string,
   l2TokenAddress: string,
   l1Signer: Signer,
l2Provider: Provider): Promise<L1ContractTransaction<L1TransactionReceipt>>
```

Register a custom token on the Arbitrum bridge
See https://developer.offchainlabs.com/docs/bridging_assets#the-arbitrum-generic-custom-gateway for more details

###### Parameters

| Parameter        | Type       | Description                                                                                                                                                                             |
| :--------------- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l1TokenAddress` | `string`   | Address of the already deployed l1 token. Must inherit from https://developer.offchainlabs.com/docs/sol_contract_docs/md_docs/arb-bridge-peripherals/tokenbridge/ethereum/icustomtoken. |
| `l2TokenAddress` | `string`   | Address of the already deployed l2 token. Must inherit from https://developer.offchainlabs.com/docs/sol_contract_docs/md_docs/arb-bridge-peripherals/tokenbridge/arbitrum/iarbtoken.    |
| `l1Signer`       | `Signer`   | The signer with the rights to call registerTokenOnL2 on the l1 token                                                                                                                    |
| `l2Provider`     | `Provider` | Arbitrum rpc provider                                                                                                                                                                   |

###### Returns

`Promise`\<`L1ContractTransaction`\<`L1TransactionReceipt`\>\>

###### Source

[assetBridger/erc20Bridger.ts:966](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L966)

##### setGateways()

```ts
setGateways(
   l1Signer: Signer,
   l2Provider: Provider,
   tokenGateways: TokenAndGateway[],
options?: GasOverrides): Promise<L1ContractCallTransaction>
```

Register the provided token addresses against the provided gateways

###### Parameters

| Parameter       | Type                | Description |
| :-------------- | :------------------ | :---------- |
| `l1Signer`      | `Signer`            |             |
| `l2Provider`    | `Provider`          |             |
| `tokenGateways` | `TokenAndGateway`[] |             |
| `options`?      | `GasOverrides`      | -           |

###### Returns

`Promise`\<`L1ContractCallTransaction`\>

###### Source

[assetBridger/erc20Bridger.ts:1170](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L1170)

##### withdraw()

```ts
withdraw(params: L2ToL1TxReqAndSigner | OmitTyped<Erc20WithdrawParams, "from"> & object): Promise<L2ContractTransaction>
```

Withdraw tokens from L2 to L1

###### Parameters

| Parameter | Type                                                                                                                 | Description |
| :-------- | :------------------------------------------------------------------------------------------------------------------- | :---------- |
| `params`  | `L2ToL1TxReqAndSigner` \| [`OmitTyped`](../utils/types.md#omittypedtk)\<`Erc20WithdrawParams`, `"from"`\> & `object` |             |

###### Returns

`Promise`\<`L2ContractTransaction`\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`withdraw`](erc20Bridger.md#withdraw-1)

###### Source

[assetBridger/erc20Bridger.ts:819](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L819)

##### fromProvider()

```ts
static fromProvider(l2Provider: Provider): Promise<Erc20Bridger>
```

Instantiates a new Erc20Bridger from an L2 Provider

###### Parameters

| Parameter    | Type       | Description |
| :----------- | :--------- | :---------- |
| `l2Provider` | `Provider` |             |

###### Returns

`Promise` \<[`Erc20Bridger`](erc20Bridger.md#erc20bridger)\>

###### Inherited from

[`Erc20Bridger`](erc20Bridger.md#erc20bridger) . [`fromProvider`](erc20Bridger.md#fromprovider-1)

###### Source

[assetBridger/erc20Bridger.ts:196](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L196)

---

### Erc20Bridger

Bridger for moving ERC20 tokens back and forth between L1 to L2

#### Extends

- [`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams)\<`Erc20DepositParams` \| `L1ToL2TxReqAndSignerProvider`, [`OmitTyped`](../utils/types.md#omittypedtk)\<`Erc20WithdrawParams`, `"from"`\> \| [`L2ToL1TransactionRequest`](../dataEntities/transactionRequest.md#l2tol1transactionrequest)\>

#### Extended by

- [`AdminErc20Bridger`](erc20Bridger.md#adminerc20bridger)

#### Constructors

##### new Erc20Bridger()

```ts
new Erc20Bridger(l2Network: L2Network): Erc20Bridger
```

Bridger for moving ERC20 tokens back and forth between L1 to L2

###### Parameters

| Parameter   | Type                                                 |
| :---------- | :--------------------------------------------------- |
| `l2Network` | [`L2Network`](../dataEntities/networks.md#l2network) |

###### Returns

[`Erc20Bridger`](erc20Bridger.md#erc20bridger)

###### Overrides

AssetBridger\<
Erc20DepositParams \| L1ToL2TxReqAndSignerProvider,
OmitTyped\<Erc20WithdrawParams, 'from'\> \| L2ToL1TransactionRequest
\>.constructor

###### Source

[assetBridger/erc20Bridger.ts:187](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L187)

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
approveGasToken(params: ApproveParamsOrTxRequest): Promise<ContractTransaction>
```

Approves the custom gas token to be spent by the relevant gateway on the parent chain

###### Parameters

| Parameter | Type                       | Description |
| :-------- | :------------------------- | :---------- |
| `params`  | `ApproveParamsOrTxRequest` |             |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Source

[assetBridger/erc20Bridger.ts:256](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L256)

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

[assetBridger/erc20Bridger.ts:317](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L317)

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
deposit(params: Erc20DepositParams | L1ToL2TxReqAndSignerProvider): Promise<L1ContractCallTransaction>
```

Execute a token deposit from L1 to L2

###### Parameters

| Parameter | Type                                                   | Description |
| :-------- | :----------------------------------------------------- | :---------- |
| `params`  | `Erc20DepositParams` \| `L1ToL2TxReqAndSignerProvider` |             |

###### Returns

`Promise`\<`L1ContractCallTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`deposit`](assetBridger.md#deposit)

###### Source

[assetBridger/erc20Bridger.ts:723](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L723)

##### getApproveGasTokenRequest()

```ts
getApproveGasTokenRequest(params: ProviderTokenApproveParams): Promise<Required<Pick<TransactionRequest, "data" | "value" | "to">>>
```

Creates a transaction request for approving the custom gas token to be spent by the relevant gateway on the parent chain

###### Parameters

| Parameter | Type                         | Description |
| :-------- | :--------------------------- | :---------- |
| `params`  | `ProviderTokenApproveParams` |             |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"to"`\>\>\>

###### Source

[assetBridger/erc20Bridger.ts:240](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L240)

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

[assetBridger/erc20Bridger.ts:284](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L284)

##### getDepositRequest()

```ts
getDepositRequest(params: DepositRequest): Promise<L1ToL2TransactionRequest>
```

Get the arguments for calling the deposit function

###### Parameters

| Parameter | Type             | Description |
| :-------- | :--------------- | :---------- |
| `params`  | `DepositRequest` |             |

###### Returns

`Promise` \<[`L1ToL2TransactionRequest`](../dataEntities/transactionRequest.md#l1tol2transactionrequest)\>

###### Source

[assetBridger/erc20Bridger.ts:617](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L617)

##### getDepositRequestCallValue()

```ts
private getDepositRequestCallValue(depositParams: OmitTyped<L1ToL2MessageGasParams, "deposit">): BigNumber | BigNumber
```

Get the call value for the deposit transaction request

###### Parameters

| Parameter       | Type                                                                                  | Description |
| :-------------- | :------------------------------------------------------------------------------------ | :---------- |
| `depositParams` | [`OmitTyped`](../utils/types.md#omittypedtk)\<`L1ToL2MessageGasParams`, `"deposit"`\> |             |

###### Returns

`BigNumber` \| `BigNumber`

###### Source

[assetBridger/erc20Bridger.ts:559](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L559)

##### getDepositRequestOutboundTransferInnerData()

```ts
private getDepositRequestOutboundTransferInnerData(depositParams: OmitTyped<L1ToL2MessageGasParams, "deposit">): string
```

Get the `data` param for call to `outboundTransfer`

###### Parameters

| Parameter       | Type                                                                                  | Description |
| :-------------- | :------------------------------------------------------------------------------------ | :---------- |
| `depositParams` | [`OmitTyped`](../utils/types.md#omittypedtk)\<`L1ToL2MessageGasParams`, `"deposit"`\> |             |

###### Returns

`string`

###### Source

[assetBridger/erc20Bridger.ts:582](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L582)

##### getL1ERC20Address()

```ts
getL1ERC20Address(erc20L2Address: string, l2Provider: Provider): Promise<string>
```

Get the corresponding L1 for the provided L2 token
Validates the returned address against the l2 router to ensure it is correctly mapped to the provided erc20L2Address

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `erc20L2Address` | `string`   |             |
| `l2Provider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/erc20Bridger.ts:487](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L487)

##### getL1GatewayAddress()

```ts
getL1GatewayAddress(erc20L1Address: string, l1Provider: Provider): Promise<string>
```

Get the address of the l1 gateway for this token

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `erc20L1Address` | `string`   |             |
| `l1Provider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/erc20Bridger.ts:206](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L206)

##### getL1TokenContract()

```ts
getL1TokenContract(l1Provider: Provider, l1TokenAddr: string): ERC20
```

Get the L1 token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesnt
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter     | Type       | Description |
| :------------ | :--------- | :---------- |
| `l1Provider`  | `Provider` |             |
| `l1TokenAddr` | `string`   |             |

###### Returns

`ERC20`

###### Source

[assetBridger/erc20Bridger.ts:454](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L454)

##### getL2ERC20Address()

```ts
getL2ERC20Address(erc20L1Address: string, l1Provider: Provider): Promise<string>
```

Get the corresponding L2 for the provided L1 token

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `erc20L1Address` | `string`   |             |
| `l1Provider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/erc20Bridger.ts:464](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L464)

##### getL2GatewayAddress()

```ts
getL2GatewayAddress(erc20L1Address: string, l2Provider: Provider): Promise<string>
```

Get the address of the l2 gateway for this token

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `erc20L1Address` | `string`   |             |
| `l2Provider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/erc20Bridger.ts:224](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L224)

##### getL2TokenContract()

```ts
getL2TokenContract(l2Provider: Provider, l2TokenAddr: string): L2GatewayToken
```

Get the L2 token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesnt
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter     | Type       | Description |
| :------------ | :--------- | :---------- |
| `l2Provider`  | `Provider` |             |
| `l2TokenAddr` | `string`   |             |

###### Returns

`L2GatewayToken`

###### Source

[assetBridger/erc20Bridger.ts:438](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L438)

##### getL2WithdrawalEvents()

```ts
getL2WithdrawalEvents(
   l2Provider: Provider,
   gatewayAddress: string,
   filter: object,
   l1TokenAddress?: string,
   fromAddress?: string,
toAddress?: string): Promise<object & object[]>
```

Get the L2 events created by a withdrawal

###### Parameters

| Parameter          | Type       | Description |
| :----------------- | :--------- | :---------- |
| `l2Provider`       | `Provider` |             |
| `gatewayAddress`   | `string`   |             |
| `filter`           | `object`   |             |
| `filter.fromBlock` | `BlockTag` | -           |
| `filter.toBlock`?  | `BlockTag` | -           |
| `l1TokenAddress`?  | `string`   |             |
| `fromAddress`?     | `string`   |             |
| `toAddress`?       | `string`   | -           |

###### Returns

`Promise`\<`object` & `object`[]\>

###### Source

[assetBridger/erc20Bridger.ts:343](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L343)

##### getWithdrawalRequest()

```ts
getWithdrawalRequest(params: Erc20WithdrawParams): Promise<L2ToL1TransactionRequest>
```

Get the arguments for calling the token withdrawal function

###### Parameters

| Parameter | Type                  | Description |
| :-------- | :-------------------- | :---------- |
| `params`  | `Erc20WithdrawParams` |             |

###### Returns

`Promise` \<[`L2ToL1TransactionRequest`](../dataEntities/transactionRequest.md#l2tol1transactionrequest)\>

###### Source

[assetBridger/erc20Bridger.ts:759](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L759)

##### isRegistered()

```ts
isRegistered(__namedParameters: object): Promise<boolean>
```

Checks if the token has been properly registered on both gateways. Mostly useful for tokens that use a custom gateway.

###### Parameters

| Parameter                          | Type       |
| :--------------------------------- | :--------- |
| `__namedParameters`                | `object`   |
| `__namedParameters.erc20L1Address` | `string`   |
| `__namedParameters.l1Provider`     | `Provider` |
| `__namedParameters.l2Provider`     | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Source

[assetBridger/erc20Bridger.ts:852](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L852)

##### isWethGateway()

```ts
private isWethGateway(gatewayAddress: string, l1Provider: Provider): Promise<boolean>
```

Is this a known or unknown WETH gateway

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `gatewayAddress` | `string`   |             |
| `l1Provider`     | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

###### Source

[assetBridger/erc20Bridger.ts:412](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L412)

##### l1TokenIsDisabled()

```ts
l1TokenIsDisabled(l1TokenAddress: string, l1Provider: Provider): Promise<boolean>
```

Whether the token has been disabled on the router

###### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `l1TokenAddress` | `string`   |             |
| `l1Provider`     | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

###### Source

[assetBridger/erc20Bridger.ts:526](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L526)

##### looksLikeWethGateway()

```ts
private looksLikeWethGateway(potentialWethGatewayAddress: string, l1Provider: Provider): Promise<boolean>
```

Does the provided address look like a weth gateway

###### Parameters

| Parameter                     | Type       | Description |
| :---------------------------- | :--------- | :---------- |
| `potentialWethGatewayAddress` | `string`   |             |
| `l1Provider`                  | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

###### Source

[assetBridger/erc20Bridger.ts:382](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L382)

##### withdraw()

```ts
withdraw(params: L2ToL1TxReqAndSigner | OmitTyped<Erc20WithdrawParams, "from"> & object): Promise<L2ContractTransaction>
```

Withdraw tokens from L2 to L1

###### Parameters

| Parameter | Type                                                                                                                 | Description |
| :-------- | :------------------------------------------------------------------------------------------------------------------- | :---------- |
| `params`  | `L2ToL1TxReqAndSigner` \| [`OmitTyped`](../utils/types.md#omittypedtk)\<`Erc20WithdrawParams`, `"from"`\> & `object` |             |

###### Returns

`Promise`\<`L2ContractTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridgerdepositparamswithdrawparams) . [`withdraw`](assetBridger.md#withdraw)

###### Source

[assetBridger/erc20Bridger.ts:819](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L819)

##### fromProvider()

```ts
static fromProvider(l2Provider: Provider): Promise<Erc20Bridger>
```

Instantiates a new Erc20Bridger from an L2 Provider

###### Parameters

| Parameter    | Type       | Description |
| :----------- | :--------- | :---------- |
| `l2Provider` | `Provider` |             |

###### Returns

`Promise` \<[`Erc20Bridger`](erc20Bridger.md#erc20bridger)\>

###### Source

[assetBridger/erc20Bridger.ts:196](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/erc20Bridger.ts#L196)
