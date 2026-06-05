## Classes

### Address

Defined in: dataEntities/address.ts:9

Ethereum/Arbitrum address class

#### Constructors

##### Constructor

```ts
new Address(value: string): Address;
```

Defined in: dataEntities/address.ts:18

Ethereum/Arbitrum address class

###### Parameters

| Parameter | Type     | Description                                                  |
| --------- | -------- | ------------------------------------------------------------ |
| `value`   | `string` | A valid Ethereum address. Doesn't need to be checksum cased. |

###### Returns

[`Address`](#address)

#### Properties

| Property                   | Modifier   | Type     | Description                                                  | Defined in                 |
| -------------------------- | ---------- | -------- | ------------------------------------------------------------ | -------------------------- |
| <a id="value"></a> `value` | `readonly` | `string` | A valid Ethereum address. Doesn't need to be checksum cased. | dataEntities/address.ts:18 |

#### Methods

##### applyAlias()

```ts
applyAlias(): Address;
```

Defined in: dataEntities/address.ts:43

Find the L2 alias of an L1 address

###### Returns

[`Address`](#address)

##### undoAlias()

```ts
undoAlias(): Address;
```

Defined in: dataEntities/address.ts:51

Find the L1 alias of an L2 address

###### Returns

[`Address`](#address)
