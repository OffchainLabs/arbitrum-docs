---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Functions

### getFirstBlockForL1Block()

```ts
function getFirstBlockForL1Block(
  arbitrumProvider: GetFirstBlockForL1BlockProps,
): Promise<number | undefined>;
```

Defined in: [utils/lib.ts:90](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/lib.ts#L90)

This function performs a binary search to find the first Arbitrum block that corresponds to a given L1 block number.
The function returns a Promise that resolves to a number if a block is found, or undefined otherwise.

#### Parameters

| Parameter          | Type                           | Description                                  |
| ------------------ | ------------------------------ | -------------------------------------------- |
| `arbitrumProvider` | `GetFirstBlockForL1BlockProps` | The Arbitrum provider to use for the search. |

#### Returns

`Promise`\<`number` \| `undefined`\>

- A Promise that resolves to a number if a block is found, or undefined otherwise.

---

### getTransactionReceipt()

```ts
function getTransactionReceipt(
  provider: Provider,
  txHash: string,
  confirmations?: number,
  timeout?: number,
): Promise<TransactionReceipt | null>;
```

Defined in: [utils/lib.ts:33](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/lib.ts#L33)

Waits for a transaction receipt if confirmations or timeout is provided
Otherwise tries to fetch straight away.

#### Parameters

| Parameter        | Type       | Description |
| ---------------- | ---------- | ----------- |
| `provider`       | `Provider` |             |
| `txHash`         | `string`   |             |
| `confirmations?` | `number`   |             |
| `timeout?`       | `number`   |             |

#### Returns

`Promise`\<`TransactionReceipt` \| `null`\>
