---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### Erc20L1L3Bridger

Bridger for moving ERC20 tokens from L1 to L3

#### Extends

- `BaseL1L3Bridger`

#### Properties

| Property                            | Modifier    | Type                    | Default value | Description                                                                                                                                                                                          |
| :---------------------------------- | :---------- | :---------------------- | :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_l1FeeTokenAddress`                | `protected` | `undefined` \| `string` | `undefined`   | If the L3 network uses a custom fee token, this is the address of that token on L1                                                                                                                   |
| `l2ForwarderFactoryDefaultGasLimit` | `readonly`  | `BigNumber`             | `...`         | Default gas limit for L2ForwarderFactory.callForwarder of 1,000,000<br /><br />Measured Standard: 361746<br /><br />Measured OnlyGasToken: 220416<br /><br />Measured NonGasTokenToCustomGas: 373449 |
| `l2GasTokenAddress`                 | `readonly`  | `undefined` \| `string` | `undefined`   | If the L3 network uses a custom (non-eth) fee token, this is the address of that token on L2                                                                                                         |
| `teleporter`                        | `readonly`  | `Teleporter`            | `undefined`   | Addresses of teleporter contracts on L2                                                                                                                                                              |

#### Methods

##### \_checkL1Network()

```ts
protected _checkL1Network(sop: SignerOrProvider): Promise<void>
```

Check the signer/provider matches the l1Network, throws if not

###### Parameters

| Parameter | Type               | Description |
| :-------- | :----------------- | :---------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

`BaseL1L3Bridger._checkL1Network`

###### Source

[assetBridger/l1l3Bridger.ts:306](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L306)

##### \_checkL2Network()

```ts
protected _checkL2Network(sop: SignerOrProvider): Promise<void>
```

Check the signer/provider matches the l2Network, throws if not

###### Parameters

| Parameter | Type               | Description |
| :-------- | :----------------- | :---------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

`BaseL1L3Bridger._checkL2Network`

###### Source

[assetBridger/l1l3Bridger.ts:314](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L314)

##### \_checkL3Network()

```ts
protected _checkL3Network(sop: SignerOrProvider): Promise<void>
```

Check the signer/provider matches the l3Network, throws if not

###### Parameters

| Parameter | Type               | Description |
| :-------- | :----------------- | :---------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

`BaseL1L3Bridger._checkL3Network`

###### Source

[assetBridger/l1l3Bridger.ts:322](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L322)

##### \_decodeCallForwarderCalldata()

```ts
protected _decodeCallForwarderCalldata(data: string): L2ForwarderParamsStruct
```

Given raw calldata for a callForwarder call, decode the parameters

###### Parameters

| Parameter | Type     |
| :-------- | :------- |
| `data`    | `string` |

###### Returns

`L2ForwarderParamsStruct`

###### Source

[assetBridger/l1l3Bridger.ts:1402](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1402)

##### \_decodeTeleportCalldata()

```ts
protected _decodeTeleportCalldata(data: string): TeleportParamsStruct
```

Given raw calldata for a teleport tx, decode the teleport parameters

###### Parameters

| Parameter | Type     |
| :-------- | :------- |
| `data`    | `string` |

###### Returns

`TeleportParamsStruct`

###### Source

[assetBridger/l1l3Bridger.ts:1388](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1388)

##### \_fillPartialTeleportParams()

```ts
protected _fillPartialTeleportParams(
   partialTeleportParams: OmitTyped<TeleportParamsStruct, "gasParams">,
   retryableOverrides: Erc20L1L3DepositRequestRetryableOverrides,
   l1Provider: Provider,
   l2Provider: Provider,
l3Provider: Provider): Promise<object>
```

Given TeleportParams without the gas parameters, return TeleportParams with gas parameters populated.
Does not modify the input parameters.

###### Parameters

| Parameter               | Type                                                                                  |
| :---------------------- | :------------------------------------------------------------------------------------ |
| `partialTeleportParams` | [`OmitTyped`](../utils/types.md#omittypedtk)\<`TeleportParamsStruct`, `"gasParams"`\> |
| `retryableOverrides`    | `Erc20L1L3DepositRequestRetryableOverrides`                                           |
| `l1Provider`            | `Provider`                                                                            |
| `l2Provider`            | `Provider`                                                                            |
| `l3Provider`            | `Provider`                                                                            |

###### Returns

`Promise`\<`object`\>

| Member                             | Type                                                                             |
| :--------------------------------- | :------------------------------------------------------------------------------- |
| `costs`                            | [`BigNumber`, `BigNumber`, `number`, `RetryableGasCostsStructOutput`] & `object` |
| `teleportParams`                   | `object`                                                                         |
| `teleportParams.amount`            | `BigNumberish`                                                                   |
| `teleportParams.gasParams`         | `RetryableGasParamsStruct`                                                       |
| `teleportParams.l1Token`           | `string`                                                                         |
| `teleportParams.l1l2Router`        | `string`                                                                         |
| `teleportParams.l2l3RouterOrInbox` | `string`                                                                         |
| `teleportParams.l3FeeTokenL1Addr`  | `string`                                                                         |
| `teleportParams.to`                | `string`                                                                         |

###### Source

[assetBridger/l1l3Bridger.ts:1194](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1194)

##### \_getL1L2FeeTokenBridgeGasEstimates()

```ts
protected _getL1L2FeeTokenBridgeGasEstimates(params: object): Promise<RetryableGasValues>
```

Estimate the gasLimit and maxSubmissionFee for the L1 to L2 fee token bridge leg of a teleportation

###### Parameters

| Parameter                   | Type        |
| :-------------------------- | :---------- |
| `params`                    | `object`    |
| `params.feeTokenAmount`     | `BigNumber` |
| `params.l1GasPrice`         | `BigNumber` |
| `params.l1Provider`         | `Provider`  |
| `params.l2ForwarderAddress` | `string`    |
| `params.l2Provider`         | `Provider`  |
| `params.l3FeeTokenL1Addr`   | `string`    |

###### Returns

`Promise`\<`RetryableGasValues`\>

###### Source

[assetBridger/l1l3Bridger.ts:1056](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1056)

##### \_getL1L2TokenBridgeGasEstimates()

```ts
protected _getL1L2TokenBridgeGasEstimates(params: object): Promise<RetryableGasValues>
```

Estimate the gasLimit and maxSubmissionFee for the L1 to L2 token bridge leg of a teleportation

###### Parameters

| Parameter                   | Type           |
| :-------------------------- | :------------- |
| `params`                    | `object`       |
| `params.amount`             | `BigNumberish` |
| `params.l1GasPrice`         | `BigNumber`    |
| `params.l1Provider`         | `Provider`     |
| `params.l1Token`            | `string`       |
| `params.l2ForwarderAddress` | `string`       |
| `params.l2Provider`         | `Provider`     |

###### Returns

`Promise`\<`RetryableGasValues`\>

###### Source

[assetBridger/l1l3Bridger.ts:1024](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1024)

##### \_getL2ForwarderFactoryGasEstimates()

```ts
protected _getL2ForwarderFactoryGasEstimates(l1GasPrice: BigNumber, l1Provider: Provider): Promise<RetryableGasValues>
```

Estimate the gasLimit and maxSubmissionFee for L2ForwarderFactory.callForwarder leg of a teleportation.
Gas limit is hardcoded to 1,000,000

###### Parameters

| Parameter    | Type        |
| :----------- | :---------- |
| `l1GasPrice` | `BigNumber` |
| `l1Provider` | `Provider`  |

###### Returns

`Promise`\<`RetryableGasValues`\>

###### Source

[assetBridger/l1l3Bridger.ts:1095](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1095)

##### \_getL2L3BridgeGasEstimates()

```ts
protected _getL2L3BridgeGasEstimates(params: object): Promise<RetryableGasValues>
```

Estimate the gasLimit and maxSubmissionFee for the L2 -> L3 leg of a teleportation.

###### Parameters

| Parameter                      | Type                                                                                  |
| :----------------------------- | :------------------------------------------------------------------------------------ |
| `params`                       | `object`                                                                              |
| `params.l1Provider`            | `Provider`                                                                            |
| `params.l2ForwarderAddress`    | `string`                                                                              |
| `params.l2GasPrice`            | `BigNumber`                                                                           |
| `params.l2Provider`            | `Provider`                                                                            |
| `params.l3Provider`            | `Provider`                                                                            |
| `params.partialTeleportParams` | [`OmitTyped`](../utils/types.md#omittypedtk)\<`TeleportParamsStruct`, `"gasParams"`\> |

###### Returns

`Promise`\<`RetryableGasValues`\>

###### Source

[assetBridger/l1l3Bridger.ts:1117](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1117)

##### \_getTokenBridgeGasEstimates()

```ts
protected _getTokenBridgeGasEstimates(params: object): Promise<RetryableGasValues>
```

Estimate the gasLimit and maxSubmissionFee for a token bridge retryable

###### Parameters

| Parameter                     | Type        |
| :---------------------------- | :---------- |
| `params`                      | `object`    |
| `params.amount`               | `BigNumber` |
| `params.childProvider`        | `Provider`  |
| `params.from`                 | `string`    |
| `params.isWeth`               | `boolean`   |
| `params.parentErc20Address`   | `string`    |
| `params.parentGasPrice`       | `BigNumber` |
| `params.parentGatewayAddress` | `string`    |
| `params.parentProvider`       | `Provider`  |
| `params.to`                   | `string`    |

###### Returns

`Promise`\<`RetryableGasValues`\>

###### Source

[assetBridger/l1l3Bridger.ts:976](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L976)

##### \_l2ForwarderFactoryCalldataSize()

```ts
protected _l2ForwarderFactoryCalldataSize(): number
```

###### Returns

`number`

The size of the calldata for a call to L2ForwarderFactory.callForwarder

###### Source

[assetBridger/l1l3Bridger.ts:1366](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1366)

##### approveGasToken()

```ts
approveGasToken(params: TxRequestParams | object): Promise<ContractTransaction>
```

Approve the L3's fee token for teleportation.
The tokens will be approved for L1Teleporter.
Will throw if the L3 network uses ETH for fees or the fee token doesn't exist on L1.

###### Parameters

| Parameter | Type                          |
| :-------- | :---------------------------- |
| `params`  | `TxRequestParams` \| `object` |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Source

[assetBridger/l1l3Bridger.ts:701](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L701)

##### approveToken()

```ts
approveToken(params: TxRequestParams | TokenApproveParams & object): Promise<ContractTransaction>
```

Approve tokens for teleportation.
The tokens will be approved for L1Teleporter.

###### Parameters

| Parameter | Type                                                 |
| :-------- | :--------------------------------------------------- |
| `params`  | `TxRequestParams` \| `TokenApproveParams` & `object` |

###### Returns

`Promise`\<`ContractTransaction`\>

###### Source

[assetBridger/l1l3Bridger.ts:659](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L659)

##### deposit()

```ts
deposit(params: TxRequestParams | Erc20L1L3DepositRequestParams & object): Promise<ParentContractCallTransaction>
```

Execute a teleportation of some tokens from L1 to L3.

###### Parameters

| Parameter | Type                                                            |
| :-------- | :-------------------------------------------------------------- |
| `params`  | `TxRequestParams` \| `Erc20L1L3DepositRequestParams` & `object` |

###### Returns

`Promise`\<`ParentContractCallTransaction`\>

###### Source

[assetBridger/l1l3Bridger.ts:811](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L811)

##### getApproveGasTokenRequest()

```ts
getApproveGasTokenRequest(params: object): Promise<Required<Pick<TransactionRequest, "data" | "value" | "to">>>
```

Get a tx request to approve the L3's fee token for teleportation.
The tokens will be approved for L1Teleporter.
Will throw if the L3 network uses ETH for fees or the fee token doesn't exist on L1.

###### Parameters

| Parameter           | Type        |
| :------------------ | :---------- |
| `params`            | `object`    |
| `params.amount`?    | `BigNumber` |
| `params.l1Provider` | `Provider`  |
| `params.l2Provider` | `Provider`  |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"to"`\>\>\>

