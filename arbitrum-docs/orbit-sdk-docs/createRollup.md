---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Type Aliases

### CreateRollupFunctionParams

```ts
type CreateRollupFunctionParams: object;
```

This type is for the params of the createRollup function

#### Type declaration

| Member | Type |
| :------ | :------ |
| `account` | `PrivateKeyAccount` |
| `params` | `CreateRollupParams` |
| `parentChainPublicClient` | `PublicClient` |

#### Source

[src/createRollup.ts:74](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cddcae0078e845771579bdf42f49d1e85568f943/src/createRollup.ts#L74)

***

### CreateRollupResults

```ts
type CreateRollupResults: object;
```

#### Param

results of the createRollup function

#### Param

the transaction for deploying the core contracts

#### Param

the transaction receipt

#### Param

the core contracts

#### Type declaration

| Member | Type |
| :------ | :------ |
| `coreContracts` | `CoreContracts` |
| `transaction` | `CreateRollupTransaction` |
| `transactionReceipt` | `CreateRollupTransactionReceipt` |

#### Source

[src/createRollup.ts:86](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cddcae0078e845771579bdf42f49d1e85568f943/src/createRollup.ts#L86)

## Functions

### createRollup()

```ts
function createRollup(createRollupFunctionParams: CreateRollupFunctionParams): Promise<CreateRollupResults>
```

Performs the tx to deploy the chain's core contracts.

Before creating a custom gas token chain, it checks the custom gas
token allowance granted to the rollup creator contract. Runs an approval
tx for insufficient allowance.

Accepts rollup creation config, rollup owner, and the parent chain public client.

Returns the transaction, the transaction receipt, and the core contracts.

- Example 1: [Create an ETH gas token chain](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-eth/index.ts)
- Example 2: [Create a custom gas token chain](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-custom-fee-token/index.ts)

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `createRollupFunctionParams` | [`CreateRollupFunctionParams`](createRollup.md#createrollupfunctionparams) | [CreateRollupFunctionParams](createRollup.md#createrollupfunctionparams) |

#### Returns

`Promise` \<[`CreateRollupResults`](createRollup.md#createrollupresults)\>

Promise<[CreateRollupResults](createRollup.md#createrollupresults)> - the transaction, the transaction receipt, and the core contracts.

#### Example

```ts
const createRollupConfig = createRollupPrepareConfig({
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

[src/createRollup.ts:152](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cddcae0078e845771579bdf42f49d1e85568f943/src/createRollup.ts#L152)
