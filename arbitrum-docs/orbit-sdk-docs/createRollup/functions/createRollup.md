---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createRollup()

> **createRollup**(`createRollupFunctionParams`): `Promise` \<[`CreateRollupResults`](../type-aliases/CreateRollupResults.md)\>

Performs the tx to deploy the chain's core contracts.

Before creating a custom gas token chain, it checks the custom gas
token allowance granted to the rollup creator contract. Runs an approval
tx for insufficient allowance.

Accepts rollup creation config, rollup owner, and the parent chain public client.

Returns the transaction, the transaction receipt, and the core contracts.

- Example 1: [Create an ETH gas token chain](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-eth/index.ts)
- Example 2: [Create a custom gas token chain](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-custom-fee-token/index.ts)

## Parameters

• **createRollupFunctionParams**: [`CreateRollupFunctionParams`](../type-aliases/CreateRollupFunctionParams.md)

[CreateRollupFunctionParams](../type-aliases/CreateRollupFunctionParams.md)

## Returns

`Promise` \<[`CreateRollupResults`](../type-aliases/CreateRollupResults.md)\>

Promise<[CreateRollupResults](../type-aliases/CreateRollupResults.md)> - the transaction, the transaction receipt, and the core contracts.

## Example

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

## Source

[src/createRollup.ts:157](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createRollup.ts#L157)
