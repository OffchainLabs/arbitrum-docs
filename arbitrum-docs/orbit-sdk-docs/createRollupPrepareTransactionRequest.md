[Documentation](README.md) / createRollupPrepareTransactionRequest

## Functions

### createRollupPrepareTransactionRequest()

```ts
function createRollupPrepareTransactionRequest(
  __namedParameters: object,
): Promise<object | object | object>;
```

Prepare a transaction request for creating a rollup chain with specified
parameters, account, and public client. This function validates input
parameters, fetches chain configuration, and encodes the function data for
creating a rollup chain. It also handles gas overrides and returns the
prepared transaction request along with the chain ID.

#### Parameters

| Parameter                                         | Type                             | Description                                                                                                                           |
| :------------------------------------------------ | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `__namedParameters`                               | `object`                         | -                                                                                                                                     |
| `__namedParameters.account`                       | \`0x$\{string\}\`                | -                                                                                                                                     |
| `__namedParameters.gasOverrides`?                 | `TransactionRequestGasOverrides` | -                                                                                                                                     |
| `__namedParameters.params`                        | `CreateRollupParams`             | -                                                                                                                                     |
| `__namedParameters.publicClient`                  | `object`                         | -                                                                                                                                     |
| `__namedParameters.rollupCreatorAddressOverride`? | \`0x$\{string\}\`                | Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain. |

#### Returns

`Promise`\<`object` \| `object` \| `object`\>

#### Source

[src/createRollupPrepareTransactionRequest.ts:46](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createRollupPrepareTransactionRequest.ts#L46)
