---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createRollupPrepareCustomFeeTokenApprovalTransactionRequest()

> **createRollupPrepareCustomFeeTokenApprovalTransactionRequest**(`params`): `Promise`\<`any`\>

Creates a custom fee token approval transaction request for the Rollup chain.
The function takes in parameters such as the amount, native token address,
account address, and public client. It then validates the parent chain,
generates the transaction request, and returns it along with the chain ID.

## Parameters

• **params**

The parameters for creating the approval transaction request.

• **params.account**: \`0x$\{string\}\`

The account address.

• **params.amount?**: `bigint`= `createRollupDefaultRetryablesFees`

The amount of tokens to approve, optional, defaults to createRollupDefaultRetryablesFees.

• **params.nativeToken**: \`0x$\{string\}\`

The native token address.

• **params.publicClient**

The public client.

• **params.rollupCreatorAddressOverride?**: \`0x$\{string\}\`

Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain.

## Returns

`Promise`\<`any`\>

The custom fee token approval transaction request and the chain ID.

## Example

```ts
const approvalRequest = await createRollupPrepareCustomFeeTokenApprovalTransactionRequest({
  amount: 1000n,
  nativeToken: '0xTokenAddress',
  account: '0xAccountAddress',
  publicClient,
});

console.log(approvalRequest);
```

## Source

[src/createRollupPrepareCustomFeeTokenApprovalTransactionRequest.ts:45](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createRollupPrepareCustomFeeTokenApprovalTransactionRequest.ts#L45)
