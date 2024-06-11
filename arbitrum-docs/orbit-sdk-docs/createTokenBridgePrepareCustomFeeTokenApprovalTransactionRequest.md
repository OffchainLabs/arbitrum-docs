---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest

## Type Aliases

### CreateTokenBridgePrepareCustomFeeTokenApprovalTransactionRequestParams

> **CreateTokenBridgePrepareCustomFeeTokenApprovalTransactionRequestParams**: [`Prettify`](types/utils.md#prettifyt) \<[`WithTokenBridgeCreatorAddressOverride`](types/createTokenBridgeTypes.md#withtokenbridgecreatoraddressoverridet)\<`object`\>\>

#### Source

[src/createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest.ts#L10)

## Functions

### createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest()

> **createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest**(`params`): `Promise`\<`any`\>

Creates a Token Bridge prepare custom fee token approval transaction request
with specified parameters. This function returns a Request object
containing the approval transaction details.

#### Parameters

• **params**

The parameters for the approval transaction request

• **params.amount?**: `bigint`= `maxInt256`

The amount to approve, optional, defaults to maxInt256

• **params.nativeToken**: \`0x$\{string\}\`

The native token address

• **params.owner**: \`0x$\{string\}\`

The owner address

• **params.publicClient**

The public client instance

• **params.tokenBridgeCreatorAddressOverride?**: \`0x$\{string\}\`

Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise`\<`any`\>

The approval transaction request details including chainId

#### Example

```ts
const approvalRequest = await createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest({
  amount: BigInt(1000),
  nativeToken: '0xTokenAddress',
  owner: '0xOwnerAddress',
  publicClient,
});
```

#### Source

[src/createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest.ts:41](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest.ts#L41)
