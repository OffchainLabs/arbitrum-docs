---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### RetryableDataTools

Tools for parsing retryable data from errors.
When calling createRetryableTicket on Inbox.sol special values
can be passed for gasLimit and maxFeePerGas. This causes the call to revert
with the info needed to estimate the gas needed for a retryable ticket using
L1ToL2GasPriceEstimator.

#### Properties

| Property                             | Modifier | Type        | Default value | Description                                                                                                        |
| :----------------------------------- | :------- | :---------- | :------------ | :----------------------------------------------------------------------------------------------------------------- |
| `ErrorTriggeringParams`              | `static` | `object`    | `...`         | The parameters that should be passed to createRetryableTicket in order to induce<br />a revert with retryable data |
| `ErrorTriggeringParams.gasLimit`     | `public` | `BigNumber` | `...`         | -                                                                                                                  |
| `ErrorTriggeringParams.maxFeePerGas` | `public` | `BigNumber` | `...`         | -                                                                                                                  |

#### Methods

##### tryParseError()

```ts
static tryParseError(ethersJsErrorOrData: string | Error | object): null | RetryableData
```

Try to parse a retryable data struct from the supplied ethersjs error, or any explicitly supplied error data

###### Parameters

| Parameter             | Type                            | Description |
| :-------------------- | :------------------------------ | :---------- |
| `ethersJsErrorOrData` | `string` \| `Error` \| `object` |             |

###### Returns

`null` \| `RetryableData`

###### Source

[dataEntities/retryableData.ts:114](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/dataEntities/retryableData.ts#L114)
