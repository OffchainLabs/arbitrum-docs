# TW-711 branch: closing the outstanding audit gaps

**Date:** 2026-08-03
**Branch:** `tw711`, stacked on `tw766` (BoLD operational guide)
**Spec location note:** this file lives in `.claude/specs/` rather than the
skill-default `docs/superpowers/specs/` because `docs/` is routed at `/` by
Docusaurus — a spec there would publish to the public site and would fail the
repo's mandatory frontmatter convention.

## Background

An audit produced ten candidate documentation gaps (TW-711 through TW-715 plus
cross-cutting items). Validation against the repo found five already closed,
largely by the `BoLD operational guide` work on `tw766` and by the
`@signalwire/docusaurus-plugin-llms-txt` integration. This spec covers the four
that remain and that the user selected.

Closed, not covered here: validator interval tuning (TW-711 proper — all flags
are in `cli-flags-reference.mdx`), third-party infrastructure integration
(TW-714 — Helm, Prometheus, Docker, Blockscout all already covered), `llms.txt`
(plugin is live), and non-English content plus the product timeline (deferred by
scope decision, not resolved).

## Source of truth

Parameter values come from `OffchainLabs/nitro` at master (`a618155`), obtained
by sparse clone. Values asserted in this spec and traceable to source:

| Value | Source |
| --- | --- |
| BoLD `assertion-posting-interval` 15m, `assertion-scanning-interval` 1m, `assertion-confirming-interval` 1m, `minimum-gap-to-parent-assertion` 1m | `staker/bold/bold_staker.go:138-158` |
| BoLD `parent-chain-block-time` 12s, `rpc-block-number` `finalized`, `max-get-log-blocks` 5000 | `staker/bold/bold_staker.go:138-158` |
| Legacy `staker-interval` 1m, `make-assertion-interval` 1h, `confirmation-blocks` 12 | `staker/legacy/staker.go:171-191` |
| Legacy test preset: `staker-interval` 10ms, `make-assertion-interval` -1000h, `confirmation-blocks` 0 | `staker/legacy/staker.go:193-212` (`TestL1ValidatorConfig`) |
| No BoLD test preset exists | `grep TestBoldConfig` returns nothing |
| `EnableFastConfirmation` default false, both stakers; implemented via Safe multisig | `staker/legacy/staker.go:190`, `staker/bold/bold_staker.go:156`, `staker/legacy/fast_confirm.go` |
| Default HTTP API is `net, web3, eth, arb` | `cmd/genericconf/server.go:27` + OffchainLabs/go-ethereum `node/defaults.go:65` |
| Nitro assumes 500-block parent-chain `eth_getLogs` ceiling as a client | `arbnode/mel/runner/mel.go:61` |

Two of these corrected working assumptions and changed the deliverable:

1. **Nitro imposes no `eth_getLogs` block-range cap of its own.** The 499 and
   5000 figures are Nitro acting as a client against its parent chain. The doc
   must therefore say range limits are provider-imposed, not Nitro-imposed.
2. **`EnableFastConfirmation` is not a test speedup.** It is the Safe-multisig
   fast-confirmation path already documented in `fast-withdrawals.mdx`. The
   testing page must explicitly disambiguate, or it will steer readers into a
   production trust assumption.

## Deliverable 1: test chain configuration page

**New file:** `docs/launch-arbitrum-chain/chain-config/validation/test-chain-configuration.mdx`
**Sidebar:** `sidebars.js`, Validation category, inserted after `fast-withdrawals`
and before `compliance-filtering`.
**Covers:** TW-712 and the cross-cutting "challenge period on testnets" item,
merged because both are the same question — which parameters differ when the
chain is not production.

Structure:

1. **What gates confirmation speed** — the two independent layers: contract
   parameters (`confirmPeriodBlocks`, `minimumAssertionPeriod`) set the floor,
   node intervals determine how promptly a validator acts within that floor.
   Lowering only one has no effect.
2. **Contract-side parameters** — cross-reference `challenge-period.mdx` rather
   than restating it. The posting interval must exceed the Rollup's
   `minimumAssertionPeriod` (per `assertion-control.mdx`), so lowering the
   interval for a test chain requires lowering `minimumAssertionPeriod` too.
   During implementation, confirm from nitro or the contracts what actually
   happens when the interval is set below it, and describe that observed
   behavior rather than inferring it.
3. **Node-side intervals** — table of BoLD and legacy flags with verified
   defaults and the direction to move them for a test chain.
4. **Worked fast-test example** — the legacy `TestL1ValidatorConfig` values,
   attributed to nitro's own test harness, including an explanation of why
   `make-assertion-interval` is negative (the elapsed-time check always passes).
   State plainly that BoLD has no upstream equivalent preset and the flags must
   be set individually.
5. **The `finalized` pitfall** — `rpc-block-number` defaults to `finalized`; on
   a local devnet or a chain whose parent has slow or absent finality, a
   validator looks hung for reasons unrelated to intervals. Link to the
   "Parent-chain read consistency" section of `validator-troubleshooting.mdx`.
6. **Callouts** — a `<VanillaAdmonition type="caution">` that these values are
   unsafe for production, and a second that this is distinct from fast
   withdrawals, linking to `fast-withdrawals.mdx`.

