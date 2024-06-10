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

[src/types/createTokenBridgeTypes.ts:3](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/types/createTokenBridgeTypes.ts#L3)
