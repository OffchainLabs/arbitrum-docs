---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# upgradeExecutorPrepareRemoveExecutorTransactionRequest

## Type Aliases

### UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams

> **UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams**: `object`

Type for the params of the [upgradeExecutorPrepareRemoveExecutorTransactionRequest](upgradeExecutorPrepareRemoveExecutorTransactionRequest.md#upgradeexecutorprepareremoveexecutortransactionrequest) function

#### Type declaration

##### account

> **account**: `Address`

##### executorAccountAddress

> **executorAccountAddress**: `Address`

##### publicClient

> **publicClient**: `PublicClient`

##### upgradeExecutorAddress

> **upgradeExecutorAddress**: `Address`

#### Source

[src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts#L17)

## Functions

### upgradeExecutorPrepareRemoveExecutorTransactionRequest()

> **upgradeExecutorPrepareRemoveExecutorTransactionRequest**(`upgradeExecutorPrepareRemoveExecutorTransactionRequestParams`): `Promise`\<`PrepareTransactionRequestReturnType`\>

Prepares a transaction to revoke the executor role from an account

- Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)

#### Parameters

• **upgradeExecutorPrepareRemoveExecutorTransactionRequestParams**: [`UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams`](upgradeExecutorPrepareRemoveExecutorTransactionRequest.md#upgradeexecutorprepareremoveexecutortransactionrequestparams)

[UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams](upgradeExecutorPrepareRemoveExecutorTransactionRequest.md#upgradeexecutorprepareremoveexecutortransactionrequestparams)

#### Returns

`Promise`\<`PrepareTransactionRequestReturnType`\>

Promise<PrepareTransactionRequestReturnType> - the transaction request

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

[src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts:45](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts#L45)
