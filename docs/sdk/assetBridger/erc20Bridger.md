## Classes

### AdminErc20Bridger

Defined in: assetBridger/erc20Bridger.ts:977

Admin functionality for the token bridge

#### Extends

- [`Erc20Bridger`](#erc20bridger)

#### Constructors

##### Constructor

```ts
new AdminErc20Bridger(childNetwork: ArbitrumNetwork): AdminErc20Bridger;
```

Defined in: assetBridger/erc20Bridger.ts:205

Bridger for moving ERC20 tokens back and forth between parent-to-child

###### Parameters

| Parameter      | Type                                                             |
| -------------- | ---------------------------------------------------------------- |
| `childNetwork` | [`ArbitrumNetwork`](../dataEntities/networks.md#arbitrumnetwork) |

###### Returns

[`AdminErc20Bridger`](#adminerc20bridger)

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`constructor`](#constructor-1)

#### Properties

| Property                                | Modifier   | Type     | Description                                                                                                                                                                                                                                                    | Inherited from                                                  | Defined in                      |
| --------------------------------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| <a id="nativetoken"></a> `nativeToken?` | `readonly` | `string` | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address In case of a chain that uses an ERC-20 token from the parent network as its native/gas token, this is the address of said token on the parent network | [`Erc20Bridger`](#erc20bridger).[`nativeToken`](#nativetoken-1) | assetBridger/assetBridger.ts:40 |

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

[`Erc20Bridger`](#erc20bridger).[`nativeTokenIsEth`](#nativetokeniseth-1)

#### Methods

##### approveGasToken()

```ts
approveGasToken(params: ApproveParamsOrTxRequest): Promise<ContractTransaction>;
```

Defined in: assetBridger/erc20Bridger.ts:276

Approves the custom gas token to be spent by the relevant gateway on the parent network

###### Parameters

| Parameter | Type                       | Description |
| --------- | -------------------------- | ----------- |
| `params`  | `ApproveParamsOrTxRequest` |             |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`approveGasToken`](#approvegastoken-2)

##### approveToken()

```ts
approveToken(params: ApproveParamsOrTxRequest): Promise<ContractTransaction>;
```

Defined in: assetBridger/erc20Bridger.ts:339

Approve tokens for deposit to the bridge. The tokens will be approved for the relevant gateway.

###### Parameters

| Parameter | Type                       | Description |
| --------- | -------------------------- | ----------- |
| `params`  | `ApproveParamsOrTxRequest` |             |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`approveToken`](#approvetoken-2)

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

[`Erc20Bridger`](#erc20bridger).[`checkChildNetwork`](#checkchildnetwork-2)

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

[`Erc20Bridger`](#erc20bridger).[`checkParentNetwork`](#checkparentnetwork-2)

##### deposit()

```ts
deposit(params: Erc20DepositParams | ParentToChildTxReqAndSignerProvider): Promise<ParentContractCallTransaction>;
```

Defined in: assetBridger/erc20Bridger.ts:769

Execute a token deposit from parent to child network

###### Parameters

| Parameter | Type                                                          | Description |
| --------- | ------------------------------------------------------------- | ----------- |
| `params`  | `Erc20DepositParams` \| `ParentToChildTxReqAndSignerProvider` |             |

###### Returns

`Promise`\<`ParentContractCallTransaction`\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`deposit`](#deposit-2)

##### getApproveGasTokenRequest()

```ts
getApproveGasTokenRequest(params: ProviderTokenApproveParams): Promise<Required<Pick<TransactionRequest, "to" | "data" | "value">>>;
```

Defined in: assetBridger/erc20Bridger.ts:260

Creates a transaction request for approving the custom gas token to be spent by the relevant gateway on the parent network

###### Parameters

| Parameter | Type                         | Description |
| --------- | ---------------------------- | ----------- |
| `params`  | `ProviderTokenApproveParams` |             |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"to"` \| `"data"` \| `"value"`\>\>\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`getApproveGasTokenRequest`](#getapprovegastokenrequest-2)

##### getApproveTokenRequest()

```ts
getApproveTokenRequest(params: ProviderTokenApproveParams): Promise<Required<Pick<TransactionRequest, "to" | "data" | "value">>>;
```

Defined in: assetBridger/erc20Bridger.ts:306

Get a tx request to approve tokens for deposit to the bridge.
The tokens will be approved for the relevant gateway.

###### Parameters

| Parameter | Type                         | Description |
| --------- | ---------------------------- | ----------- |
| `params`  | `ProviderTokenApproveParams` |             |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"to"` \| `"data"` \| `"value"`\>\>\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`getApproveTokenRequest`](#getapprovetokenrequest-2)

##### getChildErc20Address()

```ts
getChildErc20Address(erc20ParentAddress: string, parentProvider: Provider): Promise<string>;
```

Defined in: assetBridger/erc20Bridger.ts:491

Get the corresponding child network token address for the provided parent network token

###### Parameters

| Parameter            | Type       | Description |
| -------------------- | ---------- | ----------- |
| `erc20ParentAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`getChildErc20Address`](#getchilderc20address-2)

##### getChildGatewayAddress()

```ts
getChildGatewayAddress(erc20ParentAddress: string, childProvider: Provider): Promise<string>;
```

Defined in: assetBridger/erc20Bridger.ts:244

Get the address of the child gateway for this token

###### Parameters

| Parameter            | Type       | Description |
| -------------------- | ---------- | ----------- |
| `erc20ParentAddress` | `string`   |             |
| `childProvider`      | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`getChildGatewayAddress`](#getchildgatewayaddress-2)

##### getChildGatewaySetEvents()

```ts
getChildGatewaySetEvents(
   childProvider: Provider,
   filter: object,
customNetworkChildGatewayRouter?: string): Promise<unknown[]>;
```

Defined in: assetBridger/erc20Bridger.ts:1233

Get all the gateway set events on the child gateway router

###### Parameters

| Parameter                          | Type                                                  | Description                                                 |
| ---------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| `childProvider`                    | `Provider`                                            | The provider for the child network                          |
| `filter`                           | \{ `fromBlock`: `BlockTag`; `toBlock`: `BlockTag`; \} | An object containing fromBlock and toBlock to filter events |
| `filter.fromBlock`                 | `BlockTag`                                            | -                                                           |
| `filter.toBlock?`                  | `BlockTag`                                            | -                                                           |
| `customNetworkChildGatewayRouter?` | `string`                                              | Optional address of the custom network child gateway router |

###### Returns

`Promise`\<`unknown`[]\>

An array of GatewaySetEvent event arguments

###### Throws

If the network is custom and customNetworkChildGatewayRouter is not provided

##### getChildTokenContract()

```ts
getChildTokenContract(childProvider: Provider, childTokenAddr: string): L2GatewayToken;
```

Defined in: assetBridger/erc20Bridger.ts:462

Get the child network token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesn't
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter        | Type       | Description |
| ---------------- | ---------- | ----------- |
| `childProvider`  | `Provider` |             |
| `childTokenAddr` | `string`   |             |

###### Returns

`L2GatewayToken`

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`getChildTokenContract`](#getchildtokencontract-2)

##### getDepositRequest()

```ts
getDepositRequest(params: DepositRequest): Promise<ParentToChildTransactionRequest>;
```

Defined in: assetBridger/erc20Bridger.ts:655

Get the arguments for calling the deposit function

###### Parameters

| Parameter | Type             | Description |
| --------- | ---------------- | ----------- |
| `params`  | `DepositRequest` |             |

###### Returns

`Promise`\<[`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest)\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`getDepositRequest`](#getdepositrequest-2)

##### getParentErc20Address()

```ts
getParentErc20Address(erc20ChildChainAddress: string, childProvider: Provider): Promise<string>;
```

Defined in: assetBridger/erc20Bridger.ts:514

Get the corresponding parent network address for the provided child network token
Validates the returned address against the child network router to ensure it is correctly mapped to the provided erc20ChildChainAddress

###### Parameters

| Parameter                | Type       | Description |
| ------------------------ | ---------- | ----------- |
| `erc20ChildChainAddress` | `string`   |             |
| `childProvider`          | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`getParentErc20Address`](#getparenterc20address-2)

##### getParentGatewayAddress()

```ts
getParentGatewayAddress(erc20ParentAddress: string, parentProvider: Provider): Promise<string>;
```

Defined in: assetBridger/erc20Bridger.ts:226

Get the address of the parent gateway for this token

###### Parameters

| Parameter            | Type       | Description |
| -------------------- | ---------- | ----------- |
| `erc20ParentAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`getParentGatewayAddress`](#getparentgatewayaddress-2)

##### getParentGatewaySetEvents()

```ts
getParentGatewaySetEvents(parentProvider: Provider, filter: object): Promise<unknown[]>;
```

Defined in: assetBridger/erc20Bridger.ts:1207

Get all the gateway set events on the Parent gateway router

###### Parameters

| Parameter          | Type                                                  | Description                                                 |
| ------------------ | ----------------------------------------------------- | ----------------------------------------------------------- |
| `parentProvider`   | `Provider`                                            | The provider for the parent network                         |
| `filter`           | \{ `fromBlock`: `BlockTag`; `toBlock`: `BlockTag`; \} | An object containing fromBlock and toBlock to filter events |
| `filter.fromBlock` | `BlockTag`                                            | -                                                           |
| `filter.toBlock`   | `BlockTag`                                            | -                                                           |

###### Returns

`Promise`\<`unknown`[]\>

An array of GatewaySetEvent event arguments

##### getParentTokenContract()

```ts
getParentTokenContract(parentProvider: Provider, parentTokenAddr: string): ERC20;
```

Defined in: assetBridger/erc20Bridger.ts:478

Get the parent token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesnt
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter         | Type       | Description |
| ----------------- | ---------- | ----------- |
| `parentProvider`  | `Provider` |             |
| `parentTokenAddr` | `string`   |             |

###### Returns

`ERC20`

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`getParentTokenContract`](#getparenttokencontract-2)

##### getWithdrawalEvents()

```ts
getWithdrawalEvents(
   childProvider: Provider,
   gatewayAddress: string,
   filter: object,
   parentTokenAddress?: string,
   fromAddress?: string,
toAddress?: string): Promise<object[]>;
```

Defined in: assetBridger/erc20Bridger.ts:367

Get the child network events created by a withdrawal

###### Parameters

| Parameter             | Type                                                  | Description |
| --------------------- | ----------------------------------------------------- | ----------- |
| `childProvider`       | `Provider`                                            |             |
| `gatewayAddress`      | `string`                                              |             |
| `filter`              | \{ `fromBlock`: `BlockTag`; `toBlock`: `BlockTag`; \} |             |
| `filter.fromBlock`    | `BlockTag`                                            | -           |
| `filter.toBlock?`     | `BlockTag`                                            | -           |
| `parentTokenAddress?` | `string`                                              |             |
| `fromAddress?`        | `string`                                              |             |
| `toAddress?`          | `string`                                              | -           |

###### Returns

`Promise`\<`object`[]\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`getWithdrawalEvents`](#getwithdrawalevents-2)

##### getWithdrawalRequest()

```ts
getWithdrawalRequest(params: Erc20WithdrawParams): Promise<ChildToParentTransactionRequest>;
```

Defined in: assetBridger/erc20Bridger.ts:826

Get the arguments for calling the token withdrawal function

###### Parameters

| Parameter | Type                  | Description |
| --------- | --------------------- | ----------- |
| `params`  | `Erc20WithdrawParams` |             |

###### Returns

`Promise`\<[`ChildToParentTransactionRequest`](../dataEntities/transactionRequest.md#childtoparenttransactionrequest)\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`getWithdrawalRequest`](#getwithdrawalrequest-2)

##### isDepositDisabled()

```ts
isDepositDisabled(parentTokenAddress: string, parentProvider: Provider): Promise<boolean>;
```

Defined in: assetBridger/erc20Bridger.ts:560

Whether the token has been disabled on the router

###### Parameters

| Parameter            | Type       | Description |
| -------------------- | ---------- | ----------- |
| `parentTokenAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`isDepositDisabled`](#isdepositdisabled-2)

##### isRegistered()

```ts
isRegistered(params: object): Promise<boolean>;
```

Defined in: assetBridger/erc20Bridger.ts:924

Checks if the token has been properly registered on both gateways. Mostly useful for tokens that use a custom gateway.

###### Parameters

| Parameter                   | Type                                                                                             | Description |
| --------------------------- | ------------------------------------------------------------------------------------------------ | ----------- |
| `params`                    | \{ `childProvider`: `Provider`; `erc20ParentAddress`: `string`; `parentProvider`: `Provider`; \} |             |
| `params.childProvider`      | `Provider`                                                                                       |             |
| `params.erc20ParentAddress` | `string`                                                                                         |             |
| `params.parentProvider`     | `Provider`                                                                                       |             |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`isRegistered`](#isregistered-2)

##### registerCustomToken()

```ts
registerCustomToken(
   parentTokenAddress: string,
   childTokenAddress: string,
   parentSigner: Signer,
childProvider: Provider): Promise<ParentContractTransaction<ParentTransactionReceipt>>;
```

Defined in: assetBridger/erc20Bridger.ts:1035

Register a custom token on the Arbitrum bridge
See https://developer.offchainlabs.com/docs/bridging_assets#the-arbitrum-generic-custom-gateway for more details

###### Parameters

| Parameter            | Type       | Description                                                                                                                                                                                 |
| -------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentTokenAddress` | `string`   | Address of the already deployed parent token. Must inherit from https://developer.offchainlabs.com/docs/sol_contract_docs/md_docs/arb-bridge-peripherals/tokenbridge/ethereum/icustomtoken. |
| `childTokenAddress`  | `string`   | Address of the already deployed child token. Must inherit from https://developer.offchainlabs.com/docs/sol_contract_docs/md_docs/arb-bridge-peripherals/tokenbridge/arbitrum/iarbtoken.     |
| `parentSigner`       | `Signer`   | The signer with the rights to call `registerTokenOnL2` on the parent token                                                                                                                  |
| `childProvider`      | `Provider` | Arbitrum rpc provider                                                                                                                                                                       |

###### Returns

`Promise`\<`ParentContractTransaction`\<`ParentTransactionReceipt`\>\>

##### setGateways()

```ts
setGateways(
   parentSigner: Signer,
   childProvider: Provider,
   tokenGateways: TokenAndGateway[],
options?: GasOverrides): Promise<ParentContractCallTransaction>;
```

Defined in: assetBridger/erc20Bridger.ts:1266

Register the provided token addresses against the provided gateways

###### Parameters

| Parameter       | Type                | Description |
| --------------- | ------------------- | ----------- |
| `parentSigner`  | `Signer`            |             |
| `childProvider` | `Provider`          |             |
| `tokenGateways` | `TokenAndGateway`[] |             |
| `options?`      | `GasOverrides`      | -           |

###### Returns

`Promise`\<`ParentContractCallTransaction`\>

##### withdraw()

```ts
withdraw(params:
  | OmitTyped<Erc20WithdrawParams, "from"> & object
| ChildToParentTxReqAndSigner): Promise<ChildContractTransaction>;
```

Defined in: assetBridger/erc20Bridger.ts:889

Withdraw tokens from child to parent network

###### Parameters

| Parameter | Type                                                                                                                         | Description |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `params`  | \| [`OmitTyped`](../utils/types.md#omittyped)\<`Erc20WithdrawParams`, `"from"`\> & `object` \| `ChildToParentTxReqAndSigner` |             |

###### Returns

`Promise`\<`ChildContractTransaction`\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`withdraw`](#withdraw-2)

##### fromProvider()

```ts
static fromProvider(childProvider: Provider): Promise<Erc20Bridger>;
```

Defined in: assetBridger/erc20Bridger.ts:216

Instantiates a new Erc20Bridger from a child provider

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<[`Erc20Bridger`](#erc20bridger)\>

###### Inherited from

[`Erc20Bridger`](#erc20bridger).[`fromProvider`](#fromprovider-2)

---

### Erc20Bridger

Defined in: assetBridger/erc20Bridger.ts:191

Bridger for moving ERC20 tokens back and forth between parent-to-child

#### Extends

- [`AssetBridger`](assetBridger.md#assetbridger)\<`Erc20DepositParams` \| `ParentToChildTxReqAndSignerProvider`,
  \| [`OmitTyped`](../utils/types.md#omittyped)\<`Erc20WithdrawParams`, `"from"`\>
  \| [`ChildToParentTransactionRequest`](../dataEntities/transactionRequest.md#childtoparenttransactionrequest)\>

#### Extended by

- [`AdminErc20Bridger`](#adminerc20bridger)

#### Constructors

##### Constructor

```ts
new Erc20Bridger(childNetwork: ArbitrumNetwork): Erc20Bridger;
```

Defined in: assetBridger/erc20Bridger.ts:205

Bridger for moving ERC20 tokens back and forth between parent-to-child

###### Parameters

| Parameter      | Type                                                             |
| -------------- | ---------------------------------------------------------------- |
| `childNetwork` | [`ArbitrumNetwork`](../dataEntities/networks.md#arbitrumnetwork) |

###### Returns

[`Erc20Bridger`](#erc20bridger)

###### Overrides

```ts
AssetBridger<
  Erc20DepositParams | ParentToChildTxReqAndSignerProvider,
  OmitTyped<Erc20WithdrawParams, 'from'> | ChildToParentTransactionRequest
>.constructor
```

#### Properties

| Property                                  | Modifier   | Type     | Description                                                                                                                                                                                                                                                    | Inherited from                                                                              | Defined in                      |
| ----------------------------------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| <a id="nativetoken-1"></a> `nativeToken?` | `readonly` | `string` | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address In case of a chain that uses an ERC-20 token from the parent network as its native/gas token, this is the address of said token on the parent network | [`AssetBridger`](assetBridger.md#assetbridger).[`nativeToken`](assetBridger.md#nativetoken) | assetBridger/assetBridger.ts:40 |

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
approveGasToken(params: ApproveParamsOrTxRequest): Promise<ContractTransaction>;
```

Defined in: assetBridger/erc20Bridger.ts:276

Approves the custom gas token to be spent by the relevant gateway on the parent network

###### Parameters

| Parameter | Type                       | Description |
| --------- | -------------------------- | ----------- |
| `params`  | `ApproveParamsOrTxRequest` |             |

###### Returns

`Promise`\<`ContractTransaction`\>

##### approveToken()

```ts
approveToken(params: ApproveParamsOrTxRequest): Promise<ContractTransaction>;
```

Defined in: assetBridger/erc20Bridger.ts:339

Approve tokens for deposit to the bridge. The tokens will be approved for the relevant gateway.

###### Parameters

| Parameter | Type                       | Description |
| --------- | -------------------------- | ----------- |
| `params`  | `ApproveParamsOrTxRequest` |             |

###### Returns

`Promise`\<`ContractTransaction`\>

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
deposit(params: Erc20DepositParams | ParentToChildTxReqAndSignerProvider): Promise<ParentContractCallTransaction>;
```

Defined in: assetBridger/erc20Bridger.ts:769

Execute a token deposit from parent to child network

###### Parameters

| Parameter | Type                                                          | Description |
| --------- | ------------------------------------------------------------- | ----------- |
| `params`  | `Erc20DepositParams` \| `ParentToChildTxReqAndSignerProvider` |             |

###### Returns

`Promise`\<`ParentContractCallTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridger).[`deposit`](assetBridger.md#deposit)

##### getApproveGasTokenRequest()

```ts
getApproveGasTokenRequest(params: ProviderTokenApproveParams): Promise<Required<Pick<TransactionRequest, "to" | "data" | "value">>>;
```

Defined in: assetBridger/erc20Bridger.ts:260

Creates a transaction request for approving the custom gas token to be spent by the relevant gateway on the parent network

###### Parameters

| Parameter | Type                         | Description |
| --------- | ---------------------------- | ----------- |
| `params`  | `ProviderTokenApproveParams` |             |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"to"` \| `"data"` \| `"value"`\>\>\>

##### getApproveTokenRequest()

```ts
getApproveTokenRequest(params: ProviderTokenApproveParams): Promise<Required<Pick<TransactionRequest, "to" | "data" | "value">>>;
```

Defined in: assetBridger/erc20Bridger.ts:306

Get a tx request to approve tokens for deposit to the bridge.
The tokens will be approved for the relevant gateway.

###### Parameters

| Parameter | Type                         | Description |
| --------- | ---------------------------- | ----------- |
| `params`  | `ProviderTokenApproveParams` |             |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"to"` \| `"data"` \| `"value"`\>\>\>

##### getChildErc20Address()

```ts
getChildErc20Address(erc20ParentAddress: string, parentProvider: Provider): Promise<string>;
```

Defined in: assetBridger/erc20Bridger.ts:491

Get the corresponding child network token address for the provided parent network token

###### Parameters

| Parameter            | Type       | Description |
| -------------------- | ---------- | ----------- |
| `erc20ParentAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

##### getChildGatewayAddress()

```ts
getChildGatewayAddress(erc20ParentAddress: string, childProvider: Provider): Promise<string>;
```

Defined in: assetBridger/erc20Bridger.ts:244

Get the address of the child gateway for this token

###### Parameters

| Parameter            | Type       | Description |
| -------------------- | ---------- | ----------- |
| `erc20ParentAddress` | `string`   |             |
| `childProvider`      | `Provider` |             |

###### Returns

`Promise`\<`string`\>

##### getChildTokenContract()

```ts
getChildTokenContract(childProvider: Provider, childTokenAddr: string): L2GatewayToken;
```

Defined in: assetBridger/erc20Bridger.ts:462

Get the child network token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesn't
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter        | Type       | Description |
| ---------------- | ---------- | ----------- |
| `childProvider`  | `Provider` |             |
| `childTokenAddr` | `string`   |             |

###### Returns

`L2GatewayToken`

##### getDepositRequest()

```ts
getDepositRequest(params: DepositRequest): Promise<ParentToChildTransactionRequest>;
```

Defined in: assetBridger/erc20Bridger.ts:655

Get the arguments for calling the deposit function

###### Parameters

| Parameter | Type             | Description |
| --------- | ---------------- | ----------- |
| `params`  | `DepositRequest` |             |

###### Returns

`Promise`\<[`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest)\>

##### getParentErc20Address()

```ts
getParentErc20Address(erc20ChildChainAddress: string, childProvider: Provider): Promise<string>;
```

Defined in: assetBridger/erc20Bridger.ts:514

Get the corresponding parent network address for the provided child network token
Validates the returned address against the child network router to ensure it is correctly mapped to the provided erc20ChildChainAddress

###### Parameters

| Parameter                | Type       | Description |
| ------------------------ | ---------- | ----------- |
| `erc20ChildChainAddress` | `string`   |             |
| `childProvider`          | `Provider` |             |

###### Returns

`Promise`\<`string`\>

##### getParentGatewayAddress()

```ts
getParentGatewayAddress(erc20ParentAddress: string, parentProvider: Provider): Promise<string>;
```

Defined in: assetBridger/erc20Bridger.ts:226

Get the address of the parent gateway for this token

###### Parameters

| Parameter            | Type       | Description |
| -------------------- | ---------- | ----------- |
| `erc20ParentAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`string`\>

##### getParentTokenContract()

```ts
getParentTokenContract(parentProvider: Provider, parentTokenAddr: string): ERC20;
```

Defined in: assetBridger/erc20Bridger.ts:478

Get the parent token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesnt
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter         | Type       | Description |
| ----------------- | ---------- | ----------- |
| `parentProvider`  | `Provider` |             |
| `parentTokenAddr` | `string`   |             |

###### Returns

`ERC20`

##### getWithdrawalEvents()

```ts
getWithdrawalEvents(
   childProvider: Provider,
   gatewayAddress: string,
   filter: object,
   parentTokenAddress?: string,
   fromAddress?: string,
toAddress?: string): Promise<object[]>;
```

Defined in: assetBridger/erc20Bridger.ts:367

Get the child network events created by a withdrawal

###### Parameters

| Parameter             | Type                                                  | Description |
| --------------------- | ----------------------------------------------------- | ----------- |
| `childProvider`       | `Provider`                                            |             |
| `gatewayAddress`      | `string`                                              |             |
| `filter`              | \{ `fromBlock`: `BlockTag`; `toBlock`: `BlockTag`; \} |             |
| `filter.fromBlock`    | `BlockTag`                                            | -           |
| `filter.toBlock?`     | `BlockTag`                                            | -           |
| `parentTokenAddress?` | `string`                                              |             |
| `fromAddress?`        | `string`                                              |             |
| `toAddress?`          | `string`                                              | -           |

###### Returns

`Promise`\<`object`[]\>

##### getWithdrawalRequest()

```ts
getWithdrawalRequest(params: Erc20WithdrawParams): Promise<ChildToParentTransactionRequest>;
```

Defined in: assetBridger/erc20Bridger.ts:826

Get the arguments for calling the token withdrawal function

###### Parameters

| Parameter | Type                  | Description |
| --------- | --------------------- | ----------- |
| `params`  | `Erc20WithdrawParams` |             |

###### Returns

`Promise`\<[`ChildToParentTransactionRequest`](../dataEntities/transactionRequest.md#childtoparenttransactionrequest)\>

##### isDepositDisabled()

```ts
isDepositDisabled(parentTokenAddress: string, parentProvider: Provider): Promise<boolean>;
```

Defined in: assetBridger/erc20Bridger.ts:560

Whether the token has been disabled on the router

###### Parameters

| Parameter            | Type       | Description |
| -------------------- | ---------- | ----------- |
| `parentTokenAddress` | `string`   |             |
| `parentProvider`     | `Provider` |             |

###### Returns

`Promise`\<`boolean`\>

##### isRegistered()

```ts
isRegistered(params: object): Promise<boolean>;
```

Defined in: assetBridger/erc20Bridger.ts:924

Checks if the token has been properly registered on both gateways. Mostly useful for tokens that use a custom gateway.

###### Parameters

| Parameter                   | Type                                                                                             | Description |
| --------------------------- | ------------------------------------------------------------------------------------------------ | ----------- |
| `params`                    | \{ `childProvider`: `Provider`; `erc20ParentAddress`: `string`; `parentProvider`: `Provider`; \} |             |
| `params.childProvider`      | `Provider`                                                                                       |             |
| `params.erc20ParentAddress` | `string`                                                                                         |             |
| `params.parentProvider`     | `Provider`                                                                                       |             |

###### Returns

`Promise`\<`boolean`\>

##### withdraw()

```ts
withdraw(params:
  | OmitTyped<Erc20WithdrawParams, "from"> & object
| ChildToParentTxReqAndSigner): Promise<ChildContractTransaction>;
```

Defined in: assetBridger/erc20Bridger.ts:889

Withdraw tokens from child to parent network

###### Parameters

| Parameter | Type                                                                                                                         | Description |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `params`  | \| [`OmitTyped`](../utils/types.md#omittyped)\<`Erc20WithdrawParams`, `"from"`\> & `object` \| `ChildToParentTxReqAndSigner` |             |

###### Returns

`Promise`\<`ChildContractTransaction`\>

###### Overrides

[`AssetBridger`](assetBridger.md#assetbridger).[`withdraw`](assetBridger.md#withdraw)

##### fromProvider()

```ts
static fromProvider(childProvider: Provider): Promise<Erc20Bridger>;
```

Defined in: assetBridger/erc20Bridger.ts:216

Instantiates a new Erc20Bridger from a child provider

###### Parameters

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| `childProvider` | `Provider` |             |

###### Returns

`Promise`\<[`Erc20Bridger`](#erc20bridger)\>
