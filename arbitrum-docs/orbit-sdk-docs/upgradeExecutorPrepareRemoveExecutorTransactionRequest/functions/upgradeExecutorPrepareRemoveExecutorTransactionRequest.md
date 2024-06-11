---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: upgradeExecutorPrepareRemoveExecutorTransactionRequest()

> **upgradeExecutorPrepareRemoveExecutorTransactionRequest**(`upgradeExecutorPrepareRemoveExecutorTransactionRequestParams`): `Promise`\<`PrepareTransactionRequestReturnType`\>

Prepares a transaction to revoke the executor role from an account

- Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)

## Parameters

• **upgradeExecutorPrepareRemoveExecutorTransactionRequestParams**: [`UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams`](../type-aliases/UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams.md)

[UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams](../type-aliases/UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams.md)

## Returns

`Promise`\<`PrepareTransactionRequestReturnType`\>

Promise<PrepareTransactionRequestReturnType> - the transaction request

## Example

```ts
const removeExecutorTransactionRequest = await upgradeExecutorPrepareRemoveExecutorTransactionRequest({
  account: accountAddress,
  upgradeExecutorAddress: coreContracts.upgradeExecutor,
  executorAccountAddress: deployer.address,
  publicClient,
});
```

## Source

[src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts:45](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts#L45)
