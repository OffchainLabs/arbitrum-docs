---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

## Functions

### argSerializerConstructor()

```ts
function argSerializerConstructor(
  arbProvider: Provider,
): (params: PrimativeOrPrimativeArray[]) => Promise<Uint8Array>;
```

// to use:

```js
const mySerializeParamsFunction = argSerializerConstructor('rpcurl');
mySerializeParamsFunction(['4', '5', '6']);
```

#### Parameters

| Parameter     | Type       |
| :------------ | :--------- |
| `arbProvider` | `Provider` |

#### Returns

`Function`

##### Parameters

| Parameter | Type                          |
| :-------- | :---------------------------- |
| `params`  | `PrimativeOrPrimativeArray`[] |

##### Returns

`Promise`\<`Uint8Array`\>

#### Source

[utils/byte_serialize_params.ts:101](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/utils/byte_serialize_params.ts#L101)

---

### serializeParams()

```ts
function serializeParams(
  params: PrimativeOrPrimativeArray[],
  addressToIndex: (address: string) => Promise<number>,
): Promise<Uint8Array>;
```

#### Parameters

| Parameter        | Type                                           | Description                                          |
| :--------------- | :--------------------------------------------- | :--------------------------------------------------- |
| `params`         | `PrimativeOrPrimativeArray`[]                  | array of serializable types to                       |
| `addressToIndex` | (`address`: `string`) => `Promise`\<`number`\> | optional getter of address index registered in table |

#### Returns

`Promise`\<`Uint8Array`\>

#### Source

[utils/byte_serialize_params.ts:137](https://github.com/OffchainLabs/arbitrum-sdk/blob/d89535657484f4768d4009e0aecb95a7d5cbb9f5/src/lib/utils/byte_serialize_params.ts#L137)
