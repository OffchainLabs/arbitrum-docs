---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# upgradeExecutorPrepareAddExecutorTransactionRequest

## Type Aliases

### UpgradeExecutorPrepareAddExecutorTransactionRequestParams\<TChain\>

> **UpgradeExecutorPrepareAddExecutorTransactionRequestParams**\<`TChain`\>: `object`

Type for the params of the [upgradeExecutorPrepareAddExecutorTransactionRequest](upgradeExecutorPrepareAddExecutorTransactionRequest.md#upgradeexecutorprepareaddexecutortransactionrequest) function

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

[upgradeExecutorPrepareAddExecutorTransactionRequest.ts:19](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts#L19)

## Functions

### upgradeExecutorPrepareAddExecutorTransactionRequest()

> **upgradeExecutorPrepareAddExecutorTransactionRequest**\<`TChain`\>(`upgradeExecutorPrepareAddExecutorTransactionRequestParams`): `Promise`\<`any`\>

Prepares a transaction to grant the executor role to a new account

- Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **upgradeExecutorPrepareAddExecutorTransactionRequestParams**: [`UpgradeExecutorPrepareAddExecutorTransactionRequestParams`](upgradeExecutorPrepareAddExecutorTransactionRequest.md#upgradeexecutorprepareaddexecutortransactionrequestparamstchain)\<`TChain`\>

[UpgradeExecutorPrepareAddExecutorTransactionRequestParams](upgradeExecutorPrepareAddExecutorTransactionRequest.md#upgradeexecutorprepareaddexecutortransactionrequestparamstchain)

#### Returns

`Promise`\<`any`\>

Promise<[PrepareTransactionRequestReturnType](chains.md#mainnet)> - the transaction request

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

[upgradeExecutorPrepareAddExecutorTransactionRequest.ts:49](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts#L49)
