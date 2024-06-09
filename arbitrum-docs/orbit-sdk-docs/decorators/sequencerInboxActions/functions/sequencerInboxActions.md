---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function sequencerInboxActions<TParams, TTransport, TChain>(sequencerInbox: TParams): (client: object) => SequencerInboxActions<TParams["sequencerInbox"], TChain>
```

Set of actions that can be performed on the sequencerInbox contract through wagmi public client

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TParams` *extends* `object` | - |
| `TTransport` *extends* `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> | `Transport`\<`string`, `Record`\<`string`, `any`\>, `EIP1193RequestFn`\<`undefined`\>\> |
| `TChain` *extends* `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> | `undefined` \| `Chain`\<`undefined` \| `ChainFormatters`\> |

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sequencerInbox` | `TParams` | Address of the sequencerInbox core contract<br />User can still overrides sequencerInbox address,<br />by passing it as an argument to sequencerInboxReadContract/sequencerInboxPrepareTransactionRequest calls |

## Returns

`Function`

sequencerInboxActionsWithSequencerInbox - Function passed to client.extends() to extend the public client

### Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `object` |

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

[src/decorators/sequencerInboxActions.ts:71](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/decorators/sequencerInboxActions.ts#L71)
