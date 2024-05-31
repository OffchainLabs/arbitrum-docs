[Documentation](../README.md) / decorators/sequencerInboxActions

## Functions

### sequencerInboxActions()

```ts
function sequencerInboxActions<TParams, TTransport, TChain>(
  sequencerInbox: TParams,
): (client: object) => SequencerInboxActions<TParams['sequencerInbox'], TChain>;
```

Set of actions that can be performed on the sequencerInbox contract through wagmi public client

#### Type parameters

| Type parameter                            | Value                  |
| :---------------------------------------- | :--------------------- |
| `TParams` _extends_ `object`              | -                      |
| `TTransport` _extends_ `Transport`        | `Transport`            |
| `TChain` _extends_ `undefined` \| `Chain` | `undefined` \| `Chain` |

#### Parameters

| Parameter        | Type      | Description                                                                                                                                                                                           |
| :--------------- | :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sequencerInbox` | `TParams` | Address of the sequencerInbox core contract User can still overrides sequencerInbox address, by passing it as an argument to sequencerInboxReadContract/sequencerInboxPrepareTransactionRequest calls |

#### Returns

`Function`

sequencerInboxActionsWithSequencerInbox - Function passed to client.extends() to extend the public client

##### Parameters

| Parameter | Type     |
| :-------- | :------- |
| `client`  | `object` |

##### Returns

`SequencerInboxActions`\<`TParams`\[`"sequencerInbox"`\], `TChain`\>

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
  sequencerInbox: contractAddress.anotherSequencerInbox,
});
```

#### Source

[src/decorators/sequencerInboxActions.ts:71](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/decorators/sequencerInboxActions.ts#L71)
