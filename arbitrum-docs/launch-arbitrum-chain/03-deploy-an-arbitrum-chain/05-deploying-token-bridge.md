---
title: 'Deploy a token bridge using the Arbitrum chain (Orbit) SDK'
description: 'How to deploy a token bridge using the Arbitrum chain (Orbit) SDK '
author: GreatSoshiant, jose-franco
sme: GreatSoshiant, jose-franco
target_audience: 'Developers deploying and maintaining Arbitrum chains.'
user_story: As a current or prospective Arbitrum chain deployer, I need to understand how to deploy a token bridge using the Arbitrum chain (Orbit) SDK.
content_type: how-to
---

import RaaSNotice from '../partials/_raas-providers-notice.mdx';

<RaaSNotice />

The Arbitrum stack doesn't natively support specific token bridging standards at the protocol level. Instead, Offchain Labs designed a "canonical token bridge" that ensures seamless ERC-20 token transfers between the parent and child chains.

The token bridge architecture includes contracts deployed on the <a data-quicklook-from='parent-chain'>parent chain</a> and on the <a data-quicklook-from='child-chain'>child chain</a>. These entities communicate via the <a data-quicklook-from='retryable-ticket'>retryable ticket</a> protocol, ensuring efficient and secure interactions.

Once you have deployed your Arbitrum chain and have a node running, you can deploy a token bridge for your chain. See the [Overview](/launch-arbitrum-chain/arbitrum-chain-sdk-introduction.md) for an introduction to the process of creating and configuring an Arbitrum chain.

Before reading this guide, we recommend:

- Becoming familiar with the general process of creating new chains explained in [How to deploy a Rollup chain](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/02-deploying-rollup-chain.md)
- Learning about the canonical token bridge in the [Token bridging](/build-decentralized-apps/token-bridging/01-overview.mdx) section

## Parameters used when deploying a token bridge

Before we describe the process of deploying a token bridge using the Arbitrum chain (Orbit) SDK, let's take a look at the parameters we need to pass to the token bridge creator contract.

Deploying a new token bridge for an Arbitrum chain is done through a [TokenBridgeCreator](/launch-arbitrum-chain/03-deploy-an-arbitrum-chain/07-canonical-factory-contracts.mdx) contract that processes the creation of the needed contracts and sends the appropriate ParentToChild messages from the parent chain to the child chain so the counterpart contracts of the token bridge are created in the Arbitrum chain.

`TokenBridgeCreator` has a `createTokenBridge` function that creates the parent chain contracts of the token bridge and sends the creation message to the arbitrum chain via retryable tickets. `createTokenBridge` takes four parameters as input:

```solidity
address inbox,
address rollupOwner,
uint256 maxGasForContracts,
uint256 gasPriceBid
```

The following table describes these parameters:

| Parameter            | Type    | Description                                                                                                               |
| :------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------ |
| `inbox`              | address | Address of the Inbox contract of the chain. This is used to uniquely identify the chain.                                  |
| `rollupOwner`        | address | Account address responsible for deploying, owning, and managing your Arbitrum chain's base contracts on its parent chain. |
| `maxGasForContracts` | uint256 | Gas limit used for executing the retryable ticket on the child chain.                                                     |
| `gasPriceBid`        | uint256 | Max gas price used for executing the retryable ticket on the child chain.                                                 |

When creating the token bridge through the Arbitrum chain (Orbit) SDK, the parameters `maxGasForContracts` and `gasPriceBid` don't need to be configured, since the SDK will calculate the right values for them.

## How to deploy a token bridge using the Arbitrum chain (Orbit) SDK

Let's now look at the methods to use when creating a token bridge using the Arbitrum chain (Orbit) SDK.

:::info Example script

The Arbitrum chain (Orbit) SDK includes an example script for deploying a token bridge. We recommend that you first understand the process described in this section and then check the [create-token-bridge-eth](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-token-bridge-eth/index.ts) and [create-token-bridge-custom-fee-token](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-token-bridge-custom-fee-token/index.ts) scripts.

:::

Deploying a token bridge for a chain involves the following steps:

1. [Approve the custom gas token (if configured)](#1-approve-the-custom-gas-token-if-configured)
2. [Deploy the token bridge](#2-deploy-the-token-bridge)
3. [Wait for retryable tickets to execute](#3-wait-for-retryable-tickets-to-execute)
4. [Obtain the token bridge contracts (optional)](#4-obtain-the-token-bridge-contracts-optional)
5. [Set up the WETH gateway](#5-set-up-the-weth-gateway)

### 1. Approve the custom gas token (if configured)

:::note

This step is only required for Arbitrum chains configured to use a custom gas token.

:::

Because the token bridge creation involves sending a retryable ticket to the Arbitrum chain, the `TokenBridgeCreator` needs to be able to send the appropriate custom gas token amount for its execution on the child chain. That means that before calling the `TokenBridgeCreator`, we need to grant allowance to the contract to move our custom gas token. To facilitate this process, the Arbitrum chain (Orbit) SDK provides two functions:

1. `createTokenBridgeEnoughCustomFeeTokenAllowance`: This method verifies that the `TokenBridgeCreator` contract has enough allowance to pay for the fees associated with the token bridge deployment.
2. `createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest`: This function assists in generating the raw transaction required to approve the custom gas token for the `TokenBridgeCreator` contract.

Both functions take the following parameters:

- `nativeToken`: the address of the custom gas token contract in the parent chain
- `owner`: the address of the chain owner
- `publicClient`: a viem's public client for the parent chain

The following example shows how to use these functions:

```typescript
import { createPublicClient, http } from 'viem';
import {
  createTokenBridgeEnoughCustomFeeTokenAllowance,
  createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest,
} from '@arbitrum/orbit-sdk';

const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(),
});

const allowanceParams = {
  nativeToken,
  owner: rollupOwner.address,
  publicClient: parentChainPublicClient,
};

if (!(await createTokenBridgeEnoughCustomFeeTokenAllowance(allowanceParams))) {
  const approvalTxRequest = await createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest(
    allowanceParams,
  );

  // sign and send the transaction
  const approvalTxHash = await parentChainPublicClient.sendRawTransaction({
    serializedTransaction: await rollupOwner.signTransaction(approvalTxRequest),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const approvalTxReceipt = await parentChainPublicClient.waitForTransactionReceipt({
    hash: approvalTxHash,
  });
}
```

### 2. Deploy the token bridge

To initiate the token bridge deployment process, we can call the `createTokenBridgePrepareTransactionRequest` function, which will craft a transaction request to be signed by the chain owner, and sent to the `TokenBridgeCreator` contract.

After that, we wait for the transaction to be executed and retrieve its receipt with `createTokenBridgePrepareTransactionReceipt`.

You'll notice that in this case we use the `rollup` contract instead of the `inbox` contract as input for the `createTokenBridgePrepareTransactionRequest` function. Both contracts can uniquely identify a chain, so either can be used to find the right Inbox contract, but only the latter can be sent to the `TokenBridgeCreator` contract.

Below is an example of how to use these functions:

```typescript
import { createPublicClient, http } from 'viem';
import {
  createTokenBridgePrepareTransactionRequest,
  createTokenBridgePrepareTransactionReceipt,
} from '@arbitrum/orbit-sdk';

const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(),
});
const orbitChainPublicClient = createPublicClient({
  chain: orbitChain,
  transport: http(),
});

const txRequest = await createTokenBridgePrepareTransactionRequest({
  params: {
    rollup: coreContracts.rollup,
    rollupOwner: rollupOwner.address,
  },
  parentChainPublicClient,
  orbitChainPublicClient,
  account: rollupOwner.address,
});

// sign and send the transaction
const txHash = await parentChainPublicClient.sendRawTransaction({
  serializedTransaction: await rollupOwner.signTransaction(txRequest),
});

// get the transaction receipt after waiting for the transaction to complete
const txReceipt = createTokenBridgePrepareTransactionReceipt(
  await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash }),
);
```

### 3. Wait for retryable tickets to execute

After the transaction is executed on the parent chain, we wait for the generated retryable tickets to be executed on the child chain. To do this, we use a `waitForRetryable` method available in the `txReceipt` object returned by `createTokenBridgePrepareTransactionReceipt`.

Remember that these retryable tickets are meant to create the counterpart contracts of the token bridge in the child chain, so they can communicate with each other. The first retryable ticket creates a creator contract on the child chain configured with the templates of all the token bridge contracts. The second retryable creates the actual counterpart contracts of the token bridge.

Example:

```typescript
// wait for retryables to execute
console.log(`Waiting for retryable tickets to execute on the Orbit chain...`);
const orbitChainRetryableReceipts = await txReceipt.waitForRetryables({
  orbitPublicClient: orbitChainPublicClient,
});
console.log(`Retryables executed`);
console.log(
  `Transaction hash for first retryable is ${orbitChainRetryableReceipts[0].transactionHash}`,
);
console.log(
  `Transaction hash for second retryable is ${orbitChainRetryableReceipts[1].transactionHash}`,
);
if (orbitChainRetryableReceipts[0].status !== 'success') {
  throw new Error(
    `First retryable status is not success: ${orbitChainRetryableReceipts[0].status}. Aborting...`,
  );
}
if (orbitChainRetryableReceipts[1].status !== 'success') {
  throw new Error(
    `Second retryable status is not success: ${orbitChainRetryableReceipts[1].status}. Aborting...`,
  );
}
```

### 4. Obtain the token bridge contracts (optional)

Once the token bridge deployment is successful, you can use the `getTokenBridgeContracts` method to retrieve all the token bridge contracts' addresses:

```typescript
const tokenBridgeContracts = await txReceipt.getTokenBridgeContracts({
  parentChainPublicClient,
});
```

### 5. Set up the WETH gateway

:::note

That step only applies to ETH-based Arbitrum chains (i.e., not custom gas token chains). The canonical bridge design has a separate custom gateway for `WETH` to bridge it in and out of the Arbitrum chain.

You can find more info about `WETH` gateways in our ["other gateways flavors" documentation](/build-decentralized-apps/token-bridging/03-token-bridge-erc20.mdx#other-flavors-of-gateways).

:::

Once the token bridge is deployed, if the chain uses `ETH` as the gas token, you must set a special gateway to be able to bridge `WETH`. This gateway unwraps `WETH` to bridge it as `ETH` and wraps it back to `WETH` on the destination chain.

You can use the methods `createTokenBridgePrepareSetWethGatewayTransactionRequest` and `createTokenBridgePrepareSetWethGatewayTransactionReceipt` to set this gateway, in a similar way than what we used to send the `createTokenBridge` request earlier.

This action also generates a retryable ticket that is sent to the child chain to create and configure the `WETH` gateway, so you should wait to verify that the ticket is successfully executed.

Below is an example of how to use these functions:

```typescript
import { createPublicClient, http } from 'viem';
import {
  createTokenBridgePrepareSetWethGatewayTransactionRequest,
  createTokenBridgePrepareSetWethGatewayTransactionReceipt,
} from '@arbitrum/orbit-sdk';

const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(),
});
const orbitChainPublicClient = createPublicClient({
  chain: orbitChain,
  transport: http(),
});

const setWethGatewayTxRequest = await createTokenBridgePrepareSetWethGatewayTransactionRequest({
  rollup: coreContracts.rollup,
  parentChainPublicClient,
  orbitChainPublicClient,
  account: rollupOwner.address,
});

// sign and send the transaction
const setWethGatewayTxHash = await parentChainPublicClient.sendRawTransaction({
  serializedTransaction: await rollupOwner.signTransaction(setWethGatewayTxRequest),
});

// get the transaction receipt after waiting for the transaction to complete
const setWethGatewayTxReceipt = createTokenBridgePrepareSetWethGatewayTransactionReceipt(
  await parentChainPublicClient.waitForTransactionReceipt({ hash: setWethGatewayTxHash }),
);

// Wait for retryables to execute
const orbitChainSetWethGatewayRetryableReceipt = await setWethGatewayTxReceipt.waitForRetryables({
  orbitPublicClient: orbitChainPublicClient,
});
console.log(`Retryables executed`);
console.log(
  `Transaction hash for retryable is ${orbitChainSetWethGatewayRetryableReceipt[0].transactionHash}`,
);
if (orbitChainSetWethGatewayRetryableReceipt[0].status !== 'success') {
  throw new Error(
    `Retryable status is not success: ${orbitChainSetWethGatewayRetryableReceipt[0].status}. Aborting...`,
  );
}
```