###### Source

[assetBridger/l1l3Bridger.ts:682](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L682)

##### getApproveTokenRequest()

```ts
getApproveTokenRequest(params: TokenApproveParams): Promise<Required<Pick<TransactionRequest, "data" | "value" | "to">>>
```

Get a tx request to approve tokens for teleportation.
The tokens will be approved for L1Teleporter.

###### Parameters

| Parameter | Type                 |
| :-------- | :------------------- |
| `params`  | `TokenApproveParams` |

###### Returns

`Promise`\<`Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"to"`\>\>\>

###### Source

[assetBridger/l1l3Bridger.ts:640](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L640)

##### getDepositParameters()

```ts
getDepositParameters(params: object & TxReference): Promise<object>
```

Given a teleportation tx, get the L1Teleporter parameters, L2Forwarder parameters, and L2Forwarder address

###### Parameters

| Parameter | Type                     |
| :-------- | :----------------------- |
| `params`  | `object` & `TxReference` |

###### Returns

`Promise`\<`object`\>

| Member               | Type                      |
| :------------------- | :------------------------ |
| `l2ForwarderAddress` | `Promise`\<`string`\>     |
| `l2ForwarderParams`  | `L2ForwarderParamsStruct` |
| `teleportParams`     | `TeleportParamsStruct`    |

