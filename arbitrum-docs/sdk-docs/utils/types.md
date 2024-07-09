---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Type Aliases

### OmitTyped\<T, K\>

```ts
type OmitTyped<T, K>: Omit<T, K>;
```

Omit doesnt enforce that the seconds generic is a keyof the first
OmitTyped guards against the underlying type prop names
being refactored, and not being updated in the usage of OmitTyped

#### Type parameters

| Type parameter          |
| :---------------------- |
| `T`                     |
| `K` _extends_ keyof `T` |

#### Source

[utils/types.ts:6](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/utils/types.ts#L6)

---

### PartialPick\<T, K\>

```ts
type PartialPick<T, K>: OmitTyped<T, K> & Partial<T>;
```

Make the specified properties optional

#### Type parameters

| Type parameter          |
| :---------------------- |
| `T`                     |
| `K` _extends_ keyof `T` |

#### Source

[utils/types.ts:11](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/utils/types.ts#L11)

---

### RequiredPick\<T, K\>

```ts
type RequiredPick<T, K>: Required<Pick<T, K>> & T;
```

Make the specified properties required

#### Type parameters

| Type parameter          |
| :---------------------- |
| `T`                     |
| `K` _extends_ keyof `T` |

#### Source

[utils/types.ts:16](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/utils/types.ts#L16)
