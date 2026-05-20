## Type Aliases

### EventArgs

```ts
type EventArgs<T> = T extends TypedEvent<infer _, infer TObj> ? TObj : never;
```

Defined in: dataEntities/event.ts:10

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

Defined in: dataEntities/event.ts:18

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

Defined in: dataEntities/event.ts:41

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

Defined in: dataEntities/event.ts:53

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

Defined in: dataEntities/event.ts:78

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
