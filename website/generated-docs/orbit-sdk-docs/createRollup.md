---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollup

## Type Aliases

### CreateRollupFunctionParams\<TChain\>

> **CreateRollupFunctionParams**\<`TChain`\>: `object`

This type is for the params of the createRollup function

#### Type parameters

• **TChain** *extends* [`mainnet`](chains.md#mainnet) \| `undefined`

#### Type declaration

##### account

> **account**: [`mainnet`](chains.md#mainnet)

##### params

> **params**: [`CreateRollupParams`](types/createRollupTypes.md#createrollupparams)

##### parentChainPublicClient

> **parentChainPublicClient**: [`mainnet`](chains.md#mainnet) \<[`mainnet`](chains.md#mainnet), `TChain`\>

#### Source

[createRollup.ts:76](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollup.ts#L76)

***

### CreateRollupResults

> **CreateRollupResults**: `object`

#### Param

results of the createRollup function

#### Param

the transaction for deploying the core contracts

#### Param

the transaction receipt

#### Param

the core contracts

#### Type declaration

##### coreContracts

> **coreContracts**: [`CoreContracts`](types/CoreContracts.md#corecontracts)

##### transaction

> **transaction**: [`CreateRollupTransaction`](createRollupPrepareTransaction.md#createrolluptransaction)

##### transactionReceipt

> **transactionReceipt**: [`CreateRollupTransactionReceipt`](createRollupPrepareTransactionReceipt.md#createrolluptransactionreceipt)

#### Source

[createRollup.ts:88](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollup.ts#L88)

## Functions

### createRollup()

> **createRollup**\<`TChain`\>(`createRollupFunctionParams`): `Promise` \<[`CreateRollupResults`](createRollup.md#createrollupresults)\>

Performs the tx to deploy the chain's core contracts.

Before creating a custom gas token chain, it checks the custom gas
token allowance granted to the rollup creator contract. Runs an approval
tx for insufficient allowance.

Accepts rollup creation config, rollup owner, and the parent chain public client.

Returns the transaction, the transaction receipt, and the core contracts.

- Example 1: [Create an ETH gas token chain](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-eth/index.ts)
- Example 2: [Create a custom gas token chain](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-custom-fee-token/index.ts)

#### Type parameters

• **TChain** *extends* `unknown`

#### Parameters

• **createRollupFunctionParams**: [`CreateRollupFunctionParams`](createRollup.md#createrollupfunctionparamstchain)\<`TChain`\>

[CreateRollupFunctionParams](createRollup.md#createrollupfunctionparamstchain)

#### Returns

`Promise` \<[`CreateRollupResults`](createRollup.md#createrollupresults)\>

Promise<[CreateRollupResults](createRollup.md#createrollupresults)> - the transaction, the transaction receipt, and the core contracts.

#### Example

```ts
const createRollupConfig = createRollupPrepareDeploymentParamsConfig(parentChainPublicClient, {
  chainId: BigInt(chainId),
  owner: deployer.address,
  chainConfig: prepareChainConfig({
    chainId,
    arbitrum: {
      InitialChainOwner: deployer.address,
      DataAvailabilityCommittee: true,
    },
  }),
});

const {
  transaction,
  transactionReceipt,
  coreContracts,
} = await createRollup({
  params: {
    config: createRollupConfig,
    batchPoster,
    validators,
 },
 account: deployer,
 parentChainPublicClient,
});
```

#### Source

[createRollup.ts:154](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/createRollup.ts#L154)
