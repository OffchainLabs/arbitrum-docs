---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function upgradeExecutorEncodeFunctionData<TFunctionName>(__namedParameters: {
  [K in string | number | symbol]: Omit<
    EncodeFunctionDataParameters<any, TFunctionName, any>,
    'abi'
  >[K];
}): any;
```

## Type parameters

| Type parameter                      |
| :---------------------------------- |
| `TFunctionName` _extends_ `unknown` |

## Parameters

| Parameter           | Type                                                                                                                   |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| `__namedParameters` | \{ \[K in string \| number \| symbol\]: Omit\<EncodeFunctionDataParameters\<any, TFunctionName, any\>, "abi"\>\[K\] \} |

## Returns

`any`

## Source

[src/upgradeExecutorEncodeFunctionData.ts:22](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/upgradeExecutorEncodeFunctionData.ts#L22)
