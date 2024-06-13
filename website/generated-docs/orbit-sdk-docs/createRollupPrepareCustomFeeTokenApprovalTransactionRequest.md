---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupPrepareCustomFeeTokenApprovalTransactionRequest

## Type Aliases

### CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams\<TChain\>

> **CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams**\<`TChain`\>: [`Prettify`](types/utils.md#prettifyt) \<[`WithRollupCreatorAddressOverride`](types/createRollupTypes.md#withrollupcreatoraddressoverridet)\<`object`\>\>

#### Type parameters

• **TChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Source

[createRollupPrepareCustomFeeTokenApprovalTransactionRequest.ts:11](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupPrepareCustomFeeTokenApprovalTransactionRequest.ts#L11)

## Functions

### createRollupPrepareCustomFeeTokenApprovalTransactionRequest()

> **createRollupPrepareCustomFeeTokenApprovalTransactionRequest**\<`TChain`\>(`__namedParameters`): `Promise`\<`any`\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.account**: `Address`

• **\_\_namedParameters.amount?**: `bigint`= `createRollupDefaultRetryablesFees`

• **\_\_namedParameters.nativeToken**: `Address`

• **\_\_namedParameters.publicClient**: `PublicClient`\<`Transport`, `TChain`\>

• **\_\_namedParameters.rollupCreatorAddressOverride?**: `any`

Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain.

#### Returns

`Promise`\<`any`\>

#### Source

[createRollupPrepareCustomFeeTokenApprovalTransactionRequest.ts:22](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollupPrepareCustomFeeTokenApprovalTransactionRequest.ts#L22)
