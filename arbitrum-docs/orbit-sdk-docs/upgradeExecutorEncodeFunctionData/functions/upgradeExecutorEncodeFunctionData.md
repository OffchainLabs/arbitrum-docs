[Documentation](../../README.md) / [upgradeExecutorEncodeFunctionData](../README.md) / upgradeExecutorEncodeFunctionData

```ts
function upgradeExecutorEncodeFunctionData<TFunctionName>(__namedParameters: {
  [K in string | number | symbol]: Omit<
    EncodeFunctionDataParameters<readonly [Object, Object, Object, Object, Object], TFunctionName>,
    'abi'
  >[K];
}): `0x${string}`;
```

## Type parameters

| Type parameter |
| :------------- |

| `TFunctionName` _extends_
\| `"execute"`
\| `"executeCall"`
\| `"hasRole"`
\| `"grantRole"`
\| `"revokeRole"` |

## Parameters

| Parameter           | Type                                                                                                                                                              |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `__namedParameters` | \{ \[K in string \| number \| symbol\]: Omit\<EncodeFunctionDataParameters\<readonly \[Object, Object, Object, Object, Object\], TFunctionName\>, "abi"\>\[K\] \} |

## Returns

\`0x$\{string\}\`

## Source

[src/upgradeExecutorEncodeFunctionData.ts:22](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/upgradeExecutorEncodeFunctionData.ts#L22)
