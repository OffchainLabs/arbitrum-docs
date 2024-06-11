---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Type alias: SequencerInboxActions\<TSequencerInbox, TChain\>

> **SequencerInboxActions**\<`TSequencerInbox`, `TChain`\>: `object`

## Type parameters

• **TSequencerInbox** *extends* `Address` \| `undefined`

• **TChain** *extends* `Chain` \| `undefined` = `Chain` \| `undefined`

## Type declaration

### sequencerInboxPrepareTransactionRequest()

> **sequencerInboxPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

Prepares a transaction request for the sequencerInbox contract

#### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](../../../sequencerInboxPrepareTransactionRequest/type-aliases/SequencerInboxFunctionName.md)

#### Parameters

• **args**: `SequencerInboxPrepareTransactionRequestArgs`\<`TSequencerInbox`, `TFunctionName`\>

Arguments for preparing the transaction request

#### Returns

`Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

### sequencerInboxReadContract()

> **sequencerInboxReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`SequencerInboxReadContractReturnType`](../../../sequencerInboxReadContract/type-aliases/SequencerInboxReadContractReturnType.md)\<`TFunctionName`\>\>

Reads data from the sequencerInbox contract

#### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](../../../sequencerInboxPrepareTransactionRequest/type-aliases/SequencerInboxFunctionName.md)

#### Parameters

• **args**: `SequencerInboxReadContractArgs`\<`TSequencerInbox`, `TFunctionName`\>

Arguments for reading the contract

#### Returns

`Promise` \<[`SequencerInboxReadContractReturnType`](../../../sequencerInboxReadContract/type-aliases/SequencerInboxReadContractReturnType.md)\<`TFunctionName`\>\>

## Source

[src/decorators/sequencerInboxActions.ts:31](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/decorators/sequencerInboxActions.ts#L31)
