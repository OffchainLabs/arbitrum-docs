---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Interfaces

### ChildToParentTransactionRequest

Defined in: [dataEntities/transactionRequest.ts:34](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/transactionRequest.ts#L34)

A transaction request for a transaction that will trigger a child to parent message

#### Properties

| Property                                                     | Type                                                   | Description                                                                                                                                                                                                                                                                      | Defined in                                                                                                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="estimateparentgaslimit"></a> `estimateParentGasLimit` | (`l1Provider`: `Provider`) => `Promise`\<`BigNumber`\> | Estimate the gas limit required to execute the withdrawal on the parent chain. Note that this is only a rough estimate as it may not be possible to know the exact size of the proof straight away, however the real value should be within a few thousand gas of this estimate. | [dataEntities/transactionRequest.ts:44](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/transactionRequest.ts#L44) |

---

### ParentToChildTransactionRequest

Defined in: [dataEntities/transactionRequest.ts:13](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/transactionRequest.ts#L13)

A transaction request for a transaction that will trigger some sort of
execution on the child chain

#### Properties

| Property                                   | Type                                                                                                                                                                                                                         | Description                                                                                               | Defined in                                                                                                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="retryabledata"></a> `retryableData` | [`OmitTyped`](../utils/types.md#omittyped)\<`ParentToChildMessageNoGasParams`, `"excessFeeRefundAddress"` \| `"callValueRefundAddress"`\> & `Partial`\<`ParentToChildMessageNoGasParams`\> & `ParentToChildMessageGasParams` | Information about the retryable ticket, and it's subsequent execution, that will occur on the child chain | [dataEntities/transactionRequest.ts:24](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/transactionRequest.ts#L24) |
| <a id="txrequest"></a> `txRequest`         | `Required`\<`Pick`\<`TransactionRequest`, `"to"` \| `"data"` \| `"value"` \| `"from"`\>\>                                                                                                                                    | Core fields needed to form the parent component of the transaction request                                | [dataEntities/transactionRequest.ts:17](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/transactionRequest.ts#L17) |

#### Methods

##### isValid()

```ts
isValid(): Promise<boolean>;
```

Defined in: [dataEntities/transactionRequest.ts:28](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/transactionRequest.ts#L28)

If this request were sent now, would it have enough margin to reliably succeed

###### Returns

`Promise`\<`boolean`\>

## Functions

### isChildToParentTransactionRequest()

```ts
function isChildToParentTransactionRequest<T>(
  possibleRequest: ChildToParentTransactionRequest | IsNotTransactionRequest<T>,
): possibleRequest is ChildToParentTransactionRequest;
```

Defined in: [dataEntities/transactionRequest.ts:70](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/transactionRequest.ts#L70)

Check if an object is of ChildToParentTransactionRequest type

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Parameters

| Parameter         | Type                                                                                                         | Description |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | ----------- |
| `possibleRequest` | \| [`ChildToParentTransactionRequest`](#childtoparenttransactionrequest) \| `IsNotTransactionRequest`\<`T`\> |             |

#### Returns

`possibleRequest is ChildToParentTransactionRequest`

---

### isParentToChildTransactionRequest()

```ts
function isParentToChildTransactionRequest<T>(
  possibleRequest: ParentToChildTransactionRequest | IsNotTransactionRequest<T>,
): possibleRequest is ParentToChildTransactionRequest;
```

Defined in: [dataEntities/transactionRequest.ts:57](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/transactionRequest.ts#L57)

Check if an object is of ParentToChildTransactionRequest type

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Parameters

| Parameter         | Type                                                                                                         | Description |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | ----------- |
| `possibleRequest` | \| [`ParentToChildTransactionRequest`](#parenttochildtransactionrequest) \| `IsNotTransactionRequest`\<`T`\> |             |

#### Returns

`possibleRequest is ParentToChildTransactionRequest`
