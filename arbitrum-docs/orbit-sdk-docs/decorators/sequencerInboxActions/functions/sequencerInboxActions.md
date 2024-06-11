---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: sequencerInboxActions()

> **sequencerInboxActions**\<`TParams`, `TTransport`, `TChain`\>(`params`): (`client`) => [`SequencerInboxActions`](../type-aliases/SequencerInboxActions.md)\<`TParams`\[`"sequencerInbox"`\], `TChain`\>

Set of actions that can be performed on the sequencerInbox contract through wagmi public client

## Type parameters

• **TParams** *extends* `object`

• **TTransport** *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> = `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\>

• **TChain** *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> = `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\>

## Parameters

• **params**: `TParams`

Parameters object

## Returns

`Function`

sequencerInboxActionsWithSequencerInbox - Function passed to client.extends() to extend the public client

### Parameters

• **client**

### Returns

[`SequencerInboxActions`](../type-aliases/SequencerInboxActions.md)\<`TParams`\[`"sequencerInbox"`\], `TChain`\>

## Example

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

## Source

[src/decorators/sequencerInboxActions.ts:81](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/decorators/sequencerInboxActions.ts#L81)
