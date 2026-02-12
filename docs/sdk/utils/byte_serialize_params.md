## Functions

### argSerializerConstructor()

```ts
function argSerializerConstructor(
  arbProvider: Provider,
): (params: PrimativeOrPrimativeArray[]) => Promise<Uint8Array<ArrayBufferLike>>;
```

Defined in: utils/byte_serialize_params.ts:102

to use:

```js
const mySerializeParamsFunction = argSerializerConstructor('rpcurl');
mySerializeParamsFunction(['4', '5', '6']);
```

#### Parameters

| Parameter     | Type       |
| ------------- | ---------- |
| `arbProvider` | `Provider` |

#### Returns

```ts
(params: PrimativeOrPrimativeArray[]): Promise<Uint8Array<ArrayBufferLike>>;
```

##### Parameters

| Parameter | Type                          |
| --------- | ----------------------------- |
| `params`  | `PrimativeOrPrimativeArray`[] |

##### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

---

### serializeParams()

```ts
function serializeParams(
  params: PrimativeOrPrimativeArray[],
  addressToIndex: (address: string) => Promise<number>,
): Promise<Uint8Array<ArrayBufferLike>>;
```

Defined in: utils/byte_serialize_params.ts:138

#### Parameters

| Parameter        | Type                                           | Description                                          |
| ---------------- | ---------------------------------------------- | ---------------------------------------------------- |
| `params`         | `PrimativeOrPrimativeArray`[]                  | array of serializable types to                       |
| `addressToIndex` | (`address`: `string`) => `Promise`\<`number`\> | optional getter of address index registered in table |

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>
