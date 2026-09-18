# Arbitrum-docs Visual Reskin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Fumadocs site the Arbitrum brand identity — palette, Aeonik typeface, prose scale,
and brand marks — from the production Docusaurus site at `~/OCL/arbitrum-docs`.

**Architecture:** Both codebases funnel colour through a semantic token layer using shadcn/ui's
vocabulary (`--arbitrum-*` there, `--color-fd-*` here) and both derive prose from Tailwind Typography.
So the bulk of the work is a token remap in `app/global.css`; prose colour then cascades for free.
Four hardcoded-colour "islands" bypass the token layer and are fixed individually. We do **not** port
arbitrum-docs' SCSS partials — 959 lines of them target Docusaurus DOM classes that do not exist here.

**Tech Stack:** Next.js 16.2.6, Fumadocs UI 16.11.1, Tailwind CSS 4.3, TypeScript 6, pnpm 10, Node 22.

**Spec:** [`docs/superpowers/specs/2026-07-29-arbitrum-docs-reskin-design.md`](../specs/2026-07-29-arbitrum-docs-reskin-design.md)

## Global Constraints

- **There is no test runner and no linter in this repo.** `pnpm types:check` is the only automated
  gate. Every task verifies with `pnpm types:check` plus a dev smoke; visual correctness is deferred
  to Task 7's browser pass. Do not add vitest or oxlint — out of scope.
- Node 22 only (`>=22 <23`), pnpm 10, ESM. `verbatimModuleSyntax` is on — use `import type` for
  type-only imports.
- Theme tokens are `--color-fd-*`. **Never** introduce `--ifm-*` names (legacy Docusaurus).
- Geometry is **unchanged** — keep Fumadocs' rounded corners. Do not set any `border-radius: 0`.
- All heading weights are clamped to **500**. Aeonik ships only 400 and 500; requesting 600–900
  produces browser-synthesized faux bold. Do not write `font-weight: 600` or higher anywhere.
- Values stay in `hsl()` notation so each line is comparable against `_variables.scss` by eye.
- MDX is excluded from Prettier (`.prettierignore`) — do not run Prettier on `.mdx`.
- Dev smoke: always `pkill -f 'next dev'` first, then `PORT=3210 pnpm dev`, and kill it when done —
  the singleton lock races otherwise.
- Commit after each task. **Do NOT push** — the user pushes and opens PRs explicitly.
- Do not remove the pre-existing orphans (`app/[lang]/(home)/hero-bg.tsx`, `marquee.tsx`, the
  `--animate-marquee` keyframes, `public/brand/*.svg`). They are flagged in the spec as separate
  cleanup. **Exception:** `components/OffchainMark.tsx` is orphaned by Task 6 and is removed there.

## File Structure

| File                                                 | Responsibility                                                   | Task |
| ---------------------------------------------------- | ---------------------------------------------------------------- | ---- |
| `app/global.css`                                     | Brand tokens (light + dark), gradient tokens, `.prose` treatment | 1, 3 |
| `public/fonts/*.woff2`                               | Aeonik + Aeonik Fono binaries                                    | 2    |
| `app/[lang]/layout.tsx`                              | Font wiring via `next/font/local`; icon metadata                 | 2, 6 |
| `components/mdx/VanillaAdmonition/styles.module.css` | Five admonition variants, both modes                             | 4    |
| `app/[lang]/(home)/page.tsx`                         | Landing hero gradient                                            | 5    |
| `app/og/docs/[...slug]/route.tsx`                    | OG image brand accent                                            | 5    |
| `lib/layout.shared.tsx`                              | Navbar brand mark                                                | 6    |
| `public/{favicon.ico,icon.png,apple-icon.png}`       | Browser/OS icons                                                 | 6    |

## Baseline capture

Before Task 1, record the broken-link count. A reskin must not move it.

```bash
cd /Users/allup/OCL/Fumadocs-test
pnpm check-links 2>&1 | grep -c '  ->  '
```

Write the number down. Task 7 asserts it is unchanged. Do **not** use the figure `212` from the
earlier July 14 plan — content has landed since and that measurement is stale.

---

### Task 1: Remap brand tokens to the Arbitrum palette

**Files:**

- Modify: `app/global.css:6-47` (the comment + `@theme` block + `.dark` block)

**Interfaces:**

- Produces: `--color-fd-*` (17 tokens × 2 modes) consumed by every later task and by all existing
  `bg-fd-*` / `text-fd-*` utilities. Also `--color-arbitrum-gradient-from` / `-to`, consumed by
  Task 5.

- [ ] **Step 1: Replace the token blocks**

In `app/global.css`, replace everything from the comment on line 6 through the closing brace of the
`.dark` block on line 47 with:

