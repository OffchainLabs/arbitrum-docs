---
name: arbitrum-brand-svg-diagrams
description: >-
  Create or improve lightweight, brand-consistent SVG concept diagrams for the
  Arbitrum docs, using the official Google Drive infographic asset kit as the
  palette/style source. Use when asked to "make a diagram more efficient",
  replace a bloated haw-*.svg (draw.io PNG-in-SVG exports), replace an ASCII /
  box-drawing diagram in an MDX page with a real image, author a new concept
  diagram for docs/how-arbitrum-works or similar, or build a diagram from the
  Arbitrum brand assets. Hand-authored lean vector SVG — not Mermaid, not a
  full Excalidraw/draw.io pipeline.
---

# Arbitrum brand SVG diagrams

Author small, crisp, on-brand SVG concept diagrams for the docs and replace
bloated raster-in-SVG exports. A hand-authored vector diagram is a few KB and
scales perfectly; the draw.io exports it replaces are often >1MB.

## When to use

- "This diagram is too heavy / make it more efficient" — a `static/img/*.svg`
  that is really a draw.io export with a base64 PNG inside (often 1–2 MB).
- Replacing an **ASCII / box-drawing diagram** in an MDX page with a real image.
  These often carry a `{/* TODO: replace with an SVG diagram asset */}` marker
  and a `<div className="ascii-diagram">` wrapper — remove both.
- Creating a new **conceptual** diagram (layers, boxes, flows, brackets) for a
  docs page, especially `docs/how-arbitrum-works/**`.
- You have the Arbitrum brand asset kit as a source and want palette/style
  consistency.

## When NOT to use

- **Complex or interactive diagrams** (animated flows, clickable nodes, the
  transaction-lifecycle visualizers). Those use the ReactFlow /
  `DrawioReactFlow` component pipeline (Excalidraw → draw.io → SVG). This skill
  is for **static concept art only**.
- Photographic / screenshot content — keep as PNG/WebP.
- Never propose Mermaid or any text-DSL diagram tool (standing preference).

## Asset sources (the palette comes from here)

Google Drive "Arbitrum Infographic Library"
folder id `11WkZ7mn3wLDXB_-QYfjBA5-6hwCYkG2o`. Subfolders: `Basicshapes/`,
`AdditionalIcons/`, `Numbers/`, `OCL_logos/`, `foundation_logos/`, plus
`background.svg`.

**Official palette** (extracted from `background.svg`):

| Hex       | Role                                                                          |
| --------- | ----------------------------------------------------------------------------- |
| `#213147` | Arbitrum dark navy — process steps / base surfaces                            |
| `#12aaff` | Arbitrum signature cyan — entities, services, value destinations              |
| `#1b4add` | Arbitrum blue — mid-gradient (background only)                                |
| `#152c4e` | dark navy — top of the gradient (background only)                             |
| `#9dcced` | light-blue tint — connectors, arrowheads, lane headers                        |
| `#0b1b2e` | near-black — **text on cyan**                                                 |
| `#e6007a` | magenta — contracts / inboxes / pools / convergence points                    |
| `#f97316` | orange — legacy "this is code" fill; **use a code block instead** (see below) |

Map color to _meaning_: pick one role per hue and hold it for the whole diagram
(e.g. cyan = where value lands, magenta = system contract or pool, navy =
process step). Add a small color key when you use three or more.

### Text color is measured, not chosen

An earlier version of this skill said "white text on cyan/magenta boxes" for
baked-background diagrams. **White on cyan is 2.55:1 and fails WCAG at every
size.** Use this table instead — every figure below is computed, not estimated:

| Box fill                | Title text         | Sublabel text     | Never use                  |
| ----------------------- | ------------------ | ----------------- | -------------------------- |
| cyan `#12aaff`          | `#0b1b2e` — 6.8:1  | `#0b2438` — 6.2:1 | white → **2.55:1 FAIL**    |
| magenta `#e6007a`       | `#ffffff` — 4.5:1  | `#ffffff` — 4.5:1 | `#ffe3f1` → **3.8:1 FAIL** |
| navy `#213147`          | `#ffffff` — 13.2:1 | `#c9dcef` — 9.4:1 | —                          |
| Nova orange `#ff7700`   | `#0b1b2e` — 6.5:1  | `#0b2438` — 6.0:1 | white → **2.66:1 FAIL**    |
| legacy orange `#f97316` | `#0b1b2e` — 6.2:1  | —                 | white → **2.80:1 FAIL**    |

Both orange rows fail on white, so the legacy "orange box + white label = this is
code" convention is itself inaccessible — a second reason to use the palenight
code block below. `#ff7700` is the real Arbitrum Nova brand orange (it comes out
of the Nova logomark); reach for it only when the box genuinely _is_ Nova.

Magenta is the one fill with no headroom: white measures **4.52:1** against a
4.5 floor. It carries a sublabel only at white — never tint it, and never assume
a smaller sublabel is safe there.

Text sitting directly on the **gradient** has no fixed backdrop, so its contrast
depends on _where_ on the canvas it sits — the gradient runs dark navy at the top
to bright cyan at the bottom. Measure it against the render (Verification step 5).

**The safe fill inverts near the bottom.** Light text works down to roughly
three-quarters of the canvas, then fails as the gradient reaches full cyan, and
dark text takes over. Measured on two real diagrams:

