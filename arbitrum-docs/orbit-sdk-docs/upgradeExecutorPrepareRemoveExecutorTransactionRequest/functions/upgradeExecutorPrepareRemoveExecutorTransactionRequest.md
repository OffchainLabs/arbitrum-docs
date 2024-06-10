---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function upgradeExecutorPrepareRemoveExecutorTransactionRequest(upgradeExecutorPrepareRemoveExecutorTransactionRequestParams: UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams): Promise<any>
```

Prepares a transaction to revoke the executor role from an account

- Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `upgradeExecutorPrepareRemoveExecutorTransactionRequestParams` | [`UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams`](../type-aliases/UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams.md) | [UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams](../type-aliases/UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams.md) |

## Returns

`Promise`\<`any`\>

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

[src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts:45](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts#L45)
