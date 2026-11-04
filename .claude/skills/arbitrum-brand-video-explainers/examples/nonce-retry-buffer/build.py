"""Generate a looping CSS-animated SVG: the sequencer nonce retry buffer when the timer expires.

Usage:
  python3 build.py public/img/nonce-retry-buffer-expired.svg        # the animated deliverable
  python3 build.py /path/frame.svg 9.2                               # a static frame at t=9.2 s

Scenario: other senders' transactions flow through the sequencer queue into blocks. Our sender
submits nonce 8 before nonce 7. Nonce 8 is held in the retry buffer and the expiry timer starts.
Nonce 7 does not arrive in time; a boot kicks nonce 8 out and `nonce too high` is returned to the
sender. Nonce 7 then arrives late and executes, so the sender must resend nonce 8.

Base (un-animated) attributes are the END state, so `prefers-reduced-motion` and any renderer
that ignores CSS animation (rsvg-convert) show a sensible static diagram. With a second argument
the script bakes the keyframe tables into a static frame at that time, for verification.
"""

import sys

W, H = 1000, 470
LOOP = 15  # seconds

# Layout
SEQ_X, SEQ_Y, SEQ_W, SEQ_H = 330, 60, 340, 320
QUEUE_Y, QUEUE_H = 110, 90
BUF_Y, BUF_H = 240, 110
BLOCK_X, BLOCK_Y, BLOCK_W, BLOCK_H = 760, 100, 180, 250
CHIP_W, CHIP_H = 118, 32
LANE_Y = QUEUE_Y + 30  # chip y inside queue
ROW0, ROW_PITCH = 36, 42  # block rows, top offset and pitch


def row_y(slot: int) -> float:
    return BLOCK_Y + ROW0 + slot * ROW_PITCH

FONT = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"


def pct(t: float) -> str:
    return f"{t / LOOP * 100:.2f}%"


def chip(cid: str, label: str, fill: str, text: str, x: float, y: float) -> str:
    return (
        f'<g id="{cid}" class="chip {cid}" transform="translate({x} {y})">'
        f'<rect width="{CHIP_W}" height="{CHIP_H}" rx="8" fill="{fill}"/>'
        f'<text x="{CHIP_W / 2}" y="23" text-anchor="middle" font-size="18" font-weight="600" '
        f'fill="{text}">{label}</text></g>'
    )


# Keyframes for an "other" chip: enter from left, cross queue, land in block, fade.
# `slot` = stacking row inside the block for the resting end state.
def other_track(t0: float, slot: int) -> list:
    qx, qy = SEQ_X + 30, LANE_Y
    bx, by = BLOCK_X + 31, row_y(slot)
    off = -140
    return [
        (0, off, qy, 0),
        (t0, off, qy, 0),
        (t0 + 0.2, off, qy, 1),
        (t0 + 1.2, qx, qy, 1),
        (t0 + 1.7, qx + 140, qy, 1),
        (t0 + 2.4, bx, by, 1),
        (LOOP - 0.4, bx, by, 1),
        (LOOP, bx, by, 0),
    ]


def keyframes(name: str, k: list) -> str:
    frames = "".join(
        f"{pct(t)}{{transform:translate({x}px,{y}px);opacity:{o}}}" for t, x, y, o in k
    )
    return f"@keyframes {name}{{{frames}}}"


def lerp_track(k: list, t: float) -> tuple:
    """Position/opacity of a keyframe list at time t, piecewise linear like the CSS."""
    for (t0, x0, y0, o0), (t1, x1, y1, o1) in zip(k, k[1:]):
        if t0 <= t <= t1:
            f = 0 if t1 == t0 else (t - t0) / (t1 - t0)
            return x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, o0 + (o1 - o0) * f
    return k[-1][1], k[-1][2], k[-1][3]


