# Fumadocs Styling Adoption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adopt the visual style of https://www.fumadocs.dev/ across the Fumadocs-test site (rounded corners, minimal docs navbar + styled sidebar tabs, a full landing-page clone, twoslash code blocks) while keeping the Offchain brand color scheme.

**Architecture:** fumadocs.dev runs the same Fumadocs UI library. Most work is config + a landing rebuild, not a new design system. We remove a square-corner CSS override, adjust `DocsLayout` options, wire twoslash into the MDX pipeline, and rebuild `app/[lang]/(home)/page.tsx` porting Fumadocs' landing structure with Arbitrum content and the Offchain palette. The hero's WebGL shader background is replaced with a CSS-gradient animated background (no heavy shader dep).

**Tech Stack:** Next.js 16, Fumadocs UI 16.11, Tailwind CSS 4, TypeScript (strict), pnpm 10.

## Global Constraints

- Keep the Offchain palette: never edit the `--color-fd-*` tokens in `app/global.css`. Map Fumadocs' `bg-brand`/`text-brand` → `--color-fd-primary` (`bg-fd-primary`/`text-fd-primary`).
- No new per-section color scheme (no `--headless-color`/`--framework-color`/`--ui-color`).
- Pin new deps to exact versions: install with `pnpm add -E <pkg>`.
- Node 22 / pnpm 10 only. ESM. `verbatimModuleSyntax` is on — use `import type` for type-only imports.
- MDX is excluded from Prettier (`.prettierignore`) — do not run Prettier on `.mdx`.
- Verification per task (this repo has no unit-test runner; `pnpm types:check` is the gate): run `pnpm types:check` and, where noted, a dev smoke on a FRESH port (`PORT=3210 pnpm dev`) after `pkill -f 'next dev'` to avoid the singleton-lock race. Kill the dev server when done.
- en-only landing copy this pass.
- Commit after each task. Do NOT push (user pushes/PRs explicitly).

---

### Task 1: Add dependencies + `cn()` helper

**Files:**

- Modify: `package.json` (dependencies)
- Create: `lib/cn.ts`

**Interfaces:**

- Produces: `cn(...inputs: ClassValue[]): string` from `@/lib/cn` — used by all later tasks (marquee, hero, page).

- [ ] **Step 1: Install exact-pinned deps**

Run:

```bash
cd /Users/allup/OCL/Fumadocs-test
pnpm add -E class-variance-authority clsx fumadocs-twoslash
```

Expected: `package.json` gains the three deps with exact versions (no `^`). `tailwind-merge` is already present.

- [ ] **Step 2: Create the `cn` helper**

Create `lib/cn.ts`:

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Verify types**

Run: `pnpm types:check`
Expected: `✓ Types generated successfully`, no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml lib/cn.ts
git commit -m "build: add cva, clsx, fumadocs-twoslash + cn() helper"
```

---

### Task 2: Rounded corners + marquee keyframes + page-width token

**Files:**

- Modify: `app/global.css`

**Interfaces:**

- Produces: `animate-marquee` / `animate-marquee-vertical` utilities + `--spacing-page` token, consumed by the landing (Task 6/7).

- [ ] **Step 1: Remove the square-corner override**

In `app/global.css`, DELETE these two blocks:

```css
#nd-docs-layout *,
#nd-home-layout *,
#nd-nav *,
[data-radix-popper-content-wrapper] * {
  border-radius: 0 !important;
}

#nd-docs-layout .fd-step::before {
  border-radius: 9999px !important;
}
```

- [ ] **Step 2: Add page-width token + marquee keyframes**

In `app/global.css`, inside the existing `@theme { ... }` light block, add:

```css
--spacing-page: 1436px;
```

Then append a new block after the `@theme` blocks (ported from fumadocs.dev):

```css
@theme inline {
  --animate-marquee: marquee var(--duration) infinite linear;
  --animate-marquee-vertical: marquee-vertical var(--duration) linear infinite;

  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(calc(-100% - var(--gap)));
    }
  }

  @keyframes marquee-vertical {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(calc(-100% - var(--gap)));
    }
  }
}
```

- [ ] **Step 3: Dev smoke — corners are rounded**

Run:

```bash
pkill -f 'next dev' 2>/dev/null; sleep 1
PORT=3210 pnpm dev
```

Wait for `Ready`, then `curl -s -o /dev/null -w '%{http_code}' http://localhost:3210/docs/get-started` → expect `200`. (Visual rounding confirmed in browser next session.) Then `pkill -f 'next dev'`.

