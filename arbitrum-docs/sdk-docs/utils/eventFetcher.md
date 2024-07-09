---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### EventFetcher

Fetches and parses blockchain logs

#### Methods

##### getEvents()

```ts
getEvents<TContract, TEventFilter>(
   contractFactory: TypeChainContractFactory<TContract>,
   topicGenerator: (t: TContract) => TEventFilter,
filter: object): Promise<FetchedEvent<TEventOf<TEventFilter>>[]>
```

Fetch logs and parse logs

###### Type parameters

| Type parameter                                                                              |
| :------------------------------------------------------------------------------------------ |
| `TContract` _extends_ `Contract`\<`TContract`\>                                             |
| `TEventFilter` _extends_ `TypedEventFilter`\<`TypedEvent`\<`any`, `any`\>, `TEventFilter`\> |

###### Parameters

| Parameter          | Type                                                                                                    | Description                                                                |
| :----------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------- |
| `contractFactory`  | [`TypeChainContractFactory`](../dataEntities/event.md#typechaincontractfactorytcontract)\<`TContract`\> | A contract factory for generating a contract of type TContract at the addr |
| `topicGenerator`   | (`t`: `TContract`) => `TEventFilter`                                                                    | Generator function for creating                                            |
| `filter`           | `object`                                                                                                | Block and address filter parameters                                        |
| `filter.address`?  | `string`                                                                                                | -                                                                          |
| `filter.fromBlock` | `BlockTag`                                                                                              | -                                                                          |
| `filter.toBlock`   | `BlockTag`                                                                                              | -                                                                          |

###### Returns

`Promise`\<`FetchedEvent`\<`TEventOf`\<`TEventFilter`\>\>[]\>

###### Source

[utils/eventFetcher.ts:57](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/utils/eventFetcher.ts#L57)