| Depth down the canvas  | `#9dcced` | `#eaf5ff` | `#0b1b2e` | Use       |
| ---------------------- | --------: | --------: | --------: | --------- |
| upper half             | 5.0–8.2:1 |    8.2:1+ |       low | `#9dcced` |
| ~75–80%                |   **3.1** |   **4.8** |   **3.3** | `#eaf5ff` |
| ~90%+ (near-full cyan) |   **1.8** |   **2.7** |   **5.8** | `#0b1b2e` |

So there is no single "lower half" answer: at 79% down, light wins and dark
fails; at 94% down, light **fails at 2.7:1** and dark wins. A short canvas
reaches full cyan sooner than a tall one, so depth is a fraction of canvas
height, not a pixel count.

`#cfe4f5` looks fine in a render but measures 4.3:1 over the lower gradient and
fails. Don't trust your eyes on gradient text — and don't trust this table
either. It tells you which candidates to try; `check_contrast.py` decides.

Remember WCAG's "large text" exemption (3:1) needs **24px regular or 18.66px
bold** — an 18px regular sublabel does _not_ qualify, so hold it to 4.5:1.

**Fetching Drive assets:** the brand background ships **inside this skill** — no
Drive round-trip needed:

```text
.claude/skills/arbitrum-brand-svg-diagrams/assets/
  background.svg       79 KB   Inkscape source
  background.min.svg   44 KB   minified, standalone
  bg-frag.svg          44 KB   ready-to-inline <g> fragment   <- use this one
```

These are **not** at the repo root: a path like `assets/bg-frag.svg` will not
resolve. For _other_ assets:
`mcp__claude_ai_Google_Drive__search_files` with `parentId = '<folderId>'` (the
query field is `parentId`, not `parents`); `download_file_content` returns
**base64** (decode before reading; large files land in a tool-results file,
decode with `base64.b64decode(...)`).

## The one gotcha that dictates the whole design

Both `ImageWithCaption` (`src/components/ImageCaptions/index.jsx`) and
`ImageZoom` render a plain `<img src=…>`. Consequences:

1. The Docusaurus dark-mode class lives on `<html>` and **cannot reach inside**
   an `<img>`-embedded SVG. `@media (prefers-color-scheme)` tracks the OS, not
   the site toggle. **So you cannot theme the SVG to the page.**
2. Therefore: build the diagram from **opaque, self-contained shapes** with
   their own contrast. No text floating on transparency. Navy fill + white
   text and cyan fill + dark text both read on any page background.
3. **The SVG's own `<title>`/`<desc>` never reach a screen reader** through
   `<img>`. Include them anyway — they help anyone who opens the file directly —
   but the **`alt` attribute on the MDX tag carries the whole a11y burden.**
   Write the full description there, and keep the two in sync.
4. No external resources load at all: no webfonts, no `<image href=…>`, no
   external stylesheet. Everything must be inline.

## Background for `<ImageZoom>` legibility

Pages that use `<ImageZoom>` (click-to-zoom) composite the image on a
**light/variable overlay**. A transparent SVG whose labels are white then
becomes unreadable when zoomed. Diagrams that were originally designed on the
Arbitrum brand background (navy→blue→cyan gradient + circuit motif + logo) —
most `how-arbitrum-works` flow diagrams — must **bake that background in** as an
opaque, full-canvas base layer. Then the whole frame is opaque and reads on any
overlay; the zoom backdrop no longer matters.

- The background ships with the skill (see the `assets/` listing above).
  `bg-frag.svg` is already minified and wrapped in
  `<g transform="scale(3.779534)">…</g>` to fill a **1600×900** canvas.
- **Inline it, never reference it.** An `<img>`-embedded SVG cannot load
  external resources, so `<image href="bg.svg">` renders blank. Emit the
  contents of `bg-frag.svg` as the first layer of a 1600×900 diagram — it is a
  single 44 KB line, so generate the file with a script (see Workflow) rather
  than trying to hand-write it.
- The background's viewBox is exactly 16:9, so a **1600×900** canvas fits it
  undistorted (uniform ×3.779534). Use that canvas for all such diagrams for a
  consistent set. Keep content clear of the bottom-left logo (x<330 AND y>810).
- Gradient stops (if you need a matching solid): cyan `#12aaff` → blue `#1b4add`
  → dark navy `#152c4e`.
- Each diagram carries its own ~45 KB copy of the background — still a 99%+ cut
  from the 6 MB raster it replaces.

### Small diagrams: brand gradient, not the baked background

A two- or three-box explainer sitting inline next to a paragraph does not earn
45 KB of circuit motif, and a 1600×900 canvas holding four boxes looks absurd.
But it still cannot be transparent — see the stroke trap below. Use the brand
gradient stops as a plain `linearGradient` over a **full-bleed rect**:

```svg
<linearGradient id="brandbg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#152c4e"/><stop offset="0.55" stop-color="#1b4add"/><stop offset="1" stop-color="#12aaff"/>
</linearGradient>
<rect x="0" y="0" width="800" height="300" fill="url(#brandbg)"/>
```

That lands at **~2 KB**, stays opaque under `<ImageZoom>`, and reads as the same
family as the 1600×900 diagrams because the stops are identical. Size the canvas
to the content and pick a `className` near it (`img-600px` for an 800-wide
canvas keeps type crisp at 0.75× rather than 0.5625×).

**The stroke trap — why transparent still fails.** Gotcha 2 above says "no text
floating on transparency", but **strokes have the same problem and are easier to
miss**. A `#9dcced` connector is near-invisible on a white page; a `#213147` one
disappears on the dark theme. Since the SVG cannot see the page theme, any
diagram with a connector, bracket, or divider needs its own opaque backdrop.
Transparent canvas is safe only for a diagram built purely from opaque filled
shapes that touch each other — `haw-geth-sandwich` qualifies; almost nothing
with an arrow does.

