---
name: debug
description: Debug issues with research-first approach. Delegates to engineer. Triggers on "error", "tx failed", "bridge stuck", "retryable failed", "debug this".
agent: engineer
---

# Debugging

Delegates to `engineer` for systematic debugging.

When working on Arbitrum projects, use `@arbitrum-best-practices` for domain-specific debugging patterns.

## Process

### 1. Documentation Research

- Search ArbitrumDocs MCP for error patterns
- Find troubleshooting solutions
- Query relevant API references

### 2. On-Chain Investigation

```bash
cast tx <hash> --rpc-url https://arb1.arbitrum.io/rpc
cast call <contract> "function()" --rpc-url <rpc>
cast logs --from-block <block> --address <contract>
```

### 3. Root Cause Classification

- **L1 issues**: Insufficient gas, failed L1 txs
- **L2 issues**: EVM compatibility, precompiles
- **Cross-chain**: Failed retryables, message delays
- **Config**: Wrong addresses, network mismatch

### 4. Solution

Production-ready fix with:

- Complete error handling
- Gas estimation with L1 data cost buffers
- Verification commands
