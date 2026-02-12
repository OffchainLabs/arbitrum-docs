---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Classes

### MultiCaller

Defined in: [utils/multicall.ts:111](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/multicall.ts#L111)

Util for executing multi calls against the MultiCallV2 contract

#### Properties

| Property                       | Modifier   | Type     | Description                   | Defined in                                                                                                                                           |
| ------------------------------ | ---------- | -------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="address"></a> `address` | `readonly` | `string` | Address of multicall contract | [utils/multicall.ts:117](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/multicall.ts#L117) |

#### Methods

##### getBlockNumberInput()

```ts
getBlockNumberInput(): CallInput<BigNumber>;
```

Defined in: [utils/multicall.ts:133](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/multicall.ts#L133)

Get the call input for the current block number

###### Returns

[`CallInput`](#callinput)\<`BigNumber`\>

##### getCurrentBlockTimestampInput()

```ts
getCurrentBlockTimestampInput(): CallInput<BigNumber>;
```

Defined in: [utils/multicall.ts:149](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/multicall.ts#L149)

Get the call input for the current block timestamp

###### Returns

[`CallInput`](#callinput)\<`BigNumber`\>

##### getTokenData()

```ts
getTokenData<T>(erc20Addresses: string[], options?: T): Promise<TokenInputOutput<T>[]>;
```

Defined in: [utils/multicall.ts:231](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/multicall.ts#L231)

Multicall for token properties. Will collect all the requested properies for each of the
supplied token addresses.

###### Type Parameters

| Type Parameter                                 |
| ---------------------------------------------- |
| `T` _extends_ `TokenMultiInput` \| `undefined` |

###### Parameters

| Parameter        | Type       | Description             |
| ---------------- | ---------- | ----------------------- |
| `erc20Addresses` | `string`[] |                         |
| `options?`       | `T`        | Defaults to just 'name' |

###### Returns

`Promise`\<`TokenInputOutput`\<`T`\>[]\>

##### multiCall()

```ts
multiCall<T, TRequireSuccess>(params: T, requireSuccess?: TRequireSuccess): Promise<DecoderReturnType<T, TRequireSuccess>>;
```

Defined in: [utils/multicall.ts:197](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/multicall.ts#L197)

Executes a multicall for the given parameters
Return values are order the same as the inputs.
If a call failed undefined is returned instead of the value.

To get better type inference when the individual calls are of different types
create your inputs as a tuple and pass the tuple in. The return type will be
a tuple of the decoded return types. eg.

```typescript
const inputs: [
  CallInput<Awaited<ReturnType<ERC20['functions']['balanceOf']>>[0]>,
  CallInput<Awaited<ReturnType<ERC20['functions']['name']>>[0]>,
] = [
  {
    targetAddr: token.address,
    encoder: () => token.interface.encodeFunctionData('balanceOf', ['']),
    decoder: (returnData: string) =>
      token.interface.decodeFunctionResult('balanceOf', returnData)[0],
  },
  {
    targetAddr: token.address,
    encoder: () => token.interface.encodeFunctionData('name'),
    decoder: (returnData: string) => token.interface.decodeFunctionResult('name', returnData)[0],
  },
];

const res = await multiCaller.call(inputs);
```

###### Type Parameters

| Type Parameter                                         |
| ------------------------------------------------------ |
| `T` _extends_ [`CallInput`](#callinput)\<`unknown`\>[] |
| `TRequireSuccess` _extends_ `boolean`                  |

###### Parameters

| Parameter         | Type              | Description                                    |
| ----------------- | ----------------- | ---------------------------------------------- |
| `params`          | `T`               |                                                |
| `requireSuccess?` | `TRequireSuccess` | Fail the whole call if any internal call fails |

###### Returns

`Promise`\<`DecoderReturnType`\<`T`, `TRequireSuccess`\>\>

##### fromProvider()

```ts
static fromProvider(provider: Provider): Promise<MultiCaller>;
```

Defined in: [utils/multicall.ts:125](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/multicall.ts#L125)

Finds the correct multicall address for the given provider and instantiates a multicaller

###### Parameters

| Parameter  | Type       | Description |
| ---------- | ---------- | ----------- |
| `provider` | `Provider` |             |

###### Returns

`Promise`\<[`MultiCaller`](#multicaller)\>

## Type Aliases

### CallInput

```ts
type CallInput<T> = object;
```

Defined in: [utils/multicall.ts:30](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/multicall.ts#L30)

Input to multicall aggregator

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Properties

| Property                             | Type                            | Description                                 | Defined in                                                                                                                                         |
| ------------------------------------ | ------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="decoder"></a> `decoder`       | (`returnData`: `string`) => `T` | Function to decode the result of the call   | [utils/multicall.ts:42](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/multicall.ts#L42) |
| <a id="encoder"></a> `encoder`       | () => `string`                  | Function to produce encoded call data       | [utils/multicall.ts:38](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/multicall.ts#L38) |
| <a id="targetaddr"></a> `targetAddr` | `string`                        | Address of the target contract to be called | [utils/multicall.ts:34](https://github.com/OffchainLabs/arbitrum-sdk/blob/b8d7b712331a78aa8e789c06496a2586170ad5d3/src/lib/utils/multicall.ts#L34) |