- [ ] **Step 4: Commit**

```bash
git add app/global.css
git commit -m "style: adopt rounded corners; add page-width token + marquee keyframes"
```

---

### Task 3: Docs layout polish (minimal navbar + styled sidebar tabs)

**Files:**

- Modify: `app/[lang]/docs/layout.tsx`

**Interfaces:**

- Consumes: `baseOptions(lang)` from `@/lib/layout.shared` (returns `{ links, nav, githubUrl, i18n }`).

- [ ] **Step 1: Replace the docs layout body**

Replace the entire return in `app/[lang]/docs/layout.tsx` with:

```tsx
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { CSSProperties, ReactNode } from 'react';

import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  const base = baseOptions(lang);
  return (
    <DocsLayout
      {...base}
      tree={source.pageTree[lang]}
      links={base.links?.filter((item) => item.type === 'icon')}
      tabs={{
        transform(option, node) {
          if (!node.icon) return option;
          return {
            ...option,
            icon: (
              <div
                className="[&_svg]:size-full size-full rounded-md border p-1.5 text-fd-primary max-md:bg-fd-primary/10"
                style={{ '--tab-color': 'var(--color-fd-primary)' } as CSSProperties}
              >
                {node.icon}
              </div>
            ),
          };
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
```

Note: `base.links` currently has only `type: 'menu'`/`main` entries plus `githubUrl` (which Fumadocs renders as an icon automatically). Filtering to `type === 'icon'` yields an empty array, so the docs navbar shows just the GitHub icon + search + theme — matching fumadocs.dev. The mega-menu stays on the home layout.

- [ ] **Step 2: Verify types**

Run: `pnpm types:check`
Expected: PASS.

- [ ] **Step 3: Dev smoke**

Start dev (as Task 2 Step 3). `curl -s -o /dev/null -w '%{http_code}' http://localhost:3210/docs/stylus` → `200`. Kill dev.

- [ ] **Step 4: Commit**

```bash
git add "app/[lang]/docs/layout.tsx"
git commit -m "style: minimal docs navbar + styled sidebar section tabs"
```

---

### Task 4: Wire twoslash into the MDX pipeline

**Files:**

- Modify: `app/global.css` (import twoslash CSS)
- Modify: `source.config.ts` (add rehype-code transformer)

**Interfaces:**

- Consumes: `fumadocs-twoslash` (Task 1).

- [ ] **Step 1: Import twoslash CSS**

In `app/global.css`, add after the existing `@import 'fumadocs-ui/css/preset.css';` line:

```css
@import 'fumadocs-twoslash/twoslash.css';
```

- [ ] **Step 2: Add the transformer to source.config.ts**

In `source.config.ts`, add the import at the top with the other imports:

```ts
import { transformerTwoslash } from 'fumadocs-twoslash';
```

Replace the empty `mdxOptions` in `defineConfig` with:

```ts
  mdxOptions: {
    rehypeCodeOptions: {
      langs: ['ts', 'js', 'rust', 'solidity', 'bash'],
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash(),
      ],
    },
  },
```

Add this import too:

```ts
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
```

- [ ] **Step 3: Verify types + build**

