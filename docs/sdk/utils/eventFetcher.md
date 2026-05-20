## Classes

### EventFetcher

Defined in: utils/eventFetcher.ts:47

Fetches and parses blockchain logs

#### Methods

##### getEvents()

```ts
getEvents<TContract, TEventFilter>(
   contractFactory: TypeChainContractFactory<TContract>,
   topicGenerator: (t: TContract) => TEventFilter,
filter: object): Promise<FetchedEvent<TEventOf<TEventFilter>>[]>;
```

Defined in: utils/eventFetcher.ts:57

Fetch logs and parse logs

###### Type Parameters

| Type Parameter                                              |
| ----------------------------------------------------------- |
| `TContract` _extends_ `Contract`                            |
| `TEventFilter` _extends_ `TypedEventFilter`\<`TypedEvent`\> |

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
