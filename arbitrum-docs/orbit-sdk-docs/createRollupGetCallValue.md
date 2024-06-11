---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupGetCallValue

## Functions

### createRollupGetCallValue()

> **createRollupGetCallValue**(`params`): `bigint`

Calculates the call value needed for creating retryable tickets in a rollup chain.

#### Parameters

• **params**: [`CreateRollupParams`](types/createRollupTypes.md#createrollupparams)

The parameters for creating the rollup.

#### Returns

`bigint`

- The calculated call value.

#### Example

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

#### Source

[src/createRollupGetCallValue.ts:30](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupGetCallValue.ts#L30)
