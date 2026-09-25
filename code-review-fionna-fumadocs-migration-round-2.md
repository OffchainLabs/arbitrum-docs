# Code Review, Round 2: `fionna/fumadocs-migration`

## Context

- Review target: the current working tree on `fionna/fumadocs-migration`.
- Base branch: freshly fetched `origin/fumadocs` at `0afea2181d1b73cd7fe443f492c05daab953d5e6`, as requested.
- Comparison: `HEAD` equals the base commit, so every reviewed change is uncommitted. This review includes tracked changes and relevant untracked migration files.
- PR: `gh pr view` found no PR. Intent is inferred from the Fumadocs migration and the previous review/fix round.
- Scope: new findings from a second pass. The earlier findings and fixes are recorded in `code-review-fionna-fumadocs-migration.md`.

## Verdict

The original review found seven actionable issues. All seven have now been fixed and verified in the working tree. Enabling the skipped HTTP suite also exposed a Markdown routing failure; that routing fix passes the built-site suite locally. Production edge cache behavior still needs deployment-level verification.

## Findings

### High: Preserve the base's Nitro release pin and update stale examples

- Location: `content/vars.json:8-10`; examples include `content/docs/run-a-node/sequencer/run-sequencer-node.mdx:129`, `content/docs/launch-arbitrum-chain/configuration/data-availability/das-docker-deployment.mdx:75-96`, and `content/docs/launch-arbitrum-chain/configuration/core/customize-stf.mdx:61`.
- Issue: The shared image and source tag move backward from the base's `v3.11.4-7d5ac27` / `v3.11.4` to `v3.11.3-beb2108` / `v3.11.3`; the go-ethereum commit moves with them. Multiple newly edited instructions go further back to `v3.9.9` (and some to `v3.9.4`). The DAS Docker page even mixes a `v3.11.3` key-generation command with a `v3.9.9` deployment image.
- Impact: Readers get conflicting versions and older flags or binaries than the current reference pages. The generated CLI reference is also tied to the downgraded release.
- Recommendation: Restore the intended release pin from `fumadocs` (or document and verify a deliberate release change), then audit literal image tags and clone commands against that pin. Keep genuinely historical examples explicitly versioned.

### High: Restore current AnyTrust node configuration and batch limits

- Location: `content/docs/run-a-node/sequencer/run-sequencer-node.mdx:80-129`; `content/docs/launch-arbitrum-chain/arbitrum-chain-sdk-preparing-node-config.mdx:60-81`; `content/docs/launch-arbitrum-chain/configuration/data-availability/data-availability-committees/dac-configuration-defaults.mdx:55-56`.
- Issue: The sequencer guide replaces `--node.batch-poster.max-calldata-batch-size` and the separate `--node.da.anytrust.max-batch-size` with deprecated `max-size`. It also restores `--node.data-availability.sequencer-inbox-address` and `parent-chain-node-url`. The Chain SDK config example puts `sequencer-inbox-address`, `parent-chain-node-url`, and aggregator objects directly under `node` instead of `node.da.anytrust`. The base explained the v3.10+ namespace change and omitted these removed node-side keys. Nitro retains migration support for _some_ `node.data-availability.*` aliases, but the removed parent-chain fields and flat JSON shape are not registered node configuration.
- Impact: Operators following the JSON example or copying the sequencer command into a current Nitro image can fail startup or leave AnyTrust batch sizing wrong.
- Recommendation: Restore the current `node.da.anytrust` examples, correct parent-chain settings, and separate calldata and AnyTrust batch limits. Check every example against the generated CLI reference and the configured Nitro tag.

### High: DAS deployment recipes use removed tools, flags, and storage migration