```css
/* Arbitrum brand palette, ported from arbitrum-docs `src/css/partials/_variables.scss` (:root).
   Values kept in hsl() notation so each line is directly comparable against the source. */
@theme {
  --color-fd-background: hsl(0 0% 100%);
  --color-fd-foreground: hsl(222 47% 11%);
  --color-fd-muted: hsl(210 40% 96%);
  --color-fd-muted-foreground: hsl(215 16% 47%);
  --color-fd-popover: hsl(0 0% 100%);
  --color-fd-popover-foreground: hsl(222 47% 11%);
  --color-fd-card: hsl(0 0% 100%);
  --color-fd-card-foreground: hsl(222 47% 11%);
  --color-fd-border: hsl(214 32% 91%);
  --color-fd-primary: hsl(211 99% 45%);
  --color-fd-primary-foreground: hsl(0 0% 100%);
  --color-fd-secondary: hsl(210 40% 96%);
  --color-fd-secondary-foreground: hsl(222 47% 11%);
  --color-fd-accent: hsl(210 40% 96%);
  --color-fd-accent-foreground: hsl(222 47% 11%);
  --color-fd-ring: hsl(211 99% 45%);
  --color-fd-overlay: hsl(222 47% 11% / 0.5);

  /* Source: `--arbitrum-gradient-primary`, 135deg. Defined light-only in the
     source, so intentionally NOT redefined in `.dark`. */
  --color-arbitrum-gradient-from: hsl(211 99% 45%);
  --color-arbitrum-gradient-to: hsl(188 100% 53%);

  --spacing-page: 1436px;
}

/* Dark: navy-tinted surfaces, teal primary. Ported from arbitrum-docs
   `src/css/partials/_darkmode.scss` ([data-theme='dark']). */
.dark {
  --color-fd-background: hsl(222 47% 6%);
  --color-fd-foreground: hsl(210 40% 98%);
  --color-fd-muted: hsl(217 33% 12%);
  --color-fd-muted-foreground: hsl(215 20% 65%);
  --color-fd-popover: hsl(222 47% 8%);
  --color-fd-popover-foreground: hsl(210 40% 98%);
  --color-fd-card: hsl(222 47% 8%);
  --color-fd-card-foreground: hsl(210 40% 98%);
  --color-fd-border: hsl(217 33% 17%);
  --color-fd-primary: hsl(188 100% 53%);
  --color-fd-primary-foreground: hsl(222 47% 6%);
  --color-fd-secondary: hsl(217 33% 17%);
  --color-fd-secondary-foreground: hsl(210 40% 98%);
  --color-fd-accent: hsl(217 33% 17%);
  --color-fd-accent-foreground: hsl(210 40% 98%);
  --color-fd-ring: hsl(188 100% 53%);
  --color-fd-overlay: hsl(222 47% 4% / 0.8);
}
```

Leave everything below line 47 (the `#nd-subnav` navbar block, `html` rules, marquee keyframes)
untouched.

- [ ] **Step 2: Verify types**

Run: `pnpm types:check`
Expected: `✓ Types generated successfully`, no errors.

- [ ] **Step 3: Confirm the tokens actually compile into CSS**

The failure mode here is a Tailwind v4 `@theme` syntax error, which does not surface in
`types:check`. Start dev and assert the new value reaches the browser:

```bash
pkill -f 'next dev' 2>/dev/null; sleep 1
PORT=3210 pnpm dev &
sleep 25
curl -s http://localhost:3210/docs/get-started | grep -c 'nd-docs-layout'
```

Expected: `1` or more (page rendered). Then confirm the compiled stylesheet carries the new primary.

**Two gotchas make the naive grep fail against a correct implementation.** (1) In dev, Turbopack
serves CSS from `/_next/static/chunks/*.css`, _not_ `/_next/static/css/*.css` — that second path is
the production layout. (2) Lightning CSS **normalizes `hsl()` to hex** while compiling, so the literal
string `211 99% 45%` never appears in output. Grep for the hex instead.

```bash
curl -s http://localhost:3210/docs/get-started -o /tmp/skin-page.html
: > /tmp/skin-all.css
for u in $(grep -oE '/_next/static/chunks/[^"]*\.css' /tmp/skin-page.html | sort -u); do
  curl -s "http://localhost:3210$u" >> /tmp/skin-all.css
done
grep -o -- '--color-fd-primary: *[^;]*' /tmp/skin-all.css | sort -u
```

Expected, exactly these two lines — `#016fe4` is `hsl(211 99% 45%)` and `#0fdfff` is
`hsl(188 100% 53%)`:

```
--color-fd-primary: #016fe4
--color-fd-primary: #0fdfff
```

If the output is empty, the `@theme` block did not compile — check for a stray brace. If the values
differ, a token was mistyped. Also confirm the source file kept `hsl()` notation (the constraint
applies to the source, not the compiled output): `grep -cF 'hsl(' app/global.css` → expect 37.

Then: `pkill -f 'next dev'`

- [ ] **Step 4: Commit**

```bash
git add app/global.css
git commit -m "style: remap brand tokens to the Arbitrum palette

Replaces the Offchain grayscale+tan tokens with Arbitrum blue/teal/navy,
ported from arbitrum-docs _variables.scss and _darkmode.scss. Adds
gradient tokens for the landing hero."
```

---

### Task 2: Wire the Aeonik typeface

**Files:**

- Create: `public/fonts/aeonik-regular.woff2`, `public/fonts/aeonik-medium.woff2`,
  `public/fonts/aeonik-fono-regular.woff2`
- Modify: `app/[lang]/layout.tsx:3` (import), `:31-39` (font declarations), `:51` (className)

**Interfaces:**

- Consumes: nothing from Task 1 (independent).
- Produces: CSS variables `--font-sans` and `--font-mono` on `<html>`. These are the **same names**
  the current Geist/JetBrains setup produces, and `<body className="font-sans">` already consumes
  them — so no other file changes. Task 3 relies on these being live.

- [ ] **Step 1: Copy the source binaries**

