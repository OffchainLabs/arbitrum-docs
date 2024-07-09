---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Interfaces

### L1Network

Represents an L1 chain, e.g. Ethereum Mainnet or Sepolia.

#### Extends

- `Network`

#### Properties

| Property          | Type       | Description                                                          | Inherited from            |
| :---------------- | :--------- | :------------------------------------------------------------------- | :------------------------ |
| `blockTime`       | `number`   | Minimum possible block time for the chain (in seconds).              | `Network.blockTime`       |
| `partnerChainIDs` | `number`[] | Chain ids of children chains, i.e. chains that settle to this chain. | `Network.partnerChainIDs` |

---

### L2Network

Represents an Arbitrum chain, e.g. Arbitrum One, Arbitrum Sepolia, or an L3 chain.

#### Extends

- `Network`

#### Properties

| Property          | Type       | Description                                                                                                                                                                                                                                                           | Inherited from            |
| :---------------- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------ |
| `blockTime`       | `number`   | Minimum possible block time for the chain (in seconds).                                                                                                                                                                                                               | `Network.blockTime`       |
| `depositTimeout`  | `number`   | How long to wait (ms) for a deposit to arrive on l2 before timing out a request                                                                                                                                                                                       | -                         |
| `nativeToken?`    | `string`   | In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address<br /><br />In case of a chain that uses an ERC-20 token from the parent chain as its native/gas token, this is the address of said token on the parent chain | -                         |
| `partnerChainID`  | `number`   | Chain id of the parent chain, i.e. the chain on which this chain settles to.                                                                                                                                                                                          | -                         |
| `partnerChainIDs` | `number`[] | Chain ids of children chains, i.e. chains that settle to this chain.                                                                                                                                                                                                  | `Network.partnerChainIDs` |

## Variables

### l1Networks

```ts
l1Networks: L1Networks;
```

Index of _only_ L1 chains that have been added.

#### Source

[dataEntities/networks.ts:448](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/networks.ts#L448)

---

### l2Networks

```ts
l2Networks: L2Networks;
```

Index of all Arbitrum chains that have been added.

#### Source

[dataEntities/networks.ts:453](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/networks.ts#L453)

---

### networks

```ts
const networks: Networks;
```

Storage for all networks, either L1, L2 or L3.

#### Source

[dataEntities/networks.ts:149](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/networks.ts#L149)

## Functions

### addCustomNetwork()

```ts
function addCustomNetwork(__namedParameters: object): void;
```

Registers a pair of custom L1 and L2 chains, or a single custom Arbitrum chain (L2 or L3).

#### Parameters

| Parameter                            | Type                                 |
| :----------------------------------- | :----------------------------------- |
| `__namedParameters`                  | `object`                             |
| `__namedParameters.customL1Network`? | [`L1Network`](networks.md#l1network) |
| `__namedParameters.customL2Network`  | [`L2Network`](networks.md#l2network) |

#### Returns

`void`

#### Source

[dataEntities/networks.ts:583](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/networks.ts#L583)

---

### addDefaultLocalNetwork()

```ts
function addDefaultLocalNetwork(): object;
```

Registers a custom network that matches the one created by a Nitro local node. Useful in development.

#### Returns

`object`

| Member      | Type                                 |
| :---------- | :----------------------------------- |
| `l1Network` | [`L1Network`](networks.md#l1network) |
| `l2Network` | [`L2Network`](networks.md#l2network) |

#### See

[https://github.com/OffchainLabs/nitro](https://github.com/OffchainLabs/nitro)

#### Source

[dataEntities/networks.ts:627](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/networks.ts#L627)

---

### getEthBridgeInformation()

```ts
function getEthBridgeInformation(
  rollupContractAddress: string,
  l1SignerOrProvider: SignerOrProvider,
): Promise<EthBridge>;
```

Returns the addresses of all contracts that make up the ETH bridge

#### Parameters

| Parameter               | Type               | Description                       |
| :---------------------- | :----------------- | :-------------------------------- |
| `rollupContractAddress` | `string`           | Address of the Rollup contract    |
| `l1SignerOrProvider`    | `SignerOrProvider` | A parent chain signer or provider |

#### Returns

`Promise`\<`EthBridge`\>

EthBridge object with all information about the ETH bridge

#### Source

[dataEntities/networks.ts:518](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/networks.ts#L518)

---

### getL1Network()

```ts
function getL1Network(signerOrProviderOrChainID: number | SignerOrProvider): Promise<L1Network>;
```

Returns the L1 chain associated with the given signer, provider or chain id.

#### Parameters

| Parameter                   | Type                           |
| :-------------------------- | :----------------------------- |
| `signerOrProviderOrChainID` | `number` \| `SignerOrProvider` |

#### Returns

`Promise` \<[`L1Network`](networks.md#l1network)\>

#### Note

Throws if the chain is not an L1 chain.

#### Source

[dataEntities/networks.ts:495](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/networks.ts#L495)

---

### getL2Network()

```ts
function getL2Network(signerOrProviderOrChainID: number | SignerOrProvider): Promise<L2Network>;
```

Returns the Arbitrum chain associated with the given signer, provider or chain id.

#### Parameters

| Parameter                   | Type                           |
| :-------------------------- | :----------------------------- |
| `signerOrProviderOrChainID` | `number` \| `SignerOrProvider` |

#### Returns

`Promise` \<[`L2Network`](networks.md#l2network)\>

#### Note

Throws if the chain is not an Arbitrum chain.

#### Source

[dataEntities/networks.ts:506](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/networks.ts#L506)

---

### getNetwork()

```ts
function getNetwork(
  signerOrProviderOrChainID: number | SignerOrProvider,
  layer: 1 | 2,
): Promise<L1Network | L2Network>;
```

Returns the network associated with the given Signer, Provider or chain id.

#### Parameters

| Parameter                   | Type                           |
| :-------------------------- | :----------------------------- |
| `signerOrProviderOrChainID` | `number` \| `SignerOrProvider` |
| `layer`                     | `1` \| `2`                     |

#### Returns

`Promise` \<[`L1Network`](networks.md#l1network) \| [`L2Network`](networks.md#l2network)\>

#### Note

Throws if the chain is not recognized.

#### Source

[dataEntities/networks.ts:459](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/networks.ts#L459)

---

### getParentForNetwork()

```ts
function getParentForNetwork(chain: L1Network | L2Network): L1Network | L2Network;
```

Returns the parent chain for the given chain.

#### Parameters

| Parameter | Type                                                                         |
| :-------- | :--------------------------------------------------------------------------- |
| `chain`   | [`L1Network`](networks.md#l1network) \| [`L2Network`](networks.md#l2network) |

#### Returns

[`L1Network`](networks.md#l1network) \| [`L2Network`](networks.md#l2network)

#### Source

[dataEntities/networks.ts:417](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/networks.ts#L417)

---

### isL1Network()

```ts
function isL1Network(chain: L1Network | L2Network): chain is L1Network;
```

Determines if a chain is specifically an L1 chain (not L2 or L3).

#### Parameters

| Parameter | Type                                                                         |
| :-------- | :--------------------------------------------------------------------------- |
| `chain`   | [`L1Network`](networks.md#l1network) \| [`L2Network`](networks.md#l2network) |

#### Returns

`chain is L1Network`

#### Source

[dataEntities/networks.ts:386](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/networks.ts#L386)
