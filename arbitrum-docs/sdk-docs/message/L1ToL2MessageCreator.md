---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### L1ToL2MessageCreator

Creates retryable tickets by directly calling the Inbox contract on L1

#### Methods

##### createRetryableTicket()

```ts
createRetryableTicket(
   params: OmitTyped<L1ToL2MessageNoGasParams, "excessFeeRefundAddress" | "callValueRefundAddress"> & Partial<L1ToL2MessageNoGasParams> & object | L1ToL2TransactionRequest & object,
   l2Provider: Provider,
options?: GasOverrides): Promise<L1ContractTransaction<L1TransactionReceipt>>
```

Creates a retryable ticket by directly calling the Inbox contract on L1

###### Parameters

| Parameter    | Type                                                                                                                                                                                                                                                                                                 |
| :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `params`     | [`OmitTyped`](../utils/types.md#omittypedtk)\<`L1ToL2MessageNoGasParams`, `"excessFeeRefundAddress"` \| `"callValueRefundAddress"`\> & `Partial`\<`L1ToL2MessageNoGasParams`\> & `object` \| [`L1ToL2TransactionRequest`](../dataEntities/transactionRequest.md#l1tol2transactionrequest) & `object` |
| `l2Provider` | `Provider`                                                                                                                                                                                                                                                                                           |
| `options`?   | `GasOverrides`                                                                                                                                                                                                                                                                                       |

###### Returns

`Promise`\<`L1ContractTransaction`\<`L1TransactionReceipt`\>\>

###### Source

[message/L1ToL2MessageCreator.ts:194](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1ToL2MessageCreator.ts#L194)

##### getTicketCreationRequest()

```ts
static getTicketCreationRequest(
   params: L1ToL2MessageParams,
   l1Provider: Provider,
   l2Provider: Provider,
options?: GasOverrides): Promise<L1ToL2TransactionRequest>
```

Generate a transaction request for creating a retryable ticket

###### Parameters

| Parameter    | Type                  | Description |
| :----------- | :-------------------- | :---------- |
| `params`     | `L1ToL2MessageParams` |             |
| `l1Provider` | `Provider`            |             |
| `l2Provider` | `Provider`            |             |
| `options`?   | `GasOverrides`        |             |

###### Returns

`Promise` \<[`L1ToL2TransactionRequest`](../dataEntities/transactionRequest.md#l1tol2transactionrequest)\>

###### Source

[message/L1ToL2MessageCreator.ts:127](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1ToL2MessageCreator.ts#L127)

##### getTicketCreationRequestCallData()

```ts
static protected getTicketCreationRequestCallData(
   params: L1ToL2MessageParams,
   estimates: Pick<RetryableData, L1ToL2GasKeys>,
   excessFeeRefundAddress: string,
   callValueRefundAddress: string,
   nativeTokenIsEth: boolean): string
```

Prepare calldata for a call to create a retryable ticket

###### Parameters

| Parameter                | Type                                       | Description |
| :----------------------- | :----------------------------------------- | :---------- |
| `params`                 | `L1ToL2MessageParams`                      |             |
| `estimates`              | `Pick`\<`RetryableData`, `L1ToL2GasKeys`\> |             |
| `excessFeeRefundAddress` | `string`                                   |             |
| `callValueRefundAddress` | `string`                                   |             |
| `nativeTokenIsEth`       | `boolean`                                  |             |

###### Returns

`string`

###### Source

[message/L1ToL2MessageCreator.ts:80](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1ToL2MessageCreator.ts#L80)

##### getTicketEstimate()

```ts
static protected getTicketEstimate(
   params: L1ToL2MessageNoGasParams,
   l1Provider: Provider,
   l2Provider: Provider,
retryableGasOverrides?: GasOverrides): Promise<Pick<RetryableData, L1ToL2GasKeys>>
```

Gets a current estimate for the supplied params

###### Parameters

| Parameter                | Type                       | Description |
| :----------------------- | :------------------------- | :---------- |
| `params`                 | `L1ToL2MessageNoGasParams` |             |
| `l1Provider`             | `Provider`                 |             |
| `l2Provider`             | `Provider`                 |             |
| `retryableGasOverrides`? | `GasOverrides`             |             |

###### Returns

`Promise`\<`Pick`\<`RetryableData`, `L1ToL2GasKeys`\>\>

###### Source

[message/L1ToL2MessageCreator.ts:54](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/message/L1ToL2MessageCreator.ts#L54)
