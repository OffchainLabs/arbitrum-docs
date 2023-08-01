import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md';

:::tip Submitting a docs PR?

**Please review this guidance before issuing pull requests** into the [Arbitrum docs repository](https://developer.arbitrum.io/). This guidance helps us **streamline** and **scale** our efforts. Thank you!

:::

<PublicPreviewBannerPartial />

The [`docs.arbitrum.io`](https://docs.arbitrum.io/) docs portal is the **single source of truth** for documentation that supports Offchain Labs' product portfolio. This includes documentation for:

1. [Building dApps](/quickstart-solidity-hardhat) with Arbitrum's chains.
2. [Bridging tokens](../getting-started-users.mdx) to Arbitrum's chains.
3. [Running an Arbitrum node](../node-running/quickstart-running-a-node.md).
4. [Launching a self-managed chain](../launch-orbit-chain/orbit-quickstart.md) using Arbitrum Orbit.
5. [Educational materials](../intro) that explain how these technologies work.

Contributions to each of these content areas are welcome from the entire Ethereum community.

This document provides an overview of the **protocols** and **content conventions** that we use to craft, organize, and publish documentation. Familiarity with [Markdown](https://www.markdownguide.org/basic-syntax/) syntax, Github, and [Docusaurus](https://docusaurus.io/docs) is expected.

## Protocols

The following protocols help us process contributions efficiently:

### New "core docs" protocol

**Core docs** are documents that help readers use Arbitrum products directly. If a document isn't in a `Third-party content` folder in the sidebar, it's a core document.

Although Offchain Labs is responsible for producing and maintaining core docs, contributions are welcome from all. To contribute a new core doc:

1.  Begin by creating a branch of the [Arbitrum docs repo](https://github.com/OffchainLabs/arbitrum-docs).
2.  Issue a `Draft` pull request from your branch into `master`. Pull requests into `master` generate a preview of your changes via a branch-specific Docusaurus deployment; this preview will update as you push commits to your remote branch.
3.  Include answers to the following questions in your PR description:
    ```markdown
    1. Audience: Who am I writing for?
    2. Problem: What specific problem are they trying to solve?
    3. Discovery: How are they looking for a solution to this problem? What search terms are they using?
    4. Document type: Which document type is most suitable?
    5. Validated demand: How do we know that this documentation is actually needed?
    6. Policy acknowledgment (Third-party docs only): Do you agree to the third-party content policy outlined within "Contribute docs"?
    ```
4.  As you craft your contribution, refer to the [document types](#document-type-conventions), [Style guidance](#style-conventions), and other conventions below.
5.  Mark your PR as `Open` when it's ready for review.

### New "third-party docs" protocol

**Third-party docs** are documents that help readers of Arbitrum docs use partners' products (like the ones listed in the [Arbitrum portal](https://portal.arbitrum.io/)) with Arbitrum products. These are generally authored by partner teams, but can be authored by anyone.

The protocol for creating new third-party docs is the same as that of [Creating new core documents](#creating-new-third-party-documents), with the following additions:

1.  **Eligibility**
    - For now, you can only add third-party docs if your project is listed in the [Arbitrum portal](https://portal.arbitrum.io/).
    - To submit your project to the Arbitrum portal, [apply using this Google form](https://docs.google.com/forms/d/e/1FAIpQLSezhBlPgKIKKWgXKUz4MmlJPdHyfmPQlxUtS48HlRoi0e14_Q/viewform).
2.  **Purpose**
    - The purpose of our `Third-party docs` sections is to **_meet Arbitrum developer (or user) demand for guidance that helps them use non-Arbitrum products with Arbitrum products_**.
    - It's _not_ meant to drive traffic to your product (although that may happen); it's meant to solve problems that our readers are actually facing, which are directly related to Arbitrum products.
    - Partner products that support Arbitrum products aren't automatically eligible; we need to be able to prove to ourselves that our readers actually need the proposed third-party content.
3.  **Maintenance expectations**
    - Offchain Labs can't commit to maintaining third-party docs, but we make it easy for you to maintain them.
    - Ensure that your document's YAML frontmatter contains a `third_party_content_owner` property, with the Github username of the designated maintainer. This person will be assigned to your document's issues and PRs, and will be expected to resolve them in a timely manner.
4.  **Organization**
    - Third-party docs are organized within the `Third-party content` node located at the bottom of each documentation section's sidebar.
    - This node's content is grouped by third-party product. If/when this becomes unwieldy, we'll begin grouping products by [portal](https://portal.arbitrum.io/) category.
5.  **Limited document types**
    - To manage our team's limited capacity, third-party documents must be either **_Quickstarts_**, **_How-tos_**, or **_Concepts_**. See [document types](#document-type-conventions) below for guidance.
6.  **Incremental contributions: One document at a time, procedures first**
    - Third-party document PRs should contain at most one new document.
    - Any given product's first docs contribution should be a **_Quickstart_** or **_How-to_**.
    - Additional documents will be merged only if we can verify that our readers are deriving value from your initial contribution.
    - The way that we verify this isn't yet formally established, and it isn't publicly disclosed. Our current approach combines a number of objective and subjective measures.
7.  **Policy acknowledgment**
    - Before merging third-party documentation PRs, we ask contributors to acknowledge that they've read, understood, and agree with the following policies:
      1. **Content ownership**: As the author, you retain ownership of and responsibility for the content you contribute. You're free to use your content in any way you see fit outside of Arbitrum's docs. Remember that when contributing content to our documentation, you must ensure you have the necessary rights to do so, and that the content doesn't infringe on the intellectual property rights of others.
      2. **License for use**: By contributing your content to our documentation, you grant Offchain Labs a non-exclusive, royalty-free license to use, reproduce, adapt, translate, distribute, and display the content in our documentation. This allows us to integrate your content into our docs and make it available to all users.
      3. **Right to modify or remove**: Offchain Labs reserves the right to modify or remove third-party content from our documentation at any time. This might be necessary due to a range of reasons, such as content becoming outdated, receiving very low pageviews over an extended period, or misalignment with our guidelines or goals.

### Update request protocol

If you'd like to request an update or share a suggestion related to an existing document without submitting a pull request to implement the improvement yourself, click the `Request an update` button located at the top of each published document. This button will lead you to a prefilled Github issue that you can use to elaborate on your request or suggestion.

## Content conventions

Offchain Labs supports [Arbitrum docs](/) and [Prysm docs](https://docs.prylabs.network/docs/getting-started). The following **content conventions** help us maintain consistency across these documentation sets:

### Document type conventions

Every document should be a specific _type_ of document. Each type of document has its own purpose:

| Document type       | Purpose                                                                            | Example(s) to refer to                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Gentle introduction | Onboard a specific reader audience with tailored questions and answers             | [A gentle introduction to Orbit](../launch-orbit-chain/orbit-gentle-introduction.md)                                         |
| Quickstart          | Onboard a specific reader audience with step-by-step "learn by doing" instructions | [Quickstart: Build dApps](/quickstart-solidity-hardhat)                                                                      |
| How-to              | Provide task-oriented procedural guidance                                          | [How to run a local dev node](../node-running/how-tos/local-dev-node.mdx)                                                    |
| Concept             | Explain what things are and how they work                                          | [Token bridging](../asset-bridging.mdx) <br/>[Nodes and networks](https://docs.prylabs.network/docs/concepts/nodes-networks) |
| FAQ                 | Address frequently asked questions                                                 | [FAQ: Run a node](../node-running/faq.md)                                                                                    |
| Troubleshooting     | List common troubleshooting scenarios and solutions                                | [Troubleshooting: Run a node](../node-running/troubleshooting-running-nodes.md)                                              |
| Reference           | Lists and tables of things, such as API endpoints and developer resources          | [RPC endpoints and providers](../node-running/node-providers.mdx)                                                            |

This isn't an exhaustive list, but it includes most of the document types that we use.

### Style conventions

The following style guidelines provide a number of loose recommendations that help us deliver **a consistent content experience** across our docs:

1.  **Casing**
    - Sentence-case "content labels": document titles, sidebar titles, menu items, section headers, etc.
2.  **Linking**
    - Avoid anchoring links to words like "here" or "this". Descriptive anchor text can help set expectations for readers who may hesitate to click on ambiguous links.
3.  **Separate procedural from conceptual (most of the time)**
    - Within procedural docs like how-tos and quickstarts, avoid including too much conceptual content. Provide only the conceptual information that the target reader _needs_ in order to complete the task at hand. Otherwise, organize conceptual information within conceptual docs, and link to them "just in case" from other docs.
4.  **Voice**
    - Address the reader as "you".
    - Write like you'd speak to a really smart friend who's in a rush.
    - Opt for short, clear sentences that use translation-friendly, plain language.
    - Use contractions wherever it feels natural - this can help convey a friendly and conversational tone.
5.  **Formality**
    - Don't worry too much about formality. The most valuable writing is writing that provides value to readers, and readers generally want to "flow" through guidance.
    - Aim at "informal professionalism" that prioritizes **audience-tailored problem-solving** and **consistent style and structure**.
6.  **Targeting**
    - Don't try to write for everyone; write for a _specific reader persona_ (also referred to as "audience" in this document) who has a _specific need_.
    - Make assumptions about prior knowledge (or lack thereof) and make these assumptions explicit in the beginning of your document.
7.  **Flow**
    - **Set expectations**: Begin documents by setting expectations. Who is the document for? What value will it provide to your target audience? What assumptions are you making about their prior knowledge? Are there any prerequisites?
    - **Value up front**: Lead with what matters most to the reader persona you're targeting. Then, progressively build a bridge that carries them towards task completion as efficiently as possible.
8.  **Cross-linking**
    - We want to maintain both **high discoverability** and **high relevance**. As a general rule of thumb, links to other docs should be "very likely to be useful for most readers". Every link is a subtle call to action; we want to avoid CTA overload.
9.  **Things to avoid**
    - **Symbols where words will do**: Minimize usage of `&` and `/` - spell out words like "_and_" and "_or_".
    - **Jargon**: Using precise technical terminology is ok, as long as your target audience is likely to understand the terminology. When in doubt, opt for clear, unambiguous, _accessible_ language.

Don't stress too much about checking off all of these boxes; we periodically review and edit our most heavily-trafficked docs, bringing them up to spec with the latest style guidelines.

Some important disclaimers:

- **This isn't an exhaustive list**. These are just the min-bar guidelines that will be applied to all new content moving forward.
- **Many of our docs don't yet follow this guidance**. Our small-but-mighty team is working on it! If you notice an obvious content bug, feel free to submit an [issue](https://github.com/OffchainLabs/arbitrum-docs/issues) or [PR](https://github.com/OffchainLabs/arbitrum-docs/pulls).

### Banner conventions

You can use banners (Docusaurus refers to them as ["admonitions"](https://docusaurus.io/docs/markdown-features/admonitions)) to set expectations for your readers and to emphasize important callouts. Use these conservatively, as they interrupt the flow of the document.

#### Public preview content banner

Example:

<PublicPreviewBannerPartial />

Usage:

```
import PublicPreviewBannerPartial from '../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />
```

<br />

#### Under construction banner

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

<br />

#### Community member contribution banner

Example:

:::info Community member contribution

The following document was contributed by @todo-twitter-handle. Give them a shoutout if you find it useful!

:::

Usage:

```
:::info Community member contribution

The following document was contributed by @todo-twitter-handle. Give them a shoutout if you find it useful!

:::
```

### Organization conventions

Our published docs are generally organized like this in the sidebar:

```
📄 Gentle introduction
📄 Quickstart
📂 How-tos
  📄 Write a smart contract
📂 Concepts
  📄 Smart contract
📁 Reference
📄 Troubleshooting
📄 FAQ
📄 Glossary
📄 Contribute docs
📂 Third-party content
  📁 Product A
  📂 Product B
    📄 How to test your smart contract using Product B
```

- This isn't a strict requirement; it's a loose guideline.
- Not all product areas have all types of content.
- Deviating from this pattern can make important content more discoverable to readers. For example, [Developer tools and resources](https://developer.arbitrum.io/for-devs/dev-tools-and-resources/overview) is a root-level collection of reference-type content.
- The sidebar structure that you see in our published docs is determined by the [`sidebars.js` file](https://github.com/OffchainLabs/arbitrum-docs/blob/master/website/sidebars.js) located at the root of the `website` directory.
  - You may notice that our sidebars are currently organized using plain-old objects that specify individual files and folders.
  - We're moving away from this "manual configuration" and towards convention-based [auto-generated sidebars](https://docusaurus.io/docs/sidebar/autogenerated).
  - To ensure that this new approach works with your docs, **all net-new content should be organized within a folder structure that matches the desired sidebar structure**.

<br />

## Frequently asked questions

#### Can I point to my product from core docs? For example - if my product hosts a public RPC endpoint, can I add it to your [RPC endpoints and providers](/node-running/node-providers) page?

These types of contributions are generally **not merged** unless they're submitted by employees of Offchain Labs.

Instead of opening a PR for this type of contribution, click the `Request an update` button at the top of the published document to create an issue. Generally, third-party services are included in core docs only if we can confidently assert that the services are "**trustworthy, highly relevant to the core document at hand, and battle-tested by Arbitrum developers**" under a reasonable amount of scrutiny.

#### Can I use AI-generated content?

"No". By issuing PRs into our docs repo, you're acknowledging that your content has been produced organically. Content produced under the influence of AI/ML tooling, such as ChatGPT, is "strictly not allowed".

#### Should I be wary of contributing to FAQs and Glossaries? It looks like there are some automations configured against these document types.

You're right! We draft FAQs and Glossaries on Notion to make it easier for nontechnical internal contributors to contribute. This content is then published to our docs repo using a script that reads from Notion and writes to Markdown.

You can still submit changes to the Glossary and FAQ markdown files; we manually synchronize these types of changes with Notion content whenever we need to.
