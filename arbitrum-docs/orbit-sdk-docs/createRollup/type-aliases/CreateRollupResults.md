---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type CreateRollupResults: object;
```

## Param

results of the createRollup function

## Param

the transaction for deploying the core contracts

## Param

the transaction receipt

## Param

the core contracts

## Type declaration

| Member | Type |
| :------ | :------ |
| `coreContracts` | [`CoreContracts`](../../types/CoreContracts/type-aliases/CoreContracts.md) |
| `transaction` | [`CreateRollupTransaction`](../../createRollupPrepareTransaction/type-aliases/CreateRollupTransaction.md) |
| `transactionReceipt` | [`CreateRollupTransactionReceipt`](../../createRollupPrepareTransactionReceipt/type-aliases/CreateRollupTransactionReceipt.md) |

## Source

[src/createRollup.ts:86](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createRollup.ts#L86)
