[Documentation](README.md) / upgradeExecutorPrepareRemoveExecutorTransactionRequest

## Type Aliases

### UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams

```ts
type UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams: object;
```

Type for the params of the [upgradeExecutorPrepareRemoveExecutorTransactionRequest](upgradeExecutorPrepareRemoveExecutorTransactionRequest.md#upgradeexecutorprepareremoveexecutortransactionrequest) function

#### Type declaration

| Member | Type |
| :------ | :------ |
| `account` | `Address` |
| `executorAccountAddress` | `Address` |
| `publicClient` | `PublicClient` |
| `upgradeExecutorAddress` | `Address` |

#### Source

[src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts#L17)

## Functions

### upgradeExecutorPrepareRemoveExecutorTransactionRequest()

```ts
function upgradeExecutorPrepareRemoveExecutorTransactionRequest(upgradeExecutorPrepareRemoveExecutorTransactionRequestParams: UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams): Promise<object | object | object>
```

Prepares a transaction to revoke the executor role from an account

- Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `upgradeExecutorPrepareRemoveExecutorTransactionRequestParams` | [`UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams`](upgradeExecutorPrepareRemoveExecutorTransactionRequest.md#upgradeexecutorprepareremoveexecutortransactionrequestparams) | [UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams](upgradeExecutorPrepareRemoveExecutorTransactionRequest.md#upgradeexecutorprepareremoveexecutortransactionrequestparams) |

#### Returns

`Promise`\<`object` \| `object` \| `object`\>

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

[src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts:45](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/upgradeExecutorPrepareRemoveExecutorTransactionRequest.ts#L45)
