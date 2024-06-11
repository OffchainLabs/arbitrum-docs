---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Type alias: CreateTokenBridgeResults

> **CreateTokenBridgeResults**: `object`

## Type declaration

### retryables

> **retryables**: [`WaitForRetryablesResult`](../../createTokenBridgePrepareTransactionReceipt/type-aliases/WaitForRetryablesResult.md)

Retryable transaction receipts of createTokenBridgePrepareTransactionReceipt ([WaitForRetryablesResult](../../createTokenBridgePrepareTransactionReceipt/type-aliases/WaitForRetryablesResult.md))

### setWethGateway?

> `optional` **setWethGateway**: `object`

Optional: createTokenBridgePrepareSetWethGatewayTransaction's result

### setWethGateway.retryables

> **retryables**: [`TransactionReceipt`]

Retryable transaction receipt of createTokenBridgePrepareSetWethGatewayTransactionReceipt ([WaitForRetryablesResult](../../createTokenBridgePrepareTransactionReceipt/type-aliases/WaitForRetryablesResult.md))

### setWethGateway.transaction

> **transaction**: `Transaction`

Transaction of createTokenBridgePrepareSetWethGatewayTransactionReceipt (Transaction)

### setWethGateway.transactionReceipt

> **transactionReceipt**: [`CreateTokenBridgeSetWethGatewayTransactionReceipt`](../../createTokenBridgePrepareSetWethGatewayTransactionReceipt/type-aliases/CreateTokenBridgeSetWethGatewayTransactionReceipt.md)

Transaction receipt of createTokenBridgePrepareSetWethGatewayTransactionReceipt ([createTokenBridgePrepareSetWethGatewayTransactionReceipt](../../createTokenBridgePrepareSetWethGatewayTransactionReceipt/functions/createTokenBridgePrepareSetWethGatewayTransactionReceipt.md))

### tokenBridgeContracts

> **tokenBridgeContracts**: [`TokenBridgeContracts`](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md)

Core token bridge contracts ([TokenBridgeContracts](../../types/TokenBridgeContracts/type-aliases/TokenBridgeContracts.md))

### transaction

> **transaction**: `Transaction`

Transaction of createTokenBridgePrepareTransactionRequest

### transactionReceipt

> **transactionReceipt**: [`CreateTokenBridgeTransactionReceipt`](../../createTokenBridgePrepareTransactionReceipt/type-aliases/CreateTokenBridgeTransactionReceipt.md)

Transaction receipt of createTokenBridgePrepareTransactionReceipt ([CreateTokenBridgeTransactionReceipt](../../createTokenBridgePrepareTransactionReceipt/type-aliases/CreateTokenBridgeTransactionReceipt.md))

## Source

[src/createTokenBridge.ts:51](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/createTokenBridge.ts#L51)