**Keep the backdrop rect square-cornered.** A rounded full-bleed panel leaves
four transparent corners and fails the byte-identical opacity test in
Verification 3b. Let the page CSS round the image instead.

## Brand logos (Arbitrum One, Nova)

When a box names a specific chain, its **logomark** carries identity far better
than a colour swatch plus a key row — add the logo and you can delete that key
entry. Use the `_Logomark_` variants (mark only); the horizontal and vertical
lockups bundle the wordmark and duplicate your text label.

| Logo          | Drive file id                       | viewBox         | Brand fill |
| ------------- | ----------------------------------- | --------------- | ---------- |
| Arbitrum One  | `10B54LXfYk7hw5qwsWt3H2EThNrCXJcWk` | 373.9 × 422     | multi      |
| Arbitrum Nova | `12cg33GwnrLB7JXGw6Y8njTsBGwQiea02` | 372.84 × 420.63 | `#ff7700`  |

Both are genuine vector, ~2 KB each; the pair costs about **+3.3 KB** inlined.
`_AllWhite_` variants exist if you ever need a knockout.

Three things will bite, all of them silent:

1. **Fills live in a `<style>` block, keyed by class** (`.st0`…`.st3` on the
   Arbitrum mark, `.cls-1` on Nova). Resolve every class to an explicit `fill=`
   attribute before inlining. Two logos in one document otherwise collide on
   those generic names and one repaints the other. Expand shorthand hex while
   you are there (`#f70` → `#ff7700`).
2. **Put each mark on a white chip, not straight on the box.** The Arbitrum
   logomark's own body is navy `#213147` with cyan `#12aaff` strokes and a
   `#9dcced` ring — drop it on a cyan box and half the mark vanishes. A white
   rounded rect behind it renders both marks as the brand intends. Size the
   glyph to roughly 78% of the chip.
3. **A logo box still obeys the contrast table.** A Nova-orange box takes dark
   labels; white on it is 2.66:1. Giving a box a brand colour exempts it from
   nothing.

Scale by height so the two marks match optically, then centre on the width that
scale produces — they are not the same aspect ratio:

```python
scale = GLYPH / view_h
off_x = chip_x + (CHIP - view_w * scale) / 2
```

Budget the room first: a logo chip above the name needs roughly **+30px of box
height** over a text-only box.

## Workflow

Steps 1, 3, 4 and 6 are common to both jobs; steps 2 and 5 differ.

1. **Read the concept**, not just the old image. Open the MDX section and pull
   the exact terms/relationships the diagram must convey (e.g. the "Geth
   sandwich": Geth = bread top+bottom, ArbOS = filling; STF spans bottom Geth +
   part of ArbOS). The diagram must match the prose, and reuse its exact nouns.
2. **Diagnose the old file** _(replacing only)_: `head -c 1500 file.svg` — if you
   see `data:image/png;base64` and an `mxfile` blob, it's a draw.io raster
   export; replacing it with real vector is the whole win.
3. **Pick the canvas.** Baked brand background + `<ImageZoom>` → 1600×900.
   Transparent concept art → size to content.
4. **Generate** the SVG with a throwaway Python script (see below). Include
   `<title>`/`<desc>`.
5. **Wire it up** — see the two paths below.
6. **Verify** (below) before claiming done.

### Generate with a script, don't hand-write the file

The inlined background is one 44 KB line, so `Write`-ing the SVG by hand is not
practical. Put a small assembler in the scratchpad that reads `bg-frag.svg`,
emits your geometry, and writes `static/img/NAME.svg`. Only the **SVG** is
committed; the script is disposable, but keep it for the session so you can
iterate on coordinates and re-run instead of hand-patching a 44 KB file.

Two things the script must respect: emit the background as the **first** layer,
and set `font-family` once on a wrapping `<g>` (SVG inherits it) so you are not
repeating the stack on every `<text>`.

Re-run order is always: **generate → `round_arrows.py` → verify.** Regenerating
overwrites the rounded corners, so the rounding step is never optional.

### Path A — replacing an existing diagram

Keep the exact filename/path so the MDX reference needs no edit. The old file is
often too big to `Read`; move it to Trash (`trash …`) then write fresh. No
`yarn build` needed: the link graph is untouched.

### Path B — new diagram (also: retiring an ASCII diagram)

1. **Name it for its section**, matching neighbours in the same folder
   (`arb-chain-*` under `launch-arbitrum-chain`, `haw-*` under
   `how-arbitrum-works`).
2. **Add the MDX tag yourself.** `<ImageZoom>` and `<ImageWithCaption>` are
   registered globally in `src/theme/MDXComponents.js` — **no import needed.**
3. **Use a `className` that exists.** `src/css/custom.css` defines only
   `img-20px`, `img-50px`, `img-100px`, `img-200px`, `img-400px`, `img-500px`,
   `img-600px`, `img-900px`. Several pages pass `img-800px`, which is **not
   defined** and silently falls back to intrinsic width — don't copy that.
   For a 1600×900 diagram use `img-900px`.
4. **Write the `alt` text in full** (see gotcha 3) and keep it in the diagram's
   `<desc>` too.
5. **Check the page still compiles and lints:**

