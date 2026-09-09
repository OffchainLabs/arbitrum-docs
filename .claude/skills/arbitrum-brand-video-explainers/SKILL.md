---
name: arbitrum-brand-video-explainers
description: Use when asked to rebrand, restyle, re-pace, resize, or re-render an existing explainer video, when a video's labels are baked-in raster pixels that cannot be edited, or when building a new animated explainer for the Arbitrum docs from a prompt or a doc section.
---

# Arbitrum brand video explainers

## Overview

A rendered video cannot be edited. Its labels are pixels on a raster grid — there
is no "Block 1" text object, only pixels shaped like one. **The deliverable is
always a generator script, never an edited MP4.** You rebuild the animation as
code, then render it.

That makes the job two separate problems, and the second one is not the hard one:

1. **Recover the content** from the source (or invent it, from a prompt).
2. **Render it** in brand styling at the requested pace.

## When to use

- "Make this video match our branding" / "restyle this animation"
- "Slow this down so people can follow it" / "re-pace this"
- A video is the wrong aspect ratio, or its text is too small at display size
- Building a new animated explainer for a docs concept

## When NOT to use

- **Interactive or clickable diagrams** → the ReactFlow / `DrawioReactFlow`
  pipeline. Those stay editable and respond to the site's dark mode; a video does
  neither.
- **Static concept art** → `arbitrum-brand-svg-diagrams`.
- **Screen recordings of real UI** → keep the recording, just trim/crop/compress.
- Never Mermaid or any text-DSL animation tool (standing team preference).

## The failure this skill exists to prevent

Three independent agents were given "restyle and slow down this explainer" with
no guidance. All three correctly chose to rebuild as a generator. **All three
shipped fabricated numbers anyway**, in a video that looked entirely plausible:

| What they did                                                   | Result                                                                                    |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Re-simulated the concept instead of transcribing it             | Every transaction value in all six blocks was invented                                    |
| Mis-read one chip and moved on                                  | `4+7` rendered where the source shows `11`                                                |
| Expanded an acronym the source never expands                    | `TwP` became "two-way priority" — a fabricated technical term                             |
| Fitted a per-transaction gas model to make totals work          | Its own totals contradicted the readouts it claimed to reproduce (164 vs 161, 160 vs 187) |
| Tagged a block "sealed early" while showing its round-2 content | Self-contradictory frame                                                                  |

None of these are visible by looking at the output. A plausible-looking wrong
number is worse than an obviously broken render, because it ships.

## The transcription contract

**Every value you display must be traceable to a frame you actually read.**

Before writing any rendering code, produce `SOURCE.md` containing:

- one line per datum, with the **frame number** it came from
- an explicit `UNKNOWN` for anything you could not read

Then treat that file as the only source of truth. Rules that follow from it:

- **Never fit, interpolate, or infer a displayed number.** If a counter is not
  derivable from what is on screen, transcribe the observed values at the frames
  you sampled and script those. "Fitted so the totals work" is fabrication with
  arithmetic on top.
- **Never expand an acronym the source does not expand.** Carry it verbatim and
  flag it to the user.
- **Never assume one displayed number derives from another.** In the worked
  example the chip labels are tips and `block gas` is independent — chips reading
  31 + 9 sit in a block whose gas ends at 34. Assuming `gas = sum(chips)` would
  have made every number wrong in a way that looks reasonable.
- **Recompute derived labels from the data**, not from the source's pixels. A
  card tagged "sealed early" must be tagged by the same rule that decides whether
  round 2 ran.

When the brief is a prompt rather than a video, the contract inverts: you own the
data, so state it explicitly in `SOURCE.md` first and get it confirmed before
animating. Do not discover the content while writing the renderer.

## Reading a source video

See references/reading-a-source-video.md for the extraction technique —
`ffprobe` first, then the `select` + `tile` filter to read dozens of frames in a
single image, and cropping to a status region to recover a state machine cheaply.

## Pipeline

```bash
# 1. generate one TRANSPARENT svg per frame
python3 build.py --out "$TMPDIR/mybuild"

# 2. composite over the brand background and encode
tools/render.sh "$TMPDIR/mybuild/f" out.mp4 30
```

`render.sh` rasterises frames in parallel and composites them over a
once-rendered background (726 frames → MP4 in about 40 s). Keep frame SVGs
transparent: inlining the 44 KB background into every frame gives an identical
picture several times slower.

**Start from examples/pga-rounds/build.py.** Replace its source-data block and
layout; keep its keyframe/tween engine:

- `KEYS` is a list of `(duration, state)`. `render(a, b, u)` interpolates.
- Chips carry stable ids, so a chip that changes slot between two keyframes
  glides; one that appears fades in; one that leaves fades out.
- Tempo is a single constant (`SPEED`). Re-pacing is a one-line change.

## Brand rules

**REQUIRED BACKGROUND:** `arbitrum-brand-svg-diagrams` owns the palette, the
measured contrast table, the background asset, and `check_contrast.py`. Do not
copy colour values around — read that skill.

Video-specific additions:

| Rule                                                         | Why                                                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 1600×900                                                     | matches `bg-frag.svg`'s native 16:9 exactly and the docs diagram family         |
| Keep content clear of x<330 AND y>810                        | the brand logomark sits there; a full-width bottom panel clips it               |
| Run `check_contrast.py` on **probe frames**, not every frame | pick the extreme states — busiest, emptiest, and the one lowest on the gradient |
| `format=yuv420p` when encoding                               | without it the file plays in VLC but shows black in Safari                      |
| Orange is not the accent                                     | `#ff7700` is Nova-specific, and white on it is 2.66:1                           |

`build.py --one N` writes a single keyframe with the background inlined, which is
what `check_contrast.py` needs to sample the true backdrop.

## Diagram labels are prose

`docs/Offchain-pattern-guide.md` governs text inside the video. Sentence case,
active voice, no "e.g.". All three baseline agents carried `HEAVY LOAD` and
`skipped — block filled in round 1` straight through from the source. Restyling
is the moment to fix that copy, not preserve it.

## Verify against the produced video

Extract frames from **the MP4 you made**, not from your SVGs, and read them:

```bash
ffmpeg -v error -i out.mp4 -vf "select='eq(n\,60)+eq(n\,300)+eq(n\,520)+eq(n\,700)',tile=2x2,scale=iw*0.5:ih*0.5" -frames:v 1 -y grid.png
```

Then diff what you see against `SOURCE.md`, value by value. Also sample four
consecutive frames mid-transition to confirm motion actually interpolates rather
than cutting.

## Red flags — stop and go back to the frames

- "I'll fit the numbers so the totals work out"
- "TwP probably stands for..."
- "close enough to the original"
- "I'll re-simulate the same concept" (that is invention, not transcription)
- "The animation looks right" (looking right is what fabrication looks like)
- Any displayed value you cannot name a frame number for

## Common mistakes

| Mistake                               | Fix                                                                                                                                                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editing the MP4 with ffmpeg filters   | You cannot change baked-in text. Rebuild as a generator.                                                                                                                                                             |
| Keeping the source's aspect ratio     | Re-lay out to 1600×900 unless asked otherwise.                                                                                                                                                                       |
| Bottom panel spanning full width      | Clips the logomark. Start it at x≥340.                                                                                                                                                                               |
| Deciding pace/styling/canvas yourself | These are expensive to redo. Ask first — they materially change the layout. If you cannot ask, default to about 2x the source duration; a tested agent left to its own judgement shipped 4x, which reads as stalled. |
| Rendering before checking contrast    | Probe two frames first; a 700-frame render is 40 s wasted otherwise.                                                                                                                                                 |
