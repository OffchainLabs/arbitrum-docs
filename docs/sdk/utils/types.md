## Type Aliases

### OmitTyped

```ts
type OmitTyped<T, K> = Omit<T, K>;
```

Defined in: utils/types.ts:6

Omit doesnt enforce that the seconds generic is a keyof the first
OmitTyped guards against the underlying type prop names
being refactored, and not being updated in the usage of OmitTyped

#### Type Parameters

| Type Parameter          |
| ----------------------- |
| `T`                     |
| `K` _extends_ keyof `T` |

---

### PartialPick

```ts
type PartialPick<T, K> = OmitTyped<T, K> & Partial<T>;
```

Defined in: utils/types.ts:11

Make the specified properties optional

#### Type Parameters

| Type Parameter          |
| ----------------------- |
| `T`                     |
| `K` _extends_ keyof `T` |

---

### RequiredPick

```ts
type RequiredPick<T, K> = Required<Pick<T, K>> & T;
```

Defined in: utils/types.ts:16

Make the specified properties required

#### Type Parameters

| Type Parameter          |
| ----------------------- |
| `T`                     |
| `K` _extends_ keyof `T` |
