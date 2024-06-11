---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# upgradeExecutorPrepareAddExecutorTransactionRequest

## Type Aliases

### UpgradeExecutorPrepareAddExecutorTransactionRequestParams

> **UpgradeExecutorPrepareAddExecutorTransactionRequestParams**: `object`

Type for the params of the [upgradeExecutorPrepareAddExecutorTransactionRequest](upgradeExecutorPrepareAddExecutorTransactionRequest.md#upgradeexecutorprepareaddexecutortransactionrequest) function

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

[src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts#L17)

## Functions

### upgradeExecutorPrepareAddExecutorTransactionRequest()

> **upgradeExecutorPrepareAddExecutorTransactionRequest**(`upgradeExecutorPrepareAddExecutorTransactionRequestParams`): `Promise`\<`PrepareTransactionRequestReturnType`\>

Prepares a transaction to grant the executor role to a new account

- Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)

#### Parameters

• **upgradeExecutorPrepareAddExecutorTransactionRequestParams**: [`UpgradeExecutorPrepareAddExecutorTransactionRequestParams`](upgradeExecutorPrepareAddExecutorTransactionRequest.md#upgradeexecutorprepareaddexecutortransactionrequestparams)

[UpgradeExecutorPrepareAddExecutorTransactionRequestParams](upgradeExecutorPrepareAddExecutorTransactionRequest.md#upgradeexecutorprepareaddexecutortransactionrequestparams)

#### Returns

`Promise`\<`PrepareTransactionRequestReturnType`\>

Promise<PrepareTransactionRequestReturnType> - the transaction request

#### Example

```ts
const addExecutorTransactionRequest = await upgradeExecutorPrepareAddExecutorTransactionRequest({
  account: newExecutorAccountAddress,
  upgradeExecutorAddress: coreContracts.upgradeExecutor,
  executorAccountAddress: deployer.address,
  publicClient,
});
```

#### Source

[src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts:45](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts#L45)
