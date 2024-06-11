---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: fetchDecimals()

> **fetchDecimals**(`params`): `any`

Retrieves the number of decimals for a specified ERC20 token at the given address.

## Parameters

• **params**

The parameters for fetching the decimals.

• **params.address**: \`0x$\{string\}\`

The address of the token contract.

• **params.publicClient**

The public client to interact with the blockchain.

## Returns

`any`

The number of decimals.

## Source

[src/utils/erc20.ts:139](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/utils/erc20.ts#L139)
