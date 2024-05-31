[Documentation](../README.md) / utils/sanitizePrivateKey

## Functions

### sanitizePrivateKey()

```ts
function sanitizePrivateKey(privateKey: string): `0x${string}`;
```

SanitizePrivateKey sanitizes a private key by ensuring it starts with '0x'
and returns a string.

#### Parameters

| Parameter    | Type     |
| :----------- | :------- |
| `privateKey` | `string` |

#### Returns

\`0x$\{string\}\`

#### Source

[src/utils/sanitizePrivateKey.ts:5](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/sanitizePrivateKey.ts#L5)
