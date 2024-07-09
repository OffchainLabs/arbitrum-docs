---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Functions

### getFirstBlockForL1Block()

```ts
function getFirstBlockForL1Block(
  __namedParameters: GetFirstBlockForL1BlockProps,
): Promise<number | undefined>;
```

This function performs a binary search to find the first L2 block that corresponds to a given L1 block number.
The function returns a Promise that resolves to a number if a block is found, or undefined otherwise.

#### Parameters

| Parameter           | Type                           |
| :------------------ | :----------------------------- |
| `__namedParameters` | `GetFirstBlockForL1BlockProps` |

#### Returns

`Promise`\<`number` \| `undefined`\>

- A Promise that resolves to a number if a block is found, or undefined otherwise.

#### Source

[utils/lib.ts:89](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/utils/lib.ts#L89)

---

### getTransactionReceipt()

```ts
function getTransactionReceipt(
  provider: Provider,
  txHash: string,
  confirmations?: number,
  timeout?: number,
): Promise<null | TransactionReceipt>;
```

Waits for a transaction receipt if confirmations or timeout is provided
Otherwise tries to fetch straight away.

#### Parameters

| Parameter        | Type       | Description |
| :--------------- | :--------- | :---------- |
| `provider`       | `Provider` |             |
| `txHash`         | `string`   |             |
| `confirmations`? | `number`   |             |
| `timeout`?       | `number`   |             |

#### Returns

`Promise`\<`null` \| `TransactionReceipt`\>

#### Source

[utils/lib.ts:32](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/utils/lib.ts#L32)
