## Approve ERC-20 token

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
