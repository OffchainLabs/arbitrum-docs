---
title: 'How to run an archive node'
description: Learn how to run an Arbitrum archive node on your local machine.
author: jason-wanxt
sidebar_position: 3
content_type: how-to
---

An Arbitrum **archive node** is a full node that maintains an archive of historical chain states. This how-to walks you through the process of configuring an archive node on your local machine so that you can query both pre-Nitro and post-Nitro state data.

:::caution

**Most users won't need to configure an archive node**. This node type is great for a small number of use cases - for example if you need to process historical data.

:::

### Before we begin

Before the Nitro upgrade, Arbitrum One ran on the Classic stack for about one year (before block height 22207817). Although the Nitro chain uses the latest snapshot of the Classic chain's state as its genesis state, **the Nitro stack can't serve archive requests for pre-Nitro blocks**.

Running an Arbitrum One **full node** in **archive mode** lets you access both pre-Nitro and post-Nitro blocks, but it requires you to run **both Classic and Nitro nodes** together. You may not need to do this, depending on your use case:

| Use case                                                                        | Required node type(s)                                     | Docs                                                                                                |
| ------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Access the **Arbitrum network** without running your own node                   | Fully managed by third-parties, exposed via RPC endpoints | [RPC endpoints and providers](/build-decentralized-apps/reference/01-node-providers.mdx)            |
| Run an **archive node** for **Arbitrum Sepolia (testnet)** or **Arbitrum Nova** | Full node (Nitro)                                         | [How to run a full node (Nitro)](/run-arbitrum-node/03-run-full-node.md)                            |
| Send **post-Nitro** archive requests                                            | Full node (Nitro)                                         | [How to run a full node (Nitro)](/run-arbitrum-node/03-run-full-node.md)                            |
| Send **pre-Nitro** archive requests                                             | Full node (Classic)                                       | [How to run a full node (Classic, pre-Nitro)](/run-arbitrum-node/more-types/03-run-classic-node.md) |
| Send **post-Nitro** _and_ **pre-Nitro** archive requests                        | Full node (Nitro) _and_ full node (Classic)               | That's what this how-to is for; you're in the right place.                                          |

### System requirements

:::caution
As of May 2024, archive node snapshots for Arbitrum One, Arbitrum Nova, and Arbitrum Sepolia are no longer being updated on https://snapshot-explorer.arbitrum.io/ due to accelerated database and state growth. Teams who use these publicly available archive snapshots will need to wait longer than usual for their nodes to sync up.

The Offchain Labs team is actively exploring and working on solutions to address this and will provide an update as soon as possible. In the meantime, the Offchain Labs team continues to recommend that teams periodically create their own snapshots by stopping one of their archive nodes and backing up their database.
:::

:::caution

The minimum storage requirements will change as the Nitro chains grow (growing rates are specified below). We recommend exceeding the minimum requirements as much as you can to minimize risk and maintenance overhead.

:::

1. **RAM:** 16GB+ for Nitro and 32GB+ for Classic
2. **CPU:** 4+ core CPU
3. **Storage (last updated on April 2024):**
   - Arbitrum One: 9.7TB SSD, currently growing at a rate of about 850GB per month
   - Arbitrum Nova: 4.3TB SSD, currently growing at a rate of about 1.8TB GB per month
4. **Docker images:** We'll specify these in the below commands; you don't need to download them manually.
   - Latest Docker image for **Arbitrum One Nitro**: <code>@latestNitroNodeImage@</code>
   - Latest Docker image for **Arbitrum One Classic**: <code>@latestClassicNodeImage@</code>
