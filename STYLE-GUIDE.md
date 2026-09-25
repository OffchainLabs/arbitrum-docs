# Editorial style guide

The house prose rules for the Arbitrum documentation portal, for anyone writing or reviewing a
page. [CONTRIBUTE.md](CONTRIBUTE.md) holds the workflow: frontmatter, partials, variables, moving
pages, the gates, opening a PR. This file holds the prose. The six-item summary under
[Style conventions](CONTRIBUTE.md#style-conventions) in that file is the short version; everything
below is the long one, and the two do not disagree.

These rules are a standard for new content. A lot of existing pages predate them and are brought up
to spec incrementally, not all at once. Nothing here is enforced by a gate unless this file says so,
which means a reviewer applies it by reading.

## Contents

- [Plain language](#plain-language)
  - [Sentence-level rules](#sentence-level-rules)
  - [One term, one meaning](#one-term-one-meaning)
  - [Words to replace](#words-to-replace)
  - [Phrases to cut](#phrases-to-cut)
  - [Paragraph and page rules](#paragraph-and-page-rules)
- [Linking a term to the glossary](#linking-a-term-to-the-glossary)
- [Terminology](#terminology)
- [What is not here](#what-is-not-here)

## Plain language

Plain language means the reader finds what they need, understands it the first time, and can act on
it. This section applies the ISO 24495-1 principles through the concrete rules of the
[Federal Plain Language Guidelines](https://www.plainlanguage.gov/guidelines/), plus two rules
borrowed from ASD-STE100 Simplified Technical English.

Every rule below is testable in review.

### Sentence-level rules

| Rule                                    | Correct                                                                        | Incorrect                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| **Address the reader as "you"**         | "You must fund the batch poster account."                                      | "Users must ensure their batch poster account is funded."        |
| **Use active voice and name the actor** | "The batch poster compresses transactions and posts them to the parent chain." | "Transactions are compressed and posted to the parent chain."    |
| **Use present tense**                   | "The sequencer orders incoming transactions."                                  | "The sequencer will order incoming transactions."                |
| **One idea per sentence**               | Two sentences of about 15 words each.                                          | One sentence of 40 words with three clauses.                     |
| **Use verbs, not nominalizations**      | "Configure the sequencer."                                                     | "Perform configuration of the sequencer."                        |
| **Put the condition before the action** | "If you run an AnyTrust chain, enable the DA server."                          | "Enable the DA server if you run an AnyTrust chain."             |
| **Use the imperative for steps**        | "Run `yarn build`."                                                            | "You should now proceed to run `yarn build`."                    |
| **State things positively**             | "Wait until the assertion is confirmed."                                       | "Do not continue before the assertion is no longer unconfirmed." |
| **Give concrete numbers**               | "The challenge period is 6.4 days."                                            | "The challenge period takes a while."                            |
| **Reserve must, should, and can**       | must = required, should = recommended, can = optional                          | "should" for a step the reader has no choice about               |

### One term, one meaning

Pick one name for each concept and use it for the whole page. Alternating between synonyms makes the
reader ask whether you mean two different things.

| Concept                            | Pick one and keep it | Don't mix on one page                   |
| ---------------------------------- | -------------------- | --------------------------------------- |
| The chain your app runs on         | child chain          | L2, child chain, Arbitrum chain, rollup |
| The node that orders transactions  | sequencer            | sequencer, sequencing node, the orderer |
| The party that proposes assertions | proposer             | proposer, staker, validator             |

Expand every acronym on first use. Link that first mention to the glossary when an entry exists for
the term, as described under [Linking a term to the glossary](#linking-a-term-to-the-glossary).

### Words to replace

| Don't write             | Write                           |
| ----------------------- | ------------------------------- |
| utilize, leverage       | use                             |
| in order to             | to                              |
| prior to, subsequent to | before, after                   |
| facilitate              | help                            |
| terminate               | end                             |
| sufficient              | enough                          |
| additional              | more                            |
| approximately           | about                           |
| commence, initiate      | start                           |
| in the event that       | if                              |
| at this point in time   | now                             |
| e.g., i.e., etc.        | for example, that is, and so on |

### Phrases to cut

Delete these openers and keep the sentence that follows: "It is important to note that", "Please
note that", "As previously mentioned", "In the context of", "It should be pointed out that".

Never write "simply", "just", "easy", "obvious", or "of course". When the step does not work, these
words tell the reader the fault is theirs.

### Paragraph and page rules

- One topic per paragraph, five lines at most.
- Convert any sentence with three or more conditions into a bulleted list or a table.
- Lead each section with the outcome, then the detail.
- Write headings a reader can scan to find their task.

## Linking a term to the glossary

Glossary terms live in `content/glossary/`, one `.mdx` file per entry, each with an `id` in its
frontmatter. In a page, wrap the term in `<Term>` and give it that id:

```mdx
Save the console output so you can use it with your <Term id="dapp">decentralized app</Term>.
```

The component renders the linked text with the glossary definition in a hover popover. The id is the
entry's `id`, not the words on the page, so the visible text is yours to write: `id="dapp"` above
carries the wording the [terminology table](#terminology) asks for.

Four rules:

- **Once per file, on the first mention.** Leave every later mention of the same term as plain text.
  A second popover on the same term tells the reader nothing new and turns the page into a field of
  links.
- **Only for terms that have an entry.** `pnpm references:check` is a blocking gate and fails the
  build on an id with no matching file, so a typo is caught rather than silently dropped.
- **Add the entry rather than skipping the link** when a term deserves one and has none. A new file
  under `content/glossary/` needs only `id` and `title` in its frontmatter, plus the definition as
  its body.
- **Never inside a partial.** `content/partials/` is off limits for `<Term>` and `<Reference>`, and
  `pnpm references:check` rule R3 fails on one. Put the link in the page that includes the partial.

`<Reference collection="glossary" id="…">` is the general form and `<Term>` is the shorthand for the
glossary collection. Use `<Term>` in pages. `<ReferenceList>` renders a whole collection and belongs
only on the glossary index page.

## Terminology

One spelling, one capitalization, across the whole site.

| Term                                                           | Correct                                                           | Incorrect                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------- |
| JavaScript                                                     | JavaScript                                                        | js, javascript, Javascript             |
| app                                                            | first mention on page: decentralized app<br />later mentions: app | dapp, dApp                             |
| Smart contract                                                 | smart contract, contract                                          | smartcontract                          |
| Cross-chain                                                    | cross-chain                                                       | cross chain, crosschain                |
| Allowlist / denylist                                           | allowlist, denylist                                               | whitelist, blacklist                   |
| ERC-XX (ERC-20, ERC-721, …)                                    | ERC-20, ERC-721, ERC-1155                                         | ERC20, erc721, …                       |
| Sequencer Coordination Manager (unsettled, see the note below) | upstream: Sequencer Coordination Manager (SQM)                    | see the note below                     |
| AnyTrust                                                       | AnyTrust                                                          | anytrust, Anytrust                     |
| Ethereum currency                                              | ETH, Ether, ether                                                 | eth, Eth, `ETH`                        |
| onchain                                                        | onchain                                                           | on-chain, on chain                     |
| Arbitrum chains                                                | "Your Arbitrum chain"                                             | "L3 Orbit chain", "blockchain"         |
| Challenge period                                               | 6.4 days to challenge an assertion                                | confirmation period (a different term) |
| Bond                                                           | bond, bonded funds for proposing                                  | stake, staked funds                    |
| Rollup                                                         | Rollup                                                            | rollup                                 |

**The Sequencer Coordination Manager row is unsettled, so do not act on it yet.** The Correct column
records upstream's wording verbatim, `(SQM)` included, which is upstream's initialism and not an
abbreviation of either expansion. Measured over `content/docs`, this repo's own pages say
"Coordinator Manager" 18 times (15 capitalized, 3 lowercase) against "Coordination Manager" 3
times, one page is filed at `run-sequencer-coordination-manager.mdx` while its own title says
Coordinator, and Nitro's flag family is `node.seq-coordinator.*`. Naming the tool is the docs
owner's call and was requested in FS-2708, so leave both spellings alone until it lands.

## What is not here

- **Document types.** Which of `how-to`, `concept`, `quickstart`, `tutorial`, `reference`,
  `troubleshooting` or `faq` a page is, and what each one owes the reader, is in
  [CONTRIBUTE.md](CONTRIBUTE.md#document-type-conventions). The enum itself is enforced by the
  frontmatter schema in `source.config.ts`.
- **Callout syntax.** Use `<VanillaAdmonition type="…">`. Docusaurus `:::` directives do not render
  here, and `pnpm content:lint` rule A3 is a blocking gate that fails on one.
- **Diagrams.** Prefer SVG for scalable, editable diagrams; use PNG when SVG is unsuitable. Concept
  diagrams follow the `arbitrum-brand-svg-diagrams` skill under `.claude/skills/`, which covers the
  palette, asset location, and an Excalidraw editing workflow.

This file replaces the Offchain Labs pattern guide that lived in the Docusaurus repo
(`OffchainLabs/arbitrum-docs`, `docs/Offchain-pattern-guide.md`). That repo is being archived, so
this is the live copy.
