[Documentation](../../README.md) / [createTokenBridge](../README.md) / CreateTokenBridgeResults

```ts
type CreateTokenBridgeResults<TParentChain, TOrbitChain>: object;
```

## Type parameters

| Type parameter                                  |
| :---------------------------------------------- |
| `TParentChain` _extends_ `Chain` \| `undefined` |
| `TOrbitChain` _extends_ `Chain` \| `undefined`  |

## Type declaration

| Member                              | Type                                                                                                                                                                                                     | Description                                                                                                                                                                                                                                                                        |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retryables`                        | [`WaitForRetryablesResult`](../../createTokenBridgePrepareTransactionReceipt/type-aliases/WaitForRetryablesResult.md)                                                                                    | Retryable transaction receipts of createTokenBridgePrepareTransactionReceipt ([WaitForRetryablesResult](../../createTokenBridgePrepareTransactionReceipt/type-aliases/WaitForRetryablesResult.md))                                                                                 |
| `setWethGateway`                    | `object`                                                                                                                                                                                                 | Optional: createTokenBridgePrepareSetWethGatewayTransaction's result                                                                                                                                                                                                               |
| `setWethGateway.retryables`         | [`TransactionReceipt`]                                                                                                                                                                                   | Retryable transaction receipt of createTokenBridgePrepareSetWethGatewayTransactionReceipt ([WaitForRetryablesResult](../../createTokenBridgePrepareTransactionReceipt/type-aliases/WaitForRetryablesResult.md))                                                                    |
| `setWethGateway.transaction`        | `Transaction`                                                                                                                                                                                            | Transaction of createTokenBridgePrepareSetWethGatewayTransactionReceipt (Transaction)                                                                                                                                                                                              |
| `setWethGateway.transactionReceipt` | [`CreateTokenBridgeSetWethGatewayTransactionReceipt`](../../createTokenBridgePrepareSetWethGatewayTransactionReceipt/type-aliases/CreateTokenBridgeSetWethGatewayTransactionReceipt.md)\<`TOrbitChain`\> | Transaction receipt of createTokenBridgePrepareSetWethGatewayTransactionReceipt ([createTokenBridgePrepareSetWethGatewayTransactionReceipt](../../createTokenBridgePrepareSetWethGatewayTransactionReceipt/functions/createTokenBridgePrepareSetWethGatewayTransactionReceipt.md)) |
| `tokenBridgeContracts`              | [`TokenBridgeContracts`](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md)                                                                                                          | Core token bridge contracts ([TokenBridgeContracts](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md))                                                                                                                                                        |
| `transaction`                       | `Transaction`                                                                                                                                                                                            | Transaction of createTokenBridgePrepareTransactionRequest                                                                                                                                                                                                                          |
| `transactionReceipt`                | [`CreateTokenBridgeTransactionReceipt`](../../createTokenBridgePrepareTransactionReceipt/type-aliases/CreateTokenBridgeTransactionReceipt.md)\<`TParentChain`, `TOrbitChain`\>                           | Transaction receipt of createTokenBridgePrepareTransactionReceipt ([CreateTokenBridgeTransactionReceipt](../../createTokenBridgePrepareTransactionReceipt/type-aliases/CreateTokenBridgeTransactionReceipt.md))                                                                    |

## Source

[src/createTokenBridge.ts:56](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/createTokenBridge.ts#L56)