- Location: `content/docs/launch-arbitrum-chain/configuration/data-availability/data-availability-committees/deploy-das.mdx:55-61,115-133,191-193,239-242`; `deploy-mirror-das.mdx:77-82,109,138-140,191-192`; `configure-dac.mdx:85`.
- Issue: The migration removes the base's Nitro v3.10 rename warning, changes `anytrustserver`/`anytrusttool` back to `daserver`/`datool`, and changes parent-chain flags back to `--data-availability.parent-chain-node-url` and `sequencer-inbox-address`. It also tells readers to use `--data-availability.migrate-local-db-to-file-storage`, although the base says that option was removed in v3.8.0. The local Nitro `v3.11.3` Dockerfile and Makefile ship/build `anytrustserver` and `anytrusttool`, not the old binaries; the removed migration flag is absent from both `v3.9.9` and `v3.11.3` source.
- Impact: The steps do not work with the site-wide Nitro image and the Badger migration advice points to a nonexistent flag. Pinning the examples to a `v3.9.9` image hides the tool rename while leaving the removed migration instruction wrong.
- Recommendation: Restore the renamed tools and current flags, remove the obsolete storage option and migration command, and give pre-v3.8 migration instructions only as a clearly versioned historical procedure.

### High: Keep a production warning around the validator bypass

- Location: `content/docs/launch-arbitrum-chain/configuration/core/customize-stf.mdx:73-94,165`.
- Issue: The base warned that a customized STF will not match the verified WASM module root and that production use requires coordination. The new page removes that warning and says operators “have to” set `node.staker.dangerous.without-block-validator` after building the custom image. Nitro `v3.11.3` describes this flag as allowing an L1 validator without a block validator, and its code suppresses validator setup when the flag is set.
- Impact: A chain operator can run a staker without local block validation while following what appears to be the standard procedure. The later instruction to remove the flag after setting the WASM root does not protect the intervening period or explain where this is safe.
- Recommendation: Restore the production warning and scope the bypass to a clearly isolated test setup, if it is needed at all. Explain the validator and WASM-root prerequisites before any production operation.

### High: Restore the real external DA provider flags

- Location: `content/docs/launch-arbitrum-chain/integrations/da-api-integration-guide.mdx:1852-1867,1927`.
- Issue: Valid `--node.da.external-provider.*` options were rewritten as `-node.da-provider.*` or `--node.da-provider.*`. The single-dash forms are malformed CLI syntax, and `node.da-provider` is absent from the generated CLI reference. That reference still lists `node.da.external-provider.use-data-streaming` and the corresponding stream method and chunk-size options.
- Impact: The streaming integration instructions cannot enable the feature or customize its RPC methods on the documented Nitro release.
- Recommendation: Restore `--node.da.external-provider.*` consistently in the streaming section and check the entire guide against the CLI reference.

### Medium: Retain Inkeep's cookie opt-outs

- Location: `lib/inkeep.ts:63-76`.
- Issue: Refactoring `inkeepBaseSettings` into a hook removed `privacyPreferences: { optOutAnalyticalCookies: true, optOutFunctionalCookies: true }`. There is no replacement setting elsewhere. Installed `@inkeep/cxkit-primitives@0.5.119` defaults both options to `false`; its user provider persists a visitor ID and its browser storage selects cookies when functional cookies are allowed.
- Impact: Search and chat regain persistent Inkeep cookies and a returning-visitor ID, reversing behavior explicitly established in the base. The separate PostHog cookieless setting does not govern Inkeep storage.
- Recommendation: Carry the two privacy preferences into `baseSettings`, and add a focused assertion for the effective settings so future analytics refactors keep this behavior.

### Medium: Run the HTTP suite in CI instead of skipping all six tests

- Location: `scripts/static-docs-http.test.ts:11,64,242,285,319,370,419`; `.github/workflows/ci.yml:45,98-108`.
- Issue: Every top-level HTTP test uses `skip: !baseUrl`; `baseUrl` only comes from `STATIC_DOCS_TEST_URL`. CI runs `pnpm test` without that variable, while the separate, nonblocking Build job only runs `pnpm build`. The test file's comment that the Build job supplies a URL is stale.
- Impact: Route negotiation, markdown mirrors, caching headers, and metadata tests are always skipped in CI even though this migration changes the proxy, routing, and a Next response-header patch. Local `pnpm test` likewise reported six skips in the prior verification.
- Recommendation: After a production build, start the app and run this suite with `STATIC_DOCS_TEST_URL` set in a blocking job. If the full build must remain nonblocking, run a narrower blocking smoke test for the changed routing and headers.

## Test Expectations

