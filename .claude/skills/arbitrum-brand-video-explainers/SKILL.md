---
name: arbitrum-brand-video-explainers
description: Use when asked to rebrand, restyle, re-pace, resize, or re-render an existing explainer video, when a video's labels are baked-in raster pixels that cannot be edited, when a reviewer says an animation shows the wrong mechanism, or when building a new animated explainer or short looping animated diagram for the Arbitrum docs from a prompt or a doc section.
---

# Arbitrum brand video explainers

## Overview

A rendered video cannot be edited. Its labels are pixels on a raster grid — there
is no "Block 1" text object, only pixels shaped like one. **The deliverable is
always a generator script, never an edited MP4.** You rebuild the animation as
code, then render it.

That makes the job two separate problems, and the second is not the hard one:

1. **Recover the content** from the source (or invent it, from a prompt).
2. **Render it** in brand styling at the requested pace.

## When to use

- "Make this video match our branding" / "restyle this animation"
- "Slow this down so people can follow it" / "re-pace this"
- A video is the wrong aspect ratio, or its text is too small at display size
- "The animation shows the wrong behaviour" (a reviewer comment on an MP4)
- Building a new animated explainer, or a short animated diagram, for a docs page

## When NOT to use

- **Interactive or clickable diagrams** → React widgets under `components/widgets/`.
  Those stay editable and respond to the site's dark mode; a video does neither.
- **Static concept art** → `arbitrum-brand-svg-diagrams`.
- **Screen recordings of real UI** → keep the recording, just trim/crop/compress.
- Never Mermaid or any text-DSL animation tool (standing team preference).

## Pick the deliverable first

Two formats, one generator discipline. Decide before any layout work; changing
later means a rewrite.

| Brief                                                                                 | Deliverable                                    | Why                                                                                                        |
| ------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| A loop under about 15 s, fewer than about 15 moving parts, inline next to a paragraph | **CSS-animated SVG** in `public/img/`, 8–15 KB | No player, scales with the column, renders through `<ImageZoom>`, markdown mirrors get the end-state frame |
| Longer, narrated, transcribed from a source video, or more than one scene             | **MP4**, 1600×900, 30 fps, `yuv420p`           | A long CSS timeline is unreadable and cannot be re-paced per scene                                         |
| Either, and the reader must step, pause, or click                                     | Neither: a React widget                        | Out of scope here                                                                                          |

## Where the files live

A video or animation is three files, and all three are committed together:

```text
public/img/<name>.svg | <name>.mp4        the rendered deliverable
docs/explainers/<name>/build.py           the generator
docs/explainers/<name>/SOURCE.md          one line per displayed value, with its source
docs/explainers/<name>/render.json        MP4 only: SPEED, fps, frame count, duration
```

`render.json` is what makes "keep the same pace as last time" a lookup instead of
a reverse-engineering job. A shipped MP4 with no recorded tempo cost a session
solving for `SPEED` by frame count.

`examples/` under this skill is read-only reference. Copy an example out to
`docs/explainers/<name>/` before changing a line; an example edited in place was
reverted by the next checkout and the committed MP4 lost its generator.

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
- a `CONFLICTS` section (see below), even when empty

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
- **A label that names an action appears only on the steps where that action
  happens.** A `forceInclusion` sublabel that stays up during the outcome where
  force inclusion is not used is a factual bug, and only a probe frame finds it.

**When the source is wrong.** A reviewer comment that says the mechanism is
wrong, or a docs page that contradicts the video, outranks the video. Write the
conflict under `CONFLICTS` in `SOURCE.md` (what the video shows, what the prose
says, which one you followed), follow the prose, and flag it to the user. When
two docs pages contradict each other, pick one, record both, and flag it the same
way. This is the one case where transcribe-exactly does not apply.

**When the brief is a prompt**, the contract inverts: you own the data, so write
`SOURCE.md` first and show its contents in the question that asks for
confirmation. A question that covers only scope and pace has not confirmed the
data. Do not discover the content while writing the renderer.

## Reading a source video

See references/reading-a-source-video.md for the extraction technique —
`ffprobe` first, then the `select` + `tile` filter to read dozens of frames in a
single image, and cropping to a status region to recover a state machine cheaply.

## Labels are prose: read STYLE-GUIDE.md before you draft them

