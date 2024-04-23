## Deploy your custom token brige

The <a data-quicklook-from='arbitrum-nitro'>Arbitrum Nitro stack</a> doesn't natively support specific token bridging standards at the protocol level. Instead, Offchain Labs designed a "canonical bridge" that ensures seamless token transfers between the parent and child chains.

The token bridge architecture includes contracts deployed on the <a data-quicklook-from='parent-chain'>parent chain</a> and on the <a data-quicklook-from='child-chain'>child chain</a>. These entities communicate via the <a data-quicklook-from='retryable-ticket'>Retryable Ticket </a> protocol, ensuring efficient and secure interactions.

:::info

See the [`ERC-20` token bridge overview](/build-decentralized-apps/token-bridging/03-token-bridge-erc20.md) for more information about the token bridge's design and operational dynamics, and the ["create-token-bridge-eth" example ](https://github.com/OffchainLabs/arbitrum-orbit-sdk/tree/main/examples/create-token-bridge-eth) for additional guidance.

:::

### Token bridge deployment steps

Once an Orbit chain has been deployed and initialized, the bridge contracts need to be deployed on both the parent and child chains. This process involves several steps:

1. **[Token approval](#1-token-approval)**
2. **[Token bridge contract deployment](#2-token-bridge-contract-deployment)**
3. **[Transaction recipient and checking for deployment on child chain](#3-transaction-recipient-and-checking-for-deployment-on-child-chain)**
4. **[Deployment information and contract addresses](#4-deployment-information-and-contract-addresses)**

### 1. Token approval

:::note

This step is only required for custom fee token Orbit chains.

:::

Initiating the deployment of a token bridge for **[Custom Fee Token](/launch-orbit-chain/concepts/custom-gas-token-sdk.md)** on orbit chains begins with ensuring the `TokenBridgeCreator` contract is granted sufficient approvals of the native token. To facilitate this process, the Orbit SDK provides two APIs:

1. **`createTokenBridgeEnoughCustomFeeTokenAllowance`**: This method verifies that the deployer's address has enough allowance to pay for the fees associated with the token bridge deployment.
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
- The Rollup owner's address: `rollupOwner.address`.
- The parent chain's publicClient: `parentChainPublicClient`.

First, `createTokenBridgeEnoughCustomFeeTokenAllowance` checks if the deployer has been granted enough allowance.

If the allowance is insufficient, `createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest` is called to create the necessary approval transaction.

Please note that after generating the raw transaction, the deployer must still sign and broadcast it to the network to finalize the approval process.

### 2. Token bridge contract deployment

Deploying token bridge contracts is the first step in creating a bridge between the parent and the Orbit chain.

The deployment process is the same as Orbit chain contracts', where a primary contract facilitates the deployment of core contracts. The token bridge contracts are deployed on the parent and child chains by `TokenBridgeCreator`. `TokenBridgeCreator` does it in a single transaction using the [ Retryable Tickets protocol ](/arbos/l1-to-l2-messaging#retryable-ticketsO).

Orbit SDK provides an API that automates the deployment by interacting with the `TokenBridgeCreator` contract. The API is `createTokenBridgePrepareTransactionRequest`, which processes the necessary inputs and generates a transaction request tailored for token bridge deployment.

Example:

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

| Parameter                 | Description                                       |
| :------------------------ | :------------------------------------------------ |
| `rollupContractAddress`   | Orbit chain's Rollup contract address.            |
| `rollupOwnerAddress`      | Rollup owner's address.                           |
| `parentChainPublicClient` | Parent chain's public client, as defined by Viem. |
| `orbitChainPublicClient`  | Orbit chain's public client, as defined by Viem.  |

For more insights into these variables and their usage, consider exploring this [token bridge deployment example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-token-bridge-eth/index.ts).

Following the creation of the raw transaction, the next steps involve signing it and broadcasting it to the relevant blockchain network to complete the deployment process.

### 3. Transaction recipient and checking for deployment on child chain

After sending the deployment transaction, you will need to retrieve the transaction receipt and verify the successful deployment of the contracts on both the parent and child chains.

Our Orbit SDK includes a dedicated API for this purpose, named `createTokenBridgePrepareTransactionReceipt`, which simplifies the process of obtaining the deployment transaction's recipient.

Example:

```js
const txReceipt = createTokenBridgePrepareTransactionReceipt(
  await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash }),
);
```

In this scenario, `txHash` represents the hash of the deployment transaction initiated in the previous step. The `waitForTransactionReceipt` API from Viem captures the transaction's recipient on the parent chain. The `createTokenBridgePrepareTransactionReceipt` API enhances the basic functionality provided by Viem's `waitForTransactionReceipt`, introducing a specialized method named `waitForRetryables` to handle the outcome (in this case, `txReceipt`).

By employing the `waitForRetryables` method, you can ensure the success of Retryable Tickets on the parent chain.

Example:

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

### 4. Deployment information and contract addresses

Once you have completed the deployment and are assured that the Retryable Tickets are successful, you can use `getTokenBridgeContracts` to retrieve the deployment information and all the token bridge contracts' addresses.

Here's an example of how to get the contract addresses from the `txReceipt` generated in the previous steps:

```js
const tokenBridgeContracts = await txReceipt.getTokenBridgeContracts({
  parentChainPublicClient,
});
```