def main() -> None:
    out = sys.argv[1]
    at = float(sys.argv[2]) if len(sys.argv) > 2 else None  # bake a static frame at time t
    tracks: dict = {}
    # Block rows follow execution order: o1, o2, o3, o4. Ours never lands.
    others = [("o1", 0.3, 0), ("o2", 1.4, 1), ("o3", 5.5, 2), ("o4", 8.2, 3)]
    css = [
        f".chip{{animation-duration:{LOOP}s;animation-timing-function:linear;animation-iteration-count:infinite}}",
        ".caption{animation-duration:%ds;animation-timing-function:step-end;animation-iteration-count:infinite}" % LOOP,
        ".timer{transform-box:fill-box;transform-origin:left center;animation-duration:%ds;animation-timing-function:linear;animation-iteration-count:infinite}" % LOOP,
        "@media (prefers-reduced-motion:reduce){.chip,.caption,.timer{animation:none}}",
    ]
    for name, t0, slot in others:
        tracks[name] = other_track(t0, slot)
        css.append(keyframes(name, tracks[name]))
        css.append(f".{name}{{animation-name:{name}}}")

    # Ours: nonce 8 arrives at t=2.6, held in buffer at 4.4; timer runs 4.0 -> 9.0 and expires.
    # Nonce 7 never arrives. At 9.2 the sequencer drops nonce 8; the error lands at the sender.
    qx, qy = SEQ_X + 30, LANE_Y
    bufx, bufy = SEQ_X + 30, BUF_Y + 70
    off = -140
    errx, erry = 80, LANE_Y + 96  # the error chip, in the incoming column under the arrow
    n8 = [
        (0, off, qy, 0),
        (2.6, off, qy, 0),
        (2.8, off, qy, 1),
        (3.8, qx, qy, 1),
        (4.4, bufx, bufy, 1),
        (9.2, bufx, bufy, 1),
        (9.55, bufx - 150, bufy - 70, 1),
        (9.9, bufx - 290, bufy - 40, 0),
        (LOOP, bufx - 290, bufy - 40, 0),
    ]
    # Rotation for the kicked chip, degrees, keyed on the same times.
    n8_rot = {9.2: 0, 9.55: -25, 9.9: -60, LOOP: -60}
    err = [
        (0, errx, erry, 0),
        (9.8, errx, erry, 0),
        (10.2, errx, erry, 1),
        (LOOP - 0.4, errx, erry, 1),
        (LOOP, errx, erry, 0),
    ]
    # Nonce 7 arrives late, at 10.4: it executes normally, because its nonce equals the state nonce.
    b7 = (BLOCK_X + 31, row_y(4))
    n7 = [
        (0, off, qy, 0),
        (10.8, off, qy, 0),
        (11.0, off, qy, 1),
        (12.0, qx, qy, 1),
        (12.5, qx + 140, qy, 1),
        (13.2, b7[0], b7[1], 1),
        (LOOP - 0.4, b7[0], b7[1], 1),
        (LOOP, b7[0], b7[1], 0),
    ]
    bootx, booty = SEQ_X + SEQ_W - 110, bufy - 20  # rest position, right side of the buffer
    hitx = bufx + CHIP_W - 6  # the -10deg kick pivots at the boot's top-left, so lead the toe in
    boot = [
        (0, bootx + 60, booty, 0),
        (8.7, bootx + 60, booty, 0),
        (8.9, bootx + 60, booty, 1),
        (9.2, hitx, booty, 1),
        (9.45, hitx + 10, booty, 1),
        (9.9, bootx + 60, booty, 0),
        (LOOP, bootx + 60, booty, 0),
    ]
    boot_rot = {8.9: 20, 9.2: -10, 9.45: -10, 9.9: 20}
    tracks.update({"n8": n8, "err": err, "n7": n7, "boot": boot})
    rots = {"n8": n8_rot, "boot": boot_rot}
    for name, k in (("n8", n8), ("err", err), ("n7", n7), ("boot", boot)):
        rot = rots.get(name, {})
        frames = "".join(
            f"{pct(t)}{{transform:translate({x}px,{y}px) rotate({rot.get(t, 0)}deg);opacity:{o}}}"
            for t, x, y, o in k
        )
        css.append(f"@keyframes {name}{{{frames}}}")
        css.append(f".{name}{{animation-name:{name}}}")

    # Timer: full width until 4.0, drains to empty at 9.0 and stays empty.
    css.append(
        "@keyframes timer{0%{transform:scaleX(1)}"
        f"{pct(4.0)}{{transform:scaleX(1)}}"
        f"{pct(9.0)}{{transform:scaleX(0)}}"
        "100%{transform:scaleX(0)}}"
        ".timer{animation-name:timer}"
    )

    # Captions: four phases, step-end.
    caps = [
        ("c1", "Other senders' transactions pass through the queue in arrival order.", 0, 2.6),
        ("c2", "Nonce 8 arrives before nonce 7: the sequencer holds it and starts the timer.", 2.6, 6.0),
        ("c3", "Nonce 7 does not arrive. The timer runs out.", 6.0, 9.2),
        ("c4", "The sequencer drops nonce 8 and returns nonce too high to your sender.", 9.0, 10.8),
        ("c5", "Nonce 7 arrives late and executes. Resend nonce 8.", 10.8, LOOP),
    ]
    last = caps[-1][0]
    for cid, _, t0, t1 in caps:
        base = 1 if cid == last else 0
        frames = f"0%{{opacity:{1 if t0 == 0 else 0}}}"
        if t0 > 0:
            frames += f"{pct(t0)}{{opacity:1}}"
        if t1 < LOOP:
            frames += f"{pct(t1)}{{opacity:0}}"
        frames += f"100%{{opacity:{base}}}"
        css.append(f"@keyframes {cid}{{{frames}}}.{cid}{{animation-name:{cid}}}")

    desc = (
        "Animated diagram of the sequencer's nonce retry buffer when the timer expires. Transactions "
        "from other senders enter the sequencer queue from the left and land in a block on the right. "
        "Your transaction with nonce 8 arrives before nonce 7, so the sequencer moves it into the "
        "retry buffer and starts the expiry timer. Nonce 7 does not arrive and the timer runs out. "
        "The sequencer drops nonce 8 and returns the error nonce too high to your sender. Nonce 7 then "
        "arrives late and executes normally, so your sender must resend nonce 8."
    )

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="t d">',
        "<title id=\"t\">Nonce retry buffer: nonce 7 arrives late and nonce 8 fails with nonce too high</title>",
        f'<desc id="d">{desc}</desc>',
        "<defs>",
        '<linearGradient id="brandbg" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0" stop-color="#152c4e"/><stop offset="0.55" stop-color="#1b4add"/><stop offset="1" stop-color="#12aaff"/>'
        "</linearGradient>",
        '<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#9dcced"/></marker>',
        "</defs>",
        f"<style>{''.join(css)}</style>",
        f'<rect x="0" y="0" width="{W}" height="{H}" fill="url(#brandbg)"/>',
        f'<g font-family="{FONT}">',
        # Column headers
        f'<text x="150" y="40" text-anchor="middle" font-size="20" font-weight="600" fill="#9dcced">Incoming transactions</text>',
        f'<text x="{SEQ_X + SEQ_W / 2}" y="40" text-anchor="middle" font-size="20" font-weight="600" fill="#9dcced">Sequencer</text>',
        f'<text x="{BLOCK_X + BLOCK_W / 2}" y="40" text-anchor="middle" font-size="20" font-weight="600" fill="#9dcced">Block</text>',
        # Sequencer panel
        f'<rect x="{SEQ_X}" y="{SEQ_Y}" width="{SEQ_W}" height="{SEQ_H}" rx="14" fill="#ffffff" fill-opacity="0.06" stroke="#9dcced" stroke-opacity="0.5"/>',
        # Queue box
        f'<rect x="{SEQ_X + 18}" y="{QUEUE_Y}" width="{SEQ_W - 36}" height="{QUEUE_H}" rx="10" fill="#213147"/>',
        f'<text x="{SEQ_X + 30}" y="{QUEUE_Y + 20}" font-size="17" fill="#c9dcef">Queue · executes in nonce order</text>',
        # Retry buffer box
        f'<rect x="{SEQ_X + 18}" y="{BUF_Y}" width="{SEQ_W - 36}" height="{BUF_H}" rx="10" fill="#213147"/>',
        f'<text x="{SEQ_X + 30}" y="{BUF_Y + 20}" font-size="17" fill="#c9dcef">Retry buffer · holds a nonce gap</text>',
        f'<text x="{SEQ_X + 30}" y="{BUF_Y + 42}" font-size="15" fill="#c9dcef">Expiry timer (1 s by default)</text>',
        # Timer track + bar, on their own row under the label
        f'<rect x="{SEQ_X + 30}" y="{BUF_Y + 50}" width="{SEQ_W - 60}" height="10" rx="5" fill="#0b1b2e"/>',
        # Inline scaleX(0) is the end state; the animation overrides it while it runs.
        f'<rect class="timer" style="transform:scaleX(0)" x="{SEQ_X + 30}" y="{BUF_Y + 50}" width="{SEQ_W - 60}" height="10" rx="5" fill="#12aaff"/>',
        # Block box
        f'<rect x="{BLOCK_X}" y="{BLOCK_Y}" width="{BLOCK_W}" height="{BLOCK_H}" rx="12" fill="#ffffff" fill-opacity="0.06" stroke="#9dcced" stroke-opacity="0.5"/>',
        f'<text x="{BLOCK_X + BLOCK_W / 2}" y="{BLOCK_Y + 24}" text-anchor="middle" font-size="16" fill="#c9dcef">Executed, in order</text>',
        # Arrows: inbound -> queue, queue -> block
        f'<path d="M190 {LANE_Y + 17} L{SEQ_X + 10} {LANE_Y + 17}" fill="none" stroke="#9dcced" stroke-width="2.5" marker-end="url(#arrow)"/>',
        f'<path d="M{SEQ_X + SEQ_W + 8} {LANE_Y + 17} L{BLOCK_X - 10} {LANE_Y + 17}" fill="none" stroke="#9dcced" stroke-width="2.5" marker-end="url(#arrow)"/>',
        # Key, on its own chip: this depth of the gradient is the dead band for bare text.
        # Right edge stays left of the sequencer panel (SEQ_X) so the two never overlap.
        f'<rect x="40" y="{H - 118}" width="{SEQ_X - 50}" height="34" rx="8" fill="#152c4e" opacity="0.92"/>',
        f'<rect x="50" y="{H - 110}" width="18" height="18" rx="4" fill="#12aaff"/><text x="74" y="{H - 96}" font-size="16" fill="#eaf5ff">Your sender</text>',
        f'<rect x="176" y="{H - 110}" width="18" height="18" rx="4" fill="#213147"/><text x="200" y="{H - 96}" font-size="16" fill="#eaf5ff">Other senders</text>',
    ]
    # Captions (chipped, bottom)
    for cid, text, t0, t1 in caps:
        visible = (t0 <= at < t1) if at is not None else cid == last
        parts.append(
            f'<g class="caption {cid}" opacity="{1 if visible else 0}">'
            f'<rect x="40" y="{H - 62}" width="{W - 80}" height="38" rx="8" fill="#152c4e" opacity="0.92"/>'
            f'<text x="{W / 2}" y="{H - 37}" text-anchor="middle" font-size="18" fill="#eaf5ff">{text}</text></g>'
        )
    # Chips (base positions = end state; a baked frame uses the track position at `at`)
    def place(name: str, label: str, fill: str, text: str, x: float, y: float, base: float = 1) -> str:
        fx, fy, fo = (x, y, base) if at is None else lerp_track(tracks[name], at)
        rot = 0
        if at is not None and name in rots:
            keys = sorted(rots[name])
            for t0, t1 in zip(keys, keys[1:]):
                if t0 <= at <= t1:
                    f = (at - t0) / (t1 - t0)
                    rot = rots[name][t0] + (rots[name][t1] - rots[name][t0]) * f
        return (
            chip(name, label, fill, text, fx, fy)
            .replace(f'class="chip {name}"', f'class="chip {name}" opacity="{fo:.2f}"')
            .replace(f'transform="translate({fx} {fy})"', f'transform="translate({fx} {fy}) rotate({rot:.1f})"')
        )

    for name, _, slot in others:
        parts.append(place(name, "tx", "#213147", "#ffffff", BLOCK_X + 31, row_y(slot)))
    parts.append(place("n8", "nonce 8", "#12aaff", "#0b1b2e", bufx, bufy, base=0))
    parts.append(place("n7", "nonce 7", "#12aaff", "#0b1b2e", b7[0], b7[1]))
    parts.append(
        place("err", "nonce too high", "#e6007a", "#ffffff", errx, erry)
        .replace(f'width="{CHIP_W}"', 'width="168"')
        .replace(f'x="{CHIP_W / 2}"', 'x="84"')
        # The label shares the chip's group so it appears and fades with the error.
        # Measured at 6.9:1 (#eaf5ff on the gradient at this depth) before it moved into the group.
        .replace(
            "</text></g>",
            '</text><text x="0" y="-12" font-size="15" fill="#eaf5ff">Returned to your sender:</text></g>',
        )
    )
    bx, by, bo = (bootx + 60, booty, 0) if at is None else lerp_track(boot, at)
    brot = 0 if at is None else next((r for t, r in sorted(boot_rot.items(), reverse=True) if t <= at), 20)
    parts.append(
        f'<g class="chip boot" transform="translate({bx} {by}) rotate({brot})" opacity="{bo:.2f}">'
        # A work boot, toe to the left, drawn at 84x74 and scaled to 0.7 so it fits the band
        # under the timer bar: upper, toe cap, cuff, laces with eyelets, sole with heel and tread.
        '<g transform="scale(0.7)">'
        '<path d="M46 0 H78 V46 Q78 58 66 58 H10 Q0 58 0 46 Q0 32 14 30 H38 Q46 30 46 22 Z" fill="#12aaff"/>'
        '<path d="M0 46 Q0 32 14 30 H30 V58 H10 Q0 58 0 46 Z" fill="#1b4add"/>'
        '<path d="M46 0 H78 V11 H46 Z" fill="#9dcced"/>'
        '<path d="M54 16 L70 23 M70 16 L54 23 M54 23 L70 30 M70 23 L54 30 M54 30 L70 37 M70 30 L54 37" '
        'fill="none" stroke="#eaf5ff" stroke-width="2" stroke-linecap="round"/>'
        '<circle cx="54" cy="16" r="2.2" fill="#eaf5ff"/><circle cx="70" cy="16" r="2.2" fill="#eaf5ff"/>'
        '<circle cx="54" cy="23" r="2.2" fill="#eaf5ff"/><circle cx="70" cy="23" r="2.2" fill="#eaf5ff"/>'
        '<circle cx="54" cy="30" r="2.2" fill="#eaf5ff"/><circle cx="70" cy="30" r="2.2" fill="#eaf5ff"/>'
        '<circle cx="54" cy="37" r="2.2" fill="#eaf5ff"/><circle cx="70" cy="37" r="2.2" fill="#eaf5ff"/>'
        '<path d="M0 56 H74 Q84 56 84 64 V66 Q84 74 74 74 H8 Q0 74 0 66 Z" fill="#213147"/>'
        '<path d="M60 56 H84 V74 H60 Z" fill="#152c4e"/>'
        '<path d="M10 70 H16 M22 70 H28 M34 70 H40 M46 70 H52 M66 70 H72" fill="none" stroke="#9dcced" stroke-width="2" stroke-linecap="round"/>'
        "</g></g>"
    )
    parts.append("</g></svg>")
    if at is not None:
        # Bake the timer bar and drop the CSS so the frame is what the keyframes say.
        timer = 1.0 if at < 4.0 else max(0.0, 1 - (at - 4.0) / 5.0)
        parts = [
            p.replace(
                f'<rect class="timer" style="transform:scaleX(0)" x="{SEQ_X + 30}" y="{BUF_Y + 50}" width="{SEQ_W - 60}"',
                f'<rect class="timer" x="{SEQ_X + 30}" y="{BUF_Y + 50}" width="{(SEQ_W - 60) * timer:.1f}"',
            )
            for p in parts
        ]
        parts = [p for p in parts if not p.startswith("<style>")]

    with open(out, "w") as f:
        f.write("\n".join(parts) + "\n")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