```bash
cd /Users/allup/OCL/Fumadocs-test
mkdir -p public/fonts
SRC=/Users/allup/OCL/arbitrum-docs/static/fonts
cp "$SRC/Aeonik-Regular.otf"     public/fonts/aeonik-regular.otf
cp "$SRC/Aeonik-Medium.otf"      public/fonts/aeonik-medium.otf
cp "$SRC/AeonikFono-Regular.woff" public/fonts/aeonik-fono-regular.woff
ls -la public/fonts/
```

Expected: three files, roughly 80 KB / 83 KB / 38 KB.

- [ ] **Step 2: Convert to woff2**

```bash
cd /Users/allup/OCL/Fumadocs-test/public/fonts
uvx --from "fonttools[woff]" fonttools ttLib.woff2 compress aeonik-regular.otf
uvx --from "fonttools[woff]" fonttools ttLib.woff2 compress aeonik-medium.otf
uvx --from "fonttools[woff]" fonttools ttLib.woff2 compress aeonik-fono-regular.woff
ls -la
```

Expected: three new `.woff2` files, each roughly 40–60% of its source size.

**If conversion fails** (any non-zero exit, or a missing `.woff2`): delete any partial output, keep
the originals, and in Step 3 use `aeonik-regular.otf`, `aeonik-medium.otf`, and
`aeonik-fono-regular.woff` as the `src` paths instead. `next/font/local` accepts `.otf` and `.woff`
directly; the only cost is transfer size. Do not spend more than one attempt debugging fonttools.

- [ ] **Step 3: Remove the originals (only if Step 2 succeeded)**

```bash
cd /Users/allup/OCL/Fumadocs-test
rm public/fonts/aeonik-regular.otf public/fonts/aeonik-medium.otf public/fonts/aeonik-fono-regular.woff
ls public/fonts/
```

Expected: exactly three `.woff2` files. Skip this step entirely if Step 2 fell back.

- [ ] **Step 4: Replace the font declarations**

In `app/[lang]/layout.tsx`, change the import on line 3 from:

```tsx
import { Geist, JetBrains_Mono } from 'next/font/google';
```

to:

```tsx
import localFont from 'next/font/local';
```

Then replace lines 31–39 (the `geist` and `mono` consts) with:

```tsx
// Aeonik is the Arbitrum brand typeface, self-hosted from arbitrum-docs.
// Only 400 and 500 exist — there is no Bold or Black face. Heading weights are
// clamped to 500 in global.css so nothing requests a weight the browser would
// have to synthesize. Fallback stack copied from arbitrum-docs _variables.scss.
const sans = localFont({
  variable: '--font-sans',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
  src: [
    { path: '../../public/fonts/aeonik-regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/aeonik-medium.woff2', weight: '500', style: 'normal' },
  ],
});

const mono = localFont({
  variable: '--font-mono',
  display: 'swap',
  fallback: [
    'ui-monospace',
    'SF Mono',
    'Cascadia Code',
    'Segoe UI Mono',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace',
  ],
  src: [{ path: '../../public/fonts/aeonik-fono-regular.woff2', weight: '400', style: 'normal' }],
});
```

Then on line 51, change `${geist.variable}` to `${sans.variable}`:

```tsx
    <html lang={lang} className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
```

The `src` paths are relative to `app/[lang]/`, so `../../public/` resolves to the repo root's
`public/`. If Step 2 fell back, adjust the three filenames accordingly.

- [ ] **Step 5: Verify types**

Run: `pnpm types:check`
Expected: PASS. A wrong `src` path fails here with "Can't resolve" — that is the main risk.

- [ ] **Step 6: Confirm the font is actually served**

```bash
pkill -f 'next dev' 2>/dev/null; sleep 1
PORT=3210 pnpm dev &
sleep 25
curl -s http://localhost:3210/docs/get-started | grep -o -E '/_next/static/media/[^"]*\.woff2' | head -3
```

Expected: at least one `_next/static/media/*.woff2` URL. If empty, `next/font/local` did not pick up
the files. Then:

```bash
pkill -f 'next dev'
```

- [ ] **Step 7: Commit**

```bash
git add public/fonts "app/[lang]/layout.tsx"
git commit -m "style: adopt Aeonik as the brand typeface

Self-hosts Aeonik 400/500 and Aeonik Fono from arbitrum-docs via
next/font/local, reusing the existing --font-sans/--font-mono variables.
Replaces Geist and JetBrains Mono."
```

---

### Task 3: Add the Arbitrum prose treatment

**Files:**

- Modify: `app/global.css` (append a new `@layer components` block after the `.dark` block)

**Interfaces:**

- Consumes: `--color-fd-primary`, `--color-fd-border`, `--color-fd-muted`,
  `--color-fd-muted-foreground` from Task 1; `--font-sans` from Task 2.
- Produces: styling for `.prose`, the class `DocsBody` renders. No JS interface.

- [ ] **Step 1: Append the prose layer**

In `app/global.css`, immediately after the closing brace of the `.dark` block from Task 1, insert:

