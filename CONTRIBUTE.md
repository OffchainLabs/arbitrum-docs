
Thank you for considering contributing to the Arbitrum documentation! We're excited to have you on board.

The [`docs.arbitrum.io`](https://docs.arbitrum.io/) docs portal is the **single source of truth** for documentation that supports Offchain Labs' product portfolio. Contributions are welcome from the entire Ethereum community.

This document shows you how to craft and publish Arbitrum documentation. There is an expectation to have familiarity with [Markdown](https://www.markdownguide.org/basic-syntax/) syntax, Github, and [Docusaurus](https://docusaurus.io/docs).

### Add a new core document

If a document isn't in a `Third-party content` sidebar node, it's a **core document**. To contribute a new core doc:

1.  Begin by creating a branch (internal) or fork (external) of the [Arbitrum docs repo](https://github.com/OffchainLabs/arbitrum-docs).
2.  Issue a `Draft` pull request into `master`. Pull requests into `master` will generate a preview of your changes via a PR-specific Docusaurus deployment; this preview will update as you push commits to your remote.
3.  Include answers to the following questions in your PR description:
    ```markdown
    1. Audience: Who am I writing for?
    2. Problem: What specific problem are they trying to solve?
    3. Discovery: How are they looking for a solution to this problem? What search terms are they using?
    4. Document type: Which document type is most suitable?
    5. Policy acknowledgment (Third-party docs only): Do you agree to the third-party content policy outlined within "Contribute docs"?
    ```
4.  As you craft your contribution, refer to the [document types](#document-type-conventions), [Style guidance](#style-conventions), and other conventions below.
5.  Mark your PR as `Open` when it's ready for review.

### Add a new third-party document

**Third-party docs** are documents that help readers of Arbitrum docs use other products, services, and protocols (like the ones listed in the [Arbitrum portal](https://portal.arbitrum.io/)) with Arbitrum products.

See [Contribute third-party docs](https://docs.arbitrum.io/for-devs/third-party-docs/contribute) for detailed instructions.

### Request an update

If you'd like to request an update or share a suggestion related to an **existing document** without submitting a pull request to implement the improvement yourself, click the `Request an update` button at the top of each published document. This button will lead you to a prefilled Github issue that you can use to elaborate on your request or suggestion.

### Add a new translation page

If you would like to participate in translating the Arbitrum docs, you can:

1. Check if `/website/i18n` has a corresponding language (currently there are `ja` and `zh`). If not, you can use the following command to add it (we take adding French as an example):

```
cd ./website
npm run write-translations -- --locale fr
```

It will help generate folder `website/i18n/fr`.

2. Create the folders `current` and `translated` under the newly generated folder `website/i18n/fr/docusaurus-plugin-content-docs`:

```
mkdir i18n/{Your_language}/docusaurus-plugin-content-docs/current && mkdir i18n/{Your_language}/docusaurus-plugin-content-docs/translated
```

3. Translate one of more docs files located in `/arbitrum-docs`.

4. Place the translated document into the folder `i18n/{Your_language}/docusaurus-plugin-content-docs/translated` according to its relative path in `arbitrum-docs`. For example, if you translated `/arbitrum-docs/how-arbitrum-works/arbos/introduction.md`, then its path in `i18n` should be `i18n/{Your_language}/docusaurus-plugin-content-docs/translated/how-arbitrum-works/arbos/introduction.md`.

Test run:

1. Check that the `i18n` settings in `website/docusaurus.config.js` have included your new language:

```
i18n: {
    defaultLocale: 'en',
    // locales: ['en', 'ja', 'zh'],
    locales: ['en'], // You can add your new language to this array
  },
```

2. Check whether the `locale Dropdown` component exists in navbar, if not, add it:

```
navbar: {
    title: 'Arbitrum Docs',
    logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
        href: '/welcome/arbitrum-gentle-introduction',
    },
    items: [
        // note:  we can uncomment this when we want to display the locale dropdown in the top navbar
        //        if we enable this now, the dropdown will appear above every document; if `ja` is selected for a document that isn't yet translated, it will 404
        //        there may be a way to show the dropdown only on pages that have been translated, but that's out of scope for the initial version
        {
        type: 'localeDropdown',
        position: 'right',
        }
    ],
},
```

2. Build translation and docs:

```
yarn build_translation && yarn build
```

6. Start docs:

```
npm run serve
```

<br />

---

### Document type conventions

Every document should be a specific _type_ of document. Each type of document has its own purpose:

| Document type | Purpose |
| ------------- | ------- |
| Gentle introduction | Onboard a specific reader audience with tailored questions and answers |
| Quickstart | Onboard a specific reader audience with step-by-step "learn by doing" instructions |
| How-to | Provide task-oriented procedural guidance |
| Concept | Explain what things are and how they work |
| FAQ | Address frequently asked questions |
| Troubleshooting | List common troubleshooting scenarios and solutions |
| Reference | Lists and tables of things, such as API endpoints and developer resources |

This isn't an exhaustive list, but it includes most of the document types that we use.

### Style conventions

The following style guidelines provide recommendations that help us deliver **a consistent content experience** across our docs:

1.  **Casing**
    - Sentence-case "content labels": document titles, sidebar titles, menu items, section headers, etc.
2.  **Linking**
    - Avoid anchoring links to words like "here" or "this". Descriptive anchor text can help set expectations for readers who may hesitate to click on ambiguous links. When linking to docs, link to the document's title verbatim.
3.  **Titling**
    - Titles should balance brevity with precision - _Node running overview_ is preferred to _Overview_. This format helps with SEO and reader UX.
4.  **Separate procedural from conceptual (most of the time)**
    - Avoid including too much conceptual content within procedural docs like how-tos and quickstarts. Provide only the conceptual information that the target reader _needs_ to complete the task. Otherwise, organize conceptual information within conceptual docs and link to them "just in case" from other docs.
5.  **Voice**
    - Address the reader as "you".
    - Write like you'd speak to a really smart friend who's in a rush.
    - Opt for short, clear sentences that use translation-friendly, plain language.
    - Use contractions wherever they feel natural. This approach can help convey a friendly and conversational tone.
6.  **Formality**
    - Don't worry too much about formality. The most valuable writing provides value to readers, and readers generally want to "flow" through guidance.
    - Aim at "informal professionalism" that prioritizes **audience-tailored problem-solving** and **consistent style and structure**.
7.  **Targeting**
    - Don't try to write for everyone; write for a _specific reader persona_ (also referred to as "audience" in this document) with a _specific need_.
    - Make assumptions about prior knowledge (or lack thereof) and make these assumptions explicit at the beginning of your document.
8.  **Flow**
    - **Set expectations**: Begin documents by setting expectations. Who is the document for? What value will it provide to your target audience? What assumptions are you making about their prior knowledge? Are there any prerequisites?
    - **Value upfront**: Lead with what matters most to your target reader persona. Then, progressively build a bridge that carries them toward task completion as efficiently as possible.
9.  **Cross-linking**
    - We want to maintain both **high discoverability** and **high relevance**. Generally, links to other docs should be "very likely useful for most readers". Every link is a subtle call to action; we want to avoid CTA overload.
10. **Things to avoid**
    - **Symbols where words will do**: Minimize usage of `&` and `/` - spell out words like "_and_" and "_or_".
    - **Jargon**:  precise technical terminology is ok if your target audience is likely to understand the terminology. When in doubt, opt for clear, unambiguous, _accessible_ language.

Don't stress too much about checking off all these boxes; we periodically review and edit our most heavily trafficked docs, bringing them up to spec with the latest style guidelines.

Some important disclaimers:

- **This isn't an exhaustive list**. These are just the minimum guidelines applicable to all new content moving forward.
- **Many of our docs don't yet follow this guidance**. Our small-but-mighty team is working on it! If you notice an obvious content bug, feel free to submit an [issue](https://github.com/OffchainLabs/arbitrum-docs/issues) or [PR](https://github.com/OffchainLabs/arbitrum-docs/pulls).

### Banner conventions

You can use banners (Docusaurus refers to them as ["admonitions"](https://docusaurus.io/docs/markdown-features/admonitions)) to set expectations for your readers and to emphasize important callouts. Use these conservatively, as they interrupt the flow of the document.

#### Under construction banner

Example:

:::caution UNDER CONSTRUCTION

The following steps are under construction and will be updated with more detailed guidance soon. Stay tuned, and don't hesitate to click this document's `Request an update` button if you have any feedback.

:::

Usage:

```
:::caution UNDER CONSTRUCTION

The following steps are under construction and will be updated with more detailed guidance soon. Stay tuned, and don't hesitate to click this document's `Request an update` button if you have any feedback.

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

### Frequently asked questions

#### Can I point to my product from core docs? For example - if my product hosts a public RPC endpoint, can I add it to your [RPC endpoints and providers](https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info#third-party-rpc-providers) section?

These types of contributions are generally **not merged** unless they're submitted by employees of Offchain Labs.

Instead of opening a PR for this type of contribution, click the `Request an update` button at the top of the published document to create an issue. Generally, third-party services are included in core docs only if we can confidently assert that the services are "**trustworthy, highly relevant to the core document at hand, and battle-tested by Arbitrum developers**" under a reasonable scrutiny.

#### How long does it take for my third-party content contribution to be reviewed?

Our small-but-mighty team is continuously balancing competing priorities, so we can't guarantee a specific turnaround time for third-party docs PRs. They're processed in the order in which they're received, generally within a week or two.

#### Is there any way to expedite third-party content contribution reviews?

The most effective way to expedite processing is to ensure that your PR incorporates the conventions outlined in this document. Please don't ask for status updates - if you've submitted a PR, it's on our radar!