`STYLE-GUIDE.md` at the repo root governs every label and caption. Read it
before writing the first label, not after the render: both earlier sessions
skipped this step, and the write hook only fires on an MDX edit, so nothing else
catches it. Sentence case, active voice, no "e.g.". Restyling is the moment to
fix copy such as `HEAVY LOAD` and `skipped — block filled in round 1`, not to
preserve it.

## Pipeline: MP4

```bash
# 1. generate one TRANSPARENT svg per frame, into the session scratchpad
python3 docs/explainers/<name>/build.py --out "$SCRATCHPAD/<name>"

# 2. composite over the brand background and encode
bash .claude/skills/arbitrum-brand-video-explainers/tools/render.sh "$SCRATCHPAD/<name>/f" public/img/<name>.mp4 30
```

`render.sh` rasterises frames in parallel and composites them over a
once-rendered background (726 frames → MP4 in about 40 s). Keep frame SVGs
transparent: inlining the 44 KB background into every frame gives an identical
picture several times slower.

**Start from a copy of examples/pga-rounds/build.py.** Replace its source-data
block and layout; keep its keyframe/tween engine:

- `KEYS` is a list of `(duration, state)`. `render(a, b, u)` interpolates.
- Chips carry stable ids, so a chip that changes slot between two keyframes
  glides; one that appears fades in; one that leaves fades out.
- Tempo is a single constant (`SPEED`). Re-pacing is a one-line change, and the
  value goes into `render.json` with the fps and frame count.

## Pipeline: CSS-animated SVG

**Start from a copy of examples/nonce-retry-buffer/build.py.** It is a single
file that writes the SVG, and with a second argument writes a static frame at
time _t_ for verification. The recipe it follows:

1. **Base attributes are the end state.** Every chip's `transform`, every
   caption's `opacity`, the timer's inline `style`, all describe the last frame.
   The keyframes override them while the loop runs. This is what gives you the
   `prefers-reduced-motion` fallback, a meaningful `rsvg-convert` render for
   the contrast gate, and a sensible image in the markdown mirror, for free.
2. **One `<style>` block, one `@keyframes` per moving element**, percentages
   computed from a single `LOOP` constant. Position is `transform: translate()`
   (plus `rotate()` where a piece tumbles); visibility is `opacity`. A bar that
   grows or drains is `transform-box: fill-box` with `scaleX()` or `scaleY()`
   and `transform-origin` on the fixed edge (`left center`, `bottom center`),
   never an animated `width` or `height`.
3. **Captions are chips**: a `#152c4e` rect at 92% opacity under `#eaf5ff`
   text, one per phase, stepped with `animation-timing-function: step-end`.
4. **A label shares the group of the thing it describes.** A label placed as a
   sibling is visible from frame 0; the correction "Returned to your sender was
   visible before anything was returned" came from exactly that.
5. **The loop resolves the story.** End on the state the reader must act on,
   and let it hold for a second before the fade. A loop that stopped at the
   error drew the question "and what if nonce 7 arrives late?" — the answer had
   to be animated in.
6. Wire it into the page as `<ImageZoom><img src="/img/<name>.svg" alt="…"
data-wide /></ImageZoom>`, with the full description in `alt` and the same
   text in the SVG's `<desc>`.

### Icons and motion

| Rule                                                                  | Why                                                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| An icon uses three or more brand colours and its defining details     | A one-colour silhouette was "barely identifiable as a boot"; laces, a toe cap and a sole made it read   |
| Draw the icon at a comfortable size, then wrap it in `scale()`        | A 74 px boot covered the label it kicked past; scaled to 0.7 it sat in the free band                    |
| A rotated piece pivots on its group origin, so lead the contact point | A −10° kick pulled the toe 6 px off the chip it was meant to hit; move the hit point in by that much    |
| Every fixed element clears every panel, measured, not eyeballed       | The colour key overlapped the sequencer panel by 10 px until its width was derived from the panel's `x` |
| Chips travel on straight segments; no easing                          | Linear motion reads as mechanism; easing reads as decoration                                            |

## Brand rules

**REQUIRED BACKGROUND:** `arbitrum-brand-svg-diagrams` owns the palette, the
measured contrast table, the background asset, and `check_contrast.py`. Do not
copy colour values around — read that skill.

Video-specific additions:

