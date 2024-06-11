---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollup

## Type Aliases

### CreateRollupFunctionParams

> **CreateRollupFunctionParams**: `object`

This type is for the params of the createRollup function

#### Type declaration

##### account

> **account**: `PrivateKeyAccount`

##### params

> **params**: [`CreateRollupParams`](types/createRollupTypes.md#createrollupparams)

##### parentChainPublicClient

> **parentChainPublicClient**: `PublicClient`

#### Source

[src/createRollup.ts:79](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollup.ts#L79)

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

[src/createRollup.ts:91](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollup.ts#L91)

## Functions

### createRollup()

> **createRollup**(`createRollupFunctionParams`): `Promise` \<[`CreateRollupResults`](createRollup.md#createrollupresults)\>

Performs the tx to deploy the chain's core contracts.

Before creating a custom gas token chain, it checks the custom gas
token allowance granted to the rollup creator contract. Runs an approval
tx for insufficient allowance.

Accepts rollup creation config, rollup owner, and the parent chain public client.

Returns the transaction, the transaction receipt, and the core contracts.

- Example 1: [Create an ETH gas token chain](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-eth/index.ts)
- Example 2: [Create a custom gas token chain](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-custom-fee-token/index.ts)

#### Parameters

• **createRollupFunctionParams**: [`CreateRollupFunctionParams`](createRollup.md#createrollupfunctionparams)

[CreateRollupFunctionParams](createRollup.md#createrollupfunctionparams)

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

[src/createRollup.ts:157](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollup.ts#L157)
