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

> **inbox**: [`mainnet`](chains.md#mainnet)

##### maxGasForContracts

> **maxGasForContracts**: `bigint`

##### retryableFee

> **retryableFee**: `bigint`

#### Source

[createTokenBridge-ethers.ts:27](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridge-ethers.ts#L27)

## Functions

### createTokenBridgeGetInputs()

> **createTokenBridgeGetInputs**\<`TParentChain`, `TOrbitChain`\>(`l1DeployerAddress`, `l1PublicClient`, `l2PublicClient`, `l1TokenBridgeCreatorAddress`, `rollupAddress`, `retryableGasOverrides`?): `Promise` \<[`CreateTokenBridgeGetInputsResult`](createTokenBridge-ethers.md#createtokenbridgegetinputsresult)\>

#### Type parameters

• **TParentChain** *extends* `unknown`

• **TOrbitChain** *extends* `unknown`

#### Parameters

• **l1DeployerAddress**: `string`

• **l1PublicClient**: `PublicClient`\<`Transport`, `TParentChain`\>

• **l2PublicClient**: `PublicClient`\<`Transport`, `TOrbitChain`\>

• **l1TokenBridgeCreatorAddress**: `string`

• **rollupAddress**: `string`

• **retryableGasOverrides?**: [`TransactionRequestRetryableGasOverrides`](createTokenBridgePrepareTransactionRequest.md#transactionrequestretryablegasoverrides)

#### Returns

`Promise` \<[`CreateTokenBridgeGetInputsResult`](createTokenBridge-ethers.md#createtokenbridgegetinputsresult)\>

#### Source

[createTokenBridge-ethers.ts:34](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridge-ethers.ts#L34)

***

### getEstimateForSettingGateway()

> **getEstimateForSettingGateway**\<`TParentChain`, `TOrbitChain`\>(`l1ChainOwnerAddress`, `l1UpgradeExecutorAddress`, `l1GatewayRouterAddress`, `setGatewaysCalldata`, `parentChainPublicClient`, `orbitChainPublicClient`): `Promise`\<`object`\>

#### Type parameters

• **TParentChain** *extends* `unknown`

• **TOrbitChain** *extends* `unknown`

#### Parameters

• **l1ChainOwnerAddress**: `Address`

• **l1UpgradeExecutorAddress**: `Address`

• **l1GatewayRouterAddress**: `Address`

• **setGatewaysCalldata**: \`0x$\{string\}\`

• **parentChainPublicClient**: `PublicClient`\<`Transport`, `TParentChain`\>

• **orbitChainPublicClient**: `PublicClient`\<`Transport`, `TOrbitChain`\>

#### Returns

`Promise`\<`object`\>

##### deposit

> **deposit**: `any`

##### gasLimit

> **gasLimit**: `any`

##### maxFeePerGas

> **maxFeePerGas**: `any`

##### maxSubmissionCost

> **maxSubmissionCost**: `any`

#### Source

[createTokenBridge-ethers.ts:195](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridge-ethers.ts#L195)
