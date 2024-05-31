```ts
function upgradeExecutorPrepareAddExecutorTransactionRequest(
  upgradeExecutorPrepareAddExecutorTransactionRequestParams: UpgradeExecutorPrepareAddExecutorTransactionRequestParams,
): Promise<any>;
```

Prepares a transaction to grant the executor role to a new account

- Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)

## Parameters

| Parameter                                                   | Type                                                                                                                                        | Description                                                                                                                               |
| :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- |
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

[src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts:45](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/efea61c53fc08d3a6a336315cc447bc7613aada5/src/upgradeExecutorPrepareAddExecutorTransactionRequest.ts#L45)
