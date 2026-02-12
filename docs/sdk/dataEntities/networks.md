---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Interfaces

### ArbitrumNetwork

Defined in: [dataEntities/networks.ts:32](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L32)

Represents an Arbitrum chain, e.g. Arbitrum One, Arbitrum Sepolia, or an L3 chain.

#### Properties

| Property                                                          | Type          | Description                                                                                                                                                                                                                                                | Defined in                                                                                                                                                     |
| ----------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="chainid"></a> `chainId`                                    | `number`      | Id of the chain.                                                                                                                                                                                                                                           | [dataEntities/networks.ts:40](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L40) |
| <a id="confirmperiodblocks"></a> `confirmPeriodBlocks`            | `number`      | The time allowed for validators to dispute or challenge state assertions. Measured in L1 blocks.                                                                                                                                                           | [dataEntities/networks.ts:60](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L60) |
| <a id="ethbridge"></a> `ethBridge`                                | `EthBridge`   | The core contracts                                                                                                                                                                                                                                         | [dataEntities/networks.ts:48](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L48) |
| <a id="isbold"></a> `isBold?`                                     | `boolean`     | Has the network been upgraded to bold. True if yes, otherwise undefined This is a temporary property and will be removed in future if Bold is widely adopted and the legacy challenge protocol is deprecated                                               | [dataEntities/networks.ts:84](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L84) |
| <a id="iscustom"></a> `isCustom`                                  | `boolean`     | Whether or not the chain was registered by the user.                                                                                                                                                                                                       | [dataEntities/networks.ts:78](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L78) |
| <a id="istestnet"></a> `isTestnet`                                | `boolean`     | Whether or not it is a testnet chain.                                                                                                                                                                                                                      | [dataEntities/networks.ts:74](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L74) |
| <a id="name"></a> `name`                                          | `string`      | Name of the chain.                                                                                                                                                                                                                                         | [dataEntities/networks.ts:36](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L36) |
| <a id="nativetoken"></a> `nativeToken?`                           | `string`      | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address In case of a chain that uses an ERC-20 token from the parent chain as its native/gas token, this is the address of said token on the parent chain | [dataEntities/networks.ts:70](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L70) |
| <a id="parentchainid"></a> `parentChainId`                        | `number`      | Chain id of the parent chain, i.e. the chain on which this chain settles to.                                                                                                                                                                               | [dataEntities/networks.ts:44](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L44) |
| <a id="retryablelifetimeseconds"></a> `retryableLifetimeSeconds?` | `number`      | Represents how long a retryable ticket lasts for before it expires (in seconds). Defaults to 7 days.                                                                                                                                                       | [dataEntities/networks.ts:64](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L64) |
| <a id="teleporter"></a> `teleporter?`                             | `Teleporter`  | The teleporter contracts.                                                                                                                                                                                                                                  | [dataEntities/networks.ts:56](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L56) |
| <a id="tokenbridge"></a> `tokenBridge?`                           | `TokenBridge` | The token bridge contracts.                                                                                                                                                                                                                                | [dataEntities/networks.ts:52](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L52) |

---

### ~~L2NetworkTokenBridge~~

Defined in: [dataEntities/networks.ts:131](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L131)

This type is only here for when you want to achieve backwards compatibility between SDK v3 and v4.

Please see TokenBridge for the latest type.

#### Deprecated

since v4

## Type Aliases

### ~~L2Network~~

```ts
type L2Network = Prettify<
  Omit<ArbitrumNetwork, 'chainId' | 'parentChainId' | 'tokenBridge'> & object
>;
```

Defined in: [dataEntities/networks.ts:94](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L94)

This type is only here for when you want to achieve backwards compatibility between SDK v3 and v4.

