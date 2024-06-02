---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createTokenBridgePrepareSetWethGatewayTransactionRequest(
  __namedParameters: object,
): Promise<any>;
```

Creates a transaction request to set the WETH gateway on the parent chain
router for the TokenBridge. The request includes gas overrides for retryable
transactions and ensures that the WETH gateway is not already registered.
Returns the prepared transaction request with the chain ID.

## Parameters

| Parameter                                              | Type                                      | Description                                                                                                                                |
| :----------------------------------------------------- | :---------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `__namedParameters`                                    | `object`                                  | -                                                                                                                                          |
| `__namedParameters.account`                            | \`0x$\{string\}\`                         | -                                                                                                                                          |
| `__namedParameters.orbitChainPublicClient`             | `object`                                  | -                                                                                                                                          |
| `__namedParameters.parentChainPublicClient`            | `object`                                  | -                                                                                                                                          |
| `__namedParameters.retryableGasOverrides`?             | `TransactionRequestRetryableGasOverrides` | -                                                                                                                                          |
| `__namedParameters.rollup`                             | \`0x$\{string\}\`                         | -                                                                                                                                          |
| `__namedParameters.tokenBridgeCreatorAddressOverride`? | \`0x$\{string\}\`                         | Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain. |

## Returns

`Promise`\<`any`\>

## Source

[src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts:98](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createTokenBridgePrepareSetWethGatewayTransactionRequest.ts#L98)
