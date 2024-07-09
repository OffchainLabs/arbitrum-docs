---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Interfaces

### L1ToL2TransactionRequest

A transaction request for a transaction that will trigger some sort of
execution on the L2

#### Properties

| Property        | Type                                                                                                                                                                                                      | Description                                                                                       |
| :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `retryableData` | [`OmitTyped`](../utils/types.md#omittypedtk)\<`L1ToL2MessageNoGasParams`, `"excessFeeRefundAddress"` \| `"callValueRefundAddress"`\> & `Partial`\<`L1ToL2MessageNoGasParams`\> & `L1ToL2MessageGasParams` | Information about the retryable ticket, and it's subsequent execution, that<br />will occur on L2 |
| `txRequest`     | `Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"to"` \| `"from"`\>\>                                                                                                                 | Core fields needed to form the L1 component of the transaction request                            |

#### Methods

##### isValid()

```ts
isValid(): Promise<boolean>
```

If this request were sent now, would it have enough margin to reliably succeed

###### Returns

`Promise`\<`boolean`\>

###### Source

[dataEntities/transactionRequest.ts:28](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/transactionRequest.ts#L28)

---

### L2ToL1TransactionRequest

A transaction request for a transaction that will trigger an L2 to L1 message

#### Properties

| Property             | Type                                                   | Description                                                                                                                                                                                                                                                                       |
| :------------------- | :----------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `estimateL1GasLimit` | (`l1Provider`: `Provider`) => `Promise`\<`BigNumber`\> | Estimate the gas limit required to execute the withdrawal on L1.<br />Note that this is only a rough estimate as it may not be possible to know<br />the exact size of the proof straight away, however the real value should be<br />within a few thousand gas of this estimate. |

## Functions

### isL1ToL2TransactionRequest()

```ts
function isL1ToL2TransactionRequest<T>(
  possibleRequest: L1ToL2TransactionRequest | IsNotTransactionRequest<T>,
): possibleRequest is L1ToL2TransactionRequest;
```

Check if an object is of L1ToL2TransactionRequest type

#### Type parameters

| Type parameter |
| :------------- |
| `T`            |

#### Parameters

| Parameter         | Type                                                                                                             | Description |
| :---------------- | :--------------------------------------------------------------------------------------------------------------- | :---------- |
| `possibleRequest` | [`L1ToL2TransactionRequest`](transactionRequest.md#l1tol2transactionrequest) \| `IsNotTransactionRequest`\<`T`\> |             |

#### Returns

`possibleRequest is L1ToL2TransactionRequest`

#### Source

[dataEntities/transactionRequest.ts:57](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/transactionRequest.ts#L57)

---

### isL2ToL1TransactionRequest()

```ts
function isL2ToL1TransactionRequest<T>(
  possibleRequest: L2ToL1TransactionRequest | IsNotTransactionRequest<T>,
): possibleRequest is L2ToL1TransactionRequest;
```

Check if an object is of L2ToL1TransactionRequest type

#### Type parameters

| Type parameter |
| :------------- |
| `T`            |

#### Parameters

| Parameter         | Type                                                                                                             | Description |
| :---------------- | :--------------------------------------------------------------------------------------------------------------- | :---------- |
| `possibleRequest` | [`L2ToL1TransactionRequest`](transactionRequest.md#l2tol1transactionrequest) \| `IsNotTransactionRequest`\<`T`\> |             |

#### Returns

`possibleRequest is L2ToL1TransactionRequest`

#### Source

[dataEntities/transactionRequest.ts:68](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/transactionRequest.ts#L68)
