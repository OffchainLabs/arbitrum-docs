---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Type Aliases

### EventArgs

```ts
type EventArgs<T> = T extends TypedEvent<infer _, infer TObj> ? TObj : never;
```

Defined in: [dataEntities/event.ts:10](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/event.ts#L10)

The type of the event arguments.
Gets the second generic arg

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

---

### EventFromFilter

```ts
type EventFromFilter<TFilter> = TFilter extends TypedEventFilter<infer TEvent> ? TEvent : never;
```

Defined in: [dataEntities/event.ts:18](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/event.ts#L18)

The event type of a filter
Gets the first generic arg

#### Type Parameters

| Type Parameter |
| -------------- |
| `TFilter`      |

---

### TypeChainContractFactory

```ts
type TypeChainContractFactory<TContract> = object;
```

Defined in: [dataEntities/event.ts:41](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/event.ts#L41)

Typechain contract factories have additional properties

#### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `TContract` _extends_ `Contract` |

## Functions

### parseTypedLog()

```ts
function parseTypedLog<TContract, TFilterName>(
  contractFactory: TypeChainContractFactory<TContract>,
  log: Log,
  filterName: TFilterName,
): EventArgs<EventFromFilter<ReturnType<TContract['filters'][TFilterName]>>> | null;
```

Defined in: [dataEntities/event.ts:53](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/event.ts#L53)

Parse a log that matches a given filter name.

#### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `TContract` _extends_ `Contract` |
| `TFilterName` _extends_ `string` |

#### Parameters

| Parameter         | Type                                                                   | Description      |
| ----------------- | ---------------------------------------------------------------------- | ---------------- |
| `contractFactory` | [`TypeChainContractFactory`](#typechaincontractfactory)\<`TContract`\> |                  |
| `log`             | `Log`                                                                  | The log to parse |
| `filterName`      | `TFilterName`                                                          |                  |

#### Returns

\| [`EventArgs`](#eventargs)\<[`EventFromFilter`](#eventfromfilter)\<`ReturnType`\<`TContract`\[`"filters"`\]\[`TFilterName`\]\>\>\>
\| `null`

Null if filter name topic does not match log topic

---

### parseTypedLogs()

```ts
function parseTypedLogs<TContract, TFilterName>(
  contractFactory: TypeChainContractFactory<TContract>,
  logs: Log[],
  filterName: TFilterName,
): EventArgs<EventFromFilter<ReturnType<TContract['filters'][TFilterName]>>>[];
```

Defined in: [dataEntities/event.ts:78](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/event.ts#L78)

Parses an array of logs.
Filters out any logs whose topic does not match provided the filter name topic.

#### Type Parameters

| Type Parameter                   |
| -------------------------------- |
| `TContract` _extends_ `Contract` |
| `TFilterName` _extends_ `string` |

#### Parameters

| Parameter         | Type                                                                   | Description       |
| ----------------- | ---------------------------------------------------------------------- | ----------------- |
| `contractFactory` | [`TypeChainContractFactory`](#typechaincontractfactory)\<`TContract`\> |                   |
| `logs`            | `Log`[]                                                                | The logs to parse |
| `filterName`      | `TFilterName`                                                          |                   |

#### Returns

[`EventArgs`](#eventargs)\<[`EventFromFilter`](#eventfromfilter)\<`ReturnType`\<`TContract`\[`"filters"`\]\[`TFilterName`\]\>\>\>[]