```css
/* Arbitrum prose treatment, ported from arbitrum-docs `_typography.scss` (which
   scopes to `article .markdown`; Fumadocs' DocsBody renders `.prose`).

   Colour is almost free: Fumadocs' typography plugin already defaults every
   --tw-prose-* variable to a --color-fd-* token, so Task 1 cascades into prose
   automatically. Only three variables differ from the reference.

   Selectors use :where() to keep specificity at 0,1,0 so Tailwind utilities can
   still override, and exclude `.not-prose` (Fumadocs' heading-anchor links) and
   `[data-card]` (Fumadocs Card links) — both would otherwise pick up the
   underline treatment. All heading weights are 500: Aeonik has no heavier face. */
@layer components {
  .prose {
    --tw-prose-quote-borders: var(--color-fd-primary);
    --tw-prose-captions: var(--color-fd-muted-foreground);
    --tw-prose-kbd-shadows: color-mix(in oklab, var(--color-fd-primary) 50%, transparent);

    font-size: 1rem;
    line-height: 1.75;

    :where(h1, h2, h3, h4, h5, h6) {
      font-weight: 500;
      scroll-margin-top: 80px;
      text-wrap: balance;
    }

    :where(h1) {
      font-size: 2.5rem;
      line-height: 1.1;
      margin-top: 0;
      margin-bottom: 1rem;
    }

    :where(h1:first-child) {
      font-size: 2.25rem;
    }

    :where(h2) {
      font-size: 1.625rem;
      line-height: 1.25;
      margin-top: 2.5em;
      margin-bottom: 1em;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--color-fd-border);
    }

    :where(h3) {
      font-size: 1.375rem;
      line-height: 1.4;
      margin-top: 2em;
      margin-bottom: 0.75em;
    }

    :where(h4) {
      font-size: 1.125rem;
      line-height: 1.5;
      margin-top: 1.75em;
      margin-bottom: 0.5em;
    }

    :where(h5, h6) {
      font-size: 0.875rem;
      line-height: 1.5;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    :where(h6) {
      color: var(--color-fd-muted-foreground);
    }

    :where(strong) {
      font-weight: 500;
    }

    :where(a):not(:where([data-card], [data-quicklook-from], .not-prose, .not-prose *)) {
      font-weight: 500;
      text-decoration: underline;
      text-decoration-color: var(--color-fd-primary);
      text-decoration-thickness: 2px;
      text-underline-offset: 4px;
      transition:
        color 0.2s ease,
        text-decoration-color 0.2s ease;

      &:hover {
        color: var(--color-fd-primary);
        text-decoration-color: currentColor;
      }
    }

    :where(ul > li)::marker {
      color: var(--color-fd-primary);
      font-size: 0.9em;
    }

    :where(ol > li)::marker {
      color: var(--color-fd-primary);
      font-weight: 500;
      font-feature-settings: 'tnum' 1;
    }

    :where(blockquote) {
      border-inline-start-width: 3px;
      border-inline-start-color: var(--color-fd-primary);
      background: color-mix(in oklab, var(--color-fd-primary) 5%, transparent);
      padding: 1rem 1.25rem;
    }

    :where(:not(pre) > code) {
      font-size: 0.875em;
      font-weight: 500;
      padding: 0.2em 0.4em;
      border: 1px solid var(--color-fd-border);
      background: var(--color-fd-muted);
    }

    :where(thead) {
      background: color-mix(in oklab, var(--color-fd-primary) 8%, var(--color-fd-muted));
    }

    :where(thead th) {
      font-size: 0.8125rem;
      padding: 0.75rem 1rem;
    }

    :where(tbody td) {
      padding: 0.75rem 1rem;
      vertical-align: top;
    }

    :where(tbody tr) {
      border-bottom: 1px solid color-mix(in oklab, var(--color-fd-border) 50%, transparent);
    }
  }

  @media (max-width: 736px) {
    .prose {
      font-size: 0.9375rem;
      line-height: 1.7;

      :where(h1) {
        font-size: 1.875rem;
      }

      :where(h1:first-child) {
        font-size: 1.75rem;
      }

      :where(h2) {
        font-size: 1.375rem;
        margin-top: 2em;
      }

      :where(h3) {
        font-size: 1.25rem;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }

      :where(h4) {
        font-size: 1.0625rem;
      }

      :where(table) {
        font-size: 0.8125rem;
      }

      :where(thead th),
      :where(tbody td) {
        padding: 0.625rem 0.75rem;
      }
    }
  }
}
```

- [ ] **Step 2: Verify types**

Run: `pnpm types:check`
Expected: PASS.

- [ ] **Step 3: Confirm the h2 rule compiled**

The h2 bottom border is the most recognizable signature of this section, and a CSS nesting error
would silently drop the whole block.

Note the two gotchas from Task 1: dev CSS lives under `/_next/static/chunks/*.css` (not
`/_next/static/css/`), and Lightning CSS normalizes colour functions — so grep for property names,
which survive compilation, rather than colour literals.

```bash
pkill -f 'next dev' 2>/dev/null; sleep 1
PORT=3210 pnpm dev &
sleep 30
curl -s http://localhost:3210/docs/get-started -o /tmp/skin-page.html
: > /tmp/skin-all.css
for u in $(grep -oE '/_next/static/chunks/[^"]*\.css' /tmp/skin-page.html | sort -u); do
  curl -s "http://localhost:3210$u" >> /tmp/skin-all.css
done
for p in text-underline-offset scroll-margin-top --tw-prose-quote-borders text-wrap; do
  printf '%-28s %s\n' "$p" "$(grep -c -- "$p" /tmp/skin-all.css)"
done
```

Expected: a non-zero count on every one of the four. A `0` on all four means the
`@layer components` block failed to compile — check nesting braces. A `0` on just one means that
specific rule was dropped.

Then: `pkill -f 'next dev'`

- [ ] **Step 4: Commit**

```bash
git add app/global.css
git commit -m "style: port the arbitrum-docs prose treatment

Adds the heading scale, h2 bottom rule, primary-underlined links,
primary list markers, blockquote tint, and table header tint. Heading
weights clamped to 500 (Aeonik has no bold face)."
```