5. **Database snapshots:**
   - Nitro database snapshot
     - Use the parameter `--init.url=` on the first startup to initialize the Nitro database (you can find a list of snapshots [here](https://snapshot-explorer.arbitrum.io/)). Example: <code>--init.url="@arbOneNitroArchiveSnapshot@"</code>
   - Arbitrum One Classic database snapshot
     - Download the latest Arbitrum One Classic database snapshot at [@arbOneClassicArchiveSnapshot@](@arbOneClassicArchiveSnapshot@) and place it in the mounted point directory
     - Note that other chains don't have Classic blocks and thus don't require an initial genesis database.
   - Snapshot Explorer
     - You can find more snapshots on our [snapshot explorer](https://snapshot-explorer.arbitrum.io/)

### Review and configure ports

<!-- todo: explain why these ports are important and what action needs to be taken - do rules need to be configured? -->
<!-- todo: format into a table  -->

- RPC: `8547`
- Sequencer Feed: `9642`
- WebSocket: `8548`

### Review and configure parameters

| Arbitrum Nitro                                             | Arbitrum Classic                            | Description                                                                                                                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--parent-chain.connection.url=<Layer 1 Ethereum RPC URL>` | `--l1.url=<Layer 1 Ethereum RPC URL>`       | Provide an standard L1 node RPC endpoint that you run yourself or from a third-party node provider (see [RPC endpoints and providers](/build-decentralized-apps/reference/01-node-providers.mdx)) |
| `--chain.id=<L2 chain ID>`                                 | `--l2.chain-id=<L2 Chain ID>`               | See [RPC endpoints and providers](/build-decentralized-apps/reference/01-node-providers.mdx) for a list of Arbitrum chains and the respective L2 chain IDs                                        |
| `--execution.caching.archive`                              | `--node.caching.archive`                    | Required for running an **Arbitrum One Nitro** archival node and retains past block state                                                                                                         |
| -                                                          | `--node.cache.allow-slow-lookup`            | Required for running an **Arbitrum One Classic** archival node. When this option is present, it will load old blocks from disk if not in memory cache.                                            |
| -                                                          | `--core.checkpoint-gas-frequency=156250000` | Required for running an **Arbitrum One Classic** archival node.                                                                                                                                   |


| Arbitrum Nitro | Arbitrum Classic | Description |
| ---------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--parent-chain.connection.url=<Layer 1 Ethereum RPC URL>` | `--l1.url=<Layer 1 Ethereum RPC URL>` | Provide an standard L1 node RPC endpoint that you run yourself or from a third-party node provider (see [RPC endpoints and providers](/build-decentralized-apps/reference/01-node-providers.mdx)) |
| `--chain.id=<L2 chain ID>` | `--l2.chain-id=<L2 Chain ID>` | See [RPC endpoints and providers](/build-decentralized-apps/reference/01-node-providers.mdx) for a list of Arbitrum chains and the respective L2 chain IDs |
| `--execution.caching.archive` | `--node.caching.archive` | Required for running an **Arbitrum One Nitro** archival node and retains past block state |
| - | `--node.cache.allow-slow-lookup` | Required for running an **Arbitrum One Classic** archival node. When this option is present, it will load old blocks from disk if not in memory cache. |
| - | `--core.checkpoint-gas-frequency=156250000` | Required for running an **Arbitrum One Classic** archival node. |


### Run the Docker image(s)

<!-- This is the procedure part, so we can focus on steps to take and move "conceptual information" into a dedicated concept doc -->
<!-- Arbitrum One has been upgraded to Nitro, the latest Arbitrum tech stack; "Arbitrum Classic" is our term for the old, pre-Nitro tech stack. The Nitro node databases have the raw data of all blocks, including pre-Nitro blocks. However, Nitro nodes cannot execute anything on pre-Nitro blocks. Arbitrum Nova started as a Nitro chain, so it has no classic blocks. -->

When running a Docker image, an external volume should be mounted to persist the database across restarts. The mount point should be `/home/user/.arbitrum/mainnet`.

<!-- todo: does the user need to do anything to configure the mount point, or is this handled by the below docker commands? -->

To run both Arbitrum Nitro and/or Arbitrum Classic in archive mode, follow one or more of the below examples:

- **Arbitrum One Nitro archive node**:
  ```shell
  docker run --rm -it -v /some/local/dir/arbitrum:/home/user/.arbitrum -p 0.0.0.0:8547:8547 -p 0.0.0.0:8548:8548 @latestNitroNodeImage@ --parent-chain.connection.url https://l1-node:8545 --chain.id=42161 --http.api=net,web3,eth --http.corsdomain=* --http.addr=0.0.0.0 --http.vhosts=* --execution.caching.archive
  ```
- **Arbitrum One Classic archive node**:
  ```shell
  docker run --rm -it -v /some/local/dir/arbitrum-mainnet/:/home/user/.arbitrum/mainnet -p 0.0.0.0:8547:8547 -p 0.0.0.0:8548:8548 @latestClassicNodeImage@ --l1.url=https://l1-node:8545/ --node.chain-id=42161 --l2.disable-upstream --node.cache.allow-slow-lookup --core.checkpoint-gas-frequency=156250000 --core.lazy-load-core-machine
  ```
- **Arbitrum One Nitro archive node with forwarding classic execution support**:
  ```shell
  docker run --rm -it -v /some/local/dir/arbitrum:/home/user/.arbitrum -p 0.0.0.0:8547:8547 -p 0.0.0.0:8548:8548 @latestNitroNodeImage@ --parent-chain.connection.url https://l1-node:8545 --chain.id=42161 --execution.rpc.classic-redirect=<classic node RPC> --http.api=net,web3,eth --http.corsdomain=* --http.addr=0.0.0.0 --http.vhosts=* --execution.caching.archive
  ```

Note that the above commands both map to port `8547` on their hosts. To run both on the same host, you should edit those mapping to different ports and specify your Classic node RPC URL as `<classic node RPC>` in your Nitro start command. To verify the connection health of your node(s), see [Docker network between containers - Docker Networking Example](https://www.middlewareinventory.com/blog/docker-network-example/).

#### A note on permissions

The Docker image is configured to run as non-root `UID 1000`. If you're running in Linux and you're getting permission errors when trying to run the Docker image, run this command to allow all users to update the persistent folders, replacing `arbitrum-mainnet` as needed:

```shell
mkdir /some/local/dir/arbitrum-mainnet
chmod -fR 777 /some/local/dir/arbitrum-mainnet
```

### Optional parameters

Both Nitro and Classic have multiple other parameters that can be used to configure your node. For a full comprehensive list of the available parameters, use the flag `--help`.

<!-- todo: FAQ -->

### Troubleshooting

If you run into any issues, visit the [node-running troubleshooting guide](/run-arbitrum-node/06-troubleshooting.md).