Run: `pnpm types:check` → PASS.
Run: `pnpm build` → completes without MDX/twoslash errors. (Twoslash only activates on ` ```ts twoslash ` blocks; existing shell/Rust/Solidity blocks are unaffected.)

- [ ] **Step 4: Commit**

```bash
git add app/global.css source.config.ts
git commit -m "feat: wire fumadocs-twoslash for TypeScript code blocks"
```

---

### Task 5: Copy Offchain brand assets into public/

**Files:**

- Create: `public/brand/*` (copied from `~/tmp/archive/0426_Offchain_Logo/`)

**Interfaces:**

- Produces: `/brand/offchain-icon-white.svg`, `/brand/offchain-icon-charcoal.svg`, `/brand/offchain-logo-horizontal-white.svg`, `/brand/offchain-logo-horizontal-charcoal.svg`, `/brand/offchain-logo-horizontal-black.svg`, `/brand/offchain-logo-stacked-charcoal.svg` — consumed by the landing (Task 7).

- [ ] **Step 1: Copy + rename assets**

Run:

```bash
cd /Users/allup/OCL/Fumadocs-test
mkdir -p public/brand
SRC=~/tmp/archive/0426_Offchain_Logo
cp "$SRC/0126_Offchain_Icon/0126_Offchain_Icon_White.svg" public/brand/offchain-icon-white.svg
cp "$SRC/0126_Offchain_Icon/0126_Offchain_Icon_Charcoal.svg" public/brand/offchain-icon-charcoal.svg
cp "$SRC/0126_Offchain_Logo_Horizontal/0126_Offchain_Logo_Horizontal_White.svg" public/brand/offchain-logo-horizontal-white.svg
cp "$SRC/0126_Offchain_Logo_Horizontal/0126_Offchain_Logo_Horizontal_Charcoal.svg" public/brand/offchain-logo-horizontal-charcoal.svg
cp "$SRC/0126_Offchain_Logo_Horizontal/0126_Offchain_Logo_Horizontal_Black.svg" public/brand/offchain-logo-horizontal-black.svg
cp "$SRC/0126_Offchain_Logo_Stacked/0126_Offchain_Logo_Stacked_Charcoal.svg" public/brand/offchain-logo-stacked-charcoal.svg
ls public/brand
```

Expected: six SVG files listed.

- [ ] **Step 2: Commit**

```bash
git add public/brand
git commit -m "assets: add Offchain brand logos for landing"
```

---

### Task 6: Landing client components — Marquee + animated Hero background

**Files:**

- Create: `app/[lang]/(home)/marquee.tsx`
- Create: `app/[lang]/(home)/hero-bg.tsx`

**Interfaces:**

- Consumes: `cn` from `@/lib/cn` (Task 1); `animate-marquee` from global.css (Task 2).
- Produces: `Marquee` (named export) and `HeroBackground` (named export) — consumed by `page.tsx` (Task 7).

- [ ] **Step 1: Create the Marquee (ported from fumadocs.dev)**

Create `app/[lang]/(home)/marquee.tsx`:

```tsx
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface MarqueeProps extends ComponentProps<'div'> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        'group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]',
        vertical ? 'flex-col' : 'flex-row',
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex shrink-0 justify-around [gap:var(--gap)]',
              vertical ? 'animate-marquee-vertical flex-col' : 'animate-marquee flex-row',
              pauseOnHover && 'group-hover:[animation-play-state:paused]',
              reverse && '[animation-direction:reverse]',
            )}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
```

- [ ] **Step 2: Create the CSS-gradient animated hero background**

Create `app/[lang]/(home)/hero-bg.tsx` (client component; replaces Fumadocs' WebGL shader hero — no `@paper-design/shaders-react` dependency):

```tsx
'use client';

export function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-1 overflow-hidden">
      <div className="absolute -inset-[40%] animate-fd-fade-in bg-[conic-gradient(from_180deg_at_50%_50%,var(--color-fd-primary)_0deg,transparent_120deg,var(--color-fd-accent)_240deg,var(--color-fd-primary)_360deg)] opacity-20 blur-3xl [animation-duration:1200ms]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-fd-background" />
    </div>
  );
}
```

- [ ] **Step 3: Verify types**

Run: `pnpm types:check` → PASS.

- [ ] **Step 4: Commit**

```bash
git add "app/[lang]/(home)/marquee.tsx" "app/[lang]/(home)/hero-bg.tsx"
git commit -m "feat(home): marquee + CSS-gradient hero background components"
```

---

### Task 7: Rebuild the landing page

**Files:**

- Modify (full rewrite): `app/[lang]/(home)/page.tsx`

**Interfaces:**

- Consumes: `Marquee`, `HeroBackground` (Task 6); `cn` (Task 1); brand assets (Task 5); `docsRoute`, `gitConfig`, `i18n`.

- [ ] **Step 1: Rewrite page.tsx**

Replace the entire contents of `app/[lang]/(home)/page.tsx` with the following. It ports fumadocs.dev's structure (hero container, intro band, "try it" code band, preview band, feature-card grid, marquee, footer) using Arbitrum content and the Offchain palette (`bg-brand`→`bg-fd-primary`).

```tsx
import { cva } from 'class-variance-authority';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { ArrowLeftRight, BookOpen, Braces, Code, Cog, Network, Rocket, Server } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { i18n } from '@/lib/i18n';
import { docsRoute } from '@/lib/shared';

import { HeroBackground } from './hero-bg';
import { Marquee } from './marquee';

const buttonVariants = cva(
  'inline-flex justify-center px-5 py-3 rounded-full font-medium tracking-tight transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-fd-primary text-fd-primary-foreground hover:opacity-90',
        secondary: 'border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

const cardVariants = cva(
  'rounded-2xl text-sm p-6 border bg-fd-card text-fd-card-foreground shadow-lg',
);

const features = [
  {
    icon: Code,
    title: 'Build apps with Solidity',
    desc: 'Deploy Solidity smart contracts to Arbitrum chains.',
    href: '/build-decentralized-apps',
  },
  {
    icon: Braces,
    title: 'Build apps with Stylus',
    desc: 'Write contracts in Rust, C, and C++ that compile to WebAssembly.',
    href: '/stylus',
  },
  {
    icon: BookOpen,
    title: 'Arbitrum essentials',
    desc: 'Bridging, precompiles, the NodeInterface, and platform reference.',
    href: '/arbitrum-essentials',
  },
  {
    icon: Network,
    title: 'Launch a chain',
    desc: 'Configure, deploy, and operate your own Arbitrum chain.',
    href: '/launch-arbitrum-chain',
  },
  {
    icon: Server,
    title: 'Run a node',
    desc: 'Run the machines that power Arbitrum chains.',
    href: '/run-a-node',
  },
  {
    icon: Cog,
    title: 'How Arbitrum works',
    desc: 'The protocols and mechanisms behind Arbitrum Nitro.',
    href: '/how-arbitrum-works',
  },
];

const marqueeLogos = [
  '/brand/offchain-logo-horizontal-charcoal.svg',
  '/brand/offchain-icon-charcoal.svg',
  '/brand/offchain-logo-stacked-charcoal.svg',
];

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const prefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;
  const docs = (path: string) => `${prefix}${docsRoute}${path}`;

  return (
    <main className="pt-4 pb-6 md:pb-12">
      {/* Hero */}
      <div className="relative mx-auto flex min-h-[600px] h-[70vh] max-h-[900px] w-full max-w-[1400px] overflow-hidden rounded-2xl border">
        <HeroBackground />
        <div className="z-2 flex size-full flex-col px-4 max-md:items-center max-md:text-center md:p-12">
          <p className="mt-12 w-fit rounded-full border border-fd-primary/50 p-2 text-xs font-medium text-fd-primary">
            The finance-native platform for onchain apps.
          </p>
          <h1 className="my-8 text-4xl font-medium leading-tight xl:mb-12 xl:text-5xl">
            Build onchain,
            <br />
            your <span className="text-fd-primary">way</span>.
          </h1>
          <div className="flex w-fit flex-row flex-wrap items-center justify-center gap-4">
            <Link href={docs('/get-started')} className={cn(buttonVariants(), 'max-sm:text-sm')}>
              Get started
            </Link>
            <Link
              href={docs('/launch-arbitrum-chain')}
              className={cn(buttonVariants({ variant: 'secondary' }), 'max-sm:text-sm')}
            >
              Launch a chain
            </Link>
          </div>
        </div>
      </div>

      {/* Intro band */}
      <div className="mx-auto mt-12 grid w-full max-w-[1400px] grid-cols-1 gap-10 px-6 md:px-12 lg:mt-20">
        <p className="col-span-full text-2xl font-light leading-snug tracking-tight md:text-3xl xl:text-4xl">
          Arbitrum is the <span className="font-medium text-fd-primary">finance-native</span>{' '}
          platform providing infrastructure for{' '}
          <span className="font-medium text-fd-primary">apps</span>, tokenization, and{' '}
          <span className="font-medium text-fd-primary">dedicated chains</span>. These docs explain
          the protocols, chains, services, and SDKs developers use to build on Arbitrum.
        </p>
      </div>

      {/* Try it out */}
      <div className="mx-auto mt-12 w-full max-w-[1400px] px-6 md:px-12">
        <div className="mx-auto w-full max-w-[800px] rounded-2xl border bg-fd-card p-2 text-fd-card-foreground shadow-lg">
          <div className="flex flex-row items-center gap-2">
            <h2 className="content-center rounded-xl border-2 border-fd-primary/50 px-2 font-mono font-bold uppercase text-fd-primary">
              Try it out
            </h2>
            <div className="flex-1">
              <ServerCodeBlock code="cargo stylus new my-first-stylus-app" lang="bash" />
            </div>
          </div>
        </div>
      </div>

      {/* Preview band (placeholder — swap for a real docs screenshot) */}
      <div className="mx-auto mt-12 w-full max-w-[1400px] px-6 md:px-12">
        <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-br from-fd-primary/10 to-fd-accent/20">
          <Image
            src="/brand/offchain-logo-stacked-charcoal.svg"
            alt="Offchain"
            width={160}
            height={160}
            className="opacity-40 dark:invert"
          />
        </div>
      </div>

      {/* Feature cards */}
      <div className="mx-auto mt-12 grid w-full max-w-[1400px] grid-cols-1 gap-6 px-6 md:grid-cols-2 md:px-12 lg:mt-20 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.href}
              href={docs(f.href)}
              className={cn(cardVariants(), 'transition-colors hover:bg-fd-accent')}
            >
              <Icon className="mb-3 size-8 rounded-md bg-fd-primary p-1.5 text-fd-primary-foreground" />
              <h3 className="mb-1 font-medium tracking-tight">{f.title}</h3>
              <p className="text-fd-muted-foreground">{f.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Marquee (placeholder logos — swap for ecosystem logos) */}
      <div className="mx-auto mt-16 w-full max-w-[1400px] px-6 md:px-12">
        <p className="mb-4 text-center text-sm text-fd-muted-foreground">Built by Offchain Labs</p>
        <Marquee pauseOnHover className="[--duration:30s]">
          {marqueeLogos.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt=""
              width={140}
              height={40}
              className="mx-6 h-8 w-auto opacity-60 dark:invert"
            />
          ))}
        </Marquee>
      </div>

      {/* Footer CTA */}
      <div className="mx-auto mt-16 w-full max-w-[1400px] px-6 md:px-12">
        <div className="flex flex-col items-center gap-6 rounded-2xl border bg-fd-card p-12 text-center shadow-lg">
          <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
            Start building on Arbitrum
          </h2>
          <Link href={docs('/get-started')} className={cn(buttonVariants())}>
            Get started
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `pnpm types:check` → PASS. If `ServerCodeBlock` import path errors, confirm export with `grep -r "ServerCodeBlock" node_modules/fumadocs-ui/dist/components/codeblock.rsc.d.ts` and adjust the import path to the reported one.

