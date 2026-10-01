# AGENTS.md

> **Machine-facing. Not written for humans, and not the canonical documentation.**
>
> This file is what Codex, and any other agent that reads `AGENTS.md`, sees first. It is a pointer,
> not a copy. Everything an agent needs is in [CLAUDE.md](CLAUDE.md), which is kept current, and in
> the four human documents below. Do not add material here; edit those files. The one block that
> lives here is the Next.js notice at the end, which `next dev` rewrites.

Arbitrum documentation portal on Next.js 16 and Fumadocs 16, with Tailwind 4 and TypeScript. English
MDX docs under `content/docs/`, served at `/<slug>`, deployed on Vercel.

## Read these first

1. [CLAUDE.md](CLAUDE.md): the agent-facing summary. Commands, the frontmatter contract, the rules
   that break a build or a page, and where things live.
2. [README.md](README.md): how to work on the docs.
3. [INTERNALS.md](INTERNALS.md): how the codebase works, and why.
4. [CONTRIBUTE.md](CONTRIBUTE.md): from a first edit to an open PR, with the component cheat-sheet
   and the gates to run before you push.
5. [STYLE-GUIDE.md](STYLE-GUIDE.md): the house prose rules. Read it before writing or editing any
   prose in `content/`.

Fumadocs information comes from https://www.fumadocs.dev/llms.txt. Do not guess its APIs.

## Grounding rule

Grounding rule: State only what you read in a file, and cite it as `file:line`. Read the file before
you describe it. Do not infer file content from file names, paths, directory listings, docs,
comments, or other repos. If you did not read it, write "not verified" and name the check that would
settle it. Never use "likely", "probably", "presumably", or "appears to" for a claim you could
verify by reading.

## Commands

The same list as in CLAUDE.md. When the two disagree, CLAUDE.md is right.

```bash
pnpm install           # postinstall runs fumadocs-mdx, which regenerates .source/
pnpm dev               # http://localhost:3000
pnpm types:check       # fumadocs-mdx && next typegen && tsc --noEmit
pnpm frontmatter:check # every page's frontmatter satisfies the schema in lib/page-schema.ts
pnpm test              # node --test over scripts/**/*.test.ts
pnpm build             # check-links, then next build
pnpm start             # serve the production build

# The other CI gates
pnpm vars:check        # every <Var name> and {var:name} resolves; banner keys are valid
pnpm references:check  # every <Term id> resolves to a content/glossary entry
pnpm contracts:check   # the contract-address partial is current
pnpm check-links       # internal links and #fragments resolve
pnpm content:lint      # MDX that compiles but renders wrong
pnpm format:check      # prettier (pnpm format writes)

# By hand only
pnpm move-doc <from> <to> [--dry-run]  # move a page, rewrite links, update meta.json, add a redirect
pnpm nitro:check-release               # report a newer Nitro release and stale pins, verify paths; --to <tag> is the only writer
pnpm precompiles:generate              # precompile tables (:check compares)
pnpm contracts:generate                # contract-address partial
pnpm cli:generate                      # Nitro CLI flags page (:check compares)
pnpm stylus:generate                   # Stylus by Example pages (:check compares)
pnpm edge-challenge:fetch              # BoLD challenge snapshot in public/data/
```

## Skills

Codex skills live under `.agents/skills/`. The writer skills (`new-doc`, `content-audit`) and the
diagram and video skills (`arbitrum-brand-svg-diagrams`, `arbitrum-brand-video-explainers`) exist
only under `.claude/skills/`; read them from there rather than looking for a copy here.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
