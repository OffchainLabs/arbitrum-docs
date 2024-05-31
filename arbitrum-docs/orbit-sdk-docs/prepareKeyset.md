[Documentation](README.md) / prepareKeyset

## Functions

### prepareKeyset()

```ts
function prepareKeyset(publicKeys: string[], assumedHonest: number): `0x${string}`;
```

prepareKeyset encodes a list of public keys along with an assumed honest
count and the number of members into a single hexadecimal string in big
endian format, and returns a `0x${string}`.

#### Parameters

| Parameter       | Type       |
| :-------------- | :--------- |
| `publicKeys`    | `string`[] |
| `assumedHonest` | `number`   |

#### Returns

\`0x$\{string\}\`

#### Source

[src/prepareKeyset.ts:24](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/prepareKeyset.ts#L24)
