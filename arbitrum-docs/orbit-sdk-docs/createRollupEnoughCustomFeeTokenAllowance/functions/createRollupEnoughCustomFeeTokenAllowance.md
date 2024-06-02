---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupEnoughCustomFeeTokenAllowance(__namedParameters: object): Promise<boolean>;
```

CreateRollupEnoughCustomFeeTokenAllowance checks if the allowance for a
specific native token is enough for creating a rollup with custom fees. It
fetches the allowance using the owner's account and the spender address,
which is either provided or fetched from the Rollup creator address. The
function returns a boolean indicating whether the allowance is greater than
or equal to the default retryable fees required for creating the rollup.

## Parameters

| Parameter                                         | Type              | Description                                                                                                                           |
| :------------------------------------------------ | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `__namedParameters`                               | `object`          | -                                                                                                                                     |
| `__namedParameters.account`                       | \`0x$\{string\}\` | -                                                                                                                                     |
| `__namedParameters.nativeToken`                   | \`0x$\{string\}\` | -                                                                                                                                     |
| `__namedParameters.publicClient`                  | `object`          | -                                                                                                                                     |
| `__namedParameters.rollupCreatorAddressOverride`? | \`0x$\{string\}\` | Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise`\<`boolean`\>

## Source

[src/createRollupEnoughCustomFeeTokenAllowance.ts:26](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createRollupEnoughCustomFeeTokenAllowance.ts#L26)
