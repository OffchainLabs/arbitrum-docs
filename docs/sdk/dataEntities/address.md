---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### Address

Defined in: [dataEntities/address.ts:9](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/address.ts#L9)

Ethereum/Arbitrum address class

#### Constructors

##### Constructor

```ts
new Address(value: string): Address;
```

Defined in: [dataEntities/address.ts:18](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/address.ts#L18)

Ethereum/Arbitrum address class

###### Parameters

| Parameter | Type     | Description                                                  |
| --------- | -------- | ------------------------------------------------------------ |
| `value`   | `string` | A valid Ethereum address. Doesn't need to be checksum cased. |

###### Returns

[`Address`](#address)

#### Properties

| Property                   | Modifier   | Type     | Description                                                  | Defined in                                                                                                                                                   |
| -------------------------- | ---------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <a id="value"></a> `value` | `readonly` | `string` | A valid Ethereum address. Doesn't need to be checksum cased. | [dataEntities/address.ts:18](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/address.ts#L18) |

#### Methods

##### applyAlias()

```ts
applyAlias(): Address;
```

Defined in: [dataEntities/address.ts:43](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/address.ts#L43)

Find the L2 alias of an L1 address

###### Returns

[`Address`](#address)

##### undoAlias()

```ts
undoAlias(): Address;
```

Defined in: [dataEntities/address.ts:51](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/address.ts#L51)

Find the L1 alias of an L2 address

###### Returns

[`Address`](#address)
