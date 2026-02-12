---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### ParentToChildMessageCreator

Defined in: [message/ParentToChildMessageCreator.ts:51](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessageCreator.ts#L51)

Creates retryable tickets by directly calling the Inbox contract on Parent chain

#### Methods

##### createRetryableTicket()

```ts
createRetryableTicket(
   params:
  | OmitTyped<ParentToChildMessageNoGasParams, "excessFeeRefundAddress" | "callValueRefundAddress"> & Partial<ParentToChildMessageNoGasParams> & object
  | ParentToChildTransactionRequest & object,
   childProvider: Provider,
options?: GasOverrides): Promise<ParentContractTransaction<ParentTransactionReceipt>>;
```

Defined in: [message/ParentToChildMessageCreator.ts:206](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessageCreator.ts#L206)

Creates a retryable ticket by directly calling the Inbox contract on Parent chain

###### Parameters

| Parameter       | Type                                                                                                                                                                                                                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `params`        | \| [`OmitTyped`](../utils/types.md#omittyped)\<`ParentToChildMessageNoGasParams`, `"excessFeeRefundAddress"` \| `"callValueRefundAddress"`\> & `Partial`\<`ParentToChildMessageNoGasParams`\> & `object` \| [`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest) & `object` |
| `childProvider` | `Provider`                                                                                                                                                                                                                                                                                                                        |
| `options?`      | `GasOverrides`                                                                                                                                                                                                                                                                                                                    |

###### Returns

`Promise`\<`ParentContractTransaction`\<`ParentTransactionReceipt`\>\>

##### getTicketCreationRequest()

```ts
static getTicketCreationRequest(
   params: ParentToChildMessageParams,
   parentProvider: Provider,
   childProvider: Provider,
options?: GasOverrides): Promise<ParentToChildTransactionRequest>;
```

Defined in: [message/ParentToChildMessageCreator.ts:139](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessageCreator.ts#L139)

Generate a transaction request for creating a retryable ticket

###### Parameters

| Parameter        | Type                         | Description |
| ---------------- | ---------------------------- | ----------- |
| `params`         | `ParentToChildMessageParams` |             |
| `parentProvider` | `Provider`                   |             |
| `childProvider`  | `Provider`                   |             |
| `options?`       | `GasOverrides`               |             |

###### Returns

`Promise`\<[`ParentToChildTransactionRequest`](../dataEntities/transactionRequest.md#parenttochildtransactionrequest)\>

##### getTicketCreationRequestCallData()

```ts
protected static getTicketCreationRequestCallData(
   params: ParentToChildMessageParams,
   estimates: Pick<RetryableData, ParentToChildGasKeys>,
   excessFeeRefundAddress: string,
   callValueRefundAddress: string,
   nativeTokenIsEth: boolean): string;
```

Defined in: [message/ParentToChildMessageCreator.ts:92](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessageCreator.ts#L92)

Prepare calldata for a call to create a retryable ticket

###### Parameters

| Parameter                | Type                                              | Description |
| ------------------------ | ------------------------------------------------- | ----------- |
| `params`                 | `ParentToChildMessageParams`                      |             |
| `estimates`              | `Pick`\<`RetryableData`, `ParentToChildGasKeys`\> |             |
| `excessFeeRefundAddress` | `string`                                          |             |
| `callValueRefundAddress` | `string`                                          |             |
| `nativeTokenIsEth`       | `boolean`                                         |             |

###### Returns

`string`

##### getTicketEstimate()

```ts
protected static getTicketEstimate(
   params: ParentToChildMessageNoGasParams,
   parentProvider: Provider,
   childProvider: Provider,
retryableGasOverrides?: GasOverrides): Promise<Pick<RetryableData, ParentToChildGasKeys>>;
```

Defined in: [message/ParentToChildMessageCreator.ts:66](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/message/ParentToChildMessageCreator.ts#L66)

Gets a current estimate for the supplied params

###### Parameters

| Parameter                | Type                              | Description |
| ------------------------ | --------------------------------- | ----------- |
| `params`                 | `ParentToChildMessageNoGasParams` |             |
| `parentProvider`         | `Provider`                        |             |
| `childProvider`          | `Provider`                        |             |
| `retryableGasOverrides?` | `GasOverrides`                    |             |

###### Returns

`Promise`\<`Pick`\<`RetryableData`, `ParentToChildGasKeys`\>\>
