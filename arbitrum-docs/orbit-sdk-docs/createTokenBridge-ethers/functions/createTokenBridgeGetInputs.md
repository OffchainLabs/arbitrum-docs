---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createTokenBridgeGetInputs()

> **createTokenBridgeGetInputs**(`l1DeployerAddress`, `l1PublicClient`, `l2PublicClient`, `l1TokenBridgeCreatorAddress`, `rollupAddress`, `retryableGasOverrides`?): `Promise` \<[`CreateTokenBridgeGetInputsResult`](../type-aliases/CreateTokenBridgeGetInputsResult.md)\>

Returns a [CreateTokenBridgeGetInputsResult](../type-aliases/CreateTokenBridgeGetInputsResult.md) object containing inputs
required for creating a token bridge.

## Parameters

• **l1DeployerAddress**: `string`

The address of the L1 deployer.

• **l1PublicClient**

The L1 public client.

• **l2PublicClient**

The L2 public client.

• **l1TokenBridgeCreatorAddress**: `string`

The address of the L1 token bridge creator.

• **rollupAddress**: `string`

The rollup address.

• **retryableGasOverrides?**: [`TransactionRequestRetryableGasOverrides`](../../createTokenBridgePrepareTransactionRequest/type-aliases/TransactionRequestRetryableGasOverrides.md)

Optional gas overrides for retryable transactions.

## Returns

`Promise` \<[`CreateTokenBridgeGetInputsResult`](../type-aliases/CreateTokenBridgeGetInputsResult.md)\>

A promise that resolves to the token bridge inputs.

## Source

[src/createTokenBridge-ethers.ts:63](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridge-ethers.ts#L63)
