**Date:** 2026-07-29
**Repo:** `~/OCL/Fumadocs-test` · branch `switch-to-arbitrum-ui`
**Reference:** `~/OCL/arbitrum-docs` (Docusaurus 3.10, the live `docs.arbitrum.io`)
**Goal:** Adopt the Arbitrum brand identity — palette, typeface, prose scale — from the production
Docusaurus site, on Fumadocs' existing rounded geometry.

# Reskin the Fumadocs site with the arbitrum-docs visual style — design

## Supersedes a prior constraint

[`2026-07-14-fumadocs-styling-adoption-design.md`](2026-07-14-fumadocs-styling-adoption-design.md)
adopted **fumadocs.dev's** styling and stated: _"the `--color-fd-*` tokens in `app/global.css` stay
exactly as-is."_ This spec reverses that constraint by explicit decision. The Offchain palette is
replaced with the Arbitrum palette. Everything else from that spec — rounded corners, twoslash,
`cn()` — stays.

## Decisions

| Decision        | Choice                                                             |
| --------------- | ------------------------------------------------------------------ |
| Colour          | Full Arbitrum palette (blue / teal / navy), replacing Offchain     |
| Geometry        | **Unchanged** — Fumadocs rounded corners retained                  |
| Typeface        | Aeonik + Aeonik Fono, from the arbitrum-docs binaries              |
| Heading weights | Clamped to 500 (only real outlines; no synthetic bold)             |
| Brand marks     | Arbitrum logo + favicon; app icons on opaque `#213147`             |
| Verification    | Browser side-by-side against live `docs.arbitrum.io`, light + dark |

## Architecture

Both codebases funnel colour through a semantic token layer using shadcn/ui's vocabulary —
`--arbitrum-*` there, `--color-fd-*` here. Both derive prose styling from Tailwind Typography
(`--prose-*` there, `--tw-prose-*` here, already defaulted to `--color-fd-*`).

The reskin therefore reconnects the bottom layer rather than restyling:

```
arbitrum-docs                          Fumadocs-test
  --arbitrum-*        ──── §1 ────►      --color-fd-*
  --prose-*                              --tw-prose-* (inherits §1 automatically)
  Aeonik @font-face   ──── §2 ────►      next/font/local
  _typography.scss    ──── §3 ────►      .prose layer in global.css
  (n/a)                    §4            four hardcoded-colour islands
```

We do **not** port the SCSS partials. `_navbar.scss`, `_sidebar.scss`, `_footer.scss`, and
`_content-body.scss` (959 lines) target Docusaurus DOM classes that do not exist here; importing
them would add permanent dead code and `--ifm-*` names that `CLAUDE.md` forbids.

---

## §1 — Token mapping

Rewrite the `@theme` and `.dark` blocks in `app/global.css`. Values stay in `hsl()` notation so each
line is directly comparable against `_variables.scss` by eye.

| `--color-fd-*`         | Light                    | Dark                    |
| ---------------------- | ------------------------ | ----------------------- |
| `background`           | `hsl(0 0% 100%)`         | `hsl(222 47% 6%)`       |
| `foreground`           | `hsl(222 47% 11%)`       | `hsl(210 40% 98%)`      |
| `muted`                | `hsl(210 40% 96%)`       | `hsl(217 33% 12%)`      |
| `muted-foreground`     | `hsl(215 16% 47%)`       | `hsl(215 20% 65%)`      |
| `popover`              | `hsl(0 0% 100%)`         | `hsl(222 47% 8%)`       |
| `popover-foreground`   | `hsl(222 47% 11%)`       | `hsl(210 40% 98%)`      |
| `card`                 | `hsl(0 0% 100%)`         | `hsl(222 47% 8%)`       |
| `card-foreground`      | `hsl(222 47% 11%)`       | `hsl(210 40% 98%)`      |
| `border`               | `hsl(214 32% 91%)`       | `hsl(217 33% 17%)`      |
| `primary`              | `hsl(211 99% 45%)`       | `hsl(188 100% 53%)`     |
| `primary-foreground`   | `hsl(0 0% 100%)`         | `hsl(222 47% 6%)`       |
| `secondary`            | `hsl(210 40% 96%)`       | `hsl(217 33% 17%)`      |
| `secondary-foreground` | `hsl(222 47% 11%)`       | `hsl(210 40% 98%)`      |
| `accent`               | `hsl(210 40% 96%)`       | `hsl(217 33% 17%)`      |
| `accent-foreground`    | `hsl(222 47% 11%)`       | `hsl(210 40% 98%)`      |
| `ring`                 | `hsl(211 99% 45%)`       | `hsl(188 100% 53%)`     |
| `overlay`              | `hsl(222 47% 11% / 0.5)` | `hsl(222 47% 4% / 0.8)` |

