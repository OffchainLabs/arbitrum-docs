---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Variables

### ADDRESS_ALIAS_OFFSET

```ts
const ADDRESS_ALIAS_OFFSET: '0x1111000000000000000000000000000000001111' =
  '0x1111000000000000000000000000000000001111';
```

The offset added to an L1 address to get the corresponding L2 address

#### Source

[dataEntities/constants.ts:41](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/constants.ts#L41)

---

### CUSTOM_TOKEN_IS_ENABLED

```ts
const CUSTOM_TOKEN_IS_ENABLED: 42161 = 42161;
```

If a custom token is enabled for arbitrum it will implement a function called
isArbitrumEnabled which returns this value. Intger: 0xa4b1

#### Source

[dataEntities/constants.ts:52](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/constants.ts#L52)

---

### DISABLED_GATEWAY

```ts
const DISABLED_GATEWAY: '0x0000000000000000000000000000000000000001' =
  '0x0000000000000000000000000000000000000001';
```

Address of the gateway a token will be assigned to if it is disabled

#### Source

[dataEntities/constants.ts:46](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/constants.ts#L46)
