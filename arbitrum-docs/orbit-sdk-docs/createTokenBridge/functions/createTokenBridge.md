---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridge(createTokenBridgeParams: CreateTokenBridgeParams): Promise<CreateTokenBridgeResults>
```

Performs the transactions to deploy the token bridge core contracts

For chain with custom gas token, it checks the custom gas token allowance
token allowance and approve if necessary.

Returns the token bridge core contracts.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `createTokenBridgeParams` | [`CreateTokenBridgeParams`](../type-aliases/CreateTokenBridgeParams.md) |  |

## Returns

`Promise` \<[`CreateTokenBridgeResults`](../type-aliases/CreateTokenBridgeResults.md)\>

Promise<[CreateTokenBridgeResults](../type-aliases/CreateTokenBridgeResults.md)>

## Example

```ts
const tokenBridgeCreator = await deployTokenBridgeCreator({
  publicClient: l2Client,
});

const tokenBridgeContracts = await createTokenBridge({
  rollupOwner: rollupOwner.address,
  rollupAddress: rollupAddress,
  account: deployer,
  parentChainPublicClient: l1Client,
  orbitChainPublicClient: l2Client,
  tokenBridgeCreatorAddressOverride: tokenBridgeCreator,
  gasOverrides: {
    gasLimit: {
      base: 6_000_000n,
    },
  },
  retryableGasOverrides: {
    maxGasForFactory: {
      base: 20_000_000n,
    },
    maxGasForContracts: {
      base: 20_000_000n,
    },
    maxSubmissionCostForFactory: {
      base: 4_000_000_000_000n,
    },
    maxSubmissionCostForContracts: {
      base: 4_000_000_000_000n,
    },
  },
  setWethGatewayGasOverrides: {
    gasLimit: {
      base: 100_000n,
    },
  },
});
```

## Source

[src/createTokenBridge.ts:152](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/createTokenBridge.ts#L152)
