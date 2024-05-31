[Documentation](README.md) / upgradeExecutorPrepareAddExecutorTransactionRequest

## Type Aliases

### UpgradeExecutorPrepareAddExecutorTransactionRequestParams

```ts
type UpgradeExecutorPrepareAddExecutorTransactionRequestParams: object;
```

Type for the params of the [upgradeExecutorPrepareAddExecutorTransactionRequest](upgradeExecutorPrepareAddExecutorTransactionRequest.md#upgradeexecutorprepareaddexecutortransactionrequest) function

#### Type declaration

| Member | Type |
| :------ | :------ |
| `account` | `Address` |
| `executorAccountAddress` | `Address` |
| `publicClient` | `PublicClient` |
| `upgradeExecutorAddress` | `Address` |

#### Source

[src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts:17](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts#L17)

## Functions

### upgradeExecutorPrepareAddExecutorTransactionRequest()

```ts
function upgradeExecutorPrepareAddExecutorTransactionRequest(upgradeExecutorPrepareAddExecutorTransactionRequestParams: UpgradeExecutorPrepareAddExecutorTransactionRequestParams): Promise<object | object | object>
```

Prepares a transaction to grant the executor role to a new account

- Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `upgradeExecutorPrepareAddExecutorTransactionRequestParams` | [`UpgradeExecutorPrepareAddExecutorTransactionRequestParams`](upgradeExecutorPrepareAddExecutorTransactionRequest.md#upgradeexecutorprepareaddexecutortransactionrequestparams) | [UpgradeExecutorPrepareAddExecutorTransactionRequestParams](upgradeExecutorPrepareAddExecutorTransactionRequest.md#upgradeexecutorprepareaddexecutortransactionrequestparams) |

#### Returns

`Promise`\<`object` \| `object` \| `object`\>

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

[src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts:45](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts#L45)
