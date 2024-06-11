---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridge-ethers

## Type Aliases

### CreateTokenBridgeGetInputsResult

> **CreateTokenBridgeGetInputsResult**: `object`

#### Type declaration

##### gasPrice

> **gasPrice**: `bigint`

##### inbox

> **inbox**: `Address`

##### maxGasForContracts

> **maxGasForContracts**: `bigint`

##### retryableFee

> **retryableFee**: `bigint`

#### Source

[src/createTokenBridge-ethers.ts:44](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridge-ethers.ts#L44)

## Functions

### createTokenBridgeGetInputs()

> **createTokenBridgeGetInputs**(`l1DeployerAddress`, `l1PublicClient`, `l2PublicClient`, `l1TokenBridgeCreatorAddress`, `rollupAddress`, `retryableGasOverrides`?): `Promise` \<[`CreateTokenBridgeGetInputsResult`](createTokenBridge-ethers.md#createtokenbridgegetinputsresult)\>

Returns a [CreateTokenBridgeGetInputsResult](createTokenBridge-ethers.md#createtokenbridgegetinputsresult) object containing inputs
required for creating a token bridge.

#### Parameters

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

• **retryableGasOverrides?**: [`TransactionRequestRetryableGasOverrides`](createTokenBridgePrepareTransactionRequest.md#transactionrequestretryablegasoverrides)

Optional gas overrides for retryable transactions.

#### Returns

`Promise` \<[`CreateTokenBridgeGetInputsResult`](createTokenBridge-ethers.md#createtokenbridgegetinputsresult)\>

A promise that resolves to the token bridge inputs.

#### Source

[src/createTokenBridge-ethers.ts:63](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridge-ethers.ts#L63)

***

### getEstimateForSettingGateway()

> **getEstimateForSettingGateway**(`l1ChainOwnerAddress`, `l1UpgradeExecutorAddress`, `l1GatewayRouterAddress`, `setGatewaysCalldata`, `parentChainPublicClient`, `orbitChainPublicClient`): `Promise`\<`object`\>

Returns an estimate for setting a token gateway in the router.

#### Parameters

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

#### Returns

`Promise`\<`object`\>

A promise that resolves to the gas parameters for setting the gateway.

##### deposit

> **deposit**: `any`

##### gasLimit

> **gasLimit**: `any`

##### maxFeePerGas

> **maxFeePerGas**: `any`

##### maxSubmissionCost

> **maxSubmissionCost**: `any`

#### Source

[src/createTokenBridge-ethers.ts:272](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridge-ethers.ts#L272)
