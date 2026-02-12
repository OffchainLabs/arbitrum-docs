---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### RetryableDataTools

Defined in: [dataEntities/retryableData.ts:58](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/retryableData.ts#L58)

Tools for parsing retryable data from errors.
When calling createRetryableTicket on Inbox.sol special values
can be passed for gasLimit and maxFeePerGas. This causes the call to revert
with the info needed to estimate the gas needed for a retryable ticket using
L1ToL2GasPriceEstimator.

#### Properties

| Property                                                   | Modifier | Type        | Description                                                                                                   | Defined in                                                                                                                                                               |
| ---------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <a id="errortriggeringparams"></a> `ErrorTriggeringParams` | `static` | `object`    | The parameters that should be passed to createRetryableTicket in order to induce a revert with retryable data | [dataEntities/retryableData.ts:63](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/retryableData.ts#L63) |
| `ErrorTriggeringParams.gasLimit`                           | `public` | `BigNumber` | -                                                                                                             | [dataEntities/retryableData.ts:64](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/retryableData.ts#L64) |
| `ErrorTriggeringParams.maxFeePerGas`                       | `public` | `BigNumber` | -                                                                                                             | [dataEntities/retryableData.ts:65](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/retryableData.ts#L65) |

#### Methods

##### tryParseError()

```ts
static tryParseError(ethersJsErrorOrData:
  | string
  | Error
  | {
  errorData: string;
}): RetryableData | null;
```

Defined in: [dataEntities/retryableData.ts:114](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/dataEntities/retryableData.ts#L114)

Try to parse a retryable data struct from the supplied ethersjs error, or any explicitly supplied error data

###### Parameters

| Parameter             | Type                                                   | Description |
| --------------------- | ------------------------------------------------------ | ----------- |
| `ethersJsErrorOrData` | \| `string` \| `Error` \| \{ `errorData`: `string`; \} |             |

###### Returns

`RetryableData` \| `null`
