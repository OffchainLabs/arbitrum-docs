---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# upgradeExecutorPrepareRemoveExecutorTransactionRequest

## Type Aliases

### UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams\<TChain\>

> **UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams**\<`TChain`\>: `object`

Type for the params of the [upgradeExecutorPrepareRemoveExecutorTransactionRequest](upgradeExecutorPrepareRemoveExecutorTransactionRequest.md#upgradeexecutorprepareremoveexecutortransactionrequest) function

#### Type parameters

• **TChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Type declaration

##### account

> **account**: [`mainnet`](chains.md#mainnet)

##### executorAccountAddress

> **executorAccountAddress**: [`mainnet`](chains.md#mainnet)

##### publicClient

> **publicClient**: [`mainnet`](chains.md#mainnet) \<[`mainnet`](chains.md#mainnet), `TChain`\>

##### upgradeExecutorAddress

> **upgradeExecutorAddress**: [`mainnet`](chains.md#mainnet)

#### Source

[upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts:19](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts#L19)

## Functions

### upgradeExecutorPrepareRemoveExecutorTransactionRequest()

> **upgradeExecutorPrepareRemoveExecutorTransactionRequest**\<`TChain`\>(`upgradeExecutorPrepareRemoveExecutorTransactionRequestParams`): `Promise`\<`any`\>

Prepares a transaction to revoke the executor role from an account

- Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **upgradeExecutorPrepareRemoveExecutorTransactionRequestParams**: [`UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams`](upgradeExecutorPrepareRemoveExecutorTransactionRequest.md#upgradeexecutorprepareremoveexecutortransactionrequestparamstchain)\<`TChain`\>

[UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams](upgradeExecutorPrepareRemoveExecutorTransactionRequest.md#upgradeexecutorprepareremoveexecutortransactionrequestparamstchain)

#### Returns

`Promise`\<`any`\>

Promise<[PrepareTransactionRequestReturnType](chains.md#mainnet)> - the transaction request

#### Example

```ts
const removeExecutorTransactionRequest = await upgradeExecutorPrepareRemoveExecutorTransactionRequest({
  account: accountAddress,
  upgradeExecutorAddress: coreContracts.upgradeExecutor,
  executorAccountAddress: deployer.address,
  publicClient,
});
```

#### Source

[upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts:49](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts#L49)
