---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: sanitizePrivateKey()

> **sanitizePrivateKey**(`privateKey`): \`0x$\{string\}\`

Sanitizes a private key string by ensuring it starts with '0x'.

## Parameters

• **privateKey**: `string`

The private key string to be sanitized.

## Returns

\`0x$\{string\}\`

- The sanitized private key string.

## Example

```ts
const sanitizedKey = sanitizePrivateKey('abcdef');
console.log(sanitizedKey); // Output: '0xabcdef'
```

## Source

[src/utils/sanitizePrivateKey.ts:11](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/utils/sanitizePrivateKey.ts#L11)
