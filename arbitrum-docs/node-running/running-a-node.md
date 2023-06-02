---
title: "Quickstart: Run a full node (Nitro)"
description: Learn how to run an Arbitrum node on your local machine.
author-objective: build a quickstart that helps readers understand how to run an Arbitrum node, and why they might want to
reader-audience: moderately-technical readers who are familiar with command lines, but not Ethereum / Arbitrum infrastructure
reader-task: run a node with minimal effort and maximum understanding
content-type: quickstart
---

⚠️ Note: There is no protocol level incentive to run an Arbitum full node. If you’re interested in accessing an Arbitrum chain, but you don’t want to set up your own node, see our [Node Providers](./node-providers.mdx) to get RPC access to fully-managed nodes hosted by a third party provider.

### Minimum Hardware Configuration

- Followings specify the minimum hardware configuration required to setup a Nitro full node (not archival):
  - RAM: 4-8 GB
  - CPU: 2-4 core CPU (For AWS: t3 xLarge)
  - Storage: Minimum 1.2TB SSD (make sure it is extendable)
  - Estimated Growth Rate: around 3 GB per day

⚠️ Note: The minimum storage requirements will change over time as the Nitro chain grows. It is recommended to use more than the minimum requirements to run a robust full node.

### Required Artifacts

- Latest Docker Image: <code>@latestNitroNodeImage@</code>

- Arbitrum One Nitro Genesis Database Snapshot

  - Use the parameter `--init.url="https://snapshot.arbitrum.io/mainnet/nitro.tar"` on first startup to initialize Nitro database
  - If running more than one node, easiest to manually download image from https://snapshot.arbitrum.io/mainnet/nitro.tar and host it locally for your nodes
  - Or use `--init.url="file:///path/to/snapshot/in/container/nitro.tar"` to use a local snapshot archive
  - sha256 checksum: `a609773c6103435b8a04d32c63f42bb5fa0dc8fc38a2acee4d2ab2d05880205c`
  - size: 33.5573504 GB

- Other chains do not have classic blocks, and do not require an initial genesis database

- Snapshot list: "https://snapshot.arbitrum.foundation/index.html"

### Required parameter

- `--l1.url=<Layer 1 Ethereum RPC URL>`
  - Must provide standard layer 1 node RPC endpoint that you run yourself or from a node provider
- `--l2.chain-id=<L2 Chain ID>`
  - See [public chains](/for-devs/concepts/public-chains.mdx) for a list of Arbitrum chains and the respective L2 Chain Ids

### Important ports

- RPC: `8547`
- Sequencer Feed: `9642`
- WebSocket: `8548`
  - WS port `8548` needs extra args to be opened. Please use these flags:
    - --ws.port=8548
    - --ws.addr=0.0.0.0
    - --ws.origins=\*

### Putting it all together

- When running docker image, an external volume should be mounted to persist the database across restarts. The mount point inside the docker image should be `/home/user/.arbitrum`
- Here is an example of how to run nitro-node:

  - Note that is important that `/some/local/dir/arbitrum` already exists, otherwise the directory might be created with `root` as owner, and the docker container won't be able to write to it

  ```shell
  docker run --rm -it  -v /some/local/dir/arbitrum:/home/user/.arbitrum -p 0.0.0.0:8547:8547 -p 0.0.0.0:8548:8548 @latestNitroNodeImage@ --l1.url https://l1-node:8545 --l2.chain-id=<L2ChainId> --http.api=net,web3,eth,debug --http.corsdomain=* --http.addr=0.0.0.0 --http.vhosts=*
  ```

  - Note that if you are running L1 node on localhost, you may need to add `--network host` right after `docker run` to use docker host-based networking

  - When shutting down docker image, it is important to allow for a graceful shutdown so that the current state can be saved to disk. Here is an example of how to do a graceful shutdown of all docker images currently running

  ```shell
  docker stop --time=300 $(docker ps -aq)
  ```

### Note on permissions

- The Docker image is configured to run as non-root UID 1000. This means if you are running in Linux or OSX and you are getting permission errors when trying to run the docker image, run this command to allow all users to update the persistent folders
  ```shell
  mkdir /data/arbitrum
  chmod -fR 777 /data/arbitrum
  ```

### Optional parameters

- `--init.url=https://snapshot.arbitrum.io/mainnet/nitro.tar`
  - URL to download genesis database from. Only needed when starting Arbitrum One without database. If you want to run an archive node, use the url in [running an archive node](./how-tos/running-an-archive-node.mdx).
- `--node.rpc.classic-redirect=<classic node RPC>`
  - If set, will redirect archive requests for pre-nitro blocks to the designated RPC, which should be an Arbitrum Classic node with archive database. Only valid for Arbitrum One.
- `--http.api`
  - APIs offered over the HTTP-RPC interface (default `net,web3,eth`)
  - Add `debug` to enable tracing
- `--http.corsdomain`
  - Comma separated list of domains from which to accept cross origin requests (browser enforced)
- `--http.vhosts`
  - Comma separated list of virtual hostnames from which to accept requests (server enforced). Accepts `*` wildcard (default `localhost`)
- `--http.addr`
  - Address to bind RPC to. May need to be set to `0.0.0.0` for docker networking to work properly
- `--node.caching.archive`
  - Retain past block state
- `--node.feed.input.url=<feed address>`
  - Defaults to `wss://<chainName>.arbitrum.io/feed`.
  - ⚠️ When running more than one node, it is strongly suggested to provide one feed relay per datacenter. See further instructions in [How to run a feed relay](/node-running/how-tos/running-a-feed-relay.mdx).
- `--node.forwarding-target=<sequencer RPC>`
  - Defaults to appropriate L2 Sequencer RPC depending on L1 and L2 chain IDs provided
- `--node.rpc.evm-timeout`
  - Defaults to `5s`, timeout used for `eth_call` (0 == no timeout)
- `--node.rpc.gas-cap`
  - Defaults to `50000000`, cap on computation gas that can be used in `eth_call`/`estimateGas` (0 = no cap)
- `--node.rpc.tx-fee-cap`
  - Defaults to `1`, cap on transaction fee (in ether) that can be sent via the RPC APIs (0 = no cap)
- `--ipc.path`
  - Filename for IPC socket/pipe within the datadir (explicit paths escape it)
  - 🔉 Note that `IPC (Inter-Process Communication)` is not supported on the macOS yet, and hence, it will return connection refused if used
  - 🔉 Also note that this path is within the Docker container, you need to put it to the Docker mount point in order to use it
- `--init.prune`
  - Pruning for a given use: "full" for full nodes serving RPC requests, or "validator" for validators (Only works after v2.0.14)