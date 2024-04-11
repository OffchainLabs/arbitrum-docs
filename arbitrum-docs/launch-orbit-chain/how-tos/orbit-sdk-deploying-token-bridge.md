---
title: 'Deploy a token bridge using the Orbit SDK'
sidebar_label: 'Deploy a token bridge'
description: 'How to deploy a token bridge using the Orbit SDK '
author: GreatSoshiant
sme: GreatSoshiant
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 5
user_story: As a current or prospective Orbit chain deployer, I need to understand how to deploy a token bridge using the Orbit SDK.
content_type: how-to
---

The <a data-quicklook-from='arbitrum-nitro'>Arbitrum Nitro stack</a> doesn't natively support specific token bridging standards at the protocol level. Instead, Offchain Labs designed a "canonical bridge" that ensures seamless token transfers between the parent and child chains.

The token bridge architecture includes contracts deployed on the <a data-quicklook-from='parent-chain'>parent chain</a> and on the <a data-quicklook-from='child-chain'>child chain</a>. These entities communicate via the <a data-quicklook-from='retryable-ticket'>Retryable Ticket </a> protocol, ensuring efficient and secure interactions.

:::caution UNDER CONSTRUCTION

This document is under construction and may change significantly as we incorporate [style guidance](/for-devs/contribute#document-type-conventions) and feedback from readers. Feel free to request specific clarifications by clicking the `Request an update` button at the top of this document.

:::

:::info

See the [`ERC-20` token bridge overview](/build-decentralized-apps/token-bridging/03-token-bridge-erc20.md) for more information about the token bridge's design and operational dynamics, and the ["create-token-bridge-eth" example ](https://github.com/OffchainLabs/arbitrum-orbit-sdk/tree/main/examples/create-token-bridge-eth) for additional guidance.

:::

### Token bridge deployment steps

Once an Orbit chain has been deployed and initialized, the bridge contracts need to be deployed on both the parent and child chains. This process involves several steps:

1. **[Token approval](#step-1)**
2. **[Token bridge contract deployment](#step-2)**
3. **[Transaction recipient and checking for deployment on child chain](#step-3)**
4. **[Deployment information and contract addresses](#step-4)**
5. **[Setting up the `WETH` gateway](#step-5)**

:::info

The token bridge deployment process is the same for all Orbit chains types except for the following:
- **Custom fee token Orbit chains** which require [token approval](#step-1).
- **`ETH`-based Orbit chains**, for which you need to [set up a WETH gateway](#step-5).

:::

### 1. Token approval {#step-1}

:::note

This step is only required for custom fee token Orbit chains.

:::

Initiating the deployment of a token bridge for **[Custom Fee Token](/launch-orbit-chain/concepts/custom-gas-token-sdk.md)** on orbit chains begins with ensuring the `TokenBridgeCreator` contract is granted sufficient approvals of the native token. To facilitate this process, the Orbit SDK provides two APIs:

1. **`createTokenBridgeEnoughCustomFeeTokenAllowance`**: This method verifies that the deployer's address has enough allowance to pay for the fees associated with the bridge token deployment.
2. **`createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest`**: This function assists in generating the raw transaction required to approve the native token for the `TokenBridgeCreator` contract.

The following example demonstrates how to leverage these APIs effectively to check for and, if necessary, grant approval to the `TokenBridgeCreator` contract:

```js
const allowanceParams = {
  nativeToken,
  owner: rollupOwner.address,
  publicClient: parentChainPublicClient,
};
if (!(await createTokenBridgeEnoughCustomFeeTokenAllowance(allowanceParams))) {
  const approvalTxRequest = await createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest(
    allowanceParams,
  );
}
```

In this scenario, `allowanceParams` includes:
- The native token's details: `nativeToken`.
- The Rollup owner's address: `owner`.
- The parent chain's: `publicClient`.

First, `createTokenBridgeEnoughCustomFeeTokenAllowance` checks if the deployer has been granted enough allowance. 

If the allowance is insufficient, `createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest` is called to create the necessary approval transaction.

Please note that after generating the raw transaction, the deployer must still sign and broadcast it to the network to finalize the approval process.

### 2. Token bridge contract deployment{#step-2}

Deploying token bridge contracts is the first step in creating a bridge between the parent and the Orbit chain. 

The deployment process is the same as orbit chain contracts, where a primary contract facilitates the deployment of core contracts. The token bridge contracts are deployed on the parent and child chains by `TokenBridgeCreator`. `TokenBridgeCreator` does it in a single transaction using the [ Retryable Tickets protocol ](/arbos/l1-to-l2-messaging#retryable-ticketsO).

Orbit SDK provides an API that automates the deployment by interacting with the `TokenBridgeCreator` contract. The API is `createTokenBridgePrepareTransactionRequest`, which processes the necessary inputs and generates a transaction request tailored for token bridge deployment. Below is an illustrative example of how to use this API:

```js
const txRequest = await createTokenBridgePrepareTransactionRequest({
  params: {
    rollup: rollupContractAddress,
    rollupOwner: rollupOwnerAddress,
  },
  parentChainPublicClient,
  orbitChainPublicClient,
  account: rollupOwnerAddress,
});
```

Here are the parameters used in the above example:

| Parameter                   | Description                                                                                                                                     |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `rollupContractAddress`     | Orbit chain's Rollup contract address.                                                                                                          |
| `rollupOwnerAddress`        | Rollup owner's address.                                                                                                                         |
| `parentChainPublicClient`   | Parent chain's public clients, as defined by Viem.                                                                                              |
| `orbitChainPublicClient`    | Orbit chain's public clients, as defined by Viem.                                                                                               |

For more insights into these variables and their usage, consider exploring this [token bridge deployment example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-token-bridge-eth/index.ts).

Following the creation of the raw transaction, the next steps involve signing it and broadcasting it to the relevant blockchain network to complete the deployment process.

### 3. Transaction recipient and checking for deployment on child chain{#step-3}

Following the dispatch of the deployment transaction, retrieving the transaction receipt and verifying the successful deployment of the contracts on both the parent and child chains is crucial. Our Orbit SDK includes a dedicated API for this purpose, named `createTokenBridgePrepareTransactionReceipt`, which simplifies the process of obtaining the deployment transaction's recipient. 

Example:

```js
const txReceipt = createTokenBridgePrepareTransactionReceipt(
  await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash }),
);
```

In this scenario, `txHash` represents the hash of the deployment transaction initiated in the previous step. The `waitForTransactionReceipt` API from Viem captures the transaction's recipient on the parent chain. The `createTokenBridgePrepareTransactionReceipt` API enhances the basic functionality provided by Viem's `waitForTransactionReceipt`, introducing a specialized method named `waitForRetryables` to handle the outcome (in this case, `txReceipt`).

By employing the `waitForRetryables` method, one can ascertain the success of Retryable Tickets on the parent chain. Here is how to use this API effectively:

```js
const orbitChainRetryableReceipts = await txReceipt.waitForRetryables({
  orbitPublicClient: orbitChainPublicClient,
});

if (orbitChainRetryableReceipts[0].status !== 'success') {
  throw new Error(
    `Retryable status is not success: ${orbitChainRetryableReceipts[0].status}. Aborting...`,
  );
}

console.log(`Retryable executed successfully`);
```

In this example, the `waitForRetryables` method is invoked on the `txReceipt` to monitor the execution of Retryable Tickets and verify their status. A `success` status indicates that the Retryable Tickets have been executed successfully, ensuring the contracts' deployment. It's important to note that this process involves two Retryable Tickets. You can check out a [more comprehensive walkthrough](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/1e39d21eef57d204bfa609c4c29284528ddf05ac/examples/create-token-bridge-eth/index.ts#L78-L104) of the example. This enhanced approach not only simplifies the retrieval of transaction receipts but also provides a reliable method for verifying contract deployment across chains.

### 4. Deployment information and contract addresses{#step-4}

Once we are done with the deployment and are assured that the Retryable Tickets are successful, it's time to get the deployment information and all token bridge contract addresses.

You can use `getTokenBridgeContracts` to retrieve the contracts' addresses.

Here's an example of how to get the contract addresses from the `txReceipt` generated in the previous steps:

```js
const tokenBridgeContracts = await txReceipt.getTokenBridgeContracts({
  parentChainPublicClient,
});
```

### 5. Setting up the WETH gateway (ETH-based Orbit chains only){#step-5}
The last step in spinning up the token bridge for an `ETH`-based Orbit chain consists of setting up the `WETH` Gateway`. 

:::note

That step only applies to `ETH`-based Orbit chains, not Custom fee token orbit chains. Our canonical bridge design has a separate custom gateway for `WETH` to bridge it in and out of the Orbit chain. 

You can find more info about `WETH` gateways in our ["other gateways flavors" documentation](https://docs.arbitrum.io/for-devs/concepts/token-bridge/token-bridge-erc20#other-flavors-of-gateways).

:::

So, after the token bridge has been deployed and you have secured a successful deployment on both parent and child chains, it's time to set the ``WETH` Gateway` on both parent and child chains. To handle that, we have two APIs on our Orbit SDK:

#### 1. `createTokenBridgePrepareSetWethGatewayTransactionRequest`:
This API helps you create the raw transaction which handles the `WETH` gateway on both parent and child chains. 

Example:

```js
const setWethGatewayTxRequest = await createTokenBridgePrepareSetWethGatewayTransactionRequest({
  rollup: rollupContractAddress,
  parentChainPublicClient,
  orbitChainPublicClient,
  account: rollupOwnerAddress,
  retryableGasOverrides: {
    gasLimit: {
      percentIncrease: 200n,
    },
  },
});
```

In this example, `rollupContractAddress` is the address of Orbit chain's Rollup contract, and `rollupOwnerAddress` is the address of the Rollup owner. **parentChainPublicClient** and **orbitChainPublicClient** are the public clients of the parent and orbit chains. This API also has optional fields to override the Retryable ticket setups. In this example, **percentIncrease** is the buffer to increase the gas limit, thus securing successful retryable tickets.

After creating the raw transaction, you need to use Viem to sign it and broadcast it to the network.

#### 2. `createTokenBridgePrepareSetWethGatewayTransactionReceipt`

After sending the transaction, you need to assess if the Retryable Tickets you just created have been successful.. To do that we are using `createTokenBridgePrepareSetWethGatewayTransactionReceipt` API and the`waitForRetryables` method of it to check for the success status of retryable tickets. For the example in this doc we can use this API as follow:

```js
  const setWethGatewayTxReceipt =
    createTokenBridgePrepareSetWethGatewayTransactionReceipt(
      await parentChainPublicClient.waitForTransactionReceipt({
        hash: setWethGatewayTxHash,
      }),
    );
  const orbitChainSetWethGatewayRetryableReceipt =
    await setWethGatewayTxReceipt.waitForRetryables({
      orbitPublicClient: orbitChainPublicClient,
    });
  if (orbitChainSetWethGatewayRetryableReceipt[0].status !== "success") {
    throw new Error(
      `Retryable status is not success: ${orbitChainSetWethGatewayRetryableReceipt[0].status}. Aborting...`,
    );
  }
  console.log(`Retryables executed successfully`);
```

In this example **`setWethGatewayTxHash`** is the hash of the transaction you sent to set the `WETH` gateway, setting a `WETH` gateway on the Orbit chain