---

### Task 4: Reskin the admonitions

**Files:**

- Modify: `components/mdx/VanillaAdmonition/styles.module.css` (full rewrite)

**Interfaces:**

- Consumes: `--color-fd-foreground`, `--color-fd-muted-foreground` from Task 1.
- Produces: nothing consumed later. The component's class names (`.admonition`,
  `.admonitionHeader`, `.admonitionIcon`, `.admonitionTitle`, `.admonitionContent`, `.icon`, and the
  five variants `.note` `.tip` `.info` `.warning` `.danger`) are referenced by
  `components/mdx/VanillaAdmonition/index.tsx:32-37` and **must all be preserved**.

- [ ] **Step 1: Rewrite the stylesheet**

Replace the entire contents of `components/mdx/VanillaAdmonition/styles.module.css` with:

```css
/* Admonition colours ported from arbitrum-docs: light from `_variables.scss`
   (--ifm-color-{info,success,warning,danger}*), dark from `_darkmode.scss`
   (.theme-admonition .alert--*). Variant names map:
     note -> alert--secondary   tip -> alert--success   info -> alert--info
   Left border is 4px, matching --ifm-alert-border-left-width. Radius stays
   rounded per the reskin's geometry decision. Title/content colours now come
   from tokens, so no dark-mode text overrides are needed. */

.admonition {
  margin-bottom: 16px;
  padding: 10px 12px 6px 12px;
  border-radius: 4px;
  border-left: 4px solid var(--vadm-color);
  background: var(--vadm-bg);
}

.admonitionHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  color: var(--vadm-color);
}

.admonitionIcon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.admonitionTitle {
  font-weight: 500;
  font-size: 17px;
  line-height: 1.3;
  color: var(--vadm-title, var(--color-fd-foreground));
}

.admonitionContent {
  font-size: 14px;
  color: color-mix(in oklab, var(--color-fd-foreground) 85%, transparent);
  line-height: 1.5;
  padding: 0px;
}

.note {
  --vadm-color: hsl(215 16% 47%);
  --vadm-bg: hsl(215 16% 47% / 0.1);
  --vadm-title: hsl(215 16% 35%);
}

.tip {
  --vadm-color: hsl(147 72% 35%);
  --vadm-bg: hsl(147 72% 35% / 0.08);
  --vadm-title: hsl(147 72% 25%);
}

.info {
  --vadm-color: hsl(211 99% 45%);
  --vadm-bg: hsl(211 99% 45% / 0.08);
  --vadm-title: hsl(211 99% 30%);
}

.warning {
  --vadm-color: hsl(38 92% 50%);
  --vadm-bg: hsl(38 92% 50% / 0.1);
  --vadm-title: hsl(32 81% 29%);
}

.danger {
  --vadm-color: hsl(0 72% 51%);
  --vadm-bg: hsl(0 72% 51% / 0.08);
  --vadm-title: hsl(0 72% 35%);
}

:global(.dark) .note {
  --vadm-color: hsl(215 20% 65%);
  --vadm-bg: hsl(215 20% 65% / 0.1);
  --vadm-title: hsl(215 20% 80%);
}

:global(.dark) .tip {
  --vadm-color: hsl(142 71% 45%);
  --vadm-bg: hsl(142 71% 45% / 0.1);
  --vadm-title: hsl(142 71% 65%);
}

:global(.dark) .info {
  --vadm-color: hsl(188 100% 53%);
  --vadm-bg: hsl(188 100% 53% / 0.1);
  --vadm-title: hsl(188 100% 75%);
}

:global(.dark) .warning {
  --vadm-color: hsl(45 93% 47%);
  --vadm-bg: hsl(45 93% 47% / 0.12);
  --vadm-title: hsl(48 96% 70%);
}

:global(.dark) .danger {
  --vadm-color: hsl(0 62% 55%);
  --vadm-bg: hsl(0 62% 55% / 0.12);
  --vadm-title: hsl(0 62% 75%);
}

.icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
  display: block;
}
```

Two changes worth noting: the `font-family: system-ui` declaration on `.admonition` is **removed**
so admonitions inherit Aeonik from `<body>`, and `.admonitionTitle` drops from weight 600 to 500 per
the global weight clamp.

- [ ] **Step 2: Verify types**

Run: `pnpm types:check`
Expected: PASS. CSS Modules are typed loosely, so a renamed class would NOT fail here — that is why
Step 1 lists the class names that must be preserved.

- [ ] **Step 3: Assert every class the component uses still exists**

```bash
cd /Users/allup/OCL/Fumadocs-test
for c in admonition admonitionHeader admonitionIcon admonitionTitle admonitionContent icon note tip info warning danger; do
  grep -q "\.$c\b" components/mdx/VanillaAdmonition/styles.module.css \
    && echo "ok   .$c" || echo "MISSING .$c"
done
```

Expected: eleven `ok` lines, no `MISSING`.

- [ ] **Step 4: Commit**

```bash
git add components/mdx/VanillaAdmonition/styles.module.css
git commit -m "style: reskin admonitions to the Arbitrum palette

Replaces the hardcoded GitHub-ish colours with arbitrum-docs' five-variant
system for both modes. Title and body text now derive from tokens, and the
component inherits Aeonik instead of forcing system-ui."
```

---

### Task 5: Brand the landing hero and OG images

**Files:**

