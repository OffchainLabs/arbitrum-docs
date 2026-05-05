# Copilot instructions for arbitrum-docs

This repo is the source for [docs.arbitrum.io](https://docs.arbitrum.io), built with Docusaurus. Content is the product. Trust these instructions; only search the repo when something here is incomplete or demonstrably wrong.

## Repository at a glance

- **Type:** Docusaurus 3 documentation site (TypeScript + React + MDX).
- **Runtime:** Node `22.x` (pinned in `package.json` `engines` and every workflow). Yarn classic (`yarn.lock` is committed).
- **Size:** ~900MB with deps; docs tree is thousands of `.md`/`.mdx` files. `sidebars.js` is ~61KB and `vercel.json` is ~87KB — edit them by search, not by reading end-to-end.
- **Output:** A static site deployed from `master`; every PR gets a Vercel preview deployment.

## Build, format, and validate

Always run commands from the repo root. The order below is the one CI uses.

1. **Install (required before anything else).** CI uses frozen-lockfile; match it.
   ```bash
   yarn install --frozen-lockfile
   ```
2. **Dev server.** Clears the Docusaurus cache first. First boot is slow (30–90s).
   ```bash
   yarn start
   ```
3. **Production build.** This is what GitHub Actions `build.yml` runs on every PR. Broken links, bad MDX, or unknown sidebar paths fail here.
   ```bash
   yarn build
   ```
4. **Format (Prettier).** The `main.yml` workflow runs `yarn format:check`. Always run `yarn format` before committing — the pre-commit hook will reformat staged files but only if you run Prettier on them first; CI will fail on unformatted files.
   ```bash
   yarn format         # writes + checks
   yarn format:check   # check only (mirrors CI)
   ```
5. **Type check.**
   ```bash
   yarn typecheck
   ```
6. **Markdown lint.** Excludes `docs/sdk/**` (auto-generated).
   ```bash
   yarn lint:markdown
   ```
7. **Deleted-markdown check.** `test.yml` runs this on every PR to catch links pointing at removed pages.
   ```bash
   yarn tsx scripts/check-markdown.ts --ci
   ```

### Known workflow gotchas

- `yarn start` and `yarn build` both run `yarn && yarn clear` first. If you change code and rebuild, don't also run `yarn clear` manually — you'll just double the work.
- The Husky pre-commit hook (`.husky/pre-commit`) runs Prettier, markdownlint, and `yarn typecheck` on staged files. It skips in CI (`HUSKY=0`, `CI=true`, or `GITHUB_ACTIONS=true` disables it). Do not bypass with `--no-verify`; fix the underlying issue.
- `docs/sdk/**` is auto-generated — do not hand-edit, and it is excluded from markdownlint.
- If `.gitmodules` changes, the pre-commit hook runs `git submodule update --init --recursive`. Submodules live in `submodules/`.

## Project layout

### Top-level files you will touch often

- `docs/` — all published content (see below).
- `sidebars.js` — sidebar structure. **Any new page must be added here** or it is orphaned.
- `vercel.json` — redirects. **Always add a redirect when you move or rename a page.**
- `docusaurus.config.js` — site config, plugins, i18n locales (`en`, `ja`, `zh`).
- `CONTRIBUTE.md` — the style bible. Read before writing prose.
- `.prettierrc.js`, `.markdownlint.json` — formatting config.
- `scripts/` — repo tooling (glossary build, orphan finder, doc manifest, markdown checks).

### Content tree (`docs/`)

| Path                                  | Contents                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `get-started/`                        | Onboarding and introductions                                                    |
| `intro/`                              | Introduction and glossary entry point                                           |
| `arbitrum-bridge/`                    | Bridge user docs                                                                |
| `build-decentralized-apps/`           | App developer guides and references                                             |
| `stylus/`, `stylus-by-example/`       | Stylus (Rust/WASM) smart contracts                                              |
| `how-arbitrum-works/`                 | Protocol concepts (Nitro, ArbOS, BoLD, AnyTrust)                                |
| `run-arbitrum-node/`, `node-running/` | Node operator guides                                                            |
| `launch-arbitrum-chain/`              | Orbit / Arbitrum chain deployment                                               |
| `for-devs/`                           | Dev tools and third-party integrations                                          |
| `for-users/`                          | End-user documentation                                                          |
| `partials/`                           | Reusable MDX fragments (imported with `import ... from '../partials/_foo.mdx'`) |
| `partials/glossary/`                  | Glossary terms — see glossary frontmatter below                                 |
| `sdk/`                                | **Auto-generated**, do not edit                                                 |
| `notices/`                            | Deprecation and migration notices                                               |

### Frontmatter conventions

Standard page frontmatter (required for new docs):

```yaml
---
title: 'Sentence-case page title'
description: One-line SEO description.
content_type: how-to # or concept, quickstart, faq, reference, troubleshooting, gentle-introduction
target_audience: Who this page is written for.
sidebar_position: 1 # optional
---
```

Glossary term frontmatter (files under `docs/partials/glossary/_<slug>.mdx`):

```yaml
---
title: State Transition Function
key: state-transition-function
titleforSort: State Transition Function
---
```

After adding or editing glossary terms, run:

```bash
yarn build-glossary
```

## House style (enforced in review)

This repo is reviewed like product documentation. Reviewers repeatedly flag the same issues — front-load these to avoid rework:

- **Sentence-case** for all titles, headings, sidebar labels, and section titles. Not Title Case.
- **Descriptive link text.** Link to the destination page's title verbatim; never "click here" or "this".
- **Address the reader as "you".** Short sentences, plain translation-friendly English, contractions OK.
- **Write for a specific reader persona:** node runner, chain owner, app developer, Stylus developer, or third-party integrator. Pick one per page and say so in the intro.
- **Admonitions use the `:::` form**, not GitHub's `> [!NOTE]`:
  ```markdown
  :::note
  Content here.
  :::
  ```
  Types: `note`, `info`, `tip`, `caution`, `warning`, `danger`.
- **Separate procedural from conceptual.** Keep how-tos tight; link to concept pages for background.
- **One canonical term per page.** Use `parent chain` / `child chain`, not `L1` / `L2`, unless the context explicitly requires the older terms. `Orbit chain` and `Arbitrum chain` are not interchangeable.
- **Distinguish actors** correctly: sequencer vs full node, chain owner vs node runner, validator vs batch poster.

## When you move, rename, or delete a page

All four must be updated or the build / CI will fail:

1. `sidebars.js` — update the path entry.
2. `vercel.json` — add a redirect from the old URL.
3. Internal links and anchors across `docs/**` — update any that pointed at the old slug.
4. Translated copies under `i18n/ja/` and `i18n/zh/` — mirror the move.

Run `yarn build` locally to catch broken links before pushing.

## CI checks (must all pass before merge)

| Workflow | File                          | Command                                   | What it catches                                                     |
| -------- | ----------------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| Build    | `.github/workflows/build.yml` | `yarn build`                              | Broken MDX, unknown sidebar paths, bad imports                      |
| Format   | `.github/workflows/main.yml`  | `yarn format:check`                       | Any unformatted `.md` / `.mdx` / `.ts` / `.tsx` / `.scss` / `.json` |
| Tests    | `.github/workflows/test.yml`  | `yarn tsx scripts/check-markdown.ts --ci` | Links to deleted markdown files                                     |

Additional scheduled / external workflows (`check-undocumented-issues.yml`, `daily-release-check.yml`, `sbom-export.yaml`, `update-external-content.yml`) do not gate PRs.

## PR hygiene

Reviewers reject PRs that:

- Include unrelated changes (dependency bumps mixed with content edits, `yarn.lock` churn from a stray `yarn install`, local caches, editor junk).
- Move or rename pages without redirects and sidebar updates.
- Introduce new terms that appear nowhere else in the docs.
- Describe future releases or governance votes in present tense after they have shipped.
- Use sequencer-only settings in a full-node guide (or vice versa).

The PR template at `.github/pull_request_template.md` requires a document-type selection and the CONTRIBUTE.md checklist. For new content PRs, answer these in the description: audience, problem, discovery, document type.

## Trust these instructions

Only search or explore when:

- A command here fails and the error message is not obviously about your own change.
- You need a detail not covered above (specific component, specific script).
- You suspect this file is stale (check `git log -1 .github/copilot-instructions.md`).

Otherwise, follow the steps above in order. They match what CI runs.
