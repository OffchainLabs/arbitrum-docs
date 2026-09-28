# CLAUDE.md

> **Machine-facing. Not written for humans, and not the canonical documentation.**
>
> This file provides guidance to Claude Code (claude.ai/code) when working with code in this
> repository. It is tied to a specific commercial tool; parts of it are rewritten automatically by
> `next dev`.
>
> The canonical docs are [README.md](README.md) (how to work on the docs),
> [INTERNALS.md](INTERNALS.md) (how the codebase works, and why),
> [CONTRIBUTE.md](CONTRIBUTE.md) (how an outside contributor gets from zero to an open PR), and
> [STYLE-GUIDE.md](STYLE-GUIDE.md) (the house prose rules: plain language, words to replace,
> terminology, glossary linking). Humans should read those. **Read STYLE-GUIDE.md before writing or
> editing any prose in `content/`.**
>
> **Duplication here is expected and fine.** When the same material lives in several places, **edit
> INTERNALS.md first**, then mirror what agents need back here. The frontmatter contract, the
> include rules, the variable workflow, `move-doc` and the gate list live in three places (here,
> INTERNALS.md and CONTRIBUTE.md). Change one and check the other two.

Arbitrum documentation portal on Next.js 16 and Fumadocs 16, with Tailwind 4 and TypeScript. English
MDX docs under `content/docs/`, served at `/docs/…`, deployed on Vercel.

## Commands

```bash
pnpm install           # postinstall runs fumadocs-mdx, which regenerates .source/
pnpm dev               # http://localhost:3000
pnpm types:check       # fumadocs-mdx && next typegen && tsc --noEmit
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
pnpm nitro:check-release               # bump the pinned Nitro release and marked image tags
pnpm precompiles:generate              # precompile tables (:check compares)
pnpm contracts:generate                # contract-address partial
pnpm cli:generate                      # Nitro CLI flags page (:check compares)
pnpm stylus:generate                   # Stylus by Example pages (:check compares)
pnpm edge-challenge:fetch              # BoLD challenge snapshot in public/data/
```

CI (`.github/workflows/ci.yml`) runs the gates in one job, then `pnpm build` plus
`scripts/static-docs-http.test.ts` against the running build in a second. There is no pre-commit
hook. `upstream-refresh.yml` runs `nitro:check-release` and `precompiles:generate` on Mondays and
opens a PR that gets no CI run of its own.

## Frontmatter contract

`source.config.ts` extends the Fumadocs page schema. Required: `title` (trimmed, not empty) and
`description` (trimmed). Optional: `sidebar_label`, `content_type`, `author`, `sme`. `content_type`
is one of `how-to | concept | quickstart | tutorial | reference | troubleshooting | faq`. A missing
required field or an out-of-enum value fails `types:check` and the build. There is no
`user_story`, `draft` or date field; last-modified dates come from git. Partials and glossary
entries do not carry this contract.

## Rules that break a build or a page

- **Fumadocs information comes from https://www.fumadocs.dev/llms.txt.** Do not guess its APIs.
- **`.source/` is generated.** Never hand-edit it; run `pnpm types:check`.
- **Node 22 only** (`>=22.18 <23`), pnpm 10. Run `nvm use 22`; never bypass `engines`. Every script
  is TypeScript run directly by Node, and a relative import carries its `.ts` extension.
- **Never use `next/font/google`.** Fonts are self-hosted in `public/fonts/` and loaded with
  `next/font/local`, so the build never fetches.
- **Never import `lib/source` from a client component**, directly or through a module that imports
  it. It pulls the compiled collection into the browser bundle, and no gate notices.
- **A `<Var>` does not evaluate inside a fenced block or inline code.** It ships as the literal tag
  (`content:lint` rule `var-in-code`). In a link destination or `href`, write `{var:name}` instead
  (rule `var-in-link`). A `{var:name}` in prose fails the build.
- **A remote markdown image renders broken.** Commit it under `public/img/`, or write
  `<ImageZoom><img src="https://…" alt="…" /></ImageZoom>` (rule `remote-image`).
- **Callouts are `<Callout type="info|warn|error|idea|success">`.** A Docusaurus `:::` line renders
  as text (rule `docusaurus-directive`).
- **No link in a heading, and no `<tr>` directly in `<table>`.** Both break React hydration (rules
  `link-in-heading`, `tr-in-table`).
- **A plain `.css` import in a component registered in `components/mdx.tsx` adds a render-blocking
  stylesheet to every docs page.** Use Tailwind utilities or `app/global.css`, or put the component
  behind `next/dynamic` like the widgets in `components/widgets/`. A docs page loads three
  stylesheets.
- **`types:check` proves the schema, not the render.** Open changed pages on
  `http://localhost:3000`; on `127.0.0.1` React does not hydrate.

## Where things live

- **Pipeline.** `source.config.ts` (collections and schema), `lib/source.ts` (the single
  `loader()`, the only reader of `.source/`), `app/docs/[[...slug]]/page.tsx` (every page,
  prerendered, `dynamicParams = false`). MDX options are in `lib/mdx-options.ts`.
- **Sidebar.** `meta.json` files only. The nine section folders set `"root": true`; `sidebar_label`
  renames a page. Never write a `[Label](/docs/…)` link entry for a page in this repo; use a
  `"../path"` entry. `scripts/sidebar.test.ts` checks the tree.
- **Partials.** `content/partials/`, included with `<include cwd>content/partials/…</include>`
  from a page and file-relative from another partial. Two are generated; edit their generators.
- **Variables.** `content/vars.json`; no schema edit is needed to add a key. `docsRepositoryUrl`
  and `docsRepositoryBranch` are this repo's own GitHub identity, read by `gitConfig`.
- **Components.** `components/mdx.tsx` is the registry.
- **Redirects.** `redirects.config.ts`. Never hand-edit between the `AUTO-GENERATED` markers.
  `move-doc` appends one entry and touches no other; `pnpm test` names any entry left chaining.
- **Routing.** `next.config.ts` rewrites `/docs/<slug>.md` to the `/llms.mdx/` mirror. `proxy.ts`
  only records PostHog `llms_file_fetched` events, in production.
- **Site URL.** Absolute URLs come from `getSiteUrl()` in `lib/shared.ts`, which throws in a
  production build without `NEXT_PUBLIC_SITE_URL`.
- **Theme.** Tokens are `--color-fd-*`; never `--ifm-*`. PostCSS config lives in `package.json`.
- **Generated pages.** `content/docs/stylus/stylus-by-example/` and
  `content/docs/run-a-node/nitro/cli-flags-reference.mdx`. Change their generators, not the pages.

Details for each are in [INTERNALS.md](INTERNALS.md).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
