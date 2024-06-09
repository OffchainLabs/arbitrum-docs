---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type WithTokenBridgeCreatorAddressOverride<T>: T & object;
```

## Type declaration

| Member | Type | Description |
| :------ | :------ | :------ |
| `tokenBridgeCreatorAddressOverride` | `Address` | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

## Type parameters

| Type parameter |
| :------ |
| `T` |

## Source

[src/types/createTokenBridgeTypes.ts:3](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/types/createTokenBridgeTypes.ts#L3)
