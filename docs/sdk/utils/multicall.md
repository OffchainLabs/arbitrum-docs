## Classes

### MultiCaller

Defined in: utils/multicall.ts:111

Util for executing multi calls against the MultiCallV2 contract

#### Properties

| Property                       | Modifier   | Type     | Description                   | Defined in             |
| ------------------------------ | ---------- | -------- | ----------------------------- | ---------------------- |
| <a id="address"></a> `address` | `readonly` | `string` | Address of multicall contract | utils/multicall.ts:117 |

#### Methods

##### getBlockNumberInput()

```ts
getBlockNumberInput(): CallInput<any>;
```

Defined in: utils/multicall.ts:133

Get the call input for the current block number

###### Returns

[`CallInput`](#callinput)\<`any`\>

##### getCurrentBlockTimestampInput()

```ts
getCurrentBlockTimestampInput(): CallInput<any>;
```

Defined in: utils/multicall.ts:149

Get the call input for the current block timestamp

###### Returns

[`CallInput`](#callinput)\<`any`\>

##### getTokenData()

```ts
getTokenData<T>(erc20Addresses: string[], options?: T): Promise<TokenInputOutput<T>[]>;
```

Defined in: utils/multicall.ts:231

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

Defined in: utils/multicall.ts:197

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

Defined in: utils/multicall.ts:125

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

Defined in: utils/multicall.ts:30

Input to multicall aggregator

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Properties

| Property                             | Type                            | Description                                 | Defined in            |
| ------------------------------------ | ------------------------------- | ------------------------------------------- | --------------------- |
| <a id="decoder"></a> `decoder`       | (`returnData`: `string`) => `T` | Function to decode the result of the call   | utils/multicall.ts:42 |
| <a id="encoder"></a> `encoder`       | () => `string`                  | Function to produce encoded call data       | utils/multicall.ts:38 |
| <a id="targetaddr"></a> `targetAddr` | `string`                        | Address of the target contract to be called | utils/multicall.ts:34 |