###### Source

[assetBridger/l1l3Bridger.ts:837](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L837)

##### getDepositRequest()

```ts
getDepositRequest(params: Erc20L1L3DepositRequestParams & object | object): Promise<DepositRequestResult>
```

Get a tx request for teleporting some tokens from L1 to L3.
Also returns the amount of fee tokens required for teleportation.

###### Parameters

| Parameter | Type                                                   |
| :-------- | :----------------------------------------------------- |
| `params`  | `Erc20L1L3DepositRequestParams` & `object` \| `object` |

###### Returns

`Promise`\<`DepositRequestResult`\>

###### Source

[assetBridger/l1l3Bridger.ts:732](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L732)

##### getDepositStatus()

```ts
getDepositStatus(params: GetL1L3DepositStatusParams): Promise<Erc20L1L3DepositStatus>
```

Fetch the cross chain messages and their status

Can provide either the txHash, the tx, or the txReceipt

###### Parameters

| Parameter | Type                         |
| :-------- | :--------------------------- |
| `params`  | `GetL1L3DepositStatusParams` |

###### Returns

`Promise`\<`Erc20L1L3DepositStatus`\>

###### Source

[assetBridger/l1l3Bridger.ts:878](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L878)

##### getGasTokenOnL1()

```ts
getGasTokenOnL1(l1Provider: Provider, l2Provider: Provider): Promise<string>
```