| Rule                                                             | Why                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| MP4: 1600×900                                                    | matches `bg-frag.svg`'s native 16:9 exactly and the docs diagram family         |
| MP4: keep content clear of x<330 AND y>810                       | the brand logomark sits there; a full-width bottom panel clips it               |
| SVG loop: brand gradient on a full-bleed rect, canvas to content | the baked background is 44 KB for a loop that weighs 10                         |
| Run `check_contrast.py` on **probe frames**, not every frame     | pick the extreme states — busiest, emptiest, and the one lowest on the gradient |
| Text on the lower gradient sits on an opaque card                | `#c9dcef` on the gradient at 75% depth measured 3.18:1                          |
| Text on magenta is `#ffffff`, never a tint                       | `#ffd6ec` on `#e6007a` measured 3.46:1; white is 4.52:1 with no headroom        |
| `format=yuv420p` when encoding                                   | without it the file plays in VLC but shows black in Safari                      |
| Orange is not the accent                                         | `#ff7700` is Nova-specific, and white on it is 2.66:1                           |

`build.py --one N` (MP4) or `build.py out.svg <t>` (SVG loop) writes a single
frame with the backdrop in place, which is what `check_contrast.py` needs to
sample the true backdrop.

**`check_contrast.py` reads each label's own `x`/`y` and ignores a parent
`<g transform>`.** A chip label inside a translated group reports a FAIL against
the gradient at the canvas origin. Confirm the real pairing with a zoom crop of
the rendered frame and note the false FAIL in the hand-off; do not restructure
the diagram to please the tool.

## Verify against what you produced

**MP4.** Extract frames from **the MP4 you made**, not from your SVGs:

```bash
ffmpeg -v error -i public/img/<name>.mp4 -vf "select='eq(n\,60)+eq(n\,300)+eq(n\,520)+eq(n\,700)',tile=2x2,scale=iw*0.5:ih*0.5" -frames:v 1 -y grid.png
```

Then diff what you see against `SOURCE.md`, value by value. Also sample four
consecutive frames mid-transition to confirm motion interpolates rather than
cuts.

**SVG loop.** `rsvg-convert` ignores CSS animation, so bake frames instead:

```bash
for t in 1.2 3.4 6.0 8.6 9.8; do python3 build.py "$SCRATCHPAD/f_$t.svg" $t && rsvg-convert -b '#ffffff' -w 500 "$SCRATCHPAD/f_$t.svg" -o "$SCRATCHPAD/f_$t.png"; done
magick "$SCRATCHPAD"/f_*.png -append "$SCRATCHPAD/sheet.png"   # then read the sheet
```

The baked frames prove the choreography. Prove the browser runs it with the
Claude-in-Chrome extension (`/chrome` in the session): serve `public/img` with
`python3 -m http.server 8765 --bind 127.0.0.1` (`file://` is blocked), navigate
to the SVG, and run `document.getAnimations().length` — it must equal the number
of `@keyframes` you wrote. The Playwright and chrome-devtools MCPs hung on this
in testing; do not spend more than one attempt on them. Stop the server and
close the tab when done.

## Red flags — stop and go back to the frames

- "I'll fit the numbers so the totals work out"
- "TwP probably stands for..."
- "close enough to the original"
- "I'll re-simulate the same concept" (that is invention, not transcription)
- "The animation looks right" (looking right is what fabrication looks like)
- Any displayed value you cannot name a frame number for
- A generator that exists only in the scratchpad after the deliverable is committed

## Common mistakes

| Mistake                                   | Fix                                                                                                                                                                                                                  |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editing the MP4 with ffmpeg filters       | You cannot change baked-in text. Rebuild as a generator.                                                                                                                                                             |
| Editing `examples/*/build.py` in place    | Copy it to `docs/explainers/<name>/` first. The example is reference; the copy is the project's generator and is committed with the deliverable.                                                                     |
| Writing the deliverable to the repo root  | `public/img/<name>.svg` or `.mp4`, like every other docs image.                                                                                                                                                      |
| Keeping the source's aspect ratio         | Re-lay out to 1600×900 unless asked otherwise.                                                                                                                                                                       |
| Bottom panel spanning full width          | Clips the logomark. Start it at x≥340.                                                                                                                                                                               |
| Deciding pace/styling/canvas yourself     | These are expensive to redo. Ask first — they materially change the layout. If you cannot ask, default to about 2x the source duration; a tested agent left to its own judgement shipped 4x, which reads as stalled. |
| Rendering before checking contrast        | Probe two frames first; a 700-frame render is 40 s wasted otherwise.                                                                                                                                                 |
| Animating `width`/`height` on an SVG rect | Browsers differ; `scaleX()`/`scaleY()` with `transform-box: fill-box` is uniform.                                                                                                                                    |
