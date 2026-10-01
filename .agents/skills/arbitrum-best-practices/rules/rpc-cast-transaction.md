---
title: Use Cast for Transaction Debugging
impact: HIGH
impactDescription: essential for debugging
tags: rpc, cast, debugging
---

## Use Cast for Transaction Debugging

Foundry's `cast` is the fastest way to inspect transactions on Arbitrum. Start with `cast tx` and `cast receipt` for any debugging workflow.

**Basic debugging sequence:**

```bash
# Get transaction details
cast tx 0x<hash> --rpc-url https://arb1.arbitrum.io/rpc

# Get receipt with status (1=success, 0=failure)
cast receipt 0x<hash> --rpc-url https://arb1.arbitrum.io/rpc

# Decode calldata
cast calldata-decode "transfer(address,uint256)" 0xa9059cbb...
```

**Arbitrum-specific queries:**

```bash
# Check retryable ticket timeout
cast call 0x000000000000000000000000000000000000006E \
  "getTimeout(bytes32)(uint64)" <ticketId> \
  --rpc-url https://arb1.arbitrum.io/rpc

# Get L1 gas component estimate
cast call 0x00000000000000000000000000000000000000C8 \
  "gasEstimateL1Component(address,bool,bytes)" <to> false <data> \
  --rpc-url https://arb1.arbitrum.io/rpc
```

Key precompiles: ArbSys (0x64), ArbRetryableTx (0x6E), NodeInterface (0xC8).

For cast reference, see [Foundry Book](https://book.getfoundry.sh/reference/cast/).
