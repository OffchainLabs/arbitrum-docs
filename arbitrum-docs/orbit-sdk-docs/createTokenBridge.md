---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Functions

### createTokenBridge()

```ts
function createTokenBridge(createTokenBridgeParams: CreateTokenBridgeParams): Promise<CreateTokenBridgeResults>
```

Performs the transactions to deploy the token bridge core contracts

For chain with custom gas token, it checks the custom gas token allowance
token allowance and approve if necessary.

Returns the token bridge core contracts.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `createTokenBridgeParams` | `CreateTokenBridgeParams` |  |

#### Returns

`Promise`\<`CreateTokenBridgeResults`\>

Promise<CreateTokenBridgeResults>

#### Example

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

#### Source

[src/createTokenBridge.ts:152](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cddcae0078e845771579bdf42f49d1e85568f943/src/createTokenBridge.ts#L152)
