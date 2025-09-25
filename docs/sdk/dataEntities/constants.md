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

[dataEntities/constants.ts:41](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/constants.ts#L41)

---

### ARB1_NITRO_GENESIS_L1_BLOCK

```ts
const ARB1_NITRO_GENESIS_L1_BLOCK: 15447158 = 15447158;
```

The L1 block at which Nitro was activated for Arbitrum One.

#### See

https://etherscan.io/block/15447158

#### Source

[dataEntities/constants.ts:71](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/constants.ts#L71)

---

### ARB1_NITRO_GENESIS_L2_BLOCK

```ts
const ARB1_NITRO_GENESIS_L2_BLOCK: 22207817 = 22207817;
```

The L2 block at which Nitro was activated for Arbitrum One.

#### See

https://arbiscan.io/block/22207817

#### Source

[dataEntities/constants.ts:78](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/constants.ts#L78)

---

### CUSTOM_TOKEN_IS_ENABLED

```ts
const CUSTOM_TOKEN_IS_ENABLED: 42161 = 42161;
```

If a custom token is enabled for arbitrum it will implement a function called
isArbitrumEnabled which returns this value. Intger: 0xa4b1

#### Source

[dataEntities/constants.ts:52](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/constants.ts#L52)

---

### DEFAULT_DEPOSIT_TIMEOUT

```ts
const DEFAULT_DEPOSIT_TIMEOUT: number;
```

How long to wait (in milliseconds) for a deposit to arrive before timing out a request.

Finalisation on mainnet can be up to 2 epochs = 64 blocks.
We add 10 minutes for the system to create and redeem the ticket, plus some extra buffer of time.

Total timeout: 30 minutes.

#### Source

[dataEntities/constants.ts:64](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/constants.ts#L64)

---

### DISABLED_GATEWAY

```ts
const DISABLED_GATEWAY: '0x0000000000000000000000000000000000000001' =
  '0x0000000000000000000000000000000000000001';
```

Address of the gateway a token will be assigned to if it is disabled

#### Source

[dataEntities/constants.ts:46](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/constants.ts#L46)
