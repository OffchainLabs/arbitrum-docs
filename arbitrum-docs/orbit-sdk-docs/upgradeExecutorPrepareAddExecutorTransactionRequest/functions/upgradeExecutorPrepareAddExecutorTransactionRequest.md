---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: upgradeExecutorPrepareAddExecutorTransactionRequest()

> **upgradeExecutorPrepareAddExecutorTransactionRequest**(`upgradeExecutorPrepareAddExecutorTransactionRequestParams`): `Promise`\<`PrepareTransactionRequestReturnType`\>

Prepares a transaction to grant the executor role to a new account

- Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)

## Parameters

• **upgradeExecutorPrepareAddExecutorTransactionRequestParams**: [`UpgradeExecutorPrepareAddExecutorTransactionRequestParams`](../type-aliases/UpgradeExecutorPrepareAddExecutorTransactionRequestParams.md)

[UpgradeExecutorPrepareAddExecutorTransactionRequestParams](../type-aliases/UpgradeExecutorPrepareAddExecutorTransactionRequestParams.md)

## Returns

`Promise`\<`PrepareTransactionRequestReturnType`\>

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

[src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts:45](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts#L45)
