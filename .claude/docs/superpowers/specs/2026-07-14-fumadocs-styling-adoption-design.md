# Adopt fumadocs.dev styling (Offchain colors retained) — design

**Date:** 2026-07-14
**Repo:** `~/OCL/Fumadocs-test` · branch **`styling`** (branched from `main` @ PR #10 merge)
**Goal:** Adopt the visual style of https://www.fumadocs.dev/ across the site while keeping the
Offchain brand color scheme. fumadocs.dev runs the same Fumadocs UI library we do, so this is mostly
layout/typography/component-config + a landing rebuild — not a new design system.

## Constraint: keep the Offchain palette

The `--color-fd-*` tokens in `app/global.css` (light + `.dark`) stay exactly as-is. Everywhere the
Fumadocs source uses `bg-brand` / `text-brand`, we map to `--color-fd-primary`. No new per-section
color scheme (fumadocs.dev's `--headless-color` / `--framework-color` / `--ui-color`) is introduced.

## Already matching (no work)

Fonts (Geist + JetBrains Mono), base CSS preset (`fumadocs-ui/css/neutral.css` + `preset.css`),
`DocsLayout`, scrollbar-gutter, body background.

## A. Rounded corners

Remove from `app/global.css`:

- the `#nd-docs-layout *, #nd-home-layout *, #nd-nav *, [data-radix-popper-content-wrapper] * { border-radius: 0 !important }` block
- the `.fd-step::before { border-radius: 9999px }` re-round hack (no longer needed)

Fumadocs' default rounded radii return everywhere. Reverses the earlier Offchain square-corner
override (user approved).

## B. Docs layout polish (`app/[lang]/docs/layout.tsx`)

- `links`: filter `baseOptions(lang).links` to `type === 'icon'` only, so the docs top bar is minimal
  (GitHub + search + theme). Section navigation is the sidebar tabs. The full mega-menu stays on the
  home layout.
- Add `tabs.transform`: wrap each section's existing `meta.json` Lucide icon in a rounded, tinted
  container (Fumadocs-style), tint driven by `--color-fd-primary`/foreground — NOT new section colors.

## C. Home / landing full clone (`app/[lang]/(home)/page.tsx`)

Mirror fumadocs.dev's landing structure with Arbitrum content; map `bg-brand` → `--color-fd-primary`.
Ported from `fuma-nama/fumadocs@dev` `apps/docs/app/(home)/page.tsx` + `page.client.tsx` + `marquee.tsx`.

Sections:

1. **Hero** — bordered `rounded-2xl`, ~70vh, animated gradient background (adapted, lighter than their
   circuit animation), pill tagline, large headline, CTAs: **Get started** (`/docs/get-started`) +
   **Launch a chain** (`/docs/launch-arbitrum-chain`).
2. **Intro band** — large light-weight paragraph, brand-accent highlights.
3. **"Try it out" code band** — `ServerCodeBlock` with a real Arbitrum command (Stylus
   `cargo stylus new`).
4. **Preview band** — mock browser-frame panel (gradient + Offchain mark) as placeholder until a real
   docs screenshot is supplied.
5. **Feature-card grid** — `rounded-2xl` cards for Build apps / Launch a chain / Run a node / How
   Arbitrum works / Bridge, with Lucide icons + descriptions.
6. **Logo marquee** — seeded with the Offchain brand lockups as a labeled placeholder; swap for real
   ecosystem/partner logos later.
7. **Footer CTA**.

Uses `cva` button/card variants, `tailwindcss-animate` motion, wide container (`max-w-[1400px]` /
`--spacing-page`).

## D. Code block enhancements

Install `fumadocs-twoslash`; `@import 'fumadocs-twoslash/twoslash.css'` in `global.css`; add the
twoslash transformer to `source.config.ts` `mdxOptions.rehypeCodeOptions`.
**Caveat:** twoslash only enriches ` ```ts twoslash ` blocks (TypeScript). Arbitrum docs are mostly
shell/Rust/Solidity, so the benefit is limited to JS/TS SDK examples; the built-in preset covers
tabs/copy/theme for the rest. Wired but flagged.

## Assets

Source: `~/tmp/archive/0426_Offchain_Logo/` (Offchain brand lockups: Icon / Horizontal / Stacked ×
Black / Charcoal / White; svg + png). Copy the needed variants into `public/brand/`.

- Hero + navbar branding: Offchain icon/logo (white on dark, charcoal on light).
- Marquee placeholder: brand lockups (clearly a placeholder — swap for ecosystem logos later).
- Preview band: mock frame placeholder (no screenshot yet).

## Dependencies (pinned exact; pnpm supply-chain rules)

`class-variance-authority`, `clsx`, `tailwindcss-animate`, `fumadocs-twoslash`. `tailwind-merge`
already present. Add a `cn()` helper (`lib/cn.ts`) using clsx + tailwind-merge.

## Verification

`pnpm types:check` · `pnpm build` (or dev smoke on a fresh port) · `pnpm format` · `pnpm check-links`.
Visual QA (rounded corners render, hero/marquee/cards, dropdown, sidebar tabs) pending a browser —
noted for next session.

## Implementation order

1. Deps + `cn()` helper + rounded corners (foundation).
2. Docs layout polish (icon-only nav + `tabs.transform`).
3. Code blocks (twoslash wiring).
4. Landing rebuild — split: hero → intro/code bands → feature cards → marquee → footer.

## Guardrails (YAGNI)

Keep Offchain palette untouched. Don't add fumadocs.dev's feature packages beyond twoslash (no
openapi/story/asyncapi/sponsors). Placeholder assets are explicitly labeled for swap. en-only content
strings on the landing (i18n copy can follow).