If the L3 network uses a custom gas token, return the address of that token on L1.
If the fee token is not available on L1, does not use 18 decimals on L1 and L2, or the L3 network uses ETH for fees, throw.

###### Parameters

| Parameter    | Type       |
| :----------- | :--------- |
| `l1Provider` | `Provider` |
| `l2Provider` | `Provider` |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/l1l3Bridger.ts:431](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L431)

##### getL1L2GatewayAddress()

```ts
getL1L2GatewayAddress(erc20L1Address: string, l1Provider: Provider): Promise<string>
```

Given an L1 token's address, get the address of the token's L1 \<-\> L2 gateway on L1

###### Parameters

| Parameter        | Type       |
| :--------------- | :--------- |
| `erc20L1Address` | `string`   |
| `l1Provider`     | `Provider` |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/l1l3Bridger.ts:532](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L532)

##### getL1TokenContract()

```ts
getL1TokenContract(l1TokenAddr: string, l1Provider: Provider): IERC20
```

Get the L1 token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesn't
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter     | Type       |
| :------------ | :--------- |
| `l1TokenAddr` | `string`   |
| `l1Provider`  | `Provider` |

###### Returns

`IERC20`

###### Source

[assetBridger/l1l3Bridger.ts:560](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L560)

##### getL2Erc20Address()

```ts
getL2Erc20Address(erc20L1Address: string, l1Provider: Provider): Promise<string>
```

Get the corresponding L2 token address for the provided L1 token

###### Parameters

| Parameter        | Type       |
| :--------------- | :--------- |
| `erc20L1Address` | `string`   |
| `l1Provider`     | `Provider` |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/l1l3Bridger.ts:508](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L508)

##### getL2L3GatewayAddress()

```ts
getL2L3GatewayAddress(
   erc20L1Address: string,
   l1Provider: Provider,
l2Provider: Provider): Promise<string>
```

