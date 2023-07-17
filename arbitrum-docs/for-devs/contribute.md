---
title: 'Contribution guide'
description: "Learn how to contribute to Arbitrum's developer documentation"
---

import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md'; 

:::tip Submitting a docs PR?

To help us scale our efforts, **please review this guidance before issuing pull requests** into the [Arbitrum docs repository](https://developer.arbitrum.io/).

:::

<PublicPreviewBannerPartial />

The [`developer.arbitrum.io`](https://developer.arbitrum.io/) docs portal is the **single source of truth** for documentation that supports Offchain's product portfolio. This includes documentation for:

1. [Building dApps](./quickstart-solidity-hardhat.md) with Arbitrum’s chains.
2. [Bridging tokens](../getting-started-users.mdx) to Arbitrum’s chains.
3. [Running an Arbitrum node](../node-running/quickstart-running-a-node.md).
4. [Launching a self-managed chain](../launch-orbit-chain/orbit-quickstart.md) using Arbitrum Orbit.
5. [Educational materials](../intro) that explain how these technologies work.

Contributions to each of these content areas are welcome from the entire Ethereum community.

This document provides an overview of the **content conventions** and **protocols** that we use to craft, organize, and publish our contributions. Familiarity with Markdown syntax and Docusaurus is expected.


## Content conventions

Offchain Labs supports [Arbitrum docs](/), [Prysm docs](https://docs.prylabs.network/docs/getting-started), and the [Arbitrum DAO's governance docs](https://docs.arbitrum.foundation/gentle-intro-dao-governance). The following **content conventions** help us maintain consistency across these documentation sets.

### Document types

Every document should be a specific *type* of document. Each type of document has its own purpose:

| Content type        | Purpose                                                                            | Example(s) to refer to                                                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gentle introduction | Onboard a specific reader audience with tailored questions and answers             | [A gentle introduction to Orbit](../launch-orbit-chain/orbit-gentle-introduction.md) <br/> [A gentle introduction to Arbitrum DAO](https://docs.arbitrum.foundation/gentle-intro-dao-governance) |
| Quickstart          | Onboard a specific reader audience with step-by-step "learn by doing" instructions | [Quickstart: Build dApps](./quickstart-solidity-hardhat.md)                                                                                                                                      |
| How-to              | Provide task-oriented procedural guidance                                          | [How to run a local dev node](../node-running/how-tos/local-dev-node.mdx)                                                                                                                        |
| Concept             | Explain what things are and how they work                                          | [Token bridging](../asset-bridging.mdx) <br/>[Nodes and networks](https://docs.prylabs.network/docs/concepts/nodes-networks)                                                                     |
| FAQ                 | Address frequently asked questions                                                 | [FAQ: Run a node](../node-running/faq.md)                                                                                                                                                        |
| Glossary            | Provide terms and definitions                                                      | [Arbitrum DAO: Glossary](https://docs.arbitrum.foundation/dao-glossary)                                                                                                                          |
| Troubleshooting     | List common troubleshooting scenarios and solutions                                | [Troubleshooting: Run a node](../node-running/troubleshooting-running-nodes.md)                                                                                                                  |
| Reference           | Lists and tables of things, such as API endpoints and developer resources          | [RPC endpoints and providers](../node-running/node-providers.mdx)                                                                                                                                |


This isn't an exhaustive list, but it lists the most common content types that we use in our docs.


### Style

The following style guidelines provide a number of loose recommendations that help us deliver **a consistent content experience** across our docs:

 1. **Casing**
    - Sentence-case "content labels": document titles, sidebar titles, menu items, section headers, etc.
 2. **Linking**
    - Avoid anchoring links to words like "here" or "this". Descriptive anchor text can help set expectations for readers who may hesitate to click on ambiguous links.
 3. **Separation of concerns**
    - Within procedural docs like how-tos and quickstarts, avoid including too much conceptual content. Provide only the conceptual information that the target reader *needs* in order to complete the task at hand. Otherwise, organize conceptual information within conceptual docs, and link to them "just in case" from other docs.
 4. **Voice**
    - Write like you'd speak to a really smart friend who's in a rush.
    - Address the reader as "you". Opt for short, clear sentences that use translation-friendly, plain language.
    - Use contractions wherever it feels natural - this can help convey a friendly and conversational tone.
 5. **Formality**
    - Don't worry too much about formality. The most valuable writing is writing that provides value to readers, and readers generally want to "flow" through guidance.
    - Aim at "informal professionalism" that prioritizes **audience-tailored problem-solving** and **consistent style and structure**.
 6. **Targeting**
    - Don't try to write for everyone; write for a *specific reader persona* (also referred to as "audience" in this document) who has a *specific need*.
    - Make assumptions about prior knowledge (or lack thereof) and make these assumptions explicit in the beginning of your document.
 7. **Flow**
    - **Set expectations**: Begin documents by setting expectations. Who is the document for? What value will it provide to your target audience? What assumptions are you making about their prior knowledge? Are there any prerequisites?
    - **Value up front**: Lead with what matters most to the reader persona you're targeting. Then, progressively build a bridge that carries them towards task completion as efficiently as possible.
 8. **Cross-linking**
     - We want to maintain both **high discoverability** and **high relevance**. As a general rule of thumb, links to other docs should be very likely to be useful for most readers. Every link is a subtle call to action; we want to avoid CTA overload.
 9.  **Things to avoid**
     - **Symbols where words will do**: Minimize usage of `&` and `/` - spell out words like "*and*" and "*or*".
     - **Jargon**: Using precise technical terminology is ok, as long as your target audience is likely to understand the terminology. When in doubt, opt for clear, unambiguous, *accessible* language.


Don't stress too much about checking off all of these boxes; we periodically review and edit our most heavily-trafficked docs, bringing them up to spec with the latest style guidelines.

Some important disclaimers:

 - **This isn't an exhaustive list**. These are just the min-bar guidelines that will be applied to all new content moving forward.
 - **Many of our docs don't yet follow this guidance**. Our small-but-mighty team is working on it! If you notice an obvious content bug, feel free to submit an [issue](https://github.com/OffchainLabs/arbitrum-docs/issues) or [PR](https://github.com/OffchainLabs/arbitrum-docs/pulls).


### Banners

You can use banners (Docusaurus refers to them as ["admonitions"](https://docusaurus.io/docs/markdown-features/admonitions)) to set expectations for your readers and to emphasize important callouts. Use these conservatively, as they interrupt the flow of the document.


#### Public preview content

Example:

<PublicPreviewBannerPartial />


Usage:

```
import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />
```

#### Under construction

Example:

:::caution UNDER CONSTRUCTION

The following steps are under construction and will be updated with more detailed guidance soon. Stay tuned, and don't hesitate to click the `Request an update` at the top of this document if you have any feedback along the way.

:::


Usage:

```
:::caution UNDER CONSTRUCTION

The following steps are under construction and will be updated with more detailed guidance soon. Stay tuned, and don't hesitate to click the `Request an update` at the top of this document if you have any feedback along the way.

:::
```




### Organization

Our published docs are generally organized like this in the sidebar:

```
Gentle introduction
Quickstart
How-tos
 > Write a smart contract
Concepts
 > Smart contract
Reference
Troubleshooting
FAQ
Glossary
Third-party content
>> Product A
>> Product B
>>> Test your contract
```

Notes:

 - This isn't a strict requirement; it's a loose guideline.
 - Not all product areas have all types of content.
 - Deviating from this pattern can make important content more discoverable to readers. For example, [Developer tools and resources](https://developer.arbitrum.io/for-devs/dev-tools-and-resources/overview) is a root-level collection of reference-type content.

The sidebar structure is determined by [a `sidebars.js` file](https://github.com/OffchainLabs/arbitrum-docs/blob/master/website/sidebars.js). Although most sidebars are organized with JSON that specifies individual files and folders, **all net-new content needs to be organized within a folder structure that matches the desired sidebar structure**. This lets us take advantage of [auto-generated sidebars](https://docusaurus.io/docs/sidebar/autogenerated).


## Protocols

Just as the nodes of our chains' networks follow a p2p protocol, Arbitrum’s content contributors are encouraged to follow a content contribution protocol. This helps us **streamline collaboration** and **scale our efforts**.

:::tip Thank you

We know that procedures aren't fun, so we've kept these protocols very short and sweet. Thank you for reviewing them; it's a huge help.

:::


### Creating new core documents

**Core documents** are documents that aren't third-party content. These docs help readers use Arbitrum products directly. If the document isn't in a `Third-party content` folder in the sidebar, it's a core document.

Before creating a new core document, we recommend answering the following questions:

1. **Audience**: Who is my audience, specifically?
2. **Problem**: What problem are they trying to solve, specifically?
3. **Discovery**: How are my target readers looking for a solution? For example - are they coming from search? If so, what search terms are they using?
4. **Content type**: Which content type is most suitable?

Then, based on your answer to (4), refer to the [Content types](#document-types) table above, and select one of the corresponding `Example(s) to refer to`.

Copy and paste the source of this Markdown document to scaffold your new document, and then use the [Style guidance above](#style) to craft a solution to the target problem (2) for your target audience (1).

Your answer to (3) will inform the way that you title your document, and how you should link to it from other documents.

Author your contribution within a branch of the [Arbitrum docs repo](https://github.com/OffchainLabs/arbitrum-docs) and issue a pull request. **Include answers to these four questions in your PR description**. This will signal to our content team that the PR contains a good-faith effort to understand and apply our content contribution guidelines.


### Creating new third-party documents

**Third-party documents** are documents that help readers integrate Arbitrum products with *other* products. like the ones listed in the [Arbitrum portal](https://portal.arbitrum.io/).

For now, you can only add third-party docs if your project is listed in the [Arbitrum portal](https://portal.arbitrum.io/). To submit your project to the Arbitrum portal, [apply using this Google form](https://docs.google.com/forms/d/e/1FAIpQLSezhBlPgKIKKWgXKUz4MmlJPdHyfmPQlxUtS48HlRoi0e14_Q/viewform).

The protocol for creating new third-party docs is similar to the protocol for [Creating new core documents](#creating-new-third-party-documents), with the following additions:

 1. **Maintenance**: Offchain Labs can't commit to maintaining third-party docs, but we make it easy for you to maintain them. Ensure that your document's YAML frontmatter contains a `third_party_content_owner` property, with the Github username of the designated maintainer.
    - This person will be assigned to your document's issues and PRs, and will be expected to resolve them in a timely manner.
 2. **Purpose**: The purpose of third-party docs is to meet developer demand for guidance that helps them integrate Arbitrum technologies with non-Arbitrum technologies.
    - It's not meant to drive traffic to your product (although that may happen); it's meant to solve real developer problems.
 3. **Organization**: Third-party docs are organized within the `Third-party content` node located at the bottom of each documentation section’s sidebar.
    - This node’s content is grouped by third-party product. If/when this becomes unweildy, we'll begin grouping products by [portal](https://portal.arbitrum.io/) category.
 4. **Limited content types**: To manage our team's limited capacity, third-party documents must be either ***Quickstarts***, ***How-tos***, or ***Concepts***.
 5. **One document at a time, starting with a quickstart**: Third-party document PRs should contain at most one new document.
    - Additional documents will be merged only if we can verify that Arbitrum developers are deriving value from your initial Quickstart contribution.
    - The way that we do this isn't yet firmly established, nor is it publicly disclosed; it combines a number of objective and subjective measures.
 6. **Content ownership**: You own the words that you author and can do anything that you'd like with them; Arbitrum doesn't own third-party content. We do reserve the right to remove third-party content from our docs at any time, for any reason.
    - Third-party content is generally only removed if the content isn't receiving any pageviews over a sustained period of time.



## Frequently asked questions

#### Can I use AI-generated content?

"No". The legal landscape for AI-generated content is plagued by uncertainty, shifty conditions, and risk that nobody really knows how to navigate. By issuing PRs into our docs repo, you're acknowledging that your content has been produced organically. Content produced under the influence of AI/ML tooling, such as ChatGPT, is "strictly not allowed".

#### It looks like there are some automations behind the scenes for FAQs and Glossaries; should I be wary of contributing to those docs?

You're right! We draft some types of content on Notion to make it easier for nontechnical internal contributors to contribute. This content is then published using a script that reads from Notion and writes to Markdown. 

You can still submit changes to the Glossary and FAQ markdown files; we manually synchronize these types of changes with Notion content whenever we need to.