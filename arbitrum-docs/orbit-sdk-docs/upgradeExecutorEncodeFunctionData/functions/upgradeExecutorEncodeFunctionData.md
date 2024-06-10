---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function upgradeExecutorEncodeFunctionData<TFunctionName>(__namedParameters: { [K in string | number | symbol]: Omit<EncodeFunctionDataParameters<any, TFunctionName, any>, "abi">[K] }): any
```

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* `unknown` |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | \{ \[K in string \| number \| symbol\]: Omit\<EncodeFunctionDataParameters\<any, TFunctionName, any\>, "abi"\>\[K\] \} |

## Returns

`any`

## Source

[src/upgradeExecutorEncodeFunctionData.ts:22](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/upgradeExecutorEncodeFunctionData.ts#L22)