- Modify: `app/[lang]/(home)/page.tsx:33` (hero section classes)
- Modify: `app/og/docs/[...slug]/route.tsx:16` (image props)

**Interfaces:**

- Consumes: `--color-arbitrum-gradient-from` / `-to` from Task 1.
- Produces: nothing consumed later.

- [ ] **Step 1: Rebrand the hero gradient**

In `app/[lang]/(home)/page.tsx`, line 33 currently reads:

```tsx
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 gap-6 bg-linear-to-b from-black to-[#565656] text-white">
```

Replace it with:

```tsx
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 gap-6 bg-linear-[135deg] from-arbitrum-gradient-from to-arbitrum-gradient-to text-white">
```

This swaps the hardcoded black→gray for the Arbitrum blue→teal gradient at 135°, matching
`--arbitrum-gradient-primary`. The `from-*` / `to-*` utilities come from the `--color-arbitrum-*`
tokens Task 1 added — Tailwind v4 generates gradient-stop utilities from any `--color-*` theme key.
Leave the `text-white` and the `text-white/80` / `text-white/60` paragraph classes as they are; both
gradient stops are dark enough for white text.

- [ ] **Step 2: Brand the OG images**

In `app/og/docs/[...slug]/route.tsx`, the `ImageResponse` call on lines 15–21 currently reads:

```tsx
  return new ImageResponse(
    <DefaultImage title={page.data.title} description={page.data.description} site={appName} />,
    {
      width: 1200,
      height: 630,
    },
  );
```

Replace with:

```tsx
  return new ImageResponse(
    <DefaultImage
      title={page.data.title}
      description={page.data.description}
      site={appName}
      // Arbitrum blue accent / teal site label. The generator hardcodes a
      // #0c0c0c background internally; matching Arbitrum's navy exactly would
      // require replacing DefaultImage with local JSX, which is out of scope.
      primaryColor="hsl(211 99% 45%)"
      primaryTextColor="hsl(188 100% 53%)"
    />,
    {
      width: 1200,
      height: 630,
    },
  );
```

- [ ] **Step 3: Verify types**

Run: `pnpm types:check`
Expected: PASS. If `primaryColor` / `primaryTextColor` are rejected as unknown props, confirm the
accepted names with:

```bash
grep -o -E '(primaryColor|primaryTextColor)[^;]{0,40}' node_modules/fumadocs-ui/dist/og.d.ts
```

and use whatever that reports.

- [ ] **Step 4: Confirm both routes render**

```bash
pkill -f 'next dev' 2>/dev/null; sleep 1
PORT=3210 pnpm dev &
sleep 25
curl -s -o /dev/null -w 'home %{http_code}\n' http://localhost:3210/
curl -s -o /dev/null -w 'og   %{http_code}\n' 'http://localhost:3210/og/docs/get-started/image.png'
```

Expected: `home 200`. For the OG route, `200` is a pass; a `404` means that slug does not exist —
find a real one with `curl -s http://localhost:3210/llms.txt | head -20` and retry. A `500` is a
genuine failure in this task.

Now assert the gradient utility actually compiled. A misspelled or unsupported Tailwind class does
**not** change the HTTP status — it silently emits nothing, so the hero would just look unstyled:

Per Task 1's gotchas, dev CSS is under `/_next/static/chunks/*.css`:

```bash
curl -s http://localhost:3210/ -o /tmp/skin-home.html
: > /tmp/skin-home.css
for u in $(grep -oE '/_next/static/chunks/[^"]*\.css' /tmp/skin-home.html | sort -u); do
  curl -s "http://localhost:3210$u" >> /tmp/skin-home.css
done
grep -c 'arbitrum-gradient-from' /tmp/skin-home.css
```

Expected: `2` or more — one for the `@theme` token declaration and at least one for the generated
gradient-stop utility. **`1` is a failure**, not a pass: it means the token declaration compiled but
the `from-arbitrum-gradient-from` utility did not generate. Confirm which by checking for a
gradient-stop custom property alongside it:

```bash
grep -c -- '--tw-gradient-from' /tmp/skin-home.css
```

If the utility did not generate, fall back to an explicit arbitrary value, which cannot fail to
compile:

```tsx
className =
  '... bg-[linear-gradient(135deg,var(--color-arbitrum-gradient-from),var(--color-arbitrum-gradient-to))] text-white';
```

Re-run the grep against `linear-gradient(135deg` to confirm.

```bash
pkill -f 'next dev'
```

- [ ] **Step 5: Commit**

```bash
git add "app/[lang]/(home)/page.tsx" "app/og/docs/[...slug]/route.tsx"
git commit -m "style: brand the landing hero and OG images

Hero uses the Arbitrum blue-to-teal gradient instead of hardcoded
black-to-gray. OG images get the Arbitrum accent colours."
```

---

### Task 6: Swap in the Arbitrum brand marks

**Files:**

- Modify: `lib/layout.shared.tsx:5` (import), `:29-35` (nav title)
- Delete: `components/OffchainMark.tsx`
- Replace: `public/favicon.ico`, `public/icon.png`, `public/apple-icon.png`
- Modify: `app/[lang]/layout.tsx:16-21` (stale comment)

**Interfaces:**

- Consumes: nothing from Tasks 1–5 (independent; can land in parallel).
- Produces: nothing consumed later.

- [ ] **Step 1: Replace the navbar mark**

In `lib/layout.shared.tsx`, delete the import on line 5:

```tsx
import { OffchainMark } from '@/components/OffchainMark';
```

