---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: registerNewNetwork()

> **registerNewNetwork**(`parentProvider`, `childProvider`, `rollupAddress`): `Promise`\<`object`\>

Registers a new network by creating parent and child networks based on the provided providers and rollup address.

## Parameters

• **parentProvider**: `JsonRpcProvider`

The JSON RPC provider for the parent network.

• **childProvider**: `JsonRpcProvider`

The JSON RPC provider for the child network.

• **rollupAddress**: `string`

The rollup address of the child network.

## Returns

`Promise`\<`object`\>

- Returns an object containing the parent and child networks.

### childNetwork

> **childNetwork**: `L2Network`

### parentNetwork

> **parentNetwork**: `any`

## Source

[src/utils/registerNewNetwork.ts:209](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/utils/registerNewNetwork.ts#L209)
