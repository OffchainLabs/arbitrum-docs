---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/erc20

## Type Aliases

### ApprovePrepareTransactionRequestProps

> **ApprovePrepareTransactionRequestProps**: `object`

#### Type declaration

##### address

> **address**: `Address`

##### amount

> **amount**: `bigint`

##### owner

> **owner**: `Address`

##### publicClient

> **publicClient**: `PublicClient`

##### spender

> **spender**: `Address`

#### Source

[src/utils/erc20.ts:21](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/erc20.ts#L21)

***

### ApproveProps

> **ApproveProps**: `object`

#### Type declaration

##### address

> **address**: `Address`

##### amount

> **amount**: `bigint`

##### publicClient

> **publicClient**: `PublicClient`

##### spender

> **spender**: `Address`

##### walletClient

> **walletClient**: `WalletClient`

#### Source

[src/utils/erc20.ts:56](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/erc20.ts#L56)

***

### FetchAllowanceProps

> **FetchAllowanceProps**: `object`

#### Type declaration

##### address

> **address**: `Address`

##### owner

> **owner**: `Address`

##### publicClient

> **publicClient**: `PublicClient`

##### spender

> **spender**: `Address`

#### Source

[src/utils/erc20.ts:100](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/erc20.ts#L100)

## Functions

### approve()

> **approve**(`props`): `Promise`\<`any`\>

Approves the spending of a specified amount of tokens by a designated address.

#### Parameters

• **props**: [`ApproveProps`](erc20.md#approveprops)

The properties for the approve function.

#### Returns

`Promise`\<`any`\>

The transaction receipt.

#### Source

[src/utils/erc20.ts:75](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/erc20.ts#L75)

***

### approvePrepareTransactionRequest()

> **approvePrepareTransactionRequest**(`props`): `Promise`\<`any`\>

Prepares a transaction request to approve a specific amount of tokens for a spender.

#### Parameters

• **props**: [`ApprovePrepareTransactionRequestProps`](erc20.md#approvepreparetransactionrequestprops)

The properties for preparing the transaction request.

#### Returns

`Promise`\<`any`\>

The prepared transaction request.

#### Source

[src/utils/erc20.ts:40](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/erc20.ts#L40)

***

### fetchAllowance()

> **fetchAllowance**(`props`): `Promise`\<`any`\>

Retrieves the allowance of tokens that the owner has approved to be spent by a specific spender.

#### Parameters

• **props**: [`FetchAllowanceProps`](erc20.md#fetchallowanceprops)

The properties for fetching the allowance.

#### Returns

`Promise`\<`any`\>

The allowance amount.

#### Source

[src/utils/erc20.ts:117](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/erc20.ts#L117)

***

### fetchDecimals()

> **fetchDecimals**(`params`): `any`

Retrieves the number of decimals for a specified ERC20 token at the given address.

#### Parameters

• **params**

The parameters for fetching the decimals.

• **params.address**: \`0x$\{string\}\`

The address of the token contract.

• **params.publicClient**

The public client to interact with the blockchain.

#### Returns

`any`

The number of decimals.

#### Source

[src/utils/erc20.ts:139](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/erc20.ts#L139)
