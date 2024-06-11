---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createRollupGetCallValue()

> **createRollupGetCallValue**(`params`): `bigint`

Calculates the call value needed for creating retryable tickets in a rollup chain.

## Parameters

• **params**: [`CreateRollupParams`](../../types/createRollupTypes/type-aliases/CreateRollupParams.md)

The parameters for creating the rollup.

## Returns

`bigint`

- The calculated call value.

## Example

```ts
const callValue = createRollupGetCallValue({
  config: createRollupConfig,
  batchPoster: '0x1234...',
  validators: ['0x5678...', '0x9abc...'],
  deployFactoriesToL2: true,
  nativeToken: '0xdef0...',
  maxDataSize: 104857,
  maxFeePerGasForRetryables: 0.1,
});
```

## Source

[src/createRollupGetCallValue.ts:30](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createRollupGetCallValue.ts#L30)
