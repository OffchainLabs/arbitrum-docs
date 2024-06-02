---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupPrepareCustomFeeTokenApprovalTransactionRequest(__namedParameters: object): Promise<any>
```

Creates a custom fee token approval transaction request for the Rollup chain.
The function takes in parameters such as the amount, native token address,
account address, and public client. It then validates the parent chain,
generates the transaction request, and returns it along with the chain ID.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `__namedParameters` | `object` | - |
| `__namedParameters.account` | \`0x$\{string\}\` | - |
| `__namedParameters.amount`? | `bigint` | - |
| `__namedParameters.nativeToken` | \`0x$\{string\}\` | - |
| `__namedParameters.publicClient` | `object` | - |
| `__namedParameters.rollupCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise`\<`any`\>

## Source

[src/createRollupPrepareCustomFeeTokenApprovalTransactionRequest.ts:26](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createRollupPrepareCustomFeeTokenApprovalTransactionRequest.ts#L26)
