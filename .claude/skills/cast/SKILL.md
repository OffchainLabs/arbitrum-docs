---
name: cast
description: Foundry's cast CLI for Ethereum interactions. Use when querying blockchain data, calling contracts, sending transactions, encoding/decoding data, or debugging on-chain issues. Triggers on "cast", "get balance", "call contract", "decode calldata", "check tx", "get block".
---

# Cast - Foundry CLI for Ethereum

Cast is your swiss army knife for interacting with EVM chains from the command line.

## Common RPC URLs

```bash
# Mainnet
--rpc-url https://eth.llamarpc.com

# Arbitrum One
--rpc-url https://arb1.arbitrum.io/rpc

# Arbitrum Sepolia
--rpc-url https://sepolia-rollup.arbitrum.io/rpc

# Sepolia
--rpc-url https://rpc.sepolia.org
```

## Quick Reference by Task

### Read Account Data

```bash
# Get ETH balance
cast balance <address> --rpc-url <rpc>

# Get ERC20 balance
cast call <token> "balanceOf(address)(uint256)" <address> --rpc-url <rpc>

# Get nonce
cast nonce <address> --rpc-url <rpc>

# Get contract code
cast code <address> --rpc-url <rpc>

# Get storage slot
cast storage <address> <slot> --rpc-url <rpc>
```

### Call Contracts (Read-Only)

```bash
# Basic call
cast call <contract> "functionName(argTypes)(returnTypes)" <args> --rpc-url <rpc>

# Examples
cast call 0xdead "name()(string)" --rpc-url https://arb1.arbitrum.io/rpc
cast call 0xdead "totalSupply()(uint256)" --rpc-url https://arb1.arbitrum.io/rpc
cast call 0xdead "getReserves()(uint112,uint112,uint32)" --rpc-url https://arb1.arbitrum.io/rpc
```

### Send Transactions

```bash
# Send tx with private key
cast send <to> "function(types)" <args> --private-key <key> --rpc-url <rpc>

# Send ETH
cast send <to> --value 1ether --private-key <key> --rpc-url <rpc>

# With gas settings
cast send <to> "function()" --gas-limit 500000 --gas-price 1gwei --private-key <key> --rpc-url <rpc>
```

### Transaction Analysis

```bash
# Get tx details
cast tx <txhash> --rpc-url <rpc>

# Get tx receipt
cast receipt <txhash> --rpc-url <rpc>

# Trace/replay tx locally
cast run <txhash> --rpc-url <rpc>

# Decode tx
cast decode-transaction <raw_tx>
```

### Block Data

```bash
# Latest block number
cast block-number --rpc-url <rpc>

# Block details
cast block <block_number_or_hash> --rpc-url <rpc>

# Block timestamp
cast age <block_number> --rpc-url <rpc>

# Base fee
cast base-fee --rpc-url <rpc>

# Find block by timestamp
cast find-block <timestamp> --rpc-url <rpc>
```

### ABI Encoding/Decoding

```bash
# Encode function call
cast calldata "transfer(address,uint256)" 0xdead 1000000000000000000

# Encode without selector
cast abi-encode "transfer(address,uint256)" 0xdead 1000000000000000000

# Decode calldata
cast decode-calldata "transfer(address,uint256)" 0xa9059cbb...

# Decode output
cast decode-abi "uint256" 0x000000...

# Get function selector
cast sig "transfer(address,uint256)"
# Returns: 0xa9059cbb

# Lookup selector
cast 4byte 0xa9059cbb
```

### Type Conversions

```bash
# Wei conversions
cast to-wei 1.5 ether          # 1500000000000000000
cast from-wei 1000000000000000000 ether  # 1

# Hex/decimal
cast to-dec 0xff               # 255
cast to-hex 255                # 0xff

# Checksummed address
cast to-check-sum-address 0xdead...

# Bytes32 padding
cast to-bytes32 0xdead

# String encoding
cast format-bytes32-string "hello"
cast parse-bytes32-string 0x68656c6c6f...
```

### ENS

```bash
# Resolve name to address
cast resolve-name vitalik.eth --rpc-url https://eth.llamarpc.com

# Reverse lookup
cast lookup-address 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --rpc-url https://eth.llamarpc.com

# Get namehash
cast namehash vitalik.eth
```

### Contract Source (Etherscan)

```bash
# Get verified source
cast source <address> --etherscan-api-key <key> --chain mainnet

# Get constructor args
cast constructor-args <address> --etherscan-api-key <key> --chain arbitrum
```

### Logs/Events

```bash
# Get logs by topic
cast logs --from-block 0 --to-block latest --address <contract> "Transfer(address,address,uint256)" --rpc-url <rpc>

# Decode event
cast decode-event "Transfer(address indexed,address indexed,uint256)" <topics> <data>
```

### Gas Estimation

```bash
# Estimate gas
cast estimate <to> "function(types)" <args> --rpc-url <rpc>

# Current gas price
cast gas-price --rpc-url <rpc>
```

### Utility

```bash
# Keccak256 hash
cast keccak "hello"

# EIP-191 message hash
cast hash-message "hello"

# Compute CREATE2 address
cast create2 --starts-with 0xdead --init-code <bytecode> --deployer <factory>

# Compute deployment address
cast compute-address <deployer> --nonce <nonce>

# RPC call
cast rpc eth_blockNumber --rpc-url <rpc>
```

### Wallet Operations

```bash
# Generate new wallet
cast wallet new

# Get address from private key
cast wallet address --private-key <key>

# Sign message
cast wallet sign "message" --private-key <key>
```

## Arbitrum-Specific

```bash
# Check L2 tx on Arbitrum
cast tx <hash> --rpc-url https://arb1.arbitrum.io/rpc

# Get L1 base fee on Arbitrum
cast call 0x000000000000000000000000000000000000006C "getL1BaseFeeEstimate()(uint256)" --rpc-url https://arb1.arbitrum.io/rpc

# Check ArbOS version
cast call 0x0000000000000000000000000000000000000064 "arbOSVersion()(uint256)" --rpc-url https://arb1.arbitrum.io/rpc
```

## Environment Variables

```bash
export ETH_RPC_URL=https://arb1.arbitrum.io/rpc
export ETHERSCAN_API_KEY=your_key
export PRIVATE_KEY=your_key
```

With `ETH_RPC_URL` set, omit `--rpc-url` from commands.

## Tips

1. **Always verify contracts** before interacting: `cast code <address>`
2. **Use `--json`** for machine-readable output: `cast tx <hash> --json`
3. **Trace failed txs** with: `cast run <hash> --trace`
4. **Decode unknown calldata** with: `cast 4byte-decode <calldata>`
