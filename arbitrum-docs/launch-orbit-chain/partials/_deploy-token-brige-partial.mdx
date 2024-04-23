## Deploy a token bridge

The <a data-quicklook-from='arbitrum-nitro'>Arbitrum Nitro stack</a> doesn't natively support specific token bridging standards at the protocol level. Instead, Offchain Labs designed a "canonical bridge" that ensures seamless token transfers between the parent and child chains.

The token bridge architecture includes contracts deployed on the <a data-quicklook-from='parent-chain'>parent chain</a> and on your Orbit chain.These entities communicate via the <a data-quicklook-from='retryable-ticket'>Retryable Ticket </a> protocol, ensuring efficient and secure interactions.

### Token bridge deployment steps

Once an Orbit chain has been deployed and initialized, the bridge contracts need to be deployed on both the parent and child chains. This process involves several steps:

1. **[Token bridge contract deployment](#2-token-bridge-contract-deployment)**
2. **[Transaction recipient and checking for deployment on child chain](#3-transaction-recipient-and-checking-for-deployment-on-child-chain)**
3. **[Deployment information and contract addresses](#4-deployment-information-and-contract-addresses)**
4. **[Setting up the WETH gateway](#5-setting-up-the-weth-gateway)**

### 1. Token bridge contract deployment

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

### 2. Transaction recipient and checking for deployment on child chain

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

### 3. Deployment information and contract addresses

Once you have completed the deployment and are assured that the Retryable Tickets are successful, you can use `getTokenBridgeContracts` to retrieve the deployment information and all the token bridge contracts' addresses.

Here's an example of how to get the contract addresses from the `txReceipt` generated in the previous steps:

```js
const tokenBridgeContracts = await txReceipt.getTokenBridgeContracts({
  parentChainPublicClient,
});
```

### 4. Setting up the WETH gateway

The last step in spinning up the token bridge for an `ETH`- based Orbit chain is setting up the `WETH` Gateway.

:::note

That step only applies to `ETH`-based Orbit chains, not Custom fee token orbit chains. Our canonical bridge design has a separate custom gateway for `WETH` to bridge it in and out of the Orbit chain.

You can find more info about `WETH` gateways in our ["other gateways flavors" documentation](https://docs.arbitrum.io/for-devs/concepts/token-bridge/token-bridge-erc20#other-flavors-of-gateways).

:::

So, after the token bridge has been deployed and you have secured a successful deployment on both parent and child chains, it's time to set the `WETH` gateway on both parent and child chains. To handle that, we have two APIs on our Orbit SDK:

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

After sending the transaction, you need to assess if the Retryable Tickets you just created have been successful. To do that we are using `createTokenBridgePrepareSetWethGatewayTransactionReceipt` API and the`waitForRetryables` method of it to check for the success status of retryable tickets. For the example in this doc we can use this API as follow:

```js
const setWethGatewayTxReceipt = createTokenBridgePrepareSetWethGatewayTransactionReceipt(
  await parentChainPublicClient.waitForTransactionReceipt({
    hash: setWethGatewayTxHash,
  }),
);
const orbitChainSetWethGatewayRetryableReceipt = await setWethGatewayTxReceipt.waitForRetryables({
  orbitPublicClient: orbitChainPublicClient,
});
if (orbitChainSetWethGatewayRetryableReceipt[0].status !== 'success') {
  throw new Error(
    `Retryable status is not success: ${orbitChainSetWethGatewayRetryableReceipt[0].status}. Aborting...`,
  );
}
console.log(`Retryables executed successfully`);
```

In this example **`setWethGatewayTxHash`** is the hash of the transaction you sent, setting the `WETH` gateway on your Orbit chain.
