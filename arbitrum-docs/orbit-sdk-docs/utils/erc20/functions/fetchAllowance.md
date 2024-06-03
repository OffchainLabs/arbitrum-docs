---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function fetchAllowance(__namedParameters: FetchAllowanceProps): Promise<any>
```

fetchAllowance retrieves the allowance of tokens that the owner has approved
to be spent by a specific spender. It reads the allowance from the ERC20
contract at the specified address using the owner's address and spender's
address as parameters. It returns the allowance amount as a BigInt value.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `FetchAllowanceProps` |

## Returns

`Promise`\<`any`\>

## Source

[src/utils/erc20.ts:88](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/utils/erc20.ts#L88)
