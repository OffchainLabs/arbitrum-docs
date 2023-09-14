import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

The [`docs.arbitrum.io`](https://docs.arbitrum.io/) docs portal is the **single source of truth** for documentation that supports Offchain Labs' product portfolio. This includes documentation for:

1. [Developers](/for-devs/quickstart-solidity-hardhat.md)
2. [Users (bridge)](/getting-started-users.mdx)
3. [Node runners](/node-running/quickstart-running-a-node.md)
4. [How it works](/intro)

Contributions to each of these content areas are welcome from the entire Ethereum community.

This document shows you how to craft, organize, and publish Arbitrum documentation. Familiarity with [Markdown](https://www.markdownguide.org/basic-syntax/) syntax, Github, and [Docusaurus](https://docusaurus.io/docs) is expected.

### Add a new core document

If a document isn't in a `Third-party content` sidebar node, it's a **core document**. To contribute a new core doc:

import ContributeCoreDocsPartial from './_contribute-core-docs-partial.md';

<ContributeCoreDocsPartial />

### Add a new third-party document

**Third-party docs** are documents that help readers of Arbitrum docs use other products, services, and protocols (like the ones listed in the [Arbitrum portal](https://portal.arbitrum.io/)) with Arbitrum products.

These documents are usually authored by partner teams, but can be authored by anyone.

Follow the same guidance within _[Add a new core document](#add-a-new-core-document)_, with the following additions:

import ContributeThirdPartyDocsPartial from './_contribute-third-party-docs-partial.md';

<ContributeThirdPartyDocsPartial />

### Request an update

If you'd like to request an update or share a suggestion related to an **existing document** without submitting a pull request to implement the improvement yourself, click the `Request an update` button located at the top of each published document. This button will lead you to a prefilled Github issue that you can use to elaborate on your request or suggestion.

<br />

---

import ContributeDocsConventionsFaqsPartial from './_contribute-docs-conventions-faqs-partial.md';

<ContributeDocsConventionsFaqsPartial />
