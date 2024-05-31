```ts
function createRollupPrepareConfig(__namedParameters: object): CreateRollupPrepareConfigResult;
```

## Parameters

| Parameter                                          | Type                             |
| :------------------------------------------------- | :------------------------------- |
| `__namedParameters`                                | `object`                         |
| `__namedParameters.baseStake`                      | `undefined` \| `bigint`          |
| `__namedParameters.chainConfig`?                   | `ChainConfig`                    |
| `__namedParameters.chainId`                        | `bigint`                         |
| `__namedParameters.confirmPeriodBlocks`            | `undefined` \| `bigint`          |
| `__namedParameters.extraChallengeTimeBlocks`       | `undefined` \| `bigint`          |
| `__namedParameters.genesisBlockNum`                | `undefined` \| `bigint`          |
| `__namedParameters.loserStakeEscrow`               | `undefined` \| \`0x$\{string\}\` |
| `__namedParameters.owner`                          | \`0x$\{string\}\`                |
| `__namedParameters.sequencerInboxMaxTimeVariation` | `undefined` \| `object`          |
| `__namedParameters.stakeToken`                     | `undefined` \| \`0x$\{string\}\` |
| `__namedParameters.wasmModuleRoot`                 | `undefined` \| \`0x$\{string\}\` |

## Returns

`CreateRollupPrepareConfigResult`

## Deprecated

Will be removed in a future release. Please use [createRollupPrepareDeploymentParamsConfig](../../createRollupPrepareDeploymentParamsConfig/functions/createRollupPrepareDeploymentParamsConfig.md) instead.

## Source

[src/createRollupPrepareConfig.ts:33](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/efea61c53fc08d3a6a336315cc447bc7613aada5/src/createRollupPrepareConfig.ts#L33)
