---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Interfaces

### ArbitrumNetwork

Represents an Arbitrum chain, e.g. Arbitrum One, Arbitrum Sepolia, or an L3 chain.

#### Properties

| Property                    | Type          | Description                                                                                                                                                                                                                                                           |
| :-------------------------- | :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chainId`                   | `number`      | Id of the chain.                                                                                                                                                                                                                                                      |
| `confirmPeriodBlocks`       | `number`      | The time allowed for validators to dispute or challenge state assertions. Measured in L1 blocks.                                                                                                                                                                      |
| `ethBridge`                 | `EthBridge`   | The core contracts                                                                                                                                                                                                                                                    |
| `isBold?`                   | `boolean`     | Has the network been upgraded to bold. True if yes, otherwise undefined<br />This is a temporary property and will be removed in future if Bold is widely adopted and<br />the legacy challenge protocol is deprecated                                                |
| `isCustom`                  | `boolean`     | Whether or not the chain was registered by the user.                                                                                                                                                                                                                  |
| `isTestnet`                 | `boolean`     | Whether or not it is a testnet chain.                                                                                                                                                                                                                                 |
| `name`                      | `string`      | Name of the chain.                                                                                                                                                                                                                                                    |
| `nativeToken?`              | `string`      | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address<br /><br />In case of a chain that uses an ERC-20 token from the parent chain as its native/gas token, this is the address of said token on the parent chain |
| `parentChainId`             | `number`      | Chain id of the parent chain, i.e. the chain on which this chain settles to.                                                                                                                                                                                          |
| `retryableLifetimeSeconds?` | `number`      | Represents how long a retryable ticket lasts for before it expires (in seconds). Defaults to 7 days.                                                                                                                                                                  |
| `teleporter?`               | `Teleporter`  | The teleporter contracts.                                                                                                                                                                                                                                             |
| `tokenBridge?`              | `TokenBridge` | The token bridge contracts.                                                                                                                                                                                                                                           |

---

### ~~L2NetworkTokenBridge~~

This type is only here for when you want to achieve backwards compatibility between SDK v3 and v4.

Please see TokenBridge for the latest type.

#### Deprecated

since v4

## Type Aliases

### ~~L2Network~~

```ts
type L2Network: Prettify<Omit<ArbitrumNetwork, "chainId" | "parentChainId" | "tokenBridge"> & object>;
```

This type is only here for when you want to achieve backwards compatibility between SDK v3 and v4.

Please see [ArbitrumNetwork](networks.md#arbitrumnetwork) for the latest type.

#### Deprecated

since v4

#### Source

[dataEntities/networks.ts:94](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L94)

## Functions

### assertArbitrumNetworkHasTokenBridge()

```ts
function assertArbitrumNetworkHasTokenBridge<T>(network: T): asserts network is T & Object;
```

Asserts that the given object has a token bridge. This is useful because not all Arbitrum network
operations require a token bridge.

#### Type parameters

| Type parameter                                                 |
| :------------------------------------------------------------- |
| `T` _extends_ [`ArbitrumNetwork`](networks.md#arbitrumnetwork) |

#### Parameters

| Parameter | Type | Description                                           |
| :-------- | :--- | :---------------------------------------------------- |
| `network` | `T`  | [ArbitrumNetwork](networks.md#arbitrumnetwork) object |

#### Returns

`asserts network is T & Object`

#### Throws

ArbSdkError if the object does not have a token bridge

#### Source

[dataEntities/networks.ts:554](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L554)

---

### getArbitrumNetwork()

```ts
function getArbitrumNetwork(chainId: number): ArbitrumNetwork;
```

Returns the Arbitrum chain associated with the given signer, provider or chain id.

#### Parameters

| Parameter | Type     |
| :-------- | :------- |
| `chainId` | `number` |

#### Returns

[`ArbitrumNetwork`](networks.md#arbitrumnetwork)

#### Note

Throws if the chain is not an Arbitrum chain.

#### Source

[dataEntities/networks.ts:316](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L316)

---

### getArbitrumNetworkInformationFromRollup()

```ts
function getArbitrumNetworkInformationFromRollup(
  rollupAddress: string,
  parentProvider: Provider,
): Promise<ArbitrumNetworkInformationFromRollup>;
```

Returns all the information about an Arbitrum network that can be fetched from its Rollup contract.

#### Parameters

| Parameter        | Type       | Description                                        |
| :--------------- | :--------- | :------------------------------------------------- |
| `rollupAddress`  | `string`   | Address of the Rollup contract on the parent chain |
| `parentProvider` | `Provider` | Provider for the parent chain                      |

#### Returns

`Promise`\<`ArbitrumNetworkInformationFromRollup`\>

An ArbitrumNetworkInformationFromRollup object

#### Source

[dataEntities/networks.ts:376](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L376)

---

### getArbitrumNetworks()

```ts
function getArbitrumNetworks(): ArbitrumNetwork[];
```

Returns all Arbitrum networks registered in the SDK, both default and custom.

#### Returns

[`ArbitrumNetwork`](networks.md#arbitrumnetwork)[]

#### Source

[dataEntities/networks.ts:359](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L359)

---

### getChildrenForNetwork()

```ts
function getChildrenForNetwork(parentChainOrChainId: number | ArbitrumNetwork): ArbitrumNetwork[];
```

Returns a list of children chains for the given chain or chain id.

#### Parameters

| Parameter              | Type                                                         |
| :--------------------- | :----------------------------------------------------------- |
| `parentChainOrChainId` | `number` \| [`ArbitrumNetwork`](networks.md#arbitrumnetwork) |

#### Returns

[`ArbitrumNetwork`](networks.md#arbitrumnetwork)[]

#### Source

[dataEntities/networks.ts:298](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L298)

---

### isParentNetwork()

```ts
function isParentNetwork(parentChainOrChainId: number | ArbitrumNetwork): boolean;
```

Determines if a chain is a parent of _any_ other chain. Could be an L1 or an L2 chain.

#### Parameters

| Parameter              | Type                                                         |
| :--------------------- | :----------------------------------------------------------- |
| `parentChainOrChainId` | `number` \| [`ArbitrumNetwork`](networks.md#arbitrumnetwork) |

#### Returns

`boolean`

#### Source

[dataEntities/networks.ts:283](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L283)

---

### mapL2NetworkToArbitrumNetwork()

```ts
function mapL2NetworkToArbitrumNetwork(l2Network: object): ArbitrumNetwork;
```

Maps the old [L2Network](networks.md#l2network) (from SDK v3) to [ArbitrumNetwork](networks.md#arbitrumnetwork) (from SDK v4).

#### Parameters

| Parameter                             | Type                                                       | Description                                                                                                                                                                                                                                                           |
| :------------------------------------ | :--------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l2Network`                           | `object`                                                   | -                                                                                                                                                                                                                                                                     |
| `l2Network.chainID`                   | `number`                                                   | -                                                                                                                                                                                                                                                                     |
| `l2Network.confirmPeriodBlocks`       | `number`                                                   | The time allowed for validators to dispute or challenge state assertions. Measured in L1 blocks.                                                                                                                                                                      |
| `l2Network.ethBridge`                 | `EthBridge`                                                | The core contracts                                                                                                                                                                                                                                                    |
| `l2Network.isBold`?                   | `boolean`                                                  | Has the network been upgraded to bold. True if yes, otherwise undefined<br />This is a temporary property and will be removed in future if Bold is widely adopted and<br />the legacy challenge protocol is deprecated                                                |
| `l2Network.isCustom`                  | `boolean`                                                  | Whether or not the chain was registered by the user.                                                                                                                                                                                                                  |
| `l2Network.isTestnet`                 | `boolean`                                                  | Whether or not it is a testnet chain.                                                                                                                                                                                                                                 |
| `l2Network.name`                      | `string`                                                   | Name of the chain.                                                                                                                                                                                                                                                    |
| `l2Network.nativeToken`?              | `string`                                                   | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address<br /><br />In case of a chain that uses an ERC-20 token from the parent chain as its native/gas token, this is the address of said token on the parent chain |
| `l2Network.partnerChainID`            | `number`                                                   | -                                                                                                                                                                                                                                                                     |
| `l2Network.retryableLifetimeSeconds`? | `number`                                                   | Represents how long a retryable ticket lasts for before it expires (in seconds). Defaults to 7 days.                                                                                                                                                                  |
| `l2Network.teleporter`?               | `Teleporter`                                               | The teleporter contracts.                                                                                                                                                                                                                                             |
| `l2Network.tokenBridge`               | [`L2NetworkTokenBridge`](networks.md#l2networktokenbridge) | -                                                                                                                                                                                                                                                                     |

#### Returns

[`ArbitrumNetwork`](networks.md#arbitrumnetwork)

#### Source

[dataEntities/networks.ts:534](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L534)

---

### mapL2NetworkTokenBridgeToTokenBridge()

```ts
function mapL2NetworkTokenBridgeToTokenBridge(input: L2NetworkTokenBridge): TokenBridge;
```

Maps the old L2Network.tokenBridge (from SDK v3) to [ArbitrumNetwork.tokenBridge](networks.md#arbitrumnetwork) (from SDK v4).

#### Parameters

| Parameter | Type                                                       |
| :-------- | :--------------------------------------------------------- |
| `input`   | [`L2NetworkTokenBridge`](networks.md#l2networktokenbridge) |

#### Returns

`TokenBridge`

#### Source

[dataEntities/networks.ts:510](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L510)

---

### registerCustomArbitrumNetwork()

```ts
function registerCustomArbitrumNetwork(network: ArbitrumNetwork, options?: object): ArbitrumNetwork;
```

Registers a custom Arbitrum network.

#### Parameters

| Parameter                           | Type                                             | Description                                                                                        |
| :---------------------------------- | :----------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `network`                           | [`ArbitrumNetwork`](networks.md#arbitrumnetwork) | [ArbitrumNetwork](networks.md#arbitrumnetwork) to be registered                                    |
| `options`?                          | `object`                                         | Additional options                                                                                 |
| `options.throwIfAlreadyRegistered`? | `boolean`                                        | Whether or not the function should throw if the network is already registered, defaults to `false` |

#### Returns

[`ArbitrumNetwork`](networks.md#arbitrumnetwork)

#### Source

[dataEntities/networks.ts:415](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L415)
