---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/sanitizePrivateKey

## Functions

### sanitizePrivateKey()

> **sanitizePrivateKey**(`privateKey`): \`0x$\{string\}\`

Sanitizes a private key string by ensuring it starts with '0x'.

#### Parameters

• **privateKey**: `string`

The private key string to be sanitized.

#### Returns

\`0x$\{string\}\`

- The sanitized private key string.

#### Example

```ts
const sanitizedKey = sanitizePrivateKey('abcdef');
console.log(sanitizedKey); // Output: '0xabcdef'
```

#### Source

[src/utils/sanitizePrivateKey.ts:11](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/sanitizePrivateKey.ts#L11)