Please see [ArbitrumNetwork](#arbitrumnetwork) for the latest type.

#### Deprecated

since v4

## Functions

### assertArbitrumNetworkHasTokenBridge()

```ts
function assertArbitrumNetworkHasTokenBridge<T>(
  network: T,
): asserts network is T & { tokenBridge: TokenBridge };
```

Defined in: [dataEntities/networks.ts:554](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L554)

Asserts that the given object has a token bridge. This is useful because not all Arbitrum network
operations require a token bridge.

#### Type Parameters

| Type Parameter                                      |
| --------------------------------------------------- |
| `T` _extends_ [`ArbitrumNetwork`](#arbitrumnetwork) |

#### Parameters

| Parameter | Type | Description                                |
| --------- | ---- | ------------------------------------------ |
| `network` | `T`  | [ArbitrumNetwork](#arbitrumnetwork) object |

#### Returns

`asserts network is T & { tokenBridge: TokenBridge }`

#### Throws

ArbSdkError if the object does not have a token bridge

---

### getArbitrumNetwork()

#### Call Signature

```ts
function getArbitrumNetwork(chainId: number): ArbitrumNetwork;
```

Defined in: [dataEntities/networks.ts:316](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L316)

Returns the Arbitrum chain associated with the given signer, provider or chain id.

##### Parameters

| Parameter | Type     |
| --------- | -------- |
| `chainId` | `number` |

##### Returns

[`ArbitrumNetwork`](#arbitrumnetwork)

##### Note

Throws if the chain is not an Arbitrum chain.

#### Call Signature

```ts
function getArbitrumNetwork(signerOrProvider: SignerOrProvider): Promise<ArbitrumNetwork>;
```

Defined in: [dataEntities/networks.ts:317](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L317)

Returns the Arbitrum chain associated with the given signer, provider or chain id.

##### Parameters

| Parameter          | Type               |
| ------------------ | ------------------ |
| `signerOrProvider` | `SignerOrProvider` |

##### Returns

`Promise`\<[`ArbitrumNetwork`](#arbitrumnetwork)\>

##### Note

Throws if the chain is not an Arbitrum chain.

---

### getArbitrumNetworkInformationFromRollup()

```ts
function getArbitrumNetworkInformationFromRollup(
  rollupAddress: string,
  parentProvider: Provider,
): Promise<ArbitrumNetworkInformationFromRollup>;
```

Defined in: [dataEntities/networks.ts:376](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L376)

Returns all the information about an Arbitrum network that can be fetched from its Rollup contract.

#### Parameters

| Parameter        | Type       | Description                                        |
| ---------------- | ---------- | -------------------------------------------------- |
| `rollupAddress`  | `string`   | Address of the Rollup contract on the parent chain |
| `parentProvider` | `Provider` | Provider for the parent chain                      |

#### Returns

`Promise`\<`ArbitrumNetworkInformationFromRollup`\>

An ArbitrumNetworkInformationFromRollup object

---

### getArbitrumNetworks()

```ts
function getArbitrumNetworks(): ArbitrumNetwork[];
```

Defined in: [dataEntities/networks.ts:359](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L359)

Returns all Arbitrum networks registered in the SDK, both default and custom.

#### Returns

[`ArbitrumNetwork`](#arbitrumnetwork)[]

---

### getChildrenForNetwork()

```ts
function getChildrenForNetwork(parentChainOrChainId: number | ArbitrumNetwork): ArbitrumNetwork[];
```

Defined in: [dataEntities/networks.ts:298](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L298)

Returns a list of children chains for the given chain or chain id.

#### Parameters

| Parameter              | Type                                              |
| ---------------------- | ------------------------------------------------- |
| `parentChainOrChainId` | `number` \| [`ArbitrumNetwork`](#arbitrumnetwork) |

#### Returns

[`ArbitrumNetwork`](#arbitrumnetwork)[]

---

### isParentNetwork()

```ts
function isParentNetwork(parentChainOrChainId: number | ArbitrumNetwork): boolean;
```

Defined in: [dataEntities/networks.ts:283](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L283)

Determines if a chain is a parent of _any_ other chain. Could be an L1 or an L2 chain.

#### Parameters

| Parameter              | Type                                              |
| ---------------------- | ------------------------------------------------- |
| `parentChainOrChainId` | `number` \| [`ArbitrumNetwork`](#arbitrumnetwork) |

#### Returns

`boolean`

---

### mapL2NetworkToArbitrumNetwork()

```ts
function mapL2NetworkToArbitrumNetwork(l2Network: object): ArbitrumNetwork;
```

Defined in: [dataEntities/networks.ts:534](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L534)

Maps the old [L2Network](#l2network) (from SDK v3) to [ArbitrumNetwork](#arbitrumnetwork) (from SDK v4).

#### Parameters

| Parameter                             | Type                                                                                                                                                                                                                                                                                                                                                                   | Description                                                                                                                                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `l2Network`                           | \{ `chainID`: `number`; `confirmPeriodBlocks`: `number`; `ethBridge`: `EthBridge`; `isBold?`: `boolean`; `isCustom`: `boolean`; `isTestnet`: `boolean`; `name`: `string`; `nativeToken?`: `string`; `partnerChainID`: `number`; `retryableLifetimeSeconds?`: `number`; `teleporter?`: `Teleporter`; `tokenBridge`: [`L2NetworkTokenBridge`](#l2networktokenbridge); \} | -                                                                                                                                                                                                                                                          |
| `l2Network.chainID`                   | `number`                                                                                                                                                                                                                                                                                                                                                               | -                                                                                                                                                                                                                                                          |
| `l2Network.confirmPeriodBlocks`       | `number`                                                                                                                                                                                                                                                                                                                                                               | The time allowed for validators to dispute or challenge state assertions. Measured in L1 blocks.                                                                                                                                                           |
| `l2Network.ethBridge`                 | `EthBridge`                                                                                                                                                                                                                                                                                                                                                            | The core contracts                                                                                                                                                                                                                                         |
| `l2Network.isBold?`                   | `boolean`                                                                                                                                                                                                                                                                                                                                                              | Has the network been upgraded to bold. True if yes, otherwise undefined This is a temporary property and will be removed in future if Bold is widely adopted and the legacy challenge protocol is deprecated                                               |
| `l2Network.isCustom`                  | `boolean`                                                                                                                                                                                                                                                                                                                                                              | Whether or not the chain was registered by the user.                                                                                                                                                                                                       |
| `l2Network.isTestnet`                 | `boolean`                                                                                                                                                                                                                                                                                                                                                              | Whether or not it is a testnet chain.                                                                                                                                                                                                                      |
| `l2Network.name`                      | `string`                                                                                                                                                                                                                                                                                                                                                               | Name of the chain.                                                                                                                                                                                                                                         |
| `l2Network.nativeToken?`              | `string`                                                                                                                                                                                                                                                                                                                                                               | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address In case of a chain that uses an ERC-20 token from the parent chain as its native/gas token, this is the address of said token on the parent chain |
| `l2Network.partnerChainID`            | `number`                                                                                                                                                                                                                                                                                                                                                               | -                                                                                                                                                                                                                                                          |
| `l2Network.retryableLifetimeSeconds?` | `number`                                                                                                                                                                                                                                                                                                                                                               | Represents how long a retryable ticket lasts for before it expires (in seconds). Defaults to 7 days.                                                                                                                                                       |
| `l2Network.teleporter?`               | `Teleporter`                                                                                                                                                                                                                                                                                                                                                           | The teleporter contracts.                                                                                                                                                                                                                                  |
| `l2Network.tokenBridge`               | [`L2NetworkTokenBridge`](#l2networktokenbridge)                                                                                                                                                                                                                                                                                                                        | -                                                                                                                                                                                                                                                          |

#### Returns

[`ArbitrumNetwork`](#arbitrumnetwork)

---

### mapL2NetworkTokenBridgeToTokenBridge()

```ts
function mapL2NetworkTokenBridgeToTokenBridge(input: L2NetworkTokenBridge): TokenBridge;
```

Defined in: [dataEntities/networks.ts:510](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L510)

Maps the old [L2Network.tokenBridge](#mapl2networktoarbitrumnetwork-2) (from SDK v3) to [ArbitrumNetwork.tokenBridge](#tokenbridge) (from SDK v4).

#### Parameters

| Parameter | Type                                            |
| --------- | ----------------------------------------------- |
| `input`   | [`L2NetworkTokenBridge`](#l2networktokenbridge) |

#### Returns

`TokenBridge`

---

### registerCustomArbitrumNetwork()

```ts
function registerCustomArbitrumNetwork(network: ArbitrumNetwork, options?: object): ArbitrumNetwork;
```

Defined in: [dataEntities/networks.ts:415](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/networks.ts#L415)

Registers a custom Arbitrum network.

#### Parameters

| Parameter                           | Type                                          | Description                                                                                        |
| ----------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `network`                           | [`ArbitrumNetwork`](#arbitrumnetwork)         | [ArbitrumNetwork](#arbitrumnetwork) to be registered                                               |
| `options?`                          | \{ `throwIfAlreadyRegistered?`: `boolean`; \} | Additional options                                                                                 |
| `options.throwIfAlreadyRegistered?` | `boolean`                                     | Whether or not the function should throw if the network is already registered, defaults to `false` |

#### Returns

[`ArbitrumNetwork`](#arbitrumnetwork)
