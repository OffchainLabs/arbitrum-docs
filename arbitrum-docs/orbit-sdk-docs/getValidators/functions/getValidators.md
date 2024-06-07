[Documentation](../../README.md) / [getValidators](../README.md) / getValidators

```ts
function getValidators<TChain>(
  publicClient: object,
  GetValidatorsParams: GetValidatorsParams,
): Promise<GetValidatorsReturnType>;
```

## Type parameters

| Type parameter                            |
| :---------------------------------------- |
| `TChain` _extends_ `undefined` \| `Chain` |

## Parameters

| Parameter             | Type                                                            | Description                                                   |
| :-------------------- | :-------------------------------------------------------------- | :------------------------------------------------------------ |
| `publicClient`        | `object`                                                        | The chain Viem Public Client                                  |
| `GetValidatorsParams` | [`GetValidatorsParams`](../type-aliases/GetValidatorsParams.md) | [GetValidatorsParams](../type-aliases/GetValidatorsParams.md) |

## Returns

`Promise`\<[`GetValidatorsReturnType`](../type-aliases/GetValidatorsReturnType.md)\>

Promise<[GetValidatorsReturnType](../type-aliases/GetValidatorsReturnType.md)>

## Remarks

validators list is not guaranteed to be exhaustive if the `isAccurate` flag is false.
It might contain false positive (validators that were removed, but returned as validator)
or false negative (validators that were added, but not present in the list)

## Example

```ts
const { isAccurate, validators } = getValidators(client, {
  rollup: '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336',
});

if (isAccurate) {
  // Validators were all fetched properly
} else {
  // Validators list is not guaranteed to be accurate
}
```

## Source

[src/getValidators.ts:95](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/getValidators.ts#L95)