- Branch intent: a documentation-platform migration with user-visible routing, search, analytics, and operational guide changes.
- Expected coverage: existing script checks and build, plus an HTTP smoke test for the new routes and headers. Nitro command examples need version-aware verification against the pinned source or CLI reference. Privacy settings need a regression assertion.
- Present coverage: the previous fix round ran the script suite and build successfully, but the six HTTP tests skipped. Static checks do not validate shell commands inside MDX or Inkeep's effective storage preferences.

## Unexpected Changes

- Multiple docs revert current Nitro operational guidance while migrating the site framework. These changes are substantive and unrelated to Fumadocs rendering.
- The Inkeep integration changes browser persistence, which is a runtime behavior change beyond a UI port.
- The earlier deletion audit found replacement routes and ported content for the 82 tracked deletions; this pass found its strongest regressions in surviving pages and shared settings, not a newly lost deleted page.

## Validation

- Compared the working tree directly with freshly fetched `origin/fumadocs`; inspected the affected page diffs, shared settings, CI workflow, HTTP tests, and generated CLI reference.
- Cross-checked Nitro `v3.9.9` and `v3.11.3` tags in the local Nitro repository for Docker binaries, removed migration flags, replay binary filenames, and the dangerous validator option.
- Inspected the installed Inkeep package defaults and storage implementation.
- No new build or full test run was needed for this read-only review. The previous round's unchanged working tree passed `pnpm test` (600 passed, 6 skipped), `pnpm build`, type, formatting, content, link, navigation, and reference checks. Commands embedded in docs and the deployed HTTP behavior were not executed.

## Notes

- No PR description was available, so intentional release downgrades or platform-specific runtime tradeoffs could not be confirmed from PR context.
- The findings above record the state at the time of the review. The fixes below were made afterward at the user's request.

## Fix verification

- Restored the base's Nitro `v3.11.4` image, source, and go-ethereum pins; repaired newly regressed literal image examples and added release sync markers. Regenerated the CLI reference from the actual `v3.11.4` source and its go-ethereum submodule: 783 published flags. Historical release notices and unchanged version-specific clone examples remain versioned as before.
- Restored `node.da.anytrust` settings, valid parent-chain configuration, and separate calldata and AnyTrust batch limits in the sequencer, Chain SDK, and DAC defaults guides. The DAC defaults page now distinguishes legacy SDK output from the converted Nitro configuration.
- Restored `anytrustserver`/`anytrusttool`, supported parent-chain and client flags, and current images across the DAS guides. Removed the obsolete Badger storage option from deployment instructions and removed its unused parameter partial; regenerated the partial catalog.
- Restored the customized-STF production warning and scoped pre-WASM-root testing to a non-staking local node. Removed the general instruction to bypass block validation, restored the matching Nitro source/replay filenames, and repaired links to the renamed step.
- Restored `--node.da.external-provider.*` flags throughout the streaming section of the DA API integration guide.
- Restored both Inkeep cookie opt-outs in `lib/inkeep.ts`, preserving memory-only analytical identity and session storage for functional state.
- Made the build and HTTP smoke suite blocking in CI. The first real HTTP run revealed that Next 16 returned 404 for proxy-rewritten Markdown despite direct mirror URLs working. Public `.md` paths now use `beforeFiles` rewrites; negotiated requests pass a proxy-controlled preference header to a header-matched rewrite. The proxy strips forged client markers, and the HTTP suite covers that case.

### Validation after fixes

- Passed: `pnpm build` (1,071 static pages), `pnpm types:check`, `pnpm test` (600 passed, 6 HTTP tests skipped in the generic command), `pnpm format:check`, `pnpm vars:check`, `pnpm content:lint`, `pnpm check-links`, `pnpm partials:check`, and `git diff --check origin/fumadocs`.
- Passed against `next start`: `STATIC_DOCS_TEST_URL=http://127.0.0.1:3000 node --test scripts/static-docs-http.test.ts` (32/32, no skips). CI now runs this suite after its build.
- `pnpm partials:check` retains 211 nonblocking warnings. The build retains an advisory warning about three modified versioned-document files. Local Node is v26 although the project requests v22; the checks above passed.
- A deployed Vercel edge cache and the operational Nitro commands were not exercised end to end.