Two new gradient tokens (source: `--arbitrum-gradient-primary`, 135°):

```css
--color-arbitrum-gradient-from: hsl(211 99% 45%);
--color-arbitrum-gradient-to: hsl(188 100% 53%);
```

`--spacing-page: 1436px` is Fumadocs-side layout, not brand — unchanged.

**Known consequence.** In arbitrum-docs, `muted`, `secondary`, and `accent` share one value per mode.
Today `accent` is the distinct tan `#cec5ba`. Fumadocs uses `bg-fd-accent` for hover states, so card
hover becomes a 4% delta against card white instead of a tan tint. This matches the reference and is
accepted; if hover reads too weak in verification, `accent` is the knob to adjust.

## §2 — Font pipeline

**Source binaries** (`~/OCL/arbitrum-docs/static/fonts/`): `Aeonik-Regular.otf` (400),
`Aeonik-Medium.otf` (500), `AeonikFono-Regular.woff` (400). These are the only font files in that
repo; there is no Bold, Black, or CDN reference.

**Convert** to `woff2` via `uvx fonttools ttLib.woff2 compress` (no permanent dependency) into
`public/fonts/`. Roughly 200 KB → 100 KB. `next/font/local` accepts `.otf`/`.woff` directly, so if
conversion fails, ship the originals — the only cost is bytes.

**Wire** in `app/[lang]/layout.tsx`, replacing the `Geist` / `JetBrains_Mono` imports with
`next/font/local`, reusing the existing variable names `--font-sans` and `--font-mono`. Because
`<body className="font-sans">` already consumes them, no other file changes. Fallback stack copied
verbatim from `_variables.scss`; `display: 'swap'`.

**Weight clamp.** `_typography.scss` requests 600 / 700 / 800 / 900, none of which have a font file —
so `docs.arbitrum.io` renders every heading as browser-synthesized (faux) bold. We decline to
reproduce that artifact. All heading weights are clamped to **500**; sizes, margins, rules, and
colours are unchanged from the reference. Hierarchy is carried by size, spacing, and the h2 rule.

**Assumption to confirm:** Aeonik is a commercial CoType Foundry typeface. Reuse is assumed covered
by the licence backing arbitrum.io (same org, same site family). If the full family is licensed,
restoring the 700/800/900 scale is one edit to the `localFont()` call plus reverting the clamp.

## §3 — Prose layer

**Colour needs almost no work.** Fumadocs' typography plugin
(`@fumadocs/tailwind/typography`) defaults every `--tw-prose-*` variable to a `--color-fd-*` token,
so §1 cascades into prose automatically. Of arbitrum-docs' 14 `--prose-*` declarations, 13 already
resolve identically. Three overrides are needed:

```css
--tw-prose-quote-borders: var(--color-fd-primary);
--tw-prose-captions: var(--color-fd-muted-foreground);
--tw-prose-kbd-shadows: color-mix(in oklab, var(--color-fd-primary) 50%, transparent);
```

**Structure needs writing** — one `@layer` block in `app/global.css` scoped to `.prose` (the class
`DocsBody` renders), translating these rules from `_typography.scss`:

- Body `1rem` / `1.75`.
- h1 `2.5rem`/`1.1` (`2.25rem` as `:first-child`); h2 `1.625rem`, `margin-top: 2.5em`; h3 `1.375rem`,
  `margin-top: 2em`; h4 `1.125rem`; h5/h6 `0.875rem` uppercase, `0.05em` tracking. All weight 500.
- **h2 rule:** `padding-bottom: 0.5rem` + `border-bottom: 1px solid var(--color-fd-border)`.
- Links: underline, `2px` thickness, decoration in primary, `4px` offset; hover flips decoration to
  `currentColor` and text to primary.
- `li::marker` in primary; ordered markers weight 500 with `font-feature-settings: 'tnum'`.
- Blockquote: `3px` left border in primary over a 5% primary tint.
- Tables: `thead` background `color-mix(in oklab, var(--color-fd-primary) 8%, var(--color-fd-muted))`,
  `0.8125rem` headers, `0.75rem 1rem` cell padding, row borders at 50% border opacity.
- Inline code: `0.875em`, weight 500, `1px` border, muted background, `0.2em 0.4em` padding.
- Headings: `scroll-margin-top: 80px`, `text-wrap: balance`.
- Responsive step-down at `max-width: 736px` (h1 → `1.875rem`, etc.).

