---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupPrepareDeploymentParamsConfig

## Type Aliases

### CreateRollupPrepareDeploymentParamsConfigParams

> **CreateRollupPrepareDeploymentParamsConfigParams**: [`Prettify`](types/utils.md#prettifyt)\<`RequiredParams` & `object` & `OptionalParams`\>

#### Source

[createRollupPrepareDeploymentParamsConfig.ts:24](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupPrepareDeploymentParamsConfig.ts#L24)

***

### CreateRollupPrepareDeploymentParamsConfigResult

> **CreateRollupPrepareDeploymentParamsConfigResult**: [`CreateRollupFunctionInputs`](types/createRollupTypes.md#createrollupfunctioninputs)\[`0`\]\[`"config"`\]

#### Source

[createRollupPrepareDeploymentParamsConfig.ts:15](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupPrepareDeploymentParamsConfig.ts#L15)

## Functions

### createRollupPrepareDeploymentParamsConfig()

> **createRollupPrepareDeploymentParamsConfig**\<`TChain`\>(`client`, `params`): [`CreateRollupPrepareDeploymentParamsConfigResult`](createRollupPrepareDeploymentParamsConfig.md#createrolluppreparedeploymentparamsconfigresult)

Creates the configuration object to be used with [createRollup](createRollup.md#createrollup).

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **client**: `Client`\<`Transport`, `TChain`\>

Parent chain client

• **params**

Chain configuration parameters

• **params.chainConfig?**: [`ChainConfig`](types/ChainConfig.md#chainconfig)

• **params.chainId**: `GetFunctionArgs`\<readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`], `"createRollup"`\>

• **params.owner**: `GetFunctionArgs`\<readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`], `"createRollup"`\>

#### Returns

[`CreateRollupPrepareDeploymentParamsConfigResult`](createRollupPrepareDeploymentParamsConfig.md#createrolluppreparedeploymentparamsconfigresult)

[CreateRollupPrepareDeploymentParamsConfigResult](createRollupPrepareDeploymentParamsConfig.md#createrolluppreparedeploymentparamsconfigresult)

#### See

 - https://docs.arbitrum.io/launch-orbit-chain/how-tos/customize-deployment-configuration
 - https://docs.arbitrum.io/launch-orbit-chain/reference/additional-configuration-parameters

#### Example

```ts
const config = createRollupPrepareDeploymentParamsConfig(parentPublicClient, {
  chainId: BigInt(chainId),
  owner: deployer.address,
  chainConfig: prepareChainConfig({
    chainId,
    arbitrum: {
      InitialChainOwner: deployer.address,
      DataAvailabilityCommittee: true,
    },
  }),
});
```

#### Source

[createRollupPrepareDeploymentParamsConfig.ts:66](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupPrepareDeploymentParamsConfig.ts#L66)
