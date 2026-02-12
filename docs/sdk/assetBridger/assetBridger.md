## Classes

### `abstract` AssetBridger

Defined in: assetBridger/assetBridger.ts:34

Base for bridging assets from parent-to-child and back

#### Extended by

- [`Erc20Bridger`](erc20Bridger.md#erc20bridger)
- [`EthBridger`](ethBridger.md#ethbridger)

#### Type Parameters

| Type Parameter   |
| ---------------- |
| `DepositParams`  |
| `WithdrawParams` |

#### Properties

| Property                                | Modifier   | Type     | Description                                                                                                                                                                                                                                                    | Defined in                      |
| --------------------------------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| <a id="nativetoken"></a> `nativeToken?` | `readonly` | `string` | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address In case of a chain that uses an ERC-20 token from the parent network as its native/gas token, this is the address of said token on the parent network | assetBridger/assetBridger.ts:40 |

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

#### Methods

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

##### deposit()

```ts
abstract deposit(params: DepositParams): Promise<ParentContractTransaction<ParentTransactionReceipt>>;
```

Defined in: assetBridger/assetBridger.ts:80

Transfer assets from parent-to-child

###### Parameters

| Parameter | Type            | Description |
| --------- | --------------- | ----------- |
| `params`  | `DepositParams` |             |

###### Returns

`Promise`\<`ParentContractTransaction`\<`ParentTransactionReceipt`\>\>

##### withdraw()

```ts
abstract withdraw(params: WithdrawParams): Promise<ChildContractTransaction>;
```

Defined in: assetBridger/assetBridger.ts:88

Transfer assets from child-to-parent

###### Parameters

| Parameter | Type             | Description |
| --------- | ---------------- | ----------- |
| `params`  | `WithdrawParams` |             |

###### Returns

`Promise`\<`ChildContractTransaction`\>
