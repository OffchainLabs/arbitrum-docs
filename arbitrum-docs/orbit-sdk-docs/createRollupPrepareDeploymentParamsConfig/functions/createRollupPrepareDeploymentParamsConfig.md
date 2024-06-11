---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createRollupPrepareDeploymentParamsConfig()

> **createRollupPrepareDeploymentParamsConfig**\<`TTransport`, `TChain`\>(`client`, `params`): [`CreateRollupPrepareDeploymentParamsConfigResult`](../type-aliases/CreateRollupPrepareDeploymentParamsConfigResult.md)

Creates the configuration object to be used with [createRollup](../../createRollup/functions/createRollup.md).

## Type parameters

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

## Parameters

• **client**: `Client`\<`TTransport`, `TChain`, `undefined` \| `Account`\<\`0x$\{string\}\`\>, `undefined`, `undefined` \| `object`\>

Parent chain client

• **params**

Chain configuration parameters

• **params.baseStake**: `undefined` \| `bigint`

• **params.chainConfig?**: [`ChainConfig`](../../types/ChainConfig/type-aliases/ChainConfig.md)

• **params.chainId**: `bigint`

• **params.confirmPeriodBlocks**: `undefined` \| `bigint`

• **params.extraChallengeTimeBlocks**: `undefined` \| `bigint`

• **params.genesisBlockNum**: `undefined` \| `bigint`

• **params.loserStakeEscrow**: `undefined` \| \`0x$\{string\}\`

• **params.owner**: \`0x$\{string\}\`

• **params.sequencerInboxMaxTimeVariation**: `undefined` \| `object`

• **params.stakeToken**: `undefined` \| \`0x$\{string\}\`

• **params.wasmModuleRoot**: `undefined` \| \`0x$\{string\}\`

## Returns

[`CreateRollupPrepareDeploymentParamsConfigResult`](../type-aliases/CreateRollupPrepareDeploymentParamsConfigResult.md)

- The configuration object to be used with createRollup

## Example

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

## Source

[src/createRollupPrepareDeploymentParamsConfig.ts:57](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createRollupPrepareDeploymentParamsConfig.ts#L57)