```bash
npx prettier --write docs/path/to/page.mdx
./node_modules/.bin/markdownlint --config .markdownlint.json docs/path/to/page.mdx
node --input-type=module -e "
import {compile} from '@mdx-js/mdx'; import {readFileSync} from 'node:fs';
await compile(readFileSync('docs/path/to/page.mdx','utf8').replace(/^---[\s\S]*?\n---\n/,''));
console.log('MDX compiles ok');"
```

The MDX compile is much cheaper than `yarn build` and catches the failure mode
a new JSX tag actually introduces. A full build is still unnecessary unless
you changed a doc **link**. 6. **Check what the removal orphaned.** Retiring an ASCII diagram can strip the
last consumer of a helper CSS class (`.ascii-diagram` in
`src/css/partials/_misc-classes.scss` is the known case). Grep for it and
_report_ it — don't delete shared CSS unasked.

### Diagram labels are prose — the pattern guide applies

`docs/Offchain-pattern-guide.md` governs text inside the diagram, not just the
page. An editorial hook enforces it on the MDX and will block your write.

**Read the guide before you draft labels and `alt` text, not after.** The hook
fires on the **MDX** write, not on the SVG — so you can generate, round, and
verify a whole diagram, then get blocked on the one-line tag at the end and have
to rewrite label text you already baked into the file (and into its `<desc>`).
Reading it up front costs one tool call; discovering it late costs a regenerate.

The rules that bite hardest on labels:

- **Active voice, name the actor.** "ArbOS credits it in the same transaction",
  not "credited immediately". Lane headers are the usual offender.
- **One term, one meaning.** If the page says _child chain_, the diagram says
  child chain — never L2 in the art and child chain in the prose.
- **Sentence case** for headers and labels.

Write the `alt` text to the same standard; it is page prose.

## SVG authoring rules learned the hard way