Then replace the `nav.title` block (lines 29–35) — currently:

```tsx
    nav: {
      title: (
        <>
          <OffchainMark className="h-5 w-auto" />
          {appName}
        </>
      ),
    },
```

with:

```tsx
    nav: {
      title: (
        <>
          {/* The Arbitrum mark is four-colour (navy/blue/light-blue/white), so it
              cannot be a currentColor component the way OffchainMark was. Used in
              both light and dark, matching arbitrum-docs docusaurus.config.js,
              which sets `src` with no `srcDark`. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo.svg" alt="" className="h-5 w-auto" />
          {appName}
        </>
      ),
    },
```

A plain `<img>` is correct here rather than `next/image`: the asset is an SVG, `next/image` does not
optimize SVGs, and the navbar renders on every page so an extra optimizer round-trip buys nothing.
There is no ESLint configured in this repo, so the disable comment is harmless documentation — keep
it for anyone who adds linting later.

- [ ] **Step 2: Delete the orphaned component**

`components/OffchainMark.tsx` had exactly one consumer, which Step 1 just removed.

```bash
cd /Users/allup/OCL/Fumadocs-test
grep -rn "OffchainMark" app components lib || echo "no references remain"
trash components/OffchainMark.tsx
```

Expected: `no references remain`, then the file is gone. Use `trash`, never `rm -rf`.

- [ ] **Step 3: Swap the favicon**

`public/img/favicon.ico` is arbitrum-docs' own favicon, already in the repo but unreferenced.
`public/favicon.ico` is the Offchain one wired into `metadata.icons`.

```bash
cd /Users/allup/OCL/Fumadocs-test
cp public/img/favicon.ico public/favicon.ico
ls -la public/favicon.ico
```

Expected: roughly 105 KB (was ~14.7 KB).

- [ ] **Step 4: Generate the app icons**

```bash
cd /Users/allup/OCL/Fumadocs-test
rsvg-convert -h 400 public/img/logo.svg -o /tmp/arb-mark.png
magick -size 512x512 xc:'#213147' /tmp/arb-mark.png -gravity center -composite public/icon.png
magick public/icon.png -resize 180x180 public/apple-icon.png
file public/icon.png public/apple-icon.png
```

Expected: `512 x 512` and `180 x 180`, both **without** "gray" in the description — they should now
be RGB, not `8-bit gray+alpha`.

Opaque `#213147` is deliberate, not decorative: `logo.svg` contains white internal elements that
become holes on a transparent PNG and vanish against light browser chrome, and iOS composites
`apple-touch-icon` transparency onto white. `logo.svg` is portrait (1080 × 1218.5) — `-h 400` plus
`-gravity center -composite` letterboxes it. Never stretch to square.

- [ ] **Step 5: Fix the stale icon comment**

In `app/[lang]/layout.tsx`, the comment on lines 16–21 ends with a sentence that is now wrong:

```
  // convention and lets browsers reliably pick the multi-size icon. The white
  // Offchain hexagon on a charcoal tile stays visible on both light and dark
  // tab strips.
```

Replace those three lines with:

```
  // convention and lets browsers reliably pick the multi-size icon. The Arbitrum
  // mark sits on an opaque #213147 tile so its white internal elements stay
  // visible on both light and dark tab strips.
```

- [ ] **Step 6: Verify types**

Run: `pnpm types:check`
Expected: PASS. A missed `OffchainMark` reference fails here.

- [ ] **Step 7: Confirm the logo is served**

```bash
pkill -f 'next dev' 2>/dev/null; sleep 1
PORT=3210 pnpm dev &
sleep 25
curl -s -o /dev/null -w 'logo    %{http_code}\n' http://localhost:3210/img/logo.svg
curl -s -o /dev/null -w 'favicon %{http_code}\n' http://localhost:3210/favicon.ico
curl -s -o /dev/null -w 'icon    %{http_code}\n' http://localhost:3210/icon.png
curl -s http://localhost:3210/docs/get-started | grep -c 'img/logo.svg'
```

Expected: three `200`s, and `1` or more for the logo reference in the rendered HTML. Then:

```bash
pkill -f 'next dev'
```

- [ ] **Step 8: Commit**

```bash
git add lib/layout.shared.tsx "app/[lang]/layout.tsx" public/favicon.ico public/icon.png public/apple-icon.png
git add -u components/OffchainMark.tsx
git commit -m "style: swap in the Arbitrum brand marks

Navbar uses the Arbitrum logo (four-colour, so an img rather than a
currentColor component). Favicon replaced with arbitrum-docs'. App icons
regenerated from logo.svg on an opaque #213147 tile so the mark's white
internals stay legible. Removes the now-orphaned OffchainMark."
```

---

### Task 7: Full verification

**Files:** none — verification only.

**Interfaces:**

- Consumes: everything from Tasks 1–6.

- [ ] **Step 1: Run the automated gates**

```bash
cd /Users/allup/OCL/Fumadocs-test
pnpm types:check
pnpm build
pnpm format
pnpm check-links 2>&1 | grep -c '  ->  '
```

Expected: types PASS; build completes; format clean; **the link count equals the baseline recorded
before Task 1**. Any movement means routing or content changed, which is out of scope for a reskin —
investigate before proceeding.

- [ ] **Step 2: Commit any formatting changes**

```bash
git add -A
git commit -m "chore: format after reskin" || echo "nothing to format"
```

- [ ] **Step 3: Find a page exercising all five admonition variants**

