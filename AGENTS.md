# AGENTS.md

Skills and subagents that have proven useful in this repository, with the context in which they were invoked.

## Skills

### `context-prep` (slash command `/context-prep`)

Run at session start. Launches four `Explore` subagents in parallel — documentation survey, technology stack scout, git history scan, architecture deep-dive — and synthesizes a navigable project map using progressive revelation. Cheap (~500 tokens) and prevents the "explore the codebase first" thrash before any real work.

### `arbitrum-brand-svg-diagrams` (`.claude/skills/arbitrum-brand-svg-diagrams/`)

Authors lean, on-brand SVG concept diagrams for the docs, and replaces the draw.io
raster-in-SVG exports under `static/img/` (26 of them remain, 101.5 MB total). Ships
the Arbitrum brand background as a committed asset, plus three tools:

| Tool                   | Purpose                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `check_contrast.py`    | Verifies every label against WCAG AA. Renders the diagram twice — once with `<text>` stripped — to sample each label's true background. Exits non-zero on failure. |
| `round_arrows.py`      | Rounds elbow-arrow corners geometrically. Imposes strict path-authoring rules documented in the skill.                                                             |
| `excalidraw_bridge.py` | Round-trips a diagram to an Excalidraw scene for hand editing.                                                                                                     |

Use it for **static concept art only** — interactive diagrams go through the
ReactFlow / `DrawioReactFlow` pipeline instead, and Mermaid is never an option.

Two rules worth knowing before you touch a diagram, because both were shipped
wrong before they were measured:

- **White text on cyan `#12aaff` is 2.55:1 and fails WCAG** (white on orange is
  2.80:1). Use dark `#0b1b2e` on cyan. Run `check_contrast.py` rather than
  trusting a render — spot-checking by hand missed four real failures.
- **Size type for the displayed width.** A 1600px canvas shown at
  `className="img-900px"` scales to 0.5625×, so sublabels need ≥18px.

Recent invocation: replaced the 37-line ASCII "Fee lifecycle" diagram in
`docs/launch-arbitrum-chain/chain-config/costs/revenue-routing.mdx` with
`static/img/arb-chain-fee-lifecycle.svg` — the current reference example.

### `superpowers:systematic-debugging`

Iron-law debugging for any technical issue: build failures, deployment failures, unexpected behavior. Four phases — root cause investigation, pattern analysis, hypothesis & testing, implementation — with the rule **no fixes without root cause investigation**. Especially valuable when a "one-line fix" is tempting.

Recent invocation: Diagnosed the failed Vercel deployment on PR #3279. Root cause was a `resolutions: { "image-size": "^1.1.1" }` pin in `package.json` incompatible with Docusaurus 3.10's `@docusaurus/mdx-loader`, which calls `require("image-size/fromFile")` — a subpath that only exists in image-size v2.x. Symptom-fixing (e.g. switching the pin between `^1.1.1` and `latest`) had been ping-ponging the PR; root-cause analysis revealed the pin should be removed entirely.

### `superpowers:using-superpowers`

Auto-loaded at session start. Foundational meta-skill that governs how every other skill is discovered and invoked.

## Subagents

### `Explore`

Read-only fast search for files, symbols, references, and code structure. Specify a thoroughness level: `quick` (single targeted lookup), `medium` (moderate exploration), or `very thorough` (multi-path search across naming conventions). Used four times in parallel during `/context-prep`.

## User-level agents

Agents defined at `~/.claude/agents/<name>.md` are personal to each contributor and available across all repos. They are not committed here — keep repo-specific tooling in `.claude/skills/` so the whole team gets it.

## Project conventions for agents

- Print `git branch --show-current` before any git operation. Branches change outside the session; do not assume from session start or branch names.
- Confirm with the user before `git push`, before opening or closing PRs, and before destructive operations on shared state.
- `yarn build` (or `vercel build` for Vercel parity) is the canonical pre-merge check. Type-checking and tests verify code, not feature correctness.
- Bundle low-risk Dependabot patches (patch/minor) into a single PR; keep major-version bumps in their own PRs for code review.
- `onBrokenLinks: 'throw'`, `onBrokenAnchors: 'warn'` in `docusaurus.config.js`. TypeDoc SDK pages emit false-positive anchor warnings; they are documented as harmless build noise in `CLAUDE.md`.

## See also

- `CLAUDE.md` — project conventions, terminology, content style, harmless build noise.
- `docs/Offchain-pattern-guide.md` — editorial standards every doc change is held to.
- `.claude/skills/` — skills committed to this repo, available to everyone who clones it.
