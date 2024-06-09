---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupPrepareTransactionRequest(__namedParameters: object): Promise<any>;
```

Prepares a transaction request to create a rollup chain on the specified
parent chain. The function validates the input parameters, including the
batch poster address and validator addresses, and checks if the native token
is allowed based on the chain configuration. It then encodes the function
data using the rollup creator ABI and prepares the transaction request with
the necessary data, value, and gas limits. Returns the prepared transaction
request along with the chain ID.

## Parameters

| Parameter                                         | Type                                                                                                        | Description                                                                                                                           |
| :------------------------------------------------ | :---------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `__namedParameters`                               | `object`                                                                                                    | -                                                                                                                                     |
| `__namedParameters.account`                       | \`0x$\{string\}\`                                                                                           | -                                                                                                                                     |
| `__namedParameters.gasOverrides`?                 | [`TransactionRequestGasOverrides`](../../utils/gasOverrides/type-aliases/TransactionRequestGasOverrides.md) | -                                                                                                                                     |
| `__namedParameters.params`                        | [`CreateRollupParams`](../../types/createRollupTypes/type-aliases/CreateRollupParams.md)                    | -                                                                                                                                     |
| `__namedParameters.publicClient`                  | `object`                                                                                                    | -                                                                                                                                     |
| `__namedParameters.rollupCreatorAddressOverride`? | \`0x$\{string\}\`                                                                                           | Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise`\<`any`\>

## Source

[src/createRollupPrepareTransactionRequest.ts:48](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/createRollupPrepareTransactionRequest.ts#L48)
