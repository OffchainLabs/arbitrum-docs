---
title: 'How to run a Classic node'
description: Learn how to run an classic node on your local machine.
sidebar_position: 2
content_type: how-to
---

### Do you need to run a Classic node?

Arbitrum One has been upgraded to Nitro, the latest Arbitrum tech stack. "Arbitrum Classic" is our term for the old, pre-Nitro tech stack. The Nitro node databases have the raw data of all blocks, including pre-Nitro blocks. However, Nitro nodes cannot execute anything on pre-Nitro blocks. You need an Arbitrum Classic archive node to execute data on pre-Nitro blocks.

The following commands are supported when running an Arbitrum Classic archive node:

- `eth_call`
- `eth_estimateGas`
- `eth_getBalance`
- `eth_getCode`
- `eth_getTransactionCount`
- `eth_getStorageAt`

🔉 Note that Arbitrum Nova and Arbitrum Sepolia started as a Nitro chain, so they don't have classic blocks.

### Required artifacts

- Latest Docker Image: <code>@latestClassicNodeImage@</code>
- Latest classic snapshot for Arbitrum One: [@arbOneClassicArchiveSnapshot@](@arbOneClassicArchiveSnapshot@)

### Required parameters

- `--l1.url=<Layer 1 Ethereum RPC URL>`
  - Must provide standard Ethereum node RPC endpoint.
- `--node.chain-id=<L2 Chain ID>`
  - Must use `42161` for Arbitrum One

### Important ports

- RPC: `8547`
- WebSocket: `8548`

### Putting it all together

- When running docker image, an external volume should be mounted to persist the database across restarts. The mount point should be `/home/user/.arbitrum/mainnet`.
- Here is an example of how to run a classic archive node for Arbitrum One (only needed for archive requests on pre-Nitro blocks, so you'll probably want to enable the archive mode in your nitro node as well):

```shell
docker run --rm -it  -v /some/local/dir/arbitrum-mainnet/:/home/user/.arbitrum/mainnet -p 0.0.0.0:8547:8547 -p 0.0.0.0:8548:8548 @latestClassicNodeImage@ --l1.url=https://l1-node:8545 --node.chain-id=42161 --l2.disable-upstream
```

### Note on permissions

- The Docker image is configured to run as non-root UID 1000. This means if you are running in Linux and you are getting permission errors when trying to run the docker image, run this command to allow all users to update the persistent folders.

```shell
mkdir /some/local/dir/arbitrum-mainnet
chmod -fR 777 /some/local/dir/arbitrum-mainnet
```

### Optional parameters

We show here a list of the parameters that are most commonly used when running a Classic node. You can also use the flag `--help` for a full comprehensive list of the available parameters.

- `--core.cache.timed-expire`
  - Defaults to `20m`, or 20 minutes. Age of oldest blocks to hold in cache so that disk lookups are not required
- `--node.rpc.max-call-gas`
  - Maximum amount of gas that a node will use in call, default is `5000000`
- `--core.checkpoint-gas-frequency`
  - Defaults to `1000000000`. Amount of gas between saving checkpoints to disk. When making archive queries node has to load closest previous checkpoint and then execute up to the requested block. The farther apart the checkpoints, the longer potential execution required. However, saving checkpoints more often slows down the node in general.
- `--node.cache.allow-slow-lookup`
  - When this option is present, will load old blocks from disk if not in memory cache
  - If archive support is desired, recommend using `--node.cache.allow-slow-lookup --core.checkpoint-gas-frequency=156250000`
- `--node.rpc.tracing.enable`
  - Note that you also need to have a database populated with an archive node if you want to trace previous transactions
  - This option enables the ability to call a tracing api which is inspired by the parity tracing API with some differences
    - Example: `curl http://arbnode -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"arbtrace_call","params":[{"to": "0x6b175474e89094c44da98b954eedeac495271d0f","data": "0x70a082310000000000000000000000006E0d01A76C3Cf4288372a29124A26D4353EE51BE"},["trace"], "latest"],"id":67}'`
  - The `trace_*` methods are renamed to `arbtrace_*`, except `trace_rawTransaction` is not supported
  - Only `trace` type is supported. `vmTrace` and `stateDiff` types are not supported
  - The self-destruct opcode is not included in the trace. To get the list of self-destructed contracts, you can provide the `deletedContracts` parameter to the method

### Feed relay

- Arbitrum classic does not communicate with Nitro sequencer, so the classic relay is no longer used.
