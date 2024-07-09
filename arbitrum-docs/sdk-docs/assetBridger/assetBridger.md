---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### `abstract` AssetBridger\<DepositParams, WithdrawParams\>

Base for bridging assets from l1 to l2 and back

#### Extended by

- [`Erc20Bridger`](erc20Bridger.md#erc20bridger)
- [`EthBridger`](ethBridger.md#ethbridger)

#### Type parameters

| Type parameter   |
| :--------------- |
| `DepositParams`  |
| `WithdrawParams` |

#### Properties

| Property       | Modifier   | Type                                                                                                         | Description                                                                                                                                                                                                                                                           |
| :------------- | :--------- | :----------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l1Network`    | `readonly` | [`L1Network`](../dataEntities/networks.md#l1network) \| [`L2Network`](../dataEntities/networks.md#l2network) | Parent chain for the given Arbitrum chain, can be an L1 or an L2                                                                                                                                                                                                      |
| `nativeToken?` | `readonly` | `string`                                                                                                     | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address<br /><br />In case of a chain that uses an ERC-20 token from the parent chain as its native/gas token, this is the address of said token on the parent chain |

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

###### Source

[assetBridger/assetBridger.ts:67](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/assetBridger.ts#L67)

##### deposit()

```ts
abstract deposit(params: DepositParams): Promise<L1ContractTransaction<L1TransactionReceipt>>
```

Transfer assets from L1 to L2

###### Parameters

| Parameter | Type            | Description |
| :-------- | :-------------- | :---------- |
| `params`  | `DepositParams` |             |

###### Returns

`Promise`\<`L1ContractTransaction`\<`L1TransactionReceipt`\>\>

###### Source

[assetBridger/assetBridger.ts:83](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/assetBridger.ts#L83)

##### withdraw()

```ts
abstract withdraw(params: WithdrawParams): Promise<L2ContractTransaction>
```

Transfer assets from L2 to L1

###### Parameters

| Parameter | Type             | Description |
| :-------- | :--------------- | :---------- |
| `params`  | `WithdrawParams` |             |

###### Returns

`Promise`\<`L2ContractTransaction`\>

###### Source

[assetBridger/assetBridger.ts:89](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/assetBridger/assetBridger.ts#L89)