Get the address of the L2 \<-\> L3 gateway on L2 given an L1 token address

###### Parameters

| Parameter        | Type       |
| :--------------- | :--------- |
| `erc20L1Address` | `string`   |
| `l1Provider`     | `Provider` |
| `l2Provider`     | `Provider` |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/l1l3Bridger.ts:545](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L545)

##### getL2TokenContract()

```ts
getL2TokenContract(l2TokenAddr: string, l2Provider: Provider): L2GatewayToken
```

Get the L2 token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesn't
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter     | Type       |
| :------------ | :--------- |
| `l2TokenAddr` | `string`   |
| `l2Provider`  | `Provider` |

###### Returns

`L2GatewayToken`

###### Source

[assetBridger/l1l3Bridger.ts:570](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L570)

##### getL3Erc20Address()

```ts
getL3Erc20Address(
   erc20L1Address: string,
   l1Provider: Provider,
l2Provider: Provider): Promise<string>
```

Get the corresponding L3 token address for the provided L1 token

###### Parameters

| Parameter        | Type       |
| :--------------- | :--------- |
| `erc20L1Address` | `string`   |
| `l1Provider`     | `Provider` |
| `l2Provider`     | `Provider` |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/l1l3Bridger.ts:518](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L518)

##### getL3TokenContract()

```ts
getL3TokenContract(l3TokenAddr: string, l3Provider: Provider): L2GatewayToken
```

Get the L3 token contract at the provided address
Note: This function just returns a typed ethers object for the provided address, it doesn't
check the underlying form of the contract bytecode to see if it's an erc20, and doesn't ensure the validity
of any of the underlying functions on that contract.

###### Parameters

| Parameter     | Type       |
| :------------ | :--------- |
| `l3TokenAddr` | `string`   |
| `l3Provider`  | `Provider` |

###### Returns

`L2GatewayToken`

###### Source

[assetBridger/l1l3Bridger.ts:583](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L583)

##### l1TokenIsDisabled()

```ts
l1TokenIsDisabled(l1TokenAddress: string, l1Provider: Provider): Promise<boolean>
```

Whether the L1 token has been disabled on the L1 \<-\> L2 router given an L1 token address

###### Parameters

| Parameter        | Type       |
| :--------------- | :--------- |
| `l1TokenAddress` | `string`   |
| `l1Provider`     | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Source

[assetBridger/l1l3Bridger.ts:593](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L593)

##### l2ForwarderAddress()

```ts
l2ForwarderAddress(
   owner: string,
   routerOrInbox: string,
   destinationAddress: string,
l1OrL2Provider: Provider): Promise<string>
```

Given some L2Forwarder parameters, get the address of the L2Forwarder contract

###### Parameters

| Parameter            | Type       |
| :------------------- | :--------- |
| `owner`              | `string`   |
| `routerOrInbox`      | `string`   |
| `destinationAddress` | `string`   |
| `l1OrL2Provider`     | `Provider` |

###### Returns

`Promise`\<`string`\>

###### Source

[assetBridger/l1l3Bridger.ts:613](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L613)

##### l2TokenIsDisabled()

```ts
l2TokenIsDisabled(l2TokenAddress: string, l2Provider: Provider): Promise<boolean>
```

Whether the L2 token has been disabled on the L2 \<-\> L3 router given an L2 token address

###### Parameters

| Parameter        | Type       |
| :--------------- | :--------- |
| `l2TokenAddress` | `string`   |
| `l2Provider`     | `Provider` |

###### Returns

`Promise`\<`boolean`\>

###### Source

[assetBridger/l1l3Bridger.ts:603](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L603)

##### teleportationType()

```ts
teleportationType(partialTeleportParams: Pick<TeleportParamsStruct, "l1Token" | "l3FeeTokenL1Addr">): TeleportationType
```

Get the type of teleportation from the l1Token and l3FeeTokenL1Addr teleport parameters

###### Parameters

| Parameter               | Type                                                                  |
| :---------------------- | :-------------------------------------------------------------------- |
| `partialTeleportParams` | `Pick`\<`TeleportParamsStruct`, `"l1Token"` \| `"l3FeeTokenL1Addr"`\> |

