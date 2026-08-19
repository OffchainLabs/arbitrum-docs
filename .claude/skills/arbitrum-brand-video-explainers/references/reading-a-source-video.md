# Reading a source video

How to recover an animation's content from a rendered file, cheaply and without
inventing anything. Every technique here was used to reverse-engineer the worked
example in `examples/pga-rounds/`.

## 1. Probe before you look

```bash
ffprobe -v error -show_entries format=duration,size,bit_rate \
  -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,pix_fmt \
  -of default=noprint_wrappers=1 in.mp4
```

Note the frame count — every later command addresses frames by index `n`. Check
whether an audio stream exists at all; if the source has none, your output should
not invent one.

## 2. Read many frames in one image

Reading frames one at a time burns a tool call and an image each. The `tile`
filter puts many frames in a single image, so one read covers a dozen states.

```bash
# four frames spread across the run, as a 2x2 grid
ffmpeg -v error -i in.mp4 \
  -vf "select='eq(n\,0)+eq(n\,60)+eq(n\,130)+eq(n\,257)',tile=2x2" \
  -frames:v 1 -y grid.png
```

Scale down when the grid gets large (`,scale=iw*0.5:ih*0.5`), but stop as soon as
labels stop being legible — an unreadable grid is worse than two readable ones.

## 3. Crop to the state line to recover a state machine

Most explainers carry their state in a fixed header region. Crop to just that
band and tile a long strip: you get the full state sequence in one or two reads
instead of dozens.

```bash
# crop=W:H:X:Y — here a 44px-tall header band, every 10th frame, stacked
ffmpeg -v error -i in.mp4 \
  -vf "select='not(mod(n,10))*lt(n,130)',crop=720:44:0:30,tile=1x13,scale=iw*1.5:ih*1.5" \
  -frames:v 1 -y status_a.png
```

Scaling **up** matters here — small type that is marginal at 1:1 becomes reliable
at 1.5×. This one technique recovered the complete phase/counter sequence of the
worked example (18 distinct states) from two images.

## 4. Mine the accumulator frames

Animations that build up a history — a ledger, a list of completed items, a
scoreboard — hold most of their data in the **final** frame. Read that first: it
often hands you the whole dataset at once, and earlier frames then only need to
confirm ordering and timing.

In the worked example the "sealed blocks" strip at the end carried four of the
six blocks' full contents; two mid-run frames covered the rest.

## 5. Do not assume one number derives from another

Check before you infer. In the worked example the chips looked like gas units and
the header showed `block gas: N / 150`, so "gas = sum of chips" was the obvious
reading. It is wrong:

| Block | Chips      | Sum | Displayed gas |
| ----- | ---------- | --- | ------------- |
| 1     | 31, 9      | 40  | **34**        |
| 6     | 21, 12, 11 | 44  | **152**       |

The chips are tips; gas is independent and not displayed per transaction. Any
model "fitted" to reconcile them produces numbers that are wrong everywhere.

**The rule:** if a displayed value is not derivable from what is on screen,
transcribe the observed values at the frames you sampled and script those. Record
the frames you sampled it at. Do not fit a curve.

## 6. Infer categorical rules, but state them as inferences

Colour and shape usually encode a category. You can infer the rule, but write
down the evidence and the uncertainty.

Worked example: red chips were tips ≥ 15 (observed reds: 31, 24, 29, 27, 17, 36,
29, 28, 21; observed non-reds: 12, 11, 9, 10, 5, 4, 1). The threshold is bounded
by the data to somewhere in 13–17 — pick one, and say so.

## 7. Write SOURCE.md before writing the renderer

One line per datum, each with the frame number it came from, and an explicit
`UNKNOWN` for anything unreadable. This is the artifact the transcription
contract in SKILL.md refers to. Writing the renderer first turns every gap in
your reading into an invented value, because the renderer needs _something_ in
that slot and you are the one holding the keyboard.

## 8. Verify against your own output

Re-run steps 2 and 3 against the MP4 you produced and diff the result against
`SOURCE.md`. Reading your own SVGs proves nothing — they are the thing under
test.
