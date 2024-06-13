---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/erc20

## Type Aliases

### ApprovePrepareTransactionRequestProps\<TChain\>

> **ApprovePrepareTransactionRequestProps**\<`TChain`\>: `object`

#### Type parameters

• **TChain** *extends* [`mainnet`](../chains.md#mainnet) \| `undefined`

#### Type declaration

##### address

> **address**: [`mainnet`](../chains.md#mainnet)

##### amount

> **amount**: `bigint`

##### owner

> **owner**: [`mainnet`](../chains.md#mainnet)

##### publicClient

> **publicClient**: [`mainnet`](../chains.md#mainnet) \<[`mainnet`](../chains.md#mainnet), `TChain`\>

##### spender

> **spender**: [`mainnet`](../chains.md#mainnet)

#### Source

[utils/erc20.ts:13](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/utils/erc20.ts#L13)

***

### ApproveProps\<TChain\>

> **ApproveProps**\<`TChain`\>: `object`

#### Type parameters

• **TChain** *extends* [`mainnet`](../chains.md#mainnet) \| `undefined`

#### Type declaration

##### address

> **address**: [`mainnet`](../chains.md#mainnet)

##### amount

> **amount**: `bigint`

##### publicClient

> **publicClient**: [`mainnet`](../chains.md#mainnet) \<[`mainnet`](../chains.md#mainnet), `TChain`\>

##### spender

> **spender**: [`mainnet`](../chains.md#mainnet)

##### walletClient

> **walletClient**: [`mainnet`](../chains.md#mainnet)

#### Source

[utils/erc20.ts:38](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/utils/erc20.ts#L38)

***

### FetchAllowanceProps\<TChain\>

> **FetchAllowanceProps**\<`TChain`\>: `object`

#### Type parameters

• **TChain** *extends* [`mainnet`](../chains.md#mainnet) \| `undefined`

#### Type declaration

##### address

> **address**: [`mainnet`](../chains.md#mainnet)

##### owner

> **owner**: [`mainnet`](../chains.md#mainnet)

##### publicClient

> **publicClient**: [`mainnet`](../chains.md#mainnet) \<[`mainnet`](../chains.md#mainnet), `TChain`\>

##### spender

> **spender**: [`mainnet`](../chains.md#mainnet)

#### Source

[utils/erc20.ts:72](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/utils/erc20.ts#L72)

## Functions

### approve()

> **approve**\<`TChain`\>(`__namedParameters`): `Promise`\<`any`\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**: [`ApproveProps`](erc20.md#approvepropstchain)\<`TChain`\>

#### Returns

`Promise`\<`any`\>

#### Source

[utils/erc20.ts:46](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/utils/erc20.ts#L46)

***

### approvePrepareTransactionRequest()

> **approvePrepareTransactionRequest**\<`TChain`\>(`__namedParameters`): `Promise`\<`any`\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**: [`ApprovePrepareTransactionRequestProps`](erc20.md#approvepreparetransactionrequestpropstchain)\<`TChain`\>

#### Returns

`Promise`\<`any`\>

#### Source

[utils/erc20.ts:21](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/utils/erc20.ts#L21)

***

### fetchAllowance()

> **fetchAllowance**\<`TChain`\>(`__namedParameters`): `Promise`\<`any`\>

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**: [`FetchAllowanceProps`](erc20.md#fetchallowancepropstchain)\<`TChain`\>

#### Returns

`Promise`\<`any`\>

#### Source

[utils/erc20.ts:79](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/utils/erc20.ts#L79)

***

### fetchDecimals()

> **fetchDecimals**\<`TChain`\>(`__namedParameters`): `any`

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.address**: `Address`

• **\_\_namedParameters.publicClient**: `PublicClient`\<`Transport`, `TChain`\>

#### Returns

`any`

#### Source

[utils/erc20.ts:93](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/utils/erc20.ts#L93)
