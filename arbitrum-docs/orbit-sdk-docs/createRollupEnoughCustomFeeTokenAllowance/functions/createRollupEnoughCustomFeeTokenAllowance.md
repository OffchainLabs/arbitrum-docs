---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupEnoughCustomFeeTokenAllowance(__namedParameters: object): Promise<boolean>
```

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `__namedParameters` | `object` | - |
| `__namedParameters.account` | \`0x$\{string\}\` | - |
| `__namedParameters.nativeToken` | \`0x$\{string\}\` | - |
| `__namedParameters.publicClient` | `object` | - |
| `__namedParameters.rollupCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise`\<`boolean`\>

## Source

[src/createRollupEnoughCustomFeeTokenAllowance.ts:18](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createRollupEnoughCustomFeeTokenAllowance.ts#L18)
