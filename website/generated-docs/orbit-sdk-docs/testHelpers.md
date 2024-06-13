---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# testHelpers

## Functions

### createRollupHelper()

> **createRollupHelper**(`__namedParameters`): `Promise`\<`object`\>

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.batchPoster**: `Address`

• **\_\_namedParameters.client**: `PublicClient`

• **\_\_namedParameters.deployer**: `any`

• **\_\_namedParameters.nativeToken**: `Address`= `zeroAddress`

• **\_\_namedParameters.validators**: [`Address`]

#### Returns

`Promise`\<`object`\>

##### createRollupConfig

> **createRollupConfig**: `GetFunctionArgs`\<readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`], `"createRollup"`\>

##### createRollupInformation

> **createRollupInformation**: [`CreateRollupResults`](createRollup.md#createrollupresults)

#### Source

[testHelpers.ts:138](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/testHelpers.ts#L138)

***

### getInformationFromTestnode()

> **getInformationFromTestnode**(): `TestnodeInformation`

#### Returns

`TestnodeInformation`

#### Source

[testHelpers.ts:92](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/testHelpers.ts#L92)

***

### getNitroTestnodePrivateKeyAccounts()

> **getNitroTestnodePrivateKeyAccounts**(): `NitroTestNodePrivateKeyAccounts`

#### Returns

`NitroTestNodePrivateKeyAccounts`

#### Source

[testHelpers.ts:29](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/testHelpers.ts#L29)
