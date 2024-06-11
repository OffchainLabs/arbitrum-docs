---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: createTokenBridge()

> **createTokenBridge**(`createTokenBridgeParams`): `Promise` \<[`CreateTokenBridgeResults`](../type-aliases/CreateTokenBridgeResults.md)\>

Performs the transactions to deploy the token bridge core contracts

For chain with custom gas token, it checks the custom gas token allowance
token allowance and approve if necessary.

Returns the token bridge core contracts.

## Parameters

• **createTokenBridgeParams**: [`CreateTokenBridgeParams`](../type-aliases/CreateTokenBridgeParams.md)

The parameters for creating the token bridge

## Returns

`Promise` \<[`CreateTokenBridgeResults`](../type-aliases/CreateTokenBridgeResults.md)\>

- The result of the token bridge creation

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

[src/createTokenBridge.ts:147](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridge.ts#L147)
