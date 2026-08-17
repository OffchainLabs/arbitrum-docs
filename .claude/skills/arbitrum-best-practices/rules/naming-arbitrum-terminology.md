---
title: Use Canonical Arbitrum Terminology
impact: LOW
impactDescription: ensures clarity
tags: naming, terminology, conventions
---

## Use Canonical Arbitrum Terminology

Consistent terminology makes code immediately understandable to Arbitrum developers. Match official SDK naming and documentation.

**Incorrect (non-standard names):**

```typescript
// Bad: Abbreviated or wrong casing
const ticketId: string           // Missing 'retryable'
const msgStatus: number          // Non-standard
import { ERC20Bridger }          // Wrong: it's Erc20Bridger
```

**Correct (canonical terminology):**

```typescript
// Good: Matches SDK and docs
const retryableTicketId: string;
const l1ToL2MessageStatus: L1ToL2MessageStatus;
import { Erc20Bridger, EthBridger } from '@arbitrum/sdk';
```

| Correct          | Incorrect          |
| ---------------- | ------------------ |
| Nitro            | nitro, NITRO       |
| ArbOS            | Arbos, arbOS       |
| AnyTrust         | Anytrust, anyTrust |
| retryable ticket | retry ticket       |
| Erc20Bridger     | ERC20Bridger       |
| ArbSys           | arbsys             |

For complete terminology, see [Arbitrum Glossary](https://docs.arbitrum.io/intro/glossary).