```bash
cd /Users/allup/OCL/Fumadocs-test
for v in note tip info warning danger; do
  printf "%-8s " "$v"; grep -rl "VanillaAdmonition[^>]*type=\"$v\"\|:::$v" content/docs/en | head -1
done
```

If no single page carries all five, create `content/docs/en/_skin-check.mdx` with the frontmatter the
schema requires (`title`, `description`, `content_type: reference`, `author`, `sme`) and one
admonition of each type, capture it in Step 5, then delete it before finishing.

- [ ] **Step 4: Start the target site**

```bash
pkill -f 'next dev' 2>/dev/null; sleep 1
PORT=3210 pnpm dev &
sleep 25
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3210/docs/get-started
```

Expected: `200`.

- [ ] **Step 5: Capture side-by-side screenshots**

Reference is the **live** site — no local Docusaurus build needed. Using Claude-in-Chrome, capture
each pair in both light and dark (toggle via the site's theme switcher), saving to
`scratchpad/reskin/{page}-{mode}-{side}.png`:

| Page               | Reference                                      | Target                                          |
| ------------------ | ---------------------------------------------- | ----------------------------------------------- |
| get-started        | `https://docs.arbitrum.io/get-started/`        | `http://localhost:3210/docs/get-started`        |
| how-arbitrum-works | `https://docs.arbitrum.io/how-arbitrum-works/` | `http://localhost:3210/docs/how-arbitrum-works` |
| stylus             | `https://docs.arbitrum.io/stylus/`             | `http://localhost:3210/docs/stylus`             |
| admonitions        | the equivalent live page, if one exists        | the page from Step 3                            |
| landing            | `https://docs.arbitrum.io/`                    | `http://localhost:3210/`                        |

If a target URL 404s, find the real slug with `curl -s http://localhost:3210/llms.txt | head -40`.

- [ ] **Step 6: Walk the fidelity checklist**

Compare each pair and record pass/fail. Each item names the task it falsifies:

```
Task 1  ☐ primary reads Arbitrum blue in light, teal in dark
        ☐ dark surfaces navy-tinted, not neutral gray
        ☐ borders, cards, popovers match the reference
        ☐ card hover still perceptible (accent == muted is a known risk)
Task 2  ☐ Aeonik actually rendering, not a system fallback
        ☐ Aeonik Fono in code blocks
        ☐ headings crisp at 40px, no faux-bold smearing
Task 3  ☐ h2 bottom rule present
        ☐ links underlined 2px in primary at 4px offset
        ☐ heading anchor icons and Cards NOT underlined
        ☐ list markers primary-coloured
        ☐ blockquote 3px primary border + tint
        ☐ table thead tinted 8% primary
Task 4  ☐ all five admonition variants match, both modes
        ☐ light-mode `note` looks right (its values were DERIVED, not
          sourced — see the spec footnote; most likely item to need a tweak)
Task 5  ☐ landing hero blue→teal, not black→gray
Task 6  ☐ navbar logo legible in BOTH modes — the mark's navy element on the
          navy dark background is the known risk. If it disappears, escalate:
          `public/img/logo_black.svg` is available for a two-variant approach.
        ☐ browser tab shows the Arbitrum favicon
```

- [ ] **Step 7: Clean up**

```bash
pkill -f 'next dev'
cd /Users/allup/OCL/Fumadocs-test
trash content/docs/en/_skin-check.mdx 2>/dev/null || echo "no scratch page to remove"
git status --short
```

Expected: no unexpected modified files. The scratch page must not be committed.

- [ ] **Step 8: Report**

Report to the user: the checklist with pass/fail per item, the screenshot directory, the link-count
baseline versus final, and any item needing a follow-up decision (most likely the dark-mode logo
legibility and the light-mode `note` admonition).

---

## Self-Review

**Spec coverage.** §1 tokens → Task 1. §2 fonts → Task 2. §3 prose → Task 3. §4.1 admonitions →
Task 4. §4.2 landing hero → Task 5 Step 1. §4.3 OG → Task 5 Step 2. §4.4 Inkeep → **no task, by
design** (the spec's corrected position is "leave it"). §5 verification → Task 7. §6 brand marks →
Task 6. Out-of-scope items have no tasks, as intended. Pre-existing orphans are protected by a
Global Constraint rather than a task.

**Placeholder scan.** No TBD/TODO. Every code step contains complete, literal content. The one
conditional branch (Task 2 Step 2 woff2 fallback) states both paths explicitly and caps debugging at
one attempt.

**Type and name consistency.** `--font-sans` / `--font-mono` are produced in Task 2 and consumed in
Task 3, matching the names already in `app/[lang]/layout.tsx:51` and `body className="font-sans"`.
`--color-arbitrum-gradient-from` / `-to` are defined in Task 1 and consumed as
`from-arbitrum-gradient-from` / `to-arbitrum-gradient-to` in Task 5. `sans` replaces `geist` in both
the const and the `className` interpolation. The eleven CSS Module class names in Task 4 are asserted
against `index.tsx:32-37` by a shell check, because CSS Modules would not fail `types:check`.

**Verification adequacy.** Because there is no test runner, each task pairs `types:check` with a
check targeting that task's specific silent-failure mode: a compiled-CSS grep for Tasks 1 and 3
(Tailwind syntax errors do not fail typecheck), a served-font assertion for Task 2, a class-name
assertion for Task 4, and HTTP status plus a rendered-HTML grep for Tasks 5 and 6.
