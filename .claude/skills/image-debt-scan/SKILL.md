---
name: image-debt-scan
description: >-
  Find heavy image debt in static/img — both oversized raster photos (PNG/JPG)
  AND .svg files that are secretly base64 rasters (draw.io / editor exports,
  often 1–6 MB) — map each to the MDX pages that reference it, and rank the best
  candidates to convert to lean brand SVGs. Use when asked to "find heavy
  images", "image debt scan", "what diagrams should we convert", or before a
  batch diagram-cleanup pass. Read-only reconnaissance that feeds the
  arbitrum-brand-svg-diagrams skill and the diagram-converter subagent.
disable-model-invocation: true
---

# Image debt scan

Locate the images worth converting to hand-authored SVG. This is the
reconnaissance step before `arbitrum-brand-svg-diagrams`.

## When to use

- "Which images should we convert next?" / "find our heaviest diagrams"
- Planning a batch cleanup of `static/img/`
- Before dispatching `diagram-converter` subagents — this produces their work list

## When NOT to use

- Photos/screenshots — they legitimately stay raster (only _diagrams_ convert well)
- A single known file — just use `arbitrum-brand-svg-diagrams` directly

## The blind spot this skill exists to close

The biggest image debt in this repo is **not** the PNGs — it's `.svg` files that
are actually a base64-encoded raster wrapped in draw.io/editor XML. They carry a
`.svg` extension (so a naïve size scan of `*.png/*.jpg` misses them entirely) yet
weigh **1–6 MB each** and blur when zoomed. A whole-repo scan this session found
~15 of them at ~6 MB apiece (e.g. `haw-token-gateway.svg`, `haw-batching.svg`,
`apps-pull-oracle.svg`, `arb-chain-aep-scenario-*.svg`). The scanner detects them
by grepping each `.svg` for `data:image/…;base64` (and `mxfile` for draw.io).

## Run the scan (driver)

`scan.sh` reports **raster-in-SVG first** (top debt), then oversized rasters,
each with the MDX pages that reference it (or `unreferenced` = deletion
candidate). Sizes are largest-first.

```bash
# whole repo
.claude/skills/image-debt-scan/scan.sh

# scope the reference search to one section (only reports images that section uses)
.claude/skills/image-debt-scan/scan.sh docs/how-arbitrum-works

# raise the raster threshold (default 300 KB; raster-in-SVG is always reported)
THRESHOLD_KB=500 .claude/skills/image-debt-scan/scan.sh
```

Sample output (this session, whole repo):

```
== Raster-in-SVG (draw.io / embedded-raster wearing a .svg extension — top debt) ==
   6584 KB  static/img/haw-token-gateway.svg  [embedded-raster]
           (unreferenced — candidate for deletion)
   6087 KB  static/img/apps-pull-oracle.svg  [embedded-raster]
           docs/build-decentralized-apps/oracles/01-overview.mdx
   1863 KB  static/img/arb-chain-aep-scenario-2.svg  [draw.io PNG-in-SVG]
           docs/launch-arbitrum-chain/.../02-set-up-aep-fee-router.mdx
== Raster images over 300 KB (convert diagrams; keep photos/screenshots) ==
   7863 KB  static/img/bold-before-vs-after-with-bold.png
           docs/how-arbitrum-works/bold/gentle-introduction.mdx
```

## Triage the output

Rank into tiers, biggest + most-referenced first:

1. **Raster-in-SVG, referenced → convert (highest value).** Filename ends in
   `.svg`, so `arbitrum-brand-svg-diagrams` can replace it **in place** with no
   MDX edit and no `onBrokenLinks` risk. This is the sweet spot.
2. **Raster-in-SVG, unreferenced → delete.** Dead weight; confirm with the user,
   then `trash` (never `rm`).
3. **Heavy PNG/JPG that is a concept diagram → convert** (boxes, flows, flat
   fills). Converting changes the extension, so the MDX `src=` must be updated.
4. **Heavy PNG/JPG that is a photo/screenshot/pie-chart → keep**, optionally
   recompress. Gradients and fine detail don't vectorize well.

Report a ranked table: `size · path · referencing pages · verdict`. Do **not**
convert here — that's the SVG skill's job. Hand the "convert" list to a
`diagram-converter` subagent per file (parallel) or `arbitrum-brand-svg-diagrams`
for one.

## Gotchas

- **`.svg` extension guarantees nothing.** Always grep for `base64`/`mxfile` —
  `head -c 2000` can miss a base64 blob that starts later in the file (some
  Serif/Affinity exports reference embedded images via `<use xlink:href>` well
  past the header), so `scan.sh` greps the whole file.
- **Genuine large vector exists** (e.g. an 80 KB Graphviz UML with no base64) —
  it is _not_ flagged, correctly. Size alone isn't the signal; base64 is.
- `rg` may be rewritten to `grep` by a shell hook here; `scan.sh` uses `grep -r`
  directly to avoid that.

## See also

- `arbitrum-brand-svg-diagrams` — does the actual conversion.
- Subagent `diagram-converter` — parallelizes conversion across the list.
