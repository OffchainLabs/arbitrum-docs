---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### EventFetcher

Defined in: [utils/eventFetcher.ts:47](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/eventFetcher.ts#L47)

Fetches and parses blockchain logs

#### Methods

##### getEvents()

```ts
getEvents<TContract, TEventFilter>(
   contractFactory: TypeChainContractFactory<TContract>,
   topicGenerator: (t: TContract) => TEventFilter,
filter: object): Promise<FetchedEvent<TEventOf<TEventFilter>>[]>;
```

Defined in: [utils/eventFetcher.ts:57](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/eventFetcher.ts#L57)

Fetch logs and parse logs

###### Type Parameters

| Type Parameter                                                              |
| --------------------------------------------------------------------------- |
| `TContract` _extends_ `Contract`                                            |
| `TEventFilter` _extends_ `TypedEventFilter`\<`TypedEvent`\<`any`, `any`\>\> |

###### Parameters

| Parameter          | Type                                                                                           | Description                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `contractFactory`  | [`TypeChainContractFactory`](../dataEntities/event.md#typechaincontractfactory)\<`TContract`\> | A contract factory for generating a contract of type TContract at the addr |
| `topicGenerator`   | (`t`: `TContract`) => `TEventFilter`                                                           | Generator function for creating                                            |
| `filter`           | \{ `address?`: `string`; `fromBlock`: `BlockTag`; `toBlock`: `BlockTag`; \}                    | Block and address filter parameters                                        |
| `filter.address?`  | `string`                                                                                       | -                                                                          |
| `filter.fromBlock` | `BlockTag`                                                                                     | -                                                                          |
| `filter.toBlock`   | `BlockTag`                                                                                     | -                                                                          |

###### Returns

`Promise`\<`FetchedEvent`\<`TEventOf`\<`TEventFilter`\>\>[]\>