**Excluded:** `article .markdown` scoping (replaced by `.prose`), `.hash-link` rules (Fumadocs owns
anchor markup), `.prism-code` / `.docusaurus-highlight-code-line` (Shiki, not Prism), and the `print`
block (worth having, but not part of a reskin).

## §4 — Component surface

Four colour islands sit outside the token layer.

**1. Admonitions.** `components/mdx/VanillaAdmonition/styles.module.css` hardcodes a GitHub-ish
palette and its own dark-mode text colours; it is entirely token-blind. Remap to arbitrum-docs'
five-variant system:

| Variant   | Light accent / bg-alpha / text                  | Dark accent / bg-alpha / text                   |
| --------- | ----------------------------------------------- | ----------------------------------------------- |
| `info`    | `hsl(211 99% 45%)` · .08 · `hsl(211 99% 30%)`   | `hsl(188 100% 53%)` · .10 · `hsl(188 100% 75%)` |
| `tip`     | `hsl(147 72% 35%)` · .08 · `hsl(147 72% 25%)`   | `hsl(142 71% 45%)` · .10 · `hsl(142 71% 65%)`   |
| `warning` | `hsl(38 92% 50%)` · .10 · `hsl(32 81% 29%)`     | `hsl(45 93% 47%)` · .12 · `hsl(48 96% 70%)`     |
| `danger`  | `hsl(0 72% 51%)` · .08 · `hsl(0 72% 35%)`       | `hsl(0 62% 55%)` · .12 · `hsl(0 62% 75%)`       |
| `note`    | `hsl(215 16% 47%)` · .10 · `hsl(215 16% 35%)` † | `hsl(215 20% 65%)` · .10 · `hsl(215 20% 80%)`   |

† Light-mode `note` is **derived, not sourced**: arbitrum-docs defines `alert--secondary` only in
`_darkmode.scss` and falls through to an Infima default in light. Values above extend the dark
variant's relationship to light using `--arbitrum-secondary-text`. Confirm against the live site
during verification; this is the one row that may need adjusting.

Also: left border `6px` → `4px` (matching `--ifm-alert-border-left-width`); replace hardcoded
`.admonitionTitle` / `.admonitionContent` colours with `--color-fd-foreground` and a muted mix, which
removes the `:global(.dark)` block entirely. The `4px` radius stays.

**2. Landing hero.** `app/[lang]/(home)/page.tsx:33` hardcodes
`bg-linear-to-b from-black to-[#565656]`. Replace with the §1 gradient tokens (blue→teal, 135°).

**3. OG images.** `app/og/docs/[...slug]/route.tsx` delegates to `fumadocs-ui/og`, which carries
Fumadocs' defaults — not the Offchain palette. Pass `primaryColor="hsl(211 99% 45%)"` and
`primaryTextColor="hsl(188 100% 53%)"`. The generator hardcodes `backgroundColor: "#0c0c0c"`;
closing that would require replacing `DefaultImage` with local JSX, which is **out of scope**.

**4. Inkeep — no change.** `lib/inkeep.ts:71` sets `primaryBrandColor: '#213147'`. An earlier draft of
this spec proposed repointing it to the primary blue; that was wrong. `#213147` is exactly the navy
fill of `public/img/logo.svg`, deliberately matched to the mark rendered beside the widget. Leave it.
`lib/inkeep.ts:78` already points `aiAssistantAvatar` at `/img/logo.svg` — correct as-is.

**No work:** code blocks. Shiki is wired via `rehypeCodeDefaultOptions`, and Fumadocs' `shiki.css`
drives the code surface from `--color-fd-*`, matching arbitrum-docs' `--prism-background-color:
var(--arbitrum-muted)`.

## §5 — Verification

Non-visual gates first, so the browser pass is not debugging compile errors:

```bash
pnpm types:check                                   # the repo's only automated gate
pnpm build
pnpm format
pnpm check-links | grep '  ->  ' | wc -l           # must equal the pre-change baseline
```

The link count is a negative check: a reskin must not move it. Capture the baseline by running this
command **before** the first edit — do not assume a figure from an earlier plan, as content has
landed since.

Then browser side-by-side, reference = **live `docs.arbitrum.io`** (no local Docusaurus build
needed, cannot drift from what users see), target = `PORT=3210 pnpm dev`. Captures to
`scratchpad/reskin/{page}-{mode}-{side}.png`.

Pages: a `get-started` page (heading scale, h2 rule, links), a `how-arbitrum-works` page (tables,
images, blockquotes), a `stylus` page (code blocks, mono face), the landing, and a page exercising
all five admonition variants — locate one with
`grep -rl ':::warning' content/docs/en | head`, or if no single page carries all five, author a
scratch MDX page under `content/docs/en/` containing one of each, capture it, and delete it before
committing.

Checklist, traced to the section each item falsifies:

```
§1  primary blue in light / teal in dark · dark surfaces navy not gray ·
    borders + cards + popovers match · card hover still perceptible
