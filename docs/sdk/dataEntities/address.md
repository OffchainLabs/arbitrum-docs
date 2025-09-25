---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### Address

Ethereum/Arbitrum address class

#### Constructors

##### new Address()

```ts
new Address(value: string): Address
```

Ethereum/Arbitrum address class

###### Parameters

| Parameter | Type     | Description                                                  |
| :-------- | :------- | :----------------------------------------------------------- |
| `value`   | `string` | A valid Ethereum address. Doesn't need to be checksum cased. |

###### Returns

[`Address`](address.md#address)

###### Source

[dataEntities/address.ts:18](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/address.ts#L18)

#### Properties

| Property | Modifier   | Type     | Description                                                  |
| :------- | :--------- | :------- | :----------------------------------------------------------- |
| `value`  | `readonly` | `string` | A valid Ethereum address. Doesn't need to be checksum cased. |

#### Methods

##### applyAlias()

```ts
applyAlias(): Address
```

Find the L2 alias of an L1 address

###### Returns

[`Address`](address.md#address)

###### Source

[dataEntities/address.ts:43](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/address.ts#L43)

##### undoAlias()

```ts
undoAlias(): Address
```

Find the L1 alias of an L2 address

###### Returns

[`Address`](address.md#address)

###### Source

[dataEntities/address.ts:51](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/address.ts#L51)
