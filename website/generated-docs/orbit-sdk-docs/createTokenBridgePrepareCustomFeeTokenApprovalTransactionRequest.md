---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest

## Type Aliases

### CreateTokenBridgePrepareCustomFeeTokenApprovalTransactionRequestParams\<TChain\>

> **CreateTokenBridgePrepareCustomFeeTokenApprovalTransactionRequestParams**\<`TChain`\>: [`Prettify`](types/utils.md#prettifyt) \<[`WithTokenBridgeCreatorAddressOverride`](types/createTokenBridgeTypes.md#withtokenbridgecreatoraddressoverridet)\<`object`\>\>

#### Type parameters

• **TChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Source

[createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest.ts:10](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest.ts#L10)

## Functions

### createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest()

> **createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest**\<`TChain`\>(`__namedParameters`): `Promise`\<`any`\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.amount?**: `bigint`= `maxInt256`

• **\_\_namedParameters.nativeToken**: `Address`

• **\_\_namedParameters.owner**: `Address`

• **\_\_namedParameters.publicClient**: `PublicClient`\<`Transport`, `TChain`\>

• **\_\_namedParameters.tokenBridgeCreatorAddressOverride?**: `any`

Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise`\<`any`\>

#### Source

[createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest.ts:21](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest.ts#L21)