Out of scope: minimum *safe* interval values for production. Nitro defines
defaults, not safety floors; asserting a floor would require SME input.

## Deliverable 2: RPC method additions

**File:** `docs/arbitrum-essentials/arbitrum-vs-ethereum/rpc-methods.mdx`, two
appended subsections. No new page, no sidebar change.

1. **`txpool` methods** — not in the default HTTP module set (`net, web3, eth,
   arb`), so `txpool_contentFrom` and siblings return method-not-found until
   `txpool` is added to `--http.api`. Note that even when enabled, mempool
   semantics differ from Ethereum because the sequencer orders transactions;
   link to the existing `nonce-management.mdx` page.
2. **`eth_getLogs` block ranges** — Nitro enforces no cap; observed limits come
   from RPC providers. For context, Nitro itself chunks parent-chain log queries
   at 499 blocks and BoLD reads at 5000, which indicates the range real
   providers tolerate.

## Deliverable 3: error message index

**New file:** `docs/launch-arbitrum-chain/operate/error-index.mdx`
**Sidebar:** `sidebars.js`, Operate category, after `bold-upgrade-playbook`
(alphabetical).
**Form:** pure router — verbatim error string, one-line likely cause, deep link
to the section that already explains it. No duplicated explanation, so the index
cannot drift out of sync with its sources.

Grouped by component, seeded from the pages that contain genuinely verbatim
strings:

- **Batch poster** — approximately 30 log and error strings from
  `batch-poster-troubleshooting.mdx`, spanning mempool, retry, revert,
  nonce/sync, fee/pricing, L1 bounds/reorg, DA fallback, lock/coordination, and
  config/startup sections.
- **Validator** — the three from `validator-troubleshooting.mdx`:
  `ASSERTION_NOT_EXIST`, `error initializing staker: ... no contract code at
  given address`, and `found incorrect assertion in watchtower mode`.

Deliberately scoped to chain-operator errors, which is why the page sits under
`operate/`. Excluded from v1:

- `docs/stylus/troubleshooting/common-issues.mdx` — already a well-structured
  troubleshooting page, and its headings are descriptive ("Activation failed")
  rather than verbatim strings, so routing adds little.
- The six `_troubleshooting-*-partial.mdx` files — Q&A-shaped rather than
  error-shaped, so they do not fit the paste-your-error premise.

If a follow-up wants site-wide coverage, the index generalizes by adding groups;
the routing structure does not need to change.

## Deliverable 4: creator sequencing

**File:** `docs/launch-arbitrum-chain/quickstart/sdk-introduction.mdx`, one added
subsection. No new page, no sidebar change.

Explain that deploying a chain and deploying its token bridge are two separate
factory calls in sequence: `RollupCreator` first, producing the core contracts
and the inbox; `TokenBridgeCreator` second, taking that chain's `rollup` or
`inbox` address as input. Note that the token bridge step sends retryable
tickets to the child chain, which is why it can require gas-token allowance on a
custom-gas-token chain. Link to `deploy/token-bridge.mdx` for the full procedure
and `deploy/canonical-factory-contracts.mdx` for addresses.

## Conventions to honor

Every new page needs the seven mandatory frontmatter fields (`title`,
`sidebar_label`, `description`, `user_story`, `content_type`, `author`, `sme`).
Use `<VanillaAdmonition>` rather than `:::` directives. Sentence-case headings.
Tag shell blocks `shell`. Wrap first mentions of glossary terms in
`<a data-quicklook-from="…">` — relevant keys here include `parent-chain`,
`child-chain`, `validator`, `sequencer`, `batch-poster`, `bold`,
`challenge-period`, `assertion`, `confirmation`. Prefer "To learn how X works,
see Y" over "For how X works, see Y".

## Verification

`yarn build` must pass — `onBrokenLinks: 'throw'` makes every cross-reference in
the error index load-bearing, and the index is nearly all cross-references.
Also run `yarn lint:markdown`, `yarn format`, and `yarn find-orphan-pages` to
confirm both new pages are reachable from a sidebar.

## Open item for review

The value tables in deliverable 1 are traceable to nitro master and are
therefore accurate as of `a618155`, but nitro's defaults can change between
releases. They need SME confirmation before merge.

Carry that flag as an HTML comment in the page source, immediately above each
affected table, so it is visible in the diff and to anyone editing the file but
never rendered on the site:

```markdown
<!--
SME REVIEW: values below read from OffchainLabs/nitro at a618155
(staker/bold/bold_staker.go:138-158, staker/legacy/staker.go:171-212).
Confirm they still match the Nitro release this page targets.
-->
```

HTML comments are safe here: they are already used at top level in `.mdx` files
across this repo (for example `docs/notices/fusaka-upgrade-notice.mdx:60` and a
multi-line block at `docs/run-arbitrum-node/06-troubleshooting.mdx:412`), the
`markdownPreprocessor` does not touch them, and they do not reach rendered
output. Do not use `{/* */}` for these — both work in MDX, but the HTML form
matches the existing convention in this repo, including the `<!-- todo: ... -->`
reviewer notes already in `06-troubleshooting.mdx`.

Repeat the same comment above the interval table in deliverable 1 and, if any
nitro-sourced value ends up in deliverable 2, above that too. The PR description
should still cite the commit, but the inline comment is what survives after
merge.
