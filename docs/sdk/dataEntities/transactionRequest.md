---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Interfaces

### ChildToParentTransactionRequest

A transaction request for a transaction that will trigger a child to parent message

#### Properties

| Property                 | Type                                                   | Description                                                                                                                                                                                                                                                                                     |
| :----------------------- | :----------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `estimateParentGasLimit` | (`l1Provider`: `Provider`) => `Promise`\<`BigNumber`\> | Estimate the gas limit required to execute the withdrawal on the parent chain.<br />Note that this is only a rough estimate as it may not be possible to know<br />the exact size of the proof straight away, however the real value should be<br />within a few thousand gas of this estimate. |

---

### ParentToChildTransactionRequest

A transaction request for a transaction that will trigger some sort of
execution on the child chain

#### Properties

| Property        | Type                                                                                                                                                                                                                           | Description                                                                                                    |
| :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `retryableData` | [`OmitTyped`](../utils/types.md#omittypedtk)\<`ParentToChildMessageNoGasParams`, `"excessFeeRefundAddress"` \| `"callValueRefundAddress"`\> & `Partial`\<`ParentToChildMessageNoGasParams`\> & `ParentToChildMessageGasParams` | Information about the retryable ticket, and it's subsequent execution, that<br />will occur on the child chain |
| `txRequest`     | `Required`\<`Pick`\<`TransactionRequest`, `"data"` \| `"value"` \| `"from"` \| `"to"`\>\>                                                                                                                                      | Core fields needed to form the parent component of the transaction request                                     |

#### Methods

##### isValid()

```ts
isValid(): Promise<boolean>
```

If this request were sent now, would it have enough margin to reliably succeed

###### Returns

`Promise`\<`boolean`\>

###### Source

[dataEntities/transactionRequest.ts:28](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/transactionRequest.ts#L28)

## Functions

### isChildToParentTransactionRequest()

```ts
function isChildToParentTransactionRequest<T>(
  possibleRequest: ChildToParentTransactionRequest | IsNotTransactionRequest<T>,
): possibleRequest is ChildToParentTransactionRequest;
```

Check if an object is of ChildToParentTransactionRequest type

#### Type parameters

| Type parameter |
| :------------- |
| `T`            |

#### Parameters

| Parameter         | Type                                                                                                                           | Description |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------- | :---------- |
| `possibleRequest` | [`ChildToParentTransactionRequest`](transactionRequest.md#childtoparenttransactionrequest) \| `IsNotTransactionRequest`\<`T`\> |             |

#### Returns

`possibleRequest is ChildToParentTransactionRequest`

#### Source

[dataEntities/transactionRequest.ts:70](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/transactionRequest.ts#L70)

---

### isParentToChildTransactionRequest()

```ts
function isParentToChildTransactionRequest<T>(
  possibleRequest: ParentToChildTransactionRequest | IsNotTransactionRequest<T>,
): possibleRequest is ParentToChildTransactionRequest;
```

Check if an object is of ParentToChildTransactionRequest type

#### Type parameters

| Type parameter |
| :------------- |
| `T`            |

#### Parameters

| Parameter         | Type                                                                                                                           | Description |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------- | :---------- |
| `possibleRequest` | [`ParentToChildTransactionRequest`](transactionRequest.md#parenttochildtransactionrequest) \| `IsNotTransactionRequest`\<`T`\> |             |

#### Returns

`possibleRequest is ParentToChildTransactionRequest`

#### Source

[dataEntities/transactionRequest.ts:57](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/transactionRequest.ts#L57)
