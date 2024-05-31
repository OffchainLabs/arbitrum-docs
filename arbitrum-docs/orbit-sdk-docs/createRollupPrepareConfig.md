[Documentation](README.md) / createRollupPrepareConfig

## Variables

### defaults

```ts
const defaults: object;
```

defaults includes various default values for a createRollupPrepareConfig
function, such as confirmPeriodBlocks, extraChallengeTimeBlocks, stakeToken,
baseStake, wasmModuleRoot, loserStakeEscrow, genesisBlockNum, and
sequencerInboxMaxTimeVariation.

#### Type declaration

| Member                                         | Type                                           | Value       |
| :--------------------------------------------- | :--------------------------------------------- | :---------- |
| `baseStake`                                    | `bigint`                                       | ...         |
| `confirmPeriodBlocks`                          | `bigint`                                       | ...         |
| `extraChallengeTimeBlocks`                     | `bigint`                                       | ...         |
| `genesisBlockNum`                              | `bigint`                                       | ...         |
| `loserStakeEscrow`                             | `"0x0000000000000000000000000000000000000000"` | zeroAddress |
| `sequencerInboxMaxTimeVariation`               | `object`                                       | ...         |
| `sequencerInboxMaxTimeVariation.delayBlocks`   | `bigint`                                       | ...         |
| `sequencerInboxMaxTimeVariation.delaySeconds`  | `bigint`                                       | ...         |
| `sequencerInboxMaxTimeVariation.futureBlocks`  | `bigint`                                       | ...         |
| `sequencerInboxMaxTimeVariation.futureSeconds` | `bigint`                                       | ...         |
| `stakeToken`                                   | `"0x0000000000000000000000000000000000000000"` | zeroAddress |
| `wasmModuleRoot`                               | \`0x$\{string\}\`                              | -           |

#### Source

[src/createRollupPrepareConfig.ts:28](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createRollupPrepareConfig.ts#L28)

## Functions

### createRollupPrepareConfig()

```ts
function createRollupPrepareConfig(__namedParameters: object): CreateRollupPrepareConfigResult;
```

Creates a Rollup prepare configuration object based on the provided
parameters, including chain configuration details. The function returns a
CreateRollupFunctionInputs[0]['config'].

#### Parameters

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

#### Returns

`CreateRollupPrepareConfigResult`

#### Source

[src/createRollupPrepareConfig.ts:49](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createRollupPrepareConfig.ts#L49)
