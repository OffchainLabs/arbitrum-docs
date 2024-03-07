---
title: 'Arbitrum Orbit SDK'
sidebar_label: 'Token bridge deployment'
description: 'Arbitrum SDK '
author: Mehdi Salehi
sme: Mehdi Salehi
target_audience: 'Developers deploying and maintaining Orbit chains.'
sidebar_position: 5
---

This guide outlines the process to deploy `token bridge contracts` for your Orbit chain using the Orbit SDK. As highlighted in the [introduction page](introduction.md), deploying a token bridge is a crucial step after initializing your Orbit chain, enabling the bridging of ERC-20 tokens to and from your Orbit chain.

For a practical approach, we recommend the following examples from the Orbit SDK repository:

- For Orbit chains using ETH as the native token, explore [this ETH token bridge deployment example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-token-bridge-eth/index.ts).
- For Custom fee token Orbit chains, refer to [this custom fee token bridge deployment example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-token-bridge-custom-fee-token/index.ts).

These resources are designed for users who prefer a hands-on learning experience. Ensure you're familiar with the prerequisites mentioned in the introduction before proceeding.

### Token Bridge Deployment Steps

The Arbitrum Nitro stack, designed without native support for specific token bridging standards at the protocol level but Offchain Labs crafted a "canonical bridge," a sophisticated mechanism designed to ensure seamless token transfers between the parent and child chain. This strategic development enhances the interoperability of the Arbitrum Orbit ecosystem. 
The token bridge architecture is meticulously engineered, comprising contracts situated on the parent chain as well as a complementary set of contracts on the child chain. These entities communicate via the Retryable Ticket protocol, ensuring efficient and secure interactions. For an in-depth exploration of the token bridge mechanism, interested parties are encouraged to consult the following [documentation](https://docs.arbitrum.io/for-devs/concepts/token-bridge/token-bridge-erc20). This resource provides comprehensive insights into the design and operational dynamics of the bridge.

Following the deployment and initialization of the Orbit chain, the subsequent phase involves deploying contracts on both the parent chain and the child chain. To establish and configure the token bridge effectively, the process can be broken down into the following steps:

### 1. Token bridge contract deployment
The deployment of token bridge contracts constitutes the foundational step in establishing a bridge between the parent and child chains. This process mirrors the deployment methodology used for orbit chain contracts, where a primary contract, named `RollupCreator`, facilitated the deployment of core contracts. In the context of token bridge contracts, the `TokenBridgeCreator` contract assumes a similar pivotal role by orchestrating the deployment across both the parent and child chains. The Solidity code for the `TokenBridgeCreator` contract is accessible [here](https://github.com/OffchainLabs/token-bridge-contracts/blob/b3894ecc8b6185b2d505c71c9a7851725f53df15/contracts/tokenbridge/ethereum/L1AtomicTokenBridgeCreator.sol#L4).

This unique contract is capable of deploying the token bridge contracts on both the parent and child chains through a singular transaction. A common query is how it manages to deploy contracts on the child chain from the parent chain directly. The solution lies in utilizing the Retryable Tickets protocol, which facilitates the transmission of the deployment message between the two chains. This message, have been transmitted, and trigger the contract deployment by the Retryable Tickets mechanism. For an in-depth understanding of the Retryable Ticket system, please refer to this [documentation](https://docs.arbitrum.io/arbos/l1-to-l2-messaging#retryable-tickets).

To streamline the deployment process, an API has been integrated into our Orbit SDK, designed to automate the deployment by interacting with the `TokenBridgeCreator` contract. The API is `createTokenBridgePrepareTransactionRequest`, which processes the necessary inputs and generates a transaction request tailored for token bridge deployment. Below is an illustrative example of how to use this API:

```bash
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

In the above example, `rollupContractAddress` refers to the Orbit chain's rollup contract address, and `rollupOwnerAddress` denotes the rollup owner's address. Additionally, `parentChainPublicClient` and `orbitChainPublicClient` represent the public clients for the parent and Orbit chains, respectively, as defined by Viem. For detailed insights into their configuration and usage, consider exploring this [token bridge deployment example](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-token-bridge-eth/index.ts).

Following the creation of the raw transaction, the next steps involve signing it and broadcasting it to the relevant blockchain network to complete the deployment process.

### 2. Transaction recipient and checking for deployment on child chain
Following the dispatch of the deployment transaction, it's crucial to retrieve the transaction receipt and verify the successful deployment of the contracts on both the parent and child chains. Our Orbit SDK includes a dedicated API for this purpose, named `createTokenBridgePrepareTransactionReceipt`, which simplifies the process of obtaining the deployment transaction's recipient. An illustrative use of this API is as follows:

```bash
const txReceipt = createTokenBridgePrepareTransactionReceipt(
  await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash }),
);
```

In this scenario, **txHash** represents the hash of the deployment transaction initiated in the previous step. The `waitForTransactionReceipt` API from Viem is utilized to capture the transaction's recipient on the parent chain. The `createTokenBridgePrepareTransactionReceipt` API enhances the basic functionality provided by Viem's `waitForTransactionReceipt`, introducing a specialized method named `waitForRetryables` to handle the outcome (in this case, **txReceipt**).

By employing the `waitForRetryables` method, one can ascertain the success of Retryable tickets on the parent chain. Here is how to use this API effectively:

```bash
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

In this example, the `waitForRetryables` method is invoked on the **txReceipt** to monitor the execution of Retryable tickets and verify their status. A status of "success" indicates that the Retryable tickets have been executed successfully, ensuring the contracts' deployment. It's important to note that this process involves two Retryable tickets, and a more comprehensive walkthrough is available in [this segment](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/1e39d21eef57d204bfa609c4c29284528ddf05ac/examples/create-token-bridge-eth/index.ts#L78-L104) of the example. This enhanced approach not only simplifies the retrieval of transaction receipts but also provides a reliable method for verifying contract deployment across chains.

### 3. Deployment information and contract addresses
getTokenBridgeContracts

### 4. Setting up the WETH gateway
createTokenBridgePrepareSetWethGatewayTransactionRequest
createTokenBridgePrepareSetWethGatewayTransactionReceipt

waitForRetryables
