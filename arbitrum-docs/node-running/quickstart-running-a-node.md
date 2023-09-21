---
title: 'Quickstart: Run a node'
description: Learn more about what type of ARb node one needs to run.
author-objective: Build a quickstart that helps readers understand why they might want to run a specific type of an Arbitrum node.
reader-audience: Moderately-technical readers who are familiar with command lines, but not Ethereum / Arbitrum infrastructure
reader-task: Run a node with minimal effort and maximum understanding
content-type: quickstart
---

import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

When it comes to interacting with the Arbitrum network, users have the option to run either a full node or an archive node. There are distinct advantages to running an Arbitrum full node. In this quickstart, we will explore the reasons why a user may prefer to run a full node instead of an archive node. By understanding the benefits and trade-offs of each type of node, users can make an informed decision based on their specific requirements and objectives.

### Considerations for running an Arbitrum full node

⚠️ Note: There is no protocol level incentive to run an Arbitum full node. If you’re interested in accessing an Arbitrum chain, but you don’t want to set up your own node, see our [RPC endpoints and providers](/node-running/node-providers.mdx) to get RPC access to fully-managed nodes hosted by a third party provider.

- Transaction validation and security: Running a full node allows users to independently validate transactions and verify the state of the Arbitrum blockchain. Users can have full confidence in the authenticity and integrity of the transactions they interact with.
- Reduced trust requirements: By running a full node, users can interact with the Arbitrum network without relying on third-party services or infrastructure. This reduces the need to trust external entities and mitigates the risk of potential centralized failures or vulnerabilities.
- Lower resource requirements: Compared to archive nodes, full nodes generally require fewer resources such as storage and computational power. This makes them more accessible to users with limited hardware capabilities or those operating on resource-constrained environments.

For detailed instructions on how to run an Arbitrum full node, see [here](./how-tos/running-a-full-node.mdx).

### Considerations for running an Arbitrum archive node

While full nodes offer numerous advantages, there are situations where running an archive node may be more appropriate. Archive nodes store the complete history of the Arbitrum network, making them suitable for users who require extensive historical data access or advanced analytical purposes. However, it's important to note that archive nodes are more resource-intensive, requiring significant storage capacity and computational power.

For detailed instructions on how to run an Arbitrum archive node, see [here](./how-tos/running-an-archive-node.mdx).

### Considerations for running an Arbitrum classic node

The significance of running an Arbitrum classic node is mainly applicable to individuals with specific needs for an archive node and access to classic-related commands. More details can be found [here](./how-tos/running-an-archive-node.mdx).

For detailed instructions on how to run an Arbitrum classic node, see [here](./how-tos/running-a-classic-node.mdx).

### Considerations for running a feed relay

If you are running a single node, there is no requirement to set up a feed relay. However, if you have multiple nodes, it is highly recommended to have a single feed relay per datacenter. This setup offers several advantages such as reducing ingress fees and enhancing stability within the network.

In the near future, feed endpoints will mandate compression using a custom dictionary. Therefore, if you plan to connect to a feed using anything other than a standard node, it is strongly advised to run a local feed relay. This will ensure that you have access to an uncompressed feed by default, maintaining optimal performance and compatibility.

For detailed instructions on how to run a feed relay, see [here](./how-tos/running-a-feed-relay.mdx).
