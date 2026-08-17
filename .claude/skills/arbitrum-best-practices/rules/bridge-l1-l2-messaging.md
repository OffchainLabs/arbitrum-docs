---
title: Use SDK for L1-to-L2 Messages
impact: CRITICAL
impactDescription: prevents stuck funds
tags: bridge, l1-l2, messaging, sdk
---

## Use SDK for L1-to-L2 Messages

L1-to-L2 messaging uses retryable tickets—L2 transactions created from L1. The SDK handles gas estimation, parameter ordering, and status tracking that are error-prone when done manually.

**Incorrect (manual Inbox interaction):**

```typescript
// Bad: Direct Inbox calls are error-prone with 8+ parameters
const inbox = new Contract(inboxAddress, inboxAbi, l1Signer);
await inbox.createRetryableTicket(to, l2CallValue, maxSubmissionCost, refundAddress, refundAddress, gasLimit, maxFeePerGas, data);
```

**Correct (SDK L1ToL2MessageCreator):**

```typescript
// Good: SDK handles gas estimation and provides type safety
const creator = new L1ToL2MessageCreator(l1Signer);
const ticket = await creator.createRetryableTicket(
  {
    to: l2ContractAddress,
    l2CallValue: parseEther('0.1'),
    data: calldata,
    callValueRefundAddress: sender,
    excessFeeRefundAddress: sender,
  },
  l2Provider,
);
```

The SDK automatically estimates `maxSubmissionCost` and `gasLimit` with appropriate buffers. Manual Inbox calls require calculating these yourself and risk under-funding.

For detailed implementation, see [L1 to L2 Messaging](https://docs.arbitrum.io/how-arbitrum-works/arbos/l1-l2-messaging).
