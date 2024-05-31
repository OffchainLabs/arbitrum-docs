[Documentation](README.md) / testHelpers

## Functions

### createRollupHelper()

```ts
function createRollupHelper(__namedParameters: object): Promise<object>
```

Creates a rollup chain with specified parameters and deploys it using the
provided client and account.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `object` |
| `__namedParameters.batchPoster` | \`0x$\{string\}\` |
| `__namedParameters.client` | `object` |
| `__namedParameters.deployer` | `PrivateKeyAccountWithPrivateKey` |
| `__namedParameters.nativeToken` | \`0x$\{string\}\` |
| `__namedParameters.validators` | [\`0x$\{string\}\`] |

#### Returns

`Promise`\<`object`\>

| Member | Type |
| :------ | :------ |
| `createRollupConfig` | `object` |
| `createRollupConfig.baseStake` | `bigint` |
| `createRollupConfig.chainConfig` | `string` |
| `createRollupConfig.chainId` | `bigint` |
| `createRollupConfig.confirmPeriodBlocks` | `bigint` |
| `createRollupConfig.extraChallengeTimeBlocks` | `bigint` |
| `createRollupConfig.genesisBlockNum` | `bigint` |
| `createRollupConfig.loserStakeEscrow` | \`0x$\{string\}\` |
| `createRollupConfig.owner` | \`0x$\{string\}\` |
| `createRollupConfig.sequencerInboxMaxTimeVariation` | `object` |
| `createRollupConfig.sequencerInboxMaxTimeVariation.delayBlocks` | `bigint` |
| `createRollupConfig.sequencerInboxMaxTimeVariation.delaySeconds` | `bigint` |
| `createRollupConfig.sequencerInboxMaxTimeVariation.futureBlocks` | `bigint` |
| `createRollupConfig.sequencerInboxMaxTimeVariation.futureSeconds` | `bigint` |
| `createRollupConfig.stakeToken` | \`0x$\{string\}\` |
| `createRollupConfig.wasmModuleRoot` | \`0x$\{string\}\` |
| `createRollupInformation` | [`CreateRollupResults`](createRollup.md#createrollupresults) |

#### Source

[src/testHelpers.ts:153](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/testHelpers.ts#L153)

***

### getInformationFromTestnode()

```ts
function getInformationFromTestnode(): TestnodeInformation
```

getInformationFromTestnode retrieves information from a Nitro testnode,
including details such as bridge addresses, rollup addresses, sequencer
inboxes, batch posters, and more. It returns a TestnodeInformation
object with the gathered data.

#### Returns

`TestnodeInformation`

#### Source

[src/testHelpers.ts:103](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/testHelpers.ts#L103)

***

### getNitroTestnodePrivateKeyAccounts()

```ts
function getNitroTestnodePrivateKeyAccounts(): NitroTestNodePrivateKeyAccounts
```

Returns a Nitro Testnode private key accounts object containing deployer, L2
rollup owner, L3 rollup owner, L3 token bridge deployer, and L2 token bridge
deployer private key accounts.

#### Returns

`NitroTestNodePrivateKeyAccounts`

#### Source

[src/testHelpers.ts:34](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/testHelpers.ts#L34)
