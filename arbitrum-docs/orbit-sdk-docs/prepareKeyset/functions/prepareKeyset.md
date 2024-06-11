---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: prepareKeyset()

> **prepareKeyset**(`publicKeys`, `assumedHonest`): \`0x$\{string\}\`

Prepares a keyset by encoding the assumed honest value, number of committee
members, and public keys into a single hexadecimal string.

## Parameters

• **publicKeys**: `string`[]

An array of base64-encoded public keys.

• **assumedHonest**: `number`

The assumed honest value.

## Returns

\`0x$\{string\}\`

The encoded keyset as a hexadecimal string.

## Example

```ts
const publicKeys = ['base64Key1', 'base64Key2'];
const assumedHonest = 5;
const keyset = prepareKeyset(publicKeys, assumedHonest);
console.log(keyset); // Outputs the encoded keyset
```

## Source

[src/prepareKeyset.ts:46](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/prepareKeyset.ts#L46)
