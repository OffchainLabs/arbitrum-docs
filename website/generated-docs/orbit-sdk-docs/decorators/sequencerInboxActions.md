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

• **TSequencerInbox** *extends* [`mainnet`](../chains.md#mainnet) \| `undefined`

• **TChain** *extends* [`mainnet`](../chains.md#mainnet) \| `undefined` = [`mainnet`](../chains.md#mainnet) \| `undefined`

#### Type declaration

##### sequencerInboxPrepareTransactionRequest()

> **sequencerInboxPrepareTransactionRequest**: \<`TFunctionName`\>(`args`) => `Promise` \<[`mainnet`](../chains.md#mainnet)\<`TChain`\> & `object`\>

###### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](../sequencerInboxPrepareTransactionRequest.md#sequencerinboxfunctionname)

###### Parameters

• **args**: `SequencerInboxPrepareTransactionRequestArgs`\<`TSequencerInbox`, `TFunctionName`\>

###### Returns

`Promise` \<[`mainnet`](../chains.md#mainnet)\<`TChain`\> & `object`\>

##### sequencerInboxReadContract()

> **sequencerInboxReadContract**: \<`TFunctionName`\>(`args`) => `Promise` \<[`SequencerInboxReadContractReturnType`](../sequencerInboxReadContract.md#sequencerinboxreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

###### Type parameters

• **TFunctionName** *extends* [`SequencerInboxFunctionName`](../sequencerInboxPrepareTransactionRequest.md#sequencerinboxfunctionname)

###### Parameters

• **args**: `SequencerInboxReadContractArgs`\<`TSequencerInbox`, `TFunctionName`\>

###### Returns

`Promise` \<[`SequencerInboxReadContractReturnType`](../sequencerInboxReadContract.md#sequencerinboxreadcontractreturntypetfunctionname)\<`TFunctionName`\>\>

#### Source

[decorators/sequencerInboxActions.ts:31](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/decorators/sequencerInboxActions.ts#L31)

## Functions

### sequencerInboxActions()

> **sequencerInboxActions**\<`TParams`, `TTransport`, `TChain`\>(`sequencerInbox`): (`client`) => [`SequencerInboxActions`](sequencerInboxActions.md#sequencerinboxactionstsequencerinboxtchain)\<`TParams`\[`"sequencerInbox"`\], `TChain`\>

Set of actions that can be performed on the sequencerInbox contract through wagmi public client

#### Type parameters

• **TParams** *extends* `object`

• **TTransport** *extends* `Transport` = `Transport`

• **TChain** *extends* `unknown` = `any`

#### Parameters

• **sequencerInbox**: `TParams`

Address of the sequencerInbox core contract
User can still overrides sequencerInbox address,
by passing it as an argument to sequencerInboxReadContract/sequencerInboxPrepareTransactionRequest calls

#### Returns

`Function`

sequencerInboxActionsWithSequencerInbox - Function passed to client.extends() to extend the public client

##### Parameters

• **client**: `PublicClient`\<`TTransport`, `TChain`\>

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

[decorators/sequencerInboxActions.ts:71](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/decorators/sequencerInboxActions.ts#L71)