- **Rounded-rect paths bake the radius into BOTH the arc commands and the line
  endpoints.** Changing a corner radius means recomputing every coordinate on
  that corner, not just the `A r,r` number. (A plain `<rect rx=…>` is fine when
  you don't need per-corner control.)
- **Text must fit inside its opaque pill.** If the text is wider than the pill,
  the overflow falls onto transparent background and **disappears on light
  themes**. Size the font to fit, or widen the pill.
- **Pre-check every label's width before you render.** Estimate at
  **0.52 em/char** for the sans stack and **0.60 em/char** for the mono stack,
  and compare against the box's inner width (`width − 2×16px padding`). A
  44-char sublabel at 18px is `44 × 0.52 × 18 ≈ 412px`, so it needs a box ≥
  444px wide. This costs nothing and removes most render-and-fix loops. Re-run
  the check whenever you bump a font size — that is exactly when a label that
  used to fit starts overflowing.
- **Size text for the DISPLAYED width, not the canvas.** A 1600-wide diagram
  shown with `className="img-900px"` is scaled to 0.5625×, so 16px type lands at
  9px on the page. Floors for a 1600×900 canvas: **≥21px** box titles, **≥18px**
  sublabels, **≥17px** supplementary chips. Confirm with the display-width
  render (Verification step 4) — not the 1:1 render, which flatters everything.
- **Multiple spaces collapse** in SVG `<text>`. For separators like
  `A   ·   B`, add `xml:space="preserve"` to the `<text>`.
- Use a system font stack (`Inter, ui-sans-serif, system-ui, …`) — webfonts
  won't load inside an `<img>`-embedded SVG.
- **Quote multi-word font names with SINGLE quotes.** The stack goes into a
  double-quoted attribute, so `"Segoe UI"` and `"SF Mono"` close it early and the
  file is no longer well-formed XML. Write `'Segoe UI'`, `'SF Mono'`. This bites
  on the very first render, before any layout work is visible:

  ```text
  xml.parsers.expat.ExpatError: not well-formed (invalid token): line 10, column 65
  ```

  Verification step 1 catches it — which is the reason it runs first.

- Metaphor helps recall: e.g. bun-shaped corners (larger radius on the outer
  edges of top/bottom layers) made the "sandwich" read at a glance.

## Syntax-highlight code blocks (not plain orange)

When a diagram shows function signatures, render them as a **palenight code
block** (the docs' own dark Prism `darkTheme`) rather than white text on an
orange box — the highlighting then matches the real code blocks on the page,
and it fixes an accessibility bug: **white on `#f97316` is 2.80:1 and fails
WCAG**, so the legacy orange treatment was never readable to begin with.
Box fill `#292d3e`; token colors pulled from the installed renderer
(`node -e 'console.log(require("prism-react-renderer").themes.palenight)'`):

| Token                         | Hex              |
| ----------------------------- | ---------------- |
| function / method name        | `#82aaff`        |
| punctuation `()`              | `#c792ea`        |
| keyword (`event`, `function`) | `#c792ea` italic |
| class / event name            | `#ffcb6b`        |
| plain text                    | `#bfc7d5`        |

Render each token as a `<tspan fill="…">`. **Add `xml:space="preserve"`** to the
`<text>` or a trailing space in a tspan (e.g. `event ` before the name)
collapses and fuses the words. For anything beyond trivial signatures, tokenize
with Pygments' Solidity/Rust lexer instead of a regex (see Tooling below).

## Round elbow-arrow corners

Directional turns look better curved than at sharp 90°. `stroke-linejoin="round"`
is invisible at a 2px stroke, so round **geometrically**: `tools/round_arrows.py`
rewrites every `marker-end` arrow path with ≥3 points, inserting a quadratic
Bézier (~12px radius) at each corner. It skips 2-point straight arrows, icon
curves (`A`/`C`), and paths without a marker.

```bash
python3 .claude/skills/arbitrum-brand-svg-diagrams/tools/round_arrows.py static/img/NAME.svg
```

Only single-path elbows round — T-junction fans (a trunk that branches) are not
"turns" and stay square, which is correct.

### The tool imposes hard authoring constraints

It is a regex post-processor, so **how you write the arrow decides whether it
works.** Get these wrong and it silently skips the path — or, in the first case,
corrupts the geometry. Author every arrow to this shape:

```svg
<path d="M310 440 L350 440 L350 523 L422 523" fill="none" stroke="#9dcced" stroke-width="2.5" marker-end="url(#arrow)"/>
```

| Requirement                             | Why                                          | Failure mode if violated                    |
| --------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| Full `L` polylines — no `H`/`V`         | It pairs _every_ number in `d` as (x,y)      | **geometry silently corrupted** (see below) |
| Marker id is exactly `arrow`            | greps the literal `marker-end="url(#arrow)"` | path skipped, corner stays square           |
| `marker-end` is an **inline attribute** | same literal grep                            | moving it into a `<style>` class → skipped  |
| `fill="none"` present inline            | it injects `stroke-linejoin` beside it       | rounding applied without the linejoin       |
| `d` is the **first** attribute          | regex is `<path d="…"`                       | path skipped                                |
| Self-closing `/>`                       | regex requires it                            | path skipped                                |

The `H`/`V` row is the dangerous one, and its behaviour depends on how many
numbers the path happens to contain — measured:

```text
M50 350 H200 V100 H500        5 numbers -> 2 pts -> skipped, unchanged
M50 350 H200 V100 H500 V50    6 numbers -> 3 pts -> REWRITTEN as
                              M50 350 L193.8 110.3 Q200 100 211.8 98 L500 50
```

An even count ≥6 produces a diagonal mess out of an orthogonal elbow, and nothing
warns you. An odd count is merely skipped. So `H`/`V` is never safe — and the
failure is _silent either way_. Always write full `L` pairs.

Everything else in the table degrades harmlessly to "stayed square".

**Always check the printed count** against the number of elbows you authored —
that is your only signal the tool matched anything:

```text
static/img/NAME.svg: rounded 2 elbow arrow(s)
```

`rounded 0` is the **correct** result for a diagram whose connectors are all
straight 2-point drops — a pure layer stack has no turns to round. Compare the
count to the elbows you authored, not to zero. Still run the tool: it is the
cheapest check that your arrows match the authoring contract above, and it must
run after every regenerate, since regenerating overwrites its output.

**`rounded 0` also means "already rounded".** The tool is idempotent: once a
corner is a `Q` curve the path no longer matches its straight-elbow pattern, so a
second run on an unchanged file reports 0. Don't read that as a regression —
count the baked-in corners instead:

```bash
grep -o ' Q[0-9]' static/img/NAME.svg | wc -l   # quadratic corners present
```

Because arrow styling has to be inline for this tool, don't try to factor arrows
into a `<style>` block. Text and panels can use classes; arrows cannot.

## Arrowheads: three failures no tool catches

`check_contrast.py` inspects `<text>` only, and `round_arrows.py` only looks at
path geometry. **Nothing validates a marker.** All three of these render without
warning and are only visible in the display-width image.

**1. Markers scale with `stroke-width`.** `markerUnits` defaults to
`strokeWidth`, so the head's on-canvas size is `markerWidth × stroke-width`. A
`markerWidth="7"` head is 17.5px on a 2.5px stroke but **31.5px** on a 4.5px one.
Two of those on a short segment collide and fuse into a solid diamond that reads
as a blob, not an arrow:

```text
Mermaid <==> rendered as a 65px double-headed link
  2 heads x (7 x 4.5) = 63px of arrowhead on a 65px line  ->  diamond blob
```

Give any thick link its own fixed-size marker instead of resizing the geometry:

```svg
<marker id="arrowbig" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="16" markerHeight="16" markerUnits="userSpaceOnUse"
        orient="auto-start-reverse">
  <path d="M0 0 L10 5 L0 10 z" fill="#9dcced"/>
</marker>
```

`markerUnits="userSpaceOnUse"` pins the head to 16px whatever the stroke does.
`refX`/`refY` stay in viewBox units either way.

**2. Marker color inverts down the gradient exactly like text does.** A
`#9dcced` arrowhead is fine in the upper two-thirds and near-invisible on the
near-full cyan at the bottom. A legend or key row sitting in the last tenth needs
its own ink-coloured marker (`fill="#0b1b2e"`), so a diagram often carries **two
color variants of the same head**. The contrast checker will not tell you —
it never looks at markers.

**3. Label chips swallow arrowheads.** A chip centred on a horizontal connector
must clear half the head plus its own half-height. With the standard 7×2.5 head
(17.5px tall) and a 25px chip, the label baseline needs **≥18px** of clearance
from the arrow:

```python
label_baseline = arrow_y - 20     # 2px of margin over the 18px minimum
```

Too little and the head disappears under the chip — the arrow still reads as a
line, so it looks like you drew a connector with no direction.

**Verify markers by eye at the display width.** They are the one part of the
diagram with no automated gate, so budget a zoom crop (below) for any diagram
with a bidirectional link, a thick link, or chipped horizontal connectors.

### Zoom-crop to inspect detail

`rsvg-convert` cannot crop, and reading the full render downsamples exactly the
detail you are checking. Rewrite the `viewBox` on a throwaway copy instead:

```bash
sed 's|viewBox="0 0 1360 1340" width="1360" height="1340"|viewBox="760 600 560 400" width="1120" height="800"|' \
  static/img/NAME.svg > /tmp/crop.svg
rsvg-convert -b '#ffffff' /tmp/crop.svg -o /tmp/crop.png
```

The `width`/`height` set the zoom factor (2× above). This is how you confirm a
`marker-start` actually rendered, that a rounded elbow curved, and that text sits
inside its chip.

## Converting a Mermaid source

Mermaid is not an output format here, but it is a common **input** — someone
pastes a `flowchart`/`sequenceDiagram` and wants it on-brand. Four things to
settle before you place a single box:

- **Ask which way it should flow when the request is ambiguous.** "Keep the
  horizontal layout" means one thing for a `flowchart LR` and something else for
  a `sequenceDiagram`, whose participants are already horizontal while time runs
  down. Guessing wrong throws away the whole diagram, so it is worth one
  question with two ASCII mockups rather than a full build.
- **Drop the invisible edges.** `~~~` is a layout hint that exists only to steer
  Mermaid's auto-layout. Hand placement makes them meaningless — one source this
  session had 12 of them against 14 real `-->` edges.
- **Mermaid's per-subgraph `style fill:` has no brand equivalent.** Don't try to
  map five arbitrary subgraph tints onto the palette. Let lanes carry the
  grouping and let fill carry **role** (see the key below); you usually delete a
  key row's worth of colour in the process.
- **Node text is prose.** Expand `<br/>` into title + sublabels, convert `&` to
  "and", apply sentence case, and run the terminology table over it — `L2` in a
  pasted source becomes **child chain** in the art.

A four-role key covers nearly every architecture diagram and keeps a set of
diagrams consistent with each other:

| Fill      | Role               | Text                  |
| --------- | ------------------ | --------------------- |
| `#9dcced` | people (actors)    | `#0b1b2e`             |
| `#12aaff` | user-facing app    | `#0b1b2e` / `#0b2438` |
| `#213147` | service or handler | `#ffffff` / `#c9dcef` |
| `#e6007a` | data store         | `#ffffff` only        |

Reuse it verbatim across related diagrams — a reader who learns the key once
should not have to relearn it on the next figure.

## Sequence diagrams

Participants as columns, time down. What differs from a flowchart:

- **Lifelines** are dashed verticals (`#9dcced`, ~1.5px, `stroke-dasharray="6 7"`,
  opacity ~0.5) running from under each participant box to a common floor.
- **Labels go above the arrow, not centred on it** — a centred chip on a long
  message hides the arrow it describes. Baseline at `arrow_y - 20`.
- **Every message is a straight 2-point path**, so `round_arrows.py` reports
  `rounded 0`. That is the correct result, not a miss.
- **Two head styles.** Solid request → filled triangle. Dashed response
  (Mermaid `-->>`) → open V, `fill="none"` + `stroke-linejoin="round"`. The
  distinction is load-bearing; don't collapse it.
- **Row pitch ~62px** at 16px labels keeps a chip clear of the arrowhead above.
- **Uniform column spacing, and let long labels overflow** their span. Sizing
  columns to the longest label makes the canvas absurd; the chip masks the
  lifelines it crosses, which is what makes overflow safe.

## Segment complex diagrams into labeled lanes

If a diagram crams several parallel mechanisms into one flat row, readers can't
tell them apart. Group each into its own **bounded, labeled lane** — a
translucent panel (`fill="#ffffff"` at ~6% opacity + a faint 1px stroke) with a
header borrowed from the prose (e.g. `1 · Native token bridging`). Mirror the
doc's own section structure. Route the convergence/consumption flow into a
visually separate zone below a divider.

Two worked examples: `haw-l1-to-l2.svg` (on the `haw-svg-diagrams` branch — see
Reference examples) and `arb-chain-fee-lifecycle.svg`, which uses two lanes to
separate fees paid in the same transaction from fees paid after a batch posting
report — mirroring the split the page's own fee table makes.

## Import / export to Excalidraw

`tools/excalidraw_bridge.py` round-trips a diagram between a brand SVG and an
Excalidraw scene (`.excalidraw`), so anyone can open a diagram on excalidraw.com,
tweak layout/labels, and bring it back — or sketch in Excalidraw and get a
docs-ready SVG.

```bash
T=.claude/skills/arbitrum-brand-svg-diagrams/tools/excalidraw_bridge.py
python3 "$T" export static/img/NAME.svg /tmp/NAME.excalidraw   # SVG  -> Excalidraw (edit on excalidraw.com)
python3 "$T" import  /tmp/NAME.excalidraw static/img/NAME.svg  # Excalidraw -> brand SVG (docs-ready)
```

Scenes use `roughness: 0`, so Excalidraw renders the clean (non hand-drawn)
style that matches the docs, and brand fill colors are preserved on the way in
and out.

**Round-trip scope** — the bridge covers this skill's core vocabulary:
`<rect>` (→ Excalidraw rectangle), `<text>`, and straight `<line>` arrows. To
keep a diagram fully round-trippable:

- Author boxes as plain `<rect rx=…>`, **not** `<path>` rounded rects.
- Prefer straight `<line>` arrows; **elbow `<path>` connectors and icon glyphs
  are dropped** on export (re-add them in Excalidraw, or keep arrows straight).
- Text position/size is approximate after a round-trip — treat the imported SVG
  as an editable starting point, then re-run Verification.

## Verification (do all five)

```bash
S=static/img/NAME.svg
# 1. well-formed XML
python3 -c "import xml.dom.minidom as m; m.parse('$S'); print('XML ok')"
# 2. size win
stat -f%z "$S"     # a few KB transparent; ~50 KB with the baked background
# 3. render on WHITE (simulates the <ImageZoom> overlay) and on page-dark
rsvg-convert -b '#ffffff' -z 1 "$S" -o /tmp/light.png
rsvg-convert -b '#1b1b1d' -z 1 "$S" -o /tmp/dark.png
# 3b. OBJECTIVE opacity test — for a baked-background diagram these must be
#     byte-identical. Any difference means a transparent region that will wash
#     out under zoom. Beats eyeballing the two images.
shasum -a 256 /tmp/light.png /tmp/dark.png | awk '{print $1}' | sort -u | wc -l
#     -> 1 = fully opaque (correct).  2 = transparency present, go find it.
# 4. render at the REAL DISPLAY WIDTH from the className (img-900px -> 900)
rsvg-convert -b '#ffffff' -w 900 "$S" -o /tmp/display.png
```

**Read `/tmp/display.png` and `/tmp/light.png` both.** The 1:1 render flatters
small type; the display-width render is where you find text that is technically
present but unreadable in the page. Clipped text, low contrast, and label/icon
overlap only show up visually.

### 5. Measure contrast — every label, automatically

Don't reason about where the gradient is light or dark, and don't spot-check by
hand. `tools/check_contrast.py` renders the diagram twice — once as authored,
once with all `<text>` stripped — then samples the text-free render underneath
each label to learn its true background. That works identically for text on an
opaque box and text on the gradient, where the backdrop varies with position.

```bash
python3 .claude/skills/arbitrum-brand-svg-diagrams/tools/check_contrast.py static/img/NAME.svg
```

It prints a ratio per label, applies the correct threshold (3:1 only for genuinely
large text: ≥24px, or ≥18.66px bold — **otherwise 4.5:1**), and exits non-zero on
any failure, so it can gate a commit.

Run it, don't reason about it. On its first run against a finished diagram it
caught **four** failures across two rounds — including two that hand-sampling had
already missed, because manual checks cover the labels you think to check and
skip small chips and legend headings. A later diagram opened at **8 failures of
14** connector labels, so treat a clean first run as luck, not skill.

It checks `<text>` and nothing else. Arrowheads, strokes and panel borders have
no automated gate at all — see "Arrowheads: three failures no tool catches".

Two recurring offenders worth knowing up front:

- `#9dcced` is safe for lane headers over the upper gradient (5.0–8.2:1), drops
  to **3.1:1** around 75–80% down, and collapses to **1.8:1** near the bottom.
  Switch to `#eaf5ff` below mid-canvas, then to dark `#0b1b2e` in the last tenth
  — the safe fill inverts, so never carry one choice down the whole canvas.
- White on magenta is **4.52:1** — it passes, but that is the ceiling for that
  fill. There is no headroom, so don't tint magenta sublabels at all.
- Dark labels on any orange. White is 2.66:1 on Nova `#ff7700` and 2.80:1 on
  `#f97316`; both fail.

### The gradient has a dead band — put connector labels on chips

The inversion above has a gap in the middle where **no plain text fill passes at
all.** Around 75–80% down, the gradient sits near `#1778ed`, and every candidate
measured against it fails:

| Fill              | Ratio on `#1778ed` | 4.5 needed |
| ----------------- | -----------------: | ---------- |
| `#eaf5ff`         |           **3.84** | fail       |
| `#ffffff`         |           **4.25** | fail       |
| `#0b1b2e`         |           **4.09** | fail       |
| chip `#152c4e` bg |          **12.65** | pass       |

So "switch to the other fill" has no answer in that band. Don't hunt for a
better hex — there isn't one. Give the label its own opaque backdrop:

```svg
<rect x="…" y="…" width="…" height="25" rx="6" fill="#152c4e" opacity="0.92"/>
<text … font-size="16" fill="#eaf5ff" text-anchor="middle">Proxies</text>
```

Chip every connector label, not just the failing ones. Mixed treatment reads as
arbitrary, and a chip is position-independent — you can move a label later
without re-deriving its colour. It also **masks whatever the label crosses**
(lifelines, lane borders, other connectors), which is the same trick Mermaid uses
with its white label backgrounds.

Size the chip from the width estimate (0.52 em/char sans, 0.60 mono) plus ~12px
padding. Slight text overflow past a chip is safe here: the few pixels that land
on bare gradient are still `#eaf5ff`, which is exactly the fill you would have
used anyway.

A diagram with **no edge labels needs none of this** — bare connectors on an
opaque backdrop have no contrast requirement, and the file lands ~35% smaller.

No `yarn build` is needed for either path — the link graph is untouched by an
image swap. For a **new** diagram, run the MDX compile check from Path B instead;
that is where a new JSX tag can actually break the site.

## Caption styling

Caption text is the component's job, not the SVG's. Styling lives in
`src/components/ImageCaptions/styles.module.scss` (`.figure`/`.image`/`.caption`,
centered, muted via `var(--ifm-color-emphasis-600)`). Edit there for all
captions; don't bake caption text into the diagram.

## Reference examples

**These live on unmerged branches, not on `master`.** Check before you trust a
working-tree copy — on `master` and most feature branches `static/img/haw-*.svg`
are still the multi-MB draw.io rasters, so opening one teaches you nothing:

```bash
stat -f%z static/img/haw-l1-to-l2.svg      # ~6 MB -> you are looking at the raster

# Fetch a real exemplar from origin (works for any clone of this repo):
git fetch origin haw-tier1-svg-diagrams
git show origin/haw-tier1-svg-diagrams:static/img/haw-l1-to-l2.svg | head -c 2000
```

| Diagram                       | Raster | Hand-authored | On origin branch                 | Shows                                                        |
| ----------------------------- | -----: | ------------: | -------------------------------- | ------------------------------------------------------------ |
| `haw-l1-to-l2`                | 6.2 MB |     **53 KB** | `haw-tier1-svg-diagrams`         | baked background, labeled lanes, code blocks, rounded elbows |
| `haw-aliasing`                | 284 KB |     **50 KB** | `haw-tier1-svg-diagrams`         | baked background, address-aliasing math                      |
| `haw-submit-tx-to-sequencer`  | 6.2 MB |     **50 KB** | `haw-tier1-svg-diagrams`         | baked background flow                                        |
| `haw-bypassing-the-sequencer` | 6.2 MB |     **49 KB** | `haw-tier1-svg-diagrams`         | baked background flow                                        |
| `haw-geth-sandwich`           | 1.5 MB |    **2.7 KB** | `inside-arbitrum-nitro-revision` | transparent canvas, opaque layers, bracket, legend chip      |

Note that `haw-geth-sandwich` is on a _different_ branch —
`haw-tier1-svg-diagrams` still carries its 1.5 MB raster.

Note the floor: a baked-background diagram lands at **~50 KB regardless of
complexity**, because ~44 KB of it is the background. Judge a baked-background
diagram against that number and a gradient-backdrop one against ~2 KB — they are
different budgets, not a good and a bad result.

Their color choices predate the measured contrast table above — copy their
**layout and structure**, not their white-on-cyan text.

### Current-generation exemplars

Copy these for colour and type; they all pass `check_contrast.py` clean. The
three on `update-diagram-arbitrum-intro` sit on one page, so they also show how
a small and a large diagram stay in the same family:

| Diagram                       |   Size | Canvas   | Backdrop         | Shows                                                       |
| ----------------------------- | -----: | -------- | ---------------- | ----------------------------------------------------------- |
| `arb-chain-fee-lifecycle.svg` |  52 KB | 1600×900 | baked background | two labeled lanes, three-role color key                     |
| `arbitrum-chains-diagram.svg` |  53 KB | 1600×900 | baked background | **inlined brand logomarks**, per-chain colors, tier gutter  |
| `scalability-trilemma.svg`    | 2.1 KB | 800×480  | brand gradient   | triangle, colour-as-argument, dark text low on the gradient |
| `arbitrum-chain-naming.svg`   | 1.9 KB | 800×300  | brand gradient   | smallest useful shape: two boxes and a labeled connector    |

`arb-chain-fee-lifecycle.svg` arrives with
`tw-792-document-network-revenue-routing-and-feecollector-flow`; the other three
with `update-diagram-arbitrum-intro`. If a file is absent on your branch:

```bash
git show origin/update-diagram-arbitrum-intro:static/img/arbitrum-chains-diagram.svg | head -c 2000
```

## Tooling: FOSS options considered (not yet adopted)

The generators in this skill hand-build SVG strings and tokenize code with a
regex. Researched replacements, if this graduates to a `tools/diagram_kit.py`:

- **`drawsvg`** (pip, actively maintained) — Pythonic SVG construction; replaces
  manual f-string assembly. Preferred over `svgwrite` (maintenance-only).
- **`pygments` + `pygments-lexer-solidity`** (pip) — real Solidity/Rust lexer;
  use it as a **tokenizer** feeding the palenight color map above. Its
  `SvgFormatter` is experimental and lays out its own `<text>`, so tokenize
  only, render tspans yourself.
- **Auto-layout (ELK/dagre/Graphviz): skip.** They impose their own geometry and
  fight the brand-precise, prose-aligned layouts this skill exists to produce;
  they're layout-only and still don't round corners. Reach for ELK only if a
  future diagram is a genuine large auto-layout graph.

## See also

In this repo:

- `docs/Offchain-pattern-guide.md` — editorial rules that govern diagram labels
  and `alt` text (see "Diagram labels are prose" above).
- `src/theme/MDXComponents.js` — the globally registered `<ImageZoom>` /
  `<ImageWithCaption>` components.
- `src/css/custom.css` — the `img-*px` width classes.
- **Finding the next candidate.** Raster-in-SVG files declare themselves in the
  first few KB. As of `origin/master` this finds **26 files totalling 101.5 MB**
  — the backlog this skill exists to work through:

```bash
for f in static/img/*.svg; do
  head -c 4000 "$f" | grep -q 'image/png;base64' && stat -f'%z %N' "$f"
done | sort -rn
```

(Scan 4 KB, not 400 bytes — the base64 payload starts after the draw.io
preamble, so a short window silently reports zero hits.)

Standing team conventions this skill assumes:

- **Static concept art is hand-authored SVG. Never Mermaid or any text-DSL
  diagram tool** — that is a standing preference, not a default.
- **Complex or interactive diagrams** use the ReactFlow / `DrawioReactFlow`
  pipeline (Excalidraw → draw.io → SVG) instead of this skill.
- The `DrawioReactFlow` component applies its own glassmorphic theme and
  **ignores source draw.io `fillColor`/`strokeColor`** — don't try to pass brand
  colors through it.