###### Returns

`TeleportationType`

###### Source

[assetBridger/l1l3Bridger.ts:953](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L953)

---

### EthL1L3Bridger

Bridge ETH from L1 to L3 using a double retryable ticket

#### Extends

- `BaseL1L3Bridger`

#### Methods

##### \_checkL1Network()

```ts
protected _checkL1Network(sop: SignerOrProvider): Promise<void>
```

Check the signer/provider matches the l1Network, throws if not

###### Parameters

| Parameter | Type               | Description |
| :-------- | :----------------- | :---------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

`BaseL1L3Bridger._checkL1Network`

###### Source

[assetBridger/l1l3Bridger.ts:306](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L306)

##### \_checkL2Network()

```ts
protected _checkL2Network(sop: SignerOrProvider): Promise<void>
```

Check the signer/provider matches the l2Network, throws if not

###### Parameters

| Parameter | Type               | Description |
| :-------- | :----------------- | :---------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

`BaseL1L3Bridger._checkL2Network`

###### Source

[assetBridger/l1l3Bridger.ts:314](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L314)

##### \_checkL3Network()

```ts
protected _checkL3Network(sop: SignerOrProvider): Promise<void>
```

Check the signer/provider matches the l3Network, throws if not

###### Parameters

| Parameter | Type               | Description |
| :-------- | :----------------- | :---------- |
| `sop`     | `SignerOrProvider` |             |

###### Returns

`Promise`\<`void`\>

###### Inherited from

`BaseL1L3Bridger._checkL3Network`

###### Source

[assetBridger/l1l3Bridger.ts:322](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L322)

##### deposit()

```ts
deposit(params: TxRequestParams | EthL1L3DepositRequestParams & object): Promise<ParentContractCallTransaction>
```

Deposit ETH to L3 via a double retryable ticket

###### Parameters

| Parameter | Type                                                          |
| :-------- | :------------------------------------------------------------ |
| `params`  | `TxRequestParams` \| `EthL1L3DepositRequestParams` & `object` |

###### Returns

`Promise`\<`ParentContractCallTransaction`\>

###### Source

[assetBridger/l1l3Bridger.ts:1521](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1521)

##### getDepositParameters()

```ts
getDepositParameters(params: object & TxReference): Promise<object>
```

Given an L1 transaction, get the retryable parameters for both l2 and l3 tickets

###### Parameters

| Parameter | Type                     |
| :-------- | :----------------------- |
| `params`  | `object` & `TxReference` |

###### Returns

`Promise`\<`object`\>

| Member           | Type                                                                          |
| :--------------- | :---------------------------------------------------------------------------- |
| `l1l2TicketData` | [`RetryableMessageParams`](../dataEntities/message.md#retryablemessageparams) |
| `l2l3TicketData` | [`RetryableMessageParams`](../dataEntities/message.md#retryablemessageparams) |

###### Source

[assetBridger/l1l3Bridger.ts:1547](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1547)

##### getDepositRequest()

```ts
getDepositRequest(params: EthL1L3DepositRequestParams & object | object): Promise<ParentToChildTransactionRequest>
```

Get a tx request to deposit ETH to L3 via a double retryable ticket

###### Parameters

| Parameter | Type                                                 |
| :-------- | :--------------------------------------------------- |
| `params`  | `EthL1L3DepositRequestParams` & `object` \| `object` |

###### Returns

`Promise` \<[`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest)\>

###### Source

[assetBridger/l1l3Bridger.ts:1463](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1463)

##### getDepositStatus()

```ts
getDepositStatus(params: GetL1L3DepositStatusParams): Promise<EthL1L3DepositStatus>
```

Get the status of a deposit given an L1 tx receipt. Does not check if the tx is actually a deposit tx.

###### Parameters

| Parameter | Type                         |
| :-------- | :--------------------------- |
| `params`  | `GetL1L3DepositStatusParams` |

###### Returns

`Promise`\<`EthL1L3DepositStatus`\>

Information regarding each step of the deposit
and `EthL1L3DepositStatus.completed` which indicates whether the deposit has fully completed.

###### Source

[assetBridger/l1l3Bridger.ts:1577](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/assetBridger/l1l3Bridger.ts#L1577)
