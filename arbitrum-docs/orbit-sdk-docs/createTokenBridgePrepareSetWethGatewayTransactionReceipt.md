[Documentation](README.md) / createTokenBridgePrepareSetWethGatewayTransactionReceipt

## Functions

### createTokenBridgePrepareSetWethGatewayTransactionReceipt()

```ts
function createTokenBridgePrepareSetWethGatewayTransactionReceipt(
  txReceipt: TransactionReceipt,
): CreateTokenBridgeSetWethGatewayTransactionReceipt;
```

Creates a token bridge transaction receipt for setting WETH gateway. It
includes a method `waitForRetryables` that waits for retryable transactions
to complete and returns the transaction receipt.

#### Parameters

| Parameter   | Type                 |
| :---------- | :------------------- |
| `txReceipt` | `TransactionReceipt` |

#### Returns

`CreateTokenBridgeSetWethGatewayTransactionReceipt`

#### Source

[src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts:29](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/createTokenBridgePrepareSetWethGatewayTransactionReceipt.ts#L29)
