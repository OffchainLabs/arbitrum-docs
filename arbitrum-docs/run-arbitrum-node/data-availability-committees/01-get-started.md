---
title: 'How to configure a Data Availability Committee: Introduction'
description: Learn what's needed to configure a Data Availability Committee for your chain
author: jose-franco
sidebar_position: 1
content_type: overview
---

import PublicPreviewBannerPartial from '../../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

<p>
  <a data-quicklook-from="arbitrum-anytrust-protocol">AnyTrust</a> chains rely on an external Data
  Availability Committee (DAC) to store data and provide it on-demand instead of using its{' '}
  <a data-quicklook-from="parent-chain">parent chain</a> as the Data Availability (DA) layer. The
  members of the DAC run a Data Availability Server (DAS) to handle these operations.
</p>

This section offers information and a series of how-to guides to help you along the process of setting up a Data Availability Committee. These guides target two audiences: Committee members who wish to deploy a Data Availability Server, and chain owners who wish to configure their chain with the information of the Committee.

Before following the guides in this section, you should be familiarized with how the AnyTrust protocol works, and the role of the DAC in the protocol. Refer to _[Inside AnyTrust](/how-arbitrum-works/inside-anytrust.md)_ to learn more.

## If you are a DAC member

Committee members will need to run a DAS. To do that, they will first need to generate a pair of keys and deploy a DAS. They may also choose to deploy an additional mirror DAS. Find more information in [How to deploy a DAS](/run-arbitrum-node/data-availability-committees/02-deploy-das.md) and [How to deploy a mirror DAS](/run-arbitrum-node/data-availability-committees/03-deploy-mirror-das.md).

Here's a basic checklist of actions to complete for DAC members:

- [Deploy a DAS](/run-arbitrum-node/data-availability-committees/02-deploy-das.md). Send the following information to the chain owner:
  - Public BLS key
  - The https URL for the RPC endpoint which includes some random string (e.g. das.your-chain.io/rpc/randomstring123), communicated through a secure channel
  - The https URL for the REST endpoint (e.g. das.your-chain.io/rest)
- [Deploy a mirror DAS](/run-arbitrum-node/data-availability-committees/03-deploy-mirror-das.md) if you want to complement your setup with a mirror DAS. Send the following information to the chain owner:
  - The https URL for the REST endpoint (e.g. das.your-chain.io/rest)

## If you are a chain owner

Chain owners will need to gather the information from the committee members to craft the necessary information to update their chain and the batch poster (more information in [How to set valid keyset on parent chain](/launch-orbit-chain/how-tos/orbit-sdk-deploying-anytrust-chain.md#4-setting-valid-keyset-on-parent-chain.md)). They might also want to test each DAS individually, by following the testing guides available in [How to deploy a DAS](/run-arbitrum-node/data-availability-committees/02-deploy-das.md#testing-the-das) and [How to deploy a mirror DAS](/run-arbitrum-node/data-availability-committees/03-deploy-mirror-das.md#testing-the-das).

Here's a basic checklist of actions to complete for chain owners:

- Gather the following information from every member of the committee:
  - Public BLS Key
  - URL of the RPC endpoint
  - URL(s) of the REST(s) endpoint
- Ensure that at least one DAS is running as an [archive DAS](/run-arbitrum-node/data-availability-committees/02-deploy-das.md#archive-da-servers)
- Generate the keyset and keyset hash with all the information from the servers (guide coming soon)
- Craft the new configuration for the batch poster (guide coming soon)
- Craft the new configuration for your chain's nodes (guide coming soon)
- Update the SequencerInbox contract (guide coming soon)

## Ask for help

Configuring a DAC might be a complex process. If you need help setting it up, don't hesitate to ask us on [Discord](https://discord.gg/arbitrum).
