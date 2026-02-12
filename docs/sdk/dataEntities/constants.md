## Variables

### ADDRESS_ALIAS_OFFSET

```ts
const ADDRESS_ALIAS_OFFSET: '0x1111000000000000000000000000000000001111' =
  '0x1111000000000000000000000000000000001111';
```

Defined in: dataEntities/constants.ts:41

The offset added to an L1 address to get the corresponding L2 address

---

### ARB1_NITRO_GENESIS_L1_BLOCK

```ts
const ARB1_NITRO_GENESIS_L1_BLOCK: 15447158 = 15447158;
```

Defined in: dataEntities/constants.ts:71

The L1 block at which Nitro was activated for Arbitrum One.

#### See

https://etherscan.io/block/15447158

---

### ARB1_NITRO_GENESIS_L2_BLOCK

```ts
const ARB1_NITRO_GENESIS_L2_BLOCK: 22207817 = 22207817;
```

Defined in: dataEntities/constants.ts:78

The L2 block at which Nitro was activated for Arbitrum One.

#### See

https://arbiscan.io/block/22207817

---

### CUSTOM_TOKEN_IS_ENABLED

```ts
const CUSTOM_TOKEN_IS_ENABLED: 42161 = 42161;
```

Defined in: dataEntities/constants.ts:52

If a custom token is enabled for arbitrum it will implement a function called
isArbitrumEnabled which returns this value. Intger: 0xa4b1

---

### DEFAULT_DEPOSIT_TIMEOUT

```ts
const DEFAULT_DEPOSIT_TIMEOUT: number;
```

Defined in: dataEntities/constants.ts:64

How long to wait (in milliseconds) for a deposit to arrive before timing out a request.

Finalisation on mainnet can be up to 2 epochs = 64 blocks.
We add 10 minutes for the system to create and redeem the ticket, plus some extra buffer of time.

Total timeout: 30 minutes.

---

### DISABLED_GATEWAY

```ts
const DISABLED_GATEWAY: '0x0000000000000000000000000000000000000001' =
  '0x0000000000000000000000000000000000000001';
```

Defined in: dataEntities/constants.ts:46

Address of the gateway a token will be assigned to if it is disabled