- [ ] **Step 3: Dev smoke**

Start dev on 3210. Check both:

```bash
curl -s -o /dev/null -w 'home %{http_code}\n' http://localhost:3210/
curl -s -o /dev/null -w 'docs %{http_code}\n' http://localhost:3210/docs/get-started
```

Expect `200` for both, no error markers in the dev log. Kill dev.

- [ ] **Step 4: Commit**

```bash
git add "app/[lang]/(home)/page.tsx"
git commit -m "feat(home): rebuild landing in fumadocs.dev style with Offchain content"
```

---

### Task 8: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Types + build + format + links**

Run:

```bash
pnpm types:check
pnpm build
pnpm format
pnpm check-links 2>&1 | grep -E '  ->  ' | wc -l   # expect 212 (unchanged baseline)
```

Expected: types PASS; build completes; format clean; broken-link count unchanged at 212 (all pre-existing accepted 404s).

- [ ] **Step 2: Commit any format changes**

```bash
git add -A
git commit -m "chore: format after styling adoption" || echo "nothing to format"
```

- [ ] **Step 3: Report visual-QA checklist for next session (browser)**

List for the user to confirm in a browser: rounded corners everywhere; docs pages show minimal navbar (GitHub/search/theme) + styled section tabs; home hero + gradient bg + CTAs; intro band; "try it" code block; preview placeholder; 6 feature cards; marquee scrolling; footer CTA; dark-mode parity.

---

## Self-Review

**Spec coverage:** A (rounded corners) → Task 2. B (docs polish) → Task 3. C (landing) → Tasks 5–7. D (twoslash) → Task 4. Deps → Task 1. Assets → Task 5. Verification → Task 8. All spec sections covered.

**Placeholder scan:** Preview band + marquee logos are intentional, labeled placeholders (per approved spec). No "TBD"/"implement later" in code steps; all code is complete.

**Type consistency:** `cn` signature consistent across Tasks 1/6/7. `Marquee`/`HeroBackground` named exports match imports in Task 7. `baseOptions(lang)` shape matches usage in Task 3.
