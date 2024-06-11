---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: getEstimateForSettingGateway()

> **getEstimateForSettingGateway**(`l1ChainOwnerAddress`, `l1UpgradeExecutorAddress`, `l1GatewayRouterAddress`, `setGatewaysCalldata`, `parentChainPublicClient`, `orbitChainPublicClient`): `Promise`\<`object`\>

Returns an estimate for setting a token gateway in the router.

## Parameters

• **l1ChainOwnerAddress**: \`0x$\{string\}\`

The address of the L1 chain owner.

• **l1UpgradeExecutorAddress**: \`0x$\{string\}\`

The address of the L1 upgrade executor.

• **l1GatewayRouterAddress**: \`0x$\{string\}\`

The address of the L1 gateway router.

• **setGatewaysCalldata**: \`0x$\{string\}\`

The calldata for setting gateways.

• **parentChainPublicClient**

The parent chain public client.

• **orbitChainPublicClient**

The orbit chain public client.

## Returns

`Promise`\<`object`\>

A promise that resolves to the gas parameters for setting the gateway.

### deposit

> **deposit**: `any`

### gasLimit

> **gasLimit**: `any`

### maxFeePerGas

> **maxFeePerGas**: `any`

### maxSubmissionCost

> **maxSubmissionCost**: `any`

## Source

[src/createTokenBridge-ethers.ts:272](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridge-ethers.ts#L272)
