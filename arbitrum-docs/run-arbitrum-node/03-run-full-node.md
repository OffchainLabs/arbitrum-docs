---
title: 'How to run a full node (Nitro)'
description: Learn how to run an Arbitrum node on your local machine.
sidebar_position: 1
content_type: how-to
---

:::info

There is no protocol-level incentive to run an Arbitum full node. If you’re interested in accessing an Arbitrum chain but don’t want to set up your own node, see our [Node Providers](/build-decentralized-apps/reference/01-node-providers.md) to get RPC access to fully managed nodes hosted by a third-party provider.

:::

### Minimum hardware configuration

Minimum hardware configuration required to set up a Nitro full node (not archival):

- **RAM**: 16 GB
- **CPU**: 4 core CPU
  - Single core performance is important. If the node is falling behind and a single core is 100% busy, it is recommended to update to a faster processor
- **Storage (last updated on April 2024)**:
  - Arbitrum One: 560GB for a pruned node, growing at ~200GB per month (NVMe SSD drives are recommended)
  - Arbitrum Nova: 400GB for a pruned node, growing at ~1.6TB per month (NVMe SSD drives are recommended)

:::info

These minimum requirements for RAM and CPU are recommended for nodes that process a small amount of RPC requests. For nodes that require processing multiple simultaneous requests, both RAM and number of CPU cores will need to be scaled with the amount of traffic being served.

:::

:::info

The minimum storage requirements will change over time as the Nitro chain grows. Using more than the minimum requirements to run a robust full node is recommended.

:::

### Prerequisites

:::caution Only use released versions

Even though there are alpha and beta versions of the <a data-quicklook-from='arbitrum-nitro'>Arbitrum Nitro software</a>, only release versions should be used when running your node. Running alpha or beta versions is not supported and might lead to unexpected behaviors.

:::

- Latest Docker Image: <code>@latestNitroNodeImage@</code>
- Database snapshot (required for Arbitrum One, optional for other chains)
  - Use the parameter `--init.latest <snapshot type>`, accepted values: "archive" | "pruned" | "genesis".
  - When running more than one node, it's easier to manually download the different parts of the snapshot, join them into a single archive, and host it locally for your nodes. You can then use `--init.url="file:///path/to/snapshot/in/container/snapshot-file.tar"` to use it. (For how to manually download the snapshot parts, please see [Downloading the snapshot manually](/run-arbitrum-node/nitro/03-nitro-database-snapshots.md#downloading-the-snapshot-manually))
  - This parameter is **required** when initializing an Arbitrum One node because the chain has _classic_ blocks. For the other chains, this parameter is optional.
  - This parameter is ignored if the database already exists.
  - Find more info in [Nitro database snapshots](/run-arbitrum-node/nitro/03-nitro-database-snapshots.md)
  - You can find more snapshots on our [snapshot explorer](https://snapshot-explorer.arbitrum.io/)

### Required parameters

- L1 RPC URL
  - Use the parameter `--parent-chain.connection.url=<Layer 1 Ethereum RPC URL>` for execution layer.
  - If the chain is running [ArbOS 20](/run-arbitrum-node/arbos-releases/arbos20.md), additionally use the parameter `--parent-chain.blob-client.beacon-url=<Layer 1 Ethereum Beacon RPC URL>` for consensus layer. You can find a list of beacon chain RPC providers [here](/run-arbitrum-node/05-l1-ethereum-beacon-chain-rpc-providers.md).
    - It must provide a standard layer 1 node RPC endpoint that you run yourself or from a node provider.
    - Note: historical blob data is required for chains running [ArbOS 20](/run-arbitrum-node/arbos-releases/arbos20.md) to properly sync up if they are new or have been offline for more than 18 days. This means the consensus layer RPC endpoint you use may also need to provide historical blob data. Please see [Special notes on ArbOS 20: Atlas support for EIP-4844](/run-arbitrum-node/arbos-releases/arbos20.md#special-notes-on-arbos-20-atlas-support-for-eip-4844) for more details.
  - Note: this parameter was called `--l1.url` in versions prior to `v2.1.0`
  - Note: 8545 is usually the default port for the execution layer. For the Beacon endpoint port, you should connect to the correct port set on your parent chain's consensus client.
- L2 chain ID or name
  - Use the parameter `--chain.id=<L2 chain ID>` to set the L2 chain from its chain id. See [RPC endpoints and providers](/build-decentralized-apps/reference/01-node-providers.md#rpc-endpoints) for a list of Arbitrum chains and their respective L2 chain IDs.
  - Alternatively, you can use the parameter `--chain.name=<L2 chain name>` to set the L2 chain from its name (options are: `arb1`, `nova` and `sepolia-rollup`)
  - Note: this parameter was called --l2.chain-id and only accepted chain IDs in versions before `v2.1.0`

### Important ports

- RPC: `8547`
- Sequencer Feed: `9642`
- WebSocket: `8548`
  - WS port `8548` needs extra args to be opened. Please use these flags:
    - --ws.port=8548
    - --ws.addr=0.0.0.0
    - --ws.origins=\*

### Putting it all together

- When running the Docker image, an external volume should be mounted to persist the database across restarts. The mount point inside the docker image should be `/home/user/.arbitrum`
- Here is an example of how to run nitro-node:

  - Note that it is important that `/some/local/dir/arbitrum` already exists; otherwise, the directory might be created with `root` as owner, and the docker container won't be able to write to it

  ```shell
  docker run --rm -it  -v /some/local/dir/arbitrum:/home/user/.arbitrum -p 0.0.0.0:8547:8547 -p 0.0.0.0:8548:8548 @latestNitroNodeImage@ --parent-chain.connection.url https://l1-node:8545 --chain.id=<L2ChainId> --http.api=net,web3,eth --http.corsdomain=* --http.addr=0.0.0.0 --http.vhosts=*
  ```

  - Note that if you are running an L1 node on localhost, you may need to add `--network host` right after `docker run` to use docker host-based networking

  - When shutting down the Docker image, it is important to allow a graceful shutdown to save the current state to disk. Here is an example of how to do a graceful shutdown of all docker images currently running

  ```shell
  docker stop --time=300 $(docker ps -aq)
  ```

### Note on permissions

- The Docker image is configured to run as non-root UID 1000. This means if you are running in Linux or OSX and you are getting permission errors when trying to run the docker image, run this command to allow all users to update the persistent folders
  ```shell
  mkdir /data/arbitrum
  chmod -fR 777 /data/arbitrum
  ```

### Watchtower mode

- By default, the full node will run in Watchtower mode. This means that the node watches the on-chain assertions, and if it disagrees with them, it will log an error containing the string `found incorrect assertion in watchtower mode`.
- Watchtower mode adds a small amount of execution and memory overhead. You can deactivate this mode using the parameter `--node.staker.enable=false`.

### Pruning

- Pruning a full node refers to removing older, unnecessary data from the local copy of the blockchain that the node maintains to save disk space and slightly improve the node's efficiency. Pruning will remove all states from blocks older than the latest 128.
- You can activate pruning by using the parameter `--init.prune` and using "full" or "validator" as the value (depending on the type of node you are running). Remember that this process will happen upon starting the node and will not serve RPC requests while pruning.

### Optional parameters

Below, we listed the most commonly used parameters when running a node. You can also use the flag `--help` for a comprehensive list of the available parameters.

import OptionalOrbitCompatibleCLIFlagsPartial from '../partials/_optional-orbit-compatible-cli-flags-partial.md';

<OptionalOrbitCompatibleCLIFlagsPartial />
