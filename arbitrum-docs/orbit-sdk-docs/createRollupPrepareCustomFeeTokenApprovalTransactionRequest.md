[Documentation](README.md) / createRollupPrepareCustomFeeTokenApprovalTransactionRequest

## Functions

### createRollupPrepareCustomFeeTokenApprovalTransactionRequest()

```ts
function createRollupPrepareCustomFeeTokenApprovalTransactionRequest(
  __namedParameters: object,
): Promise<object | object | object>;
```

Creates a transaction request to approve a custom fee token for a rollup
chain. The function takes in the amount to approve, native token address,
account address, and public client. It validates the parent chain, generates
the approval request, and returns it along with the chain ID.

#### Parameters

| Parameter                                         | Type              | Description                                                                                                                           |
| :------------------------------------------------ | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `__namedParameters`                               | `object`          | -                                                                                                                                     |
| `__namedParameters.account`                       | \`0x$\{string\}\` | -                                                                                                                                     |
| `__namedParameters.amount`?                       | `bigint`          | -                                                                                                                                     |
| `__namedParameters.nativeToken`                   | \`0x$\{string\}\` | -                                                                                                                                     |
| `__namedParameters.publicClient`                  | `object`          | -                                                                                                                                     |
| `__namedParameters.rollupCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain. |

#### Returns

`Promise`\<`object` \| `object` \| `object`\>

#### Source

[src/createRollupPrepareCustomFeeTokenApprovalTransactionRequest.ts:26](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createRollupPrepareCustomFeeTokenApprovalTransactionRequest.ts#L26)
