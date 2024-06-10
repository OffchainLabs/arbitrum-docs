---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function upgradeExecutorPrepareAddExecutorTransactionRequest(upgradeExecutorPrepareAddExecutorTransactionRequestParams: UpgradeExecutorPrepareAddExecutorTransactionRequestParams): Promise<any>
```

Prepares a transaction to grant the executor role to a new account

- Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `upgradeExecutorPrepareAddExecutorTransactionRequestParams` | [`UpgradeExecutorPrepareAddExecutorTransactionRequestParams`](../type-aliases/UpgradeExecutorPrepareAddExecutorTransactionRequestParams.md) | [UpgradeExecutorPrepareAddExecutorTransactionRequestParams](../type-aliases/UpgradeExecutorPrepareAddExecutorTransactionRequestParams.md) |

## Returns

`Promise`\<`any`\>

Promise<PrepareTransactionRequestReturnType> - the transaction request

## Example

```ts
const addExecutorTransactionRequest = await upgradeExecutorPrepareAddExecutorTransactionRequest({
  account: newExecutorAccountAddress,
  upgradeExecutorAddress: coreContracts.upgradeExecutor,
  executorAccountAddress: deployer.address,
  publicClient,
});
```

## Source

[src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts:45](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts#L45)
