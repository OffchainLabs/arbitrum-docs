---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# decorators/sequencerInboxActions

## Type Aliases

### SequencerInboxActions\<TSequencerInbox, TChain\>

> **SequencerInboxActions**\<`TSequencerInbox`, `TChain`\>: `object`

#### Type parameters

• **TSequencerInbox** *extends* `Address` \| `undefined`

• **TChain** *extends* `Chain` \| `undefined` = `Chain` \| `undefined`

#### Type declaration

##### sequencerInboxPrepareTransactionRequest()

> **sequencerInboxPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

Prepares a transaction request for the sequencerInbox contract

###### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](../sequencerInboxPrepareTransactionRequest.md#sequencerinboxfunctionname)

###### Parameters

• **args**: `SequencerInboxPrepareTransactionRequestArgs`\<`TSequencerInbox`, `TFunctionName`\>

Arguments for preparing the transaction request

###### Returns

`Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\>

##### sequencerInboxReadContract()

> **sequencerInboxReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`SequencerInboxReadContractReturnType`](../sequencerInboxReadContract.md#sequencerinboxreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

Reads data from the sequencerInbox contract

###### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](../sequencerInboxPrepareTransactionRequest.md#sequencerinboxfunctionname)

###### Parameters

• **args**: `SequencerInboxReadContractArgs`\<`TSequencerInbox`, `TFunctionName`\>

Arguments for reading the contract

###### Returns

`Promise` \<[`SequencerInboxReadContractReturnType`](../sequencerInboxReadContract.md#sequencerinboxreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[src/decorators/sequencerInboxActions.ts:31](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/decorators/sequencerInboxActions.ts#L31)

## Functions

### sequencerInboxActions()

> **sequencerInboxActions**\<`TParams`, `TTransport`, `TChain`\>(`params`): (`client`) => [`SequencerInboxActions`](sequencerInboxActions.md#sequencerinboxactionstsequencerinboxtchain)\<`TParams`\[`"sequencerInbox"`\], `TChain`\>

Set of actions that can be performed on the sequencerInbox contract through wagmi public client

#### Type parameters

• **TParams** *extends* `object`

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

#### Parameters

• **params**: `TParams`

Parameters object

#### Returns

`Function`

sequencerInboxActionsWithSequencerInbox - Function passed to client.extends() to extend the public client

##### Parameters

• **client**

##### Returns

[`SequencerInboxActions`](sequencerInboxActions.md#sequencerinboxactionstsequencerinboxtchain)\<`TParams`\[`"sequencerInbox"`\], `TChain`\>

#### Example

```ts
const client = createPublicClient({
  chain: arbitrumOne,
  transport: http(),
}).extend(sequencerInboxActions(coreContracts.sequencerInbox));

// SequencerInbox is set to `coreContracts.sequencerInbox` for every call
client.sequencerInboxReadContract({
  functionName: 'inboxAccs',
});

// Overriding sequencerInbox address for this call only
client.sequencerInboxReadContract({
  functionName: 'inboxAccs',
  sequencerInbox: contractAddress.anotherSequencerInbox
});
```

#### Source

[src/decorators/sequencerInboxActions.ts:81](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/decorators/sequencerInboxActions.ts#L81)
