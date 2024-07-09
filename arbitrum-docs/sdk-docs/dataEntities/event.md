---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Type Aliases

### EventArgs\<T\>

```ts
type EventArgs<T>: T extends TypedEvent<infer _, infer TObj> ? TObj : never;
```

The type of the event arguments.
Gets the second generic arg

#### Type parameters

| Type parameter |
| :------------- |
| `T`            |

#### Source

[dataEntities/event.ts:10](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/event.ts#L10)

---

### EventFromFilter\<TFilter\>

```ts
type EventFromFilter<TFilter>: TFilter extends TypedEventFilter<infer TEvent> ? TEvent : never;
```

The event type of a filter
Gets the first generic arg

#### Type parameters

| Type parameter |
| :------------- |
| `TFilter`      |

#### Source

[dataEntities/event.ts:18](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/event.ts#L18)

---

### TypeChainContractFactory\<TContract\>

```ts
type TypeChainContractFactory<TContract>: object;
```

Typechain contract factories have additional properties

#### Type parameters

| Type parameter                   |
| :------------------------------- |
| `TContract` _extends_ `Contract` |

#### Type declaration

| Member            | Type        |
| :---------------- | :---------- |
| `connect`         | `TContract` |
| `createInterface` | `Interface` |

#### Source

[dataEntities/event.ts:41](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/event.ts#L41)

## Functions

### parseTypedLog()

```ts
function parseTypedLog<TContract, TFilterName>(
  contractFactory: TypeChainContractFactory<TContract>,
  log: Log,
  filterName: TFilterName,
): null | EventArgs<EventFromFilter<ReturnType<TContract['filters'][TFilterName]>>>;
```

Parse a log that matches a given filter name.

#### Type parameters

| Type parameter                                  |
| :---------------------------------------------- |
| `TContract` _extends_ `Contract`\<`TContract`\> |
| `TFilterName` _extends_ `string`                |

#### Parameters

| Parameter         | Type                                                                                    | Description      |
| :---------------- | :-------------------------------------------------------------------------------------- | :--------------- |
| `contractFactory` | [`TypeChainContractFactory`](event.md#typechaincontractfactorytcontract)\<`TContract`\> |                  |
| `log`             | `Log`                                                                                   | The log to parse |
| `filterName`      | `TFilterName`                                                                           |                  |

#### Returns

`null` \| [`EventArgs`](event.md#eventargst) \<[`EventFromFilter`](event.md#eventfromfiltertfilter)\<`ReturnType`\<`TContract`\[`"filters"`\]\[`TFilterName`\]\>\>\>

Null if filter name topic does not match log topic

#### Source

[dataEntities/event.ts:53](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/event.ts#L53)

---

### parseTypedLogs()

```ts
function parseTypedLogs<TContract, TFilterName>(
  contractFactory: TypeChainContractFactory<TContract>,
  logs: Log[],
  filterName: TFilterName,
): EventArgs<EventFromFilter<ReturnType<TContract['filters'][TFilterName]>>>[];
```

Parses an array of logs.
Filters out any logs whose topic does not match provided the filter name topic.

#### Type parameters

| Type parameter                                  |
| :---------------------------------------------- |
| `TContract` _extends_ `Contract`\<`TContract`\> |
| `TFilterName` _extends_ `string`                |

#### Parameters

| Parameter         | Type                                                                                    | Description       |
| :---------------- | :-------------------------------------------------------------------------------------- | :---------------- |
| `contractFactory` | [`TypeChainContractFactory`](event.md#typechaincontractfactorytcontract)\<`TContract`\> |                   |
| `logs`            | `Log`[]                                                                                 | The logs to parse |
| `filterName`      | `TFilterName`                                                                           |                   |

#### Returns

[`EventArgs`](event.md#eventargst) \<[`EventFromFilter`](event.md#eventfromfiltertfilter)\<`ReturnType`\<`TContract`\[`"filters"`\]\[`TFilterName`\]\>\>\>[]

#### Source

[dataEntities/event.ts:78](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/event.ts#L78)
