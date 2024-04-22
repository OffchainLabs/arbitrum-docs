## Deploy token bridge contract

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
