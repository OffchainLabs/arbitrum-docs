---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/registerNewNetwork

## Functions

### registerNewNetwork()

> **registerNewNetwork**(`parentProvider`, `childProvider`, `rollupAddress`): `Promise`\<`object`\>

Registers a new network by creating parent and child networks based on the provided providers and rollup address.

#### Parameters

• **parentProvider**: `JsonRpcProvider`

The JSON RPC provider for the parent network.

• **childProvider**: `JsonRpcProvider`

The JSON RPC provider for the child network.

• **rollupAddress**: `string`

The rollup address of the child network.

#### Returns

`Promise`\<`object`\>

- Returns an object containing the parent and child networks.

##### childNetwork

> **childNetwork**: `L2Network`

##### parentNetwork

> **parentNetwork**: `any`

#### Source

[src/utils/registerNewNetwork.ts:209](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/registerNewNetwork.ts#L209)
