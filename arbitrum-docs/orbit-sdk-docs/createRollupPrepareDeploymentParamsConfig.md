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

[src/createRollupPrepareDeploymentParamsConfig.ts:93](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareDeploymentParamsConfig.ts#L93)

***

### CreateRollupPrepareDeploymentParamsConfigResult

> **CreateRollupPrepareDeploymentParamsConfigResult**: [`CreateRollupFunctionInputs`](types/createRollupTypes.md#createrollupfunctioninputs)\[`0`\]\[`"config"`\]

#### Source

[src/createRollupPrepareDeploymentParamsConfig.ts:15](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareDeploymentParamsConfig.ts#L15)

## Functions

### createRollupPrepareDeploymentParamsConfig()

> **createRollupPrepareDeploymentParamsConfig**\<`TTransport`, `TChain`\>(`client`, `params`): [`CreateRollupPrepareDeploymentParamsConfigResult`](createRollupPrepareDeploymentParamsConfig.md#createrolluppreparedeploymentparamsconfigresult)

Creates the configuration object to be used with [createRollup](createRollup.md#createrollup).

#### Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

#### Parameters

• **client**: `Client`\<`TTransport`, `TChain`, `undefined` \| `Account`\<\`0x$\{string\}\`\>, `undefined`, `undefined` \| `object`\>

Parent chain client

• **params**

Chain configuration parameters

• **params.baseStake**: `undefined` \| `bigint`

• **params.chainConfig?**: [`ChainConfig`](types/ChainConfig.md#chainconfig)

• **params.chainId**: `bigint`

• **params.confirmPeriodBlocks**: `undefined` \| `bigint`

• **params.extraChallengeTimeBlocks**: `undefined` \| `bigint`

• **params.genesisBlockNum**: `undefined` \| `bigint`

• **params.loserStakeEscrow**: `undefined` \| \`0x$\{string\}\`

• **params.owner**: \`0x$\{string\}\`

• **params.sequencerInboxMaxTimeVariation**: `undefined` \| `object`

• **params.stakeToken**: `undefined` \| \`0x$\{string\}\`

• **params.wasmModuleRoot**: `undefined` \| \`0x$\{string\}\`

#### Returns

[`CreateRollupPrepareDeploymentParamsConfigResult`](createRollupPrepareDeploymentParamsConfig.md#createrolluppreparedeploymentparamsconfigresult)

- The configuration object to be used with createRollup

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

[src/createRollupPrepareDeploymentParamsConfig.ts:57](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupPrepareDeploymentParamsConfig.ts#L57)
