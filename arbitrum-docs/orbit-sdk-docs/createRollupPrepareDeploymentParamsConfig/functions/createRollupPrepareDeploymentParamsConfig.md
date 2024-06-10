---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupPrepareDeploymentParamsConfig<TTransport, TChain>(client: Client<TTransport, TChain, undefined | Account<`0x${string}`>, undefined, undefined | object>, params: object): CreateRollupPrepareDeploymentParamsConfigResult
```

Creates the configuration object to be used with [createRollup](../../createRollup/functions/createRollup.md).

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TTransport` *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> | `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> | `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `client` | `Client`\<`TTransport`, `TChain`, `undefined` \| `Account`\<\`0x$\{string\}\`\>, `undefined`, `undefined` \| `object`\> | Parent chain client |
| `params` | `object` | Chain configuration parameters |
| `params.baseStake` | `undefined` \| `bigint` |  |
| `params.chainConfig`? | [`ChainConfig`](../../types/ChainConfig/type-aliases/ChainConfig.md) |  |
| `params.chainId` | `bigint` |  |
| `params.confirmPeriodBlocks` | `undefined` \| `bigint` |  |
| `params.extraChallengeTimeBlocks` | `undefined` \| `bigint` |  |
| `params.genesisBlockNum` | `undefined` \| `bigint` |  |
| `params.loserStakeEscrow` | `undefined` \| \`0x$\{string\}\` |  |
| `params.owner` | \`0x$\{string\}\` |  |
| `params.sequencerInboxMaxTimeVariation` | `undefined` \| `object` |  |
| `params.stakeToken` | `undefined` \| \`0x$\{string\}\` |  |
| `params.wasmModuleRoot` | `undefined` \| \`0x$\{string\}\` |  |

## Returns

[`CreateRollupPrepareDeploymentParamsConfigResult`](../type-aliases/CreateRollupPrepareDeploymentParamsConfigResult.md)

[CreateRollupPrepareDeploymentParamsConfigResult](../type-aliases/CreateRollupPrepareDeploymentParamsConfigResult.md)

## See

 - https://docs.arbitrum.io/launch-orbit-chain/how-tos/customize-deployment-configuration
 - https://docs.arbitrum.io/launch-orbit-chain/reference/additional-configuration-parameters

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

[src/createRollupPrepareDeploymentParamsConfig.ts:66](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createRollupPrepareDeploymentParamsConfig.ts#L66)