§2  Aeonik rendering (not fallback) · Aeonik Fono in code ·
    headings crisp at 40px, no faux-bold smearing
§3  h2 bottom rule · links underlined 2px primary at 4px offset ·
    list markers primary · blockquote 3px primary + tint · thead 8% primary
§4  five admonition variants match both modes · hero blue→teal
§6  navbar shows the Arbitrum logo, legible in BOTH modes (navy element on
    navy background is the risk) · browser tab shows the Arbitrum favicon ·
    icon.png / apple-icon.png opaque navy, mark centred not stretched
```

## §6 — Brand marks

The Arbitrum marks are **already in the repo**, imported alongside content: `public/img/logo.svg`
(four-colour: navy `#213147`, blue `#12AAFF`, light blue `#9DCCED`, white `#FFFFFF`),
`logo_black.svg`, `favicon.ico` (105.7 KB, arbitrum-docs' own — currently unreferenced),
`stylus-logo.svg`, `cupcake_icon.svg`. Three surfaces still carry Offchain marks.

**1. Navbar.** `lib/layout.shared.tsx:31` renders `<OffchainMark className="h-5 w-auto" />`, an inline
single-path silhouette using `fill="currentColor"` (`components/OffchainMark.tsx`). Replace with
`public/img/logo.svg`. Because the Arbitrum mark is four-colour, it **cannot** become a
`currentColor` component — it must be an image. arbitrum-docs uses one `src` with no `srcDark`
(`docusaurus.config.js:197-201`), so use the same logo in both modes. `components/OffchainMark.tsx`
becomes unused once its only consumer changes; remove it in the same commit as an orphan created by
this change.

**2. `favicon.ico`.** Replace `public/favicon.ico` (14.7 KB, Offchain) with `public/img/favicon.ico`
(105.7 KB, Arbitrum). Distinct files, distinct md5s. Already wired via `metadata.icons` in
`app/[lang]/layout.tsx:22-27`, so no code change — a file swap only.

**3. App icons.** `public/icon.png` (512×512) and `public/apple-icon.png` (180×180) are 8-bit
gray+alpha Offchain marks with no Arbitrum equivalent at those sizes. Generate from `logo.svg`
letterboxed onto a solid `#213147` canvas:

```bash
rsvg-convert -h 400 public/img/logo.svg -o /tmp/mark.png
magick -size 512x512 xc:'#213147' /tmp/mark.png -gravity center -composite public/icon.png
magick public/icon.png -resize 180x180 public/apple-icon.png
```

`logo.svg` is portrait (1080 × 1218.5) — letterbox, never stretch. **Opaque, not transparent:** the
mark contains white internal elements that become holes on a transparent PNG and vanish against light
browser chrome; iOS also composites `apple-touch-icon` transparency onto white. `rsvg-convert` and
`magick` are both available locally.

## Out of scope

- Porting the Docusaurus DOM partials (`_navbar`, `_sidebar`, `_footer`, `_content-body`).
- Stylus pink `#e3066e` — arbitrum-docs uses it for section branding; nothing here consumes a
  section accent.
- Widget styles: `_edge-challenge-flow.scss`, `_troubleshooting-report.scss`,
  `_number-component.scss` — page-specific components, not site skin.
- Custom OG JSX (see §4.3).
- The `print` stylesheet.
- Any content, routing, or `meta.json` change.

## Flagged, not actioned

`app/[lang]/(home)/hero-bg.tsx` and `marquee.tsx` are orphaned — nothing imports them, only
self-references. The `--animate-marquee` / `--animate-marquee-vertical` keyframes in `global.css` are
dead with them. All six `public/brand/*.svg` Offchain files are likewise unreferenced; their last
consumers were the deleted marquee/hero landing. Removal is a separate cleanup, not part of this
reskin.

Distinct from these: `components/OffchainMark.tsx` is orphaned **by** §6 and is removed there, per
the rule that we clean up orphans our own changes create.

## Implementation order

1. §1 token remap — everything downstream depends on it.
2. §2 fonts — independent of §1; both must land before prose reads correctly.
3. §3 prose layer.
4. §4 component islands.
5. §6 brand marks — independent of §1–§4; can land in parallel.
6. §5 verification (gates, then browser).
