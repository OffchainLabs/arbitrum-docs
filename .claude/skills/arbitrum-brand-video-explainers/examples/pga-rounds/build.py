#!/usr/bin/env python3
"""Worked example: the priority gas auction explainer, rebuilt as a generator.

This is the reference implementation for arbitrum-brand-video-explainers. It was
reverse-engineered from a 720x624 raster MP4 whose labels could not be edited,
and re-rendered at 1600x900 in brand styling at a slower tempo. Copy this file
and replace the source-data block and the layout; keep the keyframe/tween engine.

    python3 build.py                 # write every frame SVG to the work dir
    python3 build.py --one 33        # write probe.svg for one keyframe, with the
                                     # background inlined, for check_contrast.py
    python3 build.py --out DIR       # choose the work dir (default: a temp dir)

Then encode with ../../tools/render.sh <workdir>/f <out.mp4>
"""

import os
import sys
import tempfile
from pathlib import Path
from xml.sax.saxutils import escape

# Palette, contrast rules, and the brand background all come from the sibling
# skill. Keep the two in sync rather than copying colour values around.
SKILL = Path(
    os.environ.get('SVG_SKILL', Path(__file__).resolve().parents[3] / 'arbitrum-brand-svg-diagrams')
)


def _work_dir():
    if '--out' in sys.argv:
        return Path(sys.argv[sys.argv.index('--out') + 1])
    return Path(tempfile.gettempdir()) / 'pga-rounds-build'


OUT = _work_dir()
FRAMES = OUT / 'f'

W, H, FPS = 1600, 900, 30

SANS = ('Inter, ui-sans-serif, system-ui, -apple-system, &quot;Segoe UI&quot;, '
        'Roboto, Helvetica, Arial, sans-serif')

CYAN, MAGENTA, NAVY = '#12aaff', '#e6007a', '#213147'
LIGHT, PALE, INK = '#9dcced', '#eaf5ff', '#0b1b2e'
AMBER = '#ffcb6b'
SUBTLE = '#c9dcef'

# ---------------------------------------------------------------- source data
# tip value, is_twp, boost   (recovered from the source video frames)
BLOCKS = [
    dict(n=1, r1=[], r2=[(31, 1, 0), (9, 0, 0)], early=False,
         gas=dict(r1d=0, r1h=0, r2d=17, r2h=34), final=34),
    dict(n=2, r1=[(24, 1, 0), (10, 0, 0), (1, 0, 0)], r2=[(29, 1, 0), (1, 0, 0)], early=False,
         gas=dict(r1d=12, r1h=51, r2d=66, r2h=76), final=76),
    dict(n=3, r1=[(12, 0, 0), (11, 0, 0), (5, 0, 0)], r2=[(27, 1, 0), (17, 1, 0), (1, 0, 0)],
         early=False, gas=dict(r1d=28, r1h=44, r2d=149, r2h=194), final=194),
    dict(n=4, r1=[(36, 1, 0), (29, 1, 0), (28, 1, 0)], r2=None, early=True,
         gas=dict(r1d=113, r1h=161), final=161),
    dict(n=5, r1=[(11, 0, 0), (11, 0, 0), (5, 0, 0), (4, 0, 0)], r2=None, early=True,
         gas=dict(r1d=97, r1h=187), final=187),
    dict(n=6, r1=[(21, 1, 0), (12, 0, 0), (11, 0, 0)], r2=None, early=True,
         gas=dict(r1d=103, r1h=152), final=152),
]
LIMIT = 150
# left in the queues when the run ends (matches the source's final frame)
RESIDUAL_S2 = [(3, 0, 0), (1, 0, 1)]
RESIDUAL_S1 = [(11, 0, 0), (2, 0, 0)]

# ---------------------------------------------------------------- layout
S1X, S1W, S2X, S2W = 40, 700, 820, 740
STAGE_Y, STAGE_H = 132, 128
AB_Y, AB_H = 284, 196
R1X, R1W, R2X, R2W = 60, 720, 800, 740
RND_Y, RND_H = 316, 104
CARD_Y, CARD_H, CARD_W, CARD_GAP = 526, 160, 356, 20
TL_X, TL_Y, TL_W, TL_H = 340, 700, 1220, 178
AX_X0, AX_X1, AX_Y = 380, 1520, 756
CHIP_H, CHIP_F = 36, 19


def chip_w(txt):
    return max(50, int(len(txt) * 0.55 * CHIP_F) + 24)


def chip_text(c):
    return f'{c["v"]}+{c["b"]}' if c['b'] else str(c['v'])


def row_x(chips, x0, gap=12):
    """Left edge of each chip laid out in a row."""
    out, x = [], x0
    for c in chips:
        out.append(x)
        x += chip_w(chip_text(c)) + gap
    return out


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- state build
_uid = [0]
CHIPS = {}


def mk(v, twp, boost):
    _uid[0] += 1
    cid = f'c{_uid[0]}'
    CHIPS[cid] = dict(v=v, twp=twp, b=boost)
    return cid


def snap(**kw):
    base = dict(block=1, rnd=1, phase='executing (drain loop)', heavy=False, gas=0,
                s1=[], s2=[], r1=[], r2=[], r2_skipped=False, sealed=[],
                t=0.0, marks=(), building=True)
    base.update(kw)
    return base


KEYS = []      # (duration_seconds, state)
SPEED = 0.82   # global tempo trim; beat durations below are written unscaled


def push(dur, st):
    KEYS.append((dur * SPEED, st))


def build():
    s1, s2 = [], []
    sealed = []
    st = dict(s1=list(s1), s2=list(s2), r1=[], r2=[], sealed=[])

    push(0.8, snap(block=1, rnd=1, gas=0, t=0.0, marks=()))

    for bi, b in enumerate(BLOCKS):
        heavy = b['n'] >= 3
        win_start = ((b['n'] - 1) * 250) % 500
        marks = tuple(m for m in _marks_for(b['n'], sealed))
        rounds = [('r1', b['r1'])] if b['r2'] is None else [('r1', b['r1']), ('r2', b['r2'])]

        for ri, (rkey, spec) in enumerate(rounds):
            rstart = win_start + ri * 125
            # ---- drain: everything queued in stage 2 moves into this round
            landing = [c for c in s2 if CHIPS[c]['_for'] == (b['n'], ri + 1)]
            s2 = [c for c in s2 if c not in landing]
            if rkey == 'r1':
                st['r1'] = landing
            else:
                st['r2'] = landing
            full = heavy and b['early'] and rkey == 'r1'
            gk = 'r1d' if rkey == 'r1' else 'r2d'
            push(1.1, snap(block=b['n'], rnd=ri + 1, heavy=heavy, gas=b['gas'][gk],
                           phase='executing (drain loop)', s1=list(s1), s2=list(s2),
                           r1=list(st['r1']), r2=list(st['r2']),
                           r2_skipped=False, sealed=list(sealed),
                           t=rstart + 62, marks=marks))

            # ---- intake: prepare the next round's transactions
            born = []
            for spec, owner in _next_spec(bi, ri):
                cid = mk(*spec)
                CHIPS[cid]['_for'] = owner
                born.append(cid)
            s1 = born
            gk = 'r1h' if rkey == 'r1' else 'r2h'
            over = b['gas'][gk] >= LIMIT
            phase = ('block full, next block starts at boundary' if over
                     else 'intake only — waiting for boundary')
            push(0.8, snap(block=b['n'], rnd=ri + 1, heavy=heavy, gas=b['gas'][gk],
                           phase=phase, s1=list(s1), s2=list(s2),
                           r1=list(st['r1']), r2=list(st['r2']),
                           r2_skipped=b['early'] and rkey == 'r1',
                           sealed=list(sealed), t=rstart + 125, marks=marks))
            # promote stage 1 -> stage 2 (the final intake stays queued)
            if not (bi == len(BLOCKS) - 1 and ri == len(rounds) - 1):
                s2 = s2 + s1
                s1 = []
                push(0.55, snap(block=b['n'], rnd=ri + 1, heavy=heavy, gas=b['gas'][gk],
                                phase=phase, s1=[], s2=list(s2),
                                r1=list(st['r1']), r2=list(st['r2']),
                                r2_skipped=b['early'] and rkey == 'r1',
                                sealed=list(sealed), t=rstart + 125, marks=marks))

        # ---- seal
        seal_t = win_start + (80 if b['early'] else 250)
        sealed.append(dict(n=b['n'], r1=[CHIPS[c] for c in st['r1']],
                           r2=None if b['r2'] is None else [CHIPS[c] for c in st['r2']],
                           early=b['early']))
        marks2 = marks + (seal_t,)
        push(0.9, snap(block=b['n'], rnd=len(rounds), heavy=heavy, gas=b['final'],
                       phase='sealed', s1=list(s1), s2=list(s2),
                       r1=list(st['r1']), r2=list(st['r2']),
                       r2_skipped=b['r2'] is None, sealed=list(sealed),
                       building=False, t=win_start + 250, marks=marks2))
        final_r1, final_r2 = list(st['r1']), list(st['r2'])
        st['r1'], st['r2'] = [], []

    # tail: hold the last sealed block and its backlog, as the source video ends
    push(1.6, snap(block=6, rnd=1, heavy=True, gas=BLOCKS[-1]['final'],
                   phase='block full, next block starts at boundary',
                   s1=list(s1), s2=list(s2), r1=final_r1, r2=final_r2, r2_skipped=True,
                   sealed=list(sealed), building=False, t=250,
                   marks=(0.0, 80.0)))


def _marks_for(n, sealed):
    """Seal markers still inside the current 500 ms window."""
    out = []
    for s in sealed:
        abs_t = (s['n'] - 1) * 250 + (80 if s['early'] else 250)
        if abs_t // 500 == ((n - 1) * 250) // 500:
            out.append(abs_t % 500)
        elif abs_t % 500 == 0 and abs_t // 500 == ((n - 1) * 250) // 500 + 1:
            out.append(0.0)
    return out


def _next_spec(bi, ri):
    """[(chip spec, owning (block, round))] to admit during this intake beat.

    Owner (99, 1) never matches a real round, so those chips stay queued —
    that is how the run ends with a backlog, as the source video does.
    """
    b = BLOCKS[bi]
    if b['r2'] is not None and ri == 0:
        return [(t, (b['n'], 2)) for t in b['r2']]
    if bi + 1 < len(BLOCKS):
        nb = BLOCKS[bi + 1]
        out = [(t, (nb['n'], 1)) for t in nb['r1']]
        if bi + 1 == len(BLOCKS) - 1:
            out += [(t, (99, 1)) for t in RESIDUAL_S2]
        return out
    return [(t, (99, 1)) for t in RESIDUAL_S1]


# ---------------------------------------------------------------- svg pieces
def esc(s):
    return escape(str(s))


def txt(o, x, y, s, size, fill, anchor='start', weight='400', op=1.0, extra=''):
    a = f' opacity="{op:.3f}"' if op < 1 else ''
    o.append(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" font-weight="{weight}" '
             f'fill="{fill}" text-anchor="{anchor}"{a}{extra}>{esc(s)}</text>')


def rect(o, x, y, w, h, rx, fill, op=None, stroke=None, sop=None, sw=1, alpha=1.0):
    a = f' opacity="{alpha:.3f}"' if alpha < 1 else ''
    f = f' fill="{fill}"' + (f' fill-opacity="{op}"' if op is not None else '')
    s = ''
    if stroke:
        s = f' stroke="{stroke}" stroke-width="{sw}"' + (f' stroke-opacity="{sop}"' if sop is not None else '')
    o.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}"{f}{s}{a}/>')


def panel(o, x, y, w, h, rx=14):
    rect(o, x, y, w, h, rx, '#ffffff', op=0.06, stroke='#ffffff', sop=0.18)


def draw_chip(o, c, x, y, alpha=1.0, scale=1.0, small=False):
    t = chip_text(c)
    fh = 15 if small else CHIP_F
    h = 28 if small else CHIP_H
    w = max(40, int(len(t) * 0.55 * fh) + 20) if small else chip_w(t)
    fill = MAGENTA if c['twp'] else CYAN
    ink = '#ffffff' if c['twp'] else INK
    g = ''
    if scale != 1.0:
        cx, cy = x + w / 2, y + h / 2
        g = f' transform="translate({cx:.1f} {cy:.1f}) scale({scale:.3f}) translate({-cx:.1f} {-cy:.1f})"'
    o.append(f'<g opacity="{alpha:.3f}"{g}>')
    rect(o, x, y, w, h, h / 2.4, fill)
    txt(o, x + w / 2, y + h / 2 + fh * 0.36, t, fh, ink, anchor='middle', weight='700')
    o.append('</g>')
    return w


# ---------------------------------------------------------------- positions
def positions(st):
    """chip id -> (x, y) for every chip visible in this state."""
    p = {}
    for key, x0, y0 in (('s1', S1X + 20, 182), ('s2', S2X + 20, 182),
                        ('r1', R1X + 18, 356), ('r2', R2X + 18, 356)):
        ch = [CHIPS[c] for c in st[key]]
        for cid, x in zip(st[key], row_x(ch, x0)):
            p[cid] = (x, y0)
    return p


def card_slots(sealed):
    """block number -> x for the last four sealed cards (older ones slide off)."""
    vis = sealed[-4:]
    return {s['n']: 40 + i * (CARD_W + CARD_GAP) for i, s in enumerate(vis)}, vis


# ---------------------------------------------------------------- frame render
def render(a, b, u, inline_bg=False):
    """Tween state a -> b at u in [0,1]."""
    e = ease(u)
    st = b if u >= 0.5 else a
    o = []
    o.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
             f'width="{W}" height="{H}">')
    if inline_bg:
        o.append((SKILL / 'assets' / 'bg-frag.svg').read_text().strip())
    o.append(f'<g font-family="{SANS}">')

    # ---- header
    txt(o, 40, 50, 'Priority gas auction: block ordering across rounds', 32, PALE, weight='700')
    txt(o, 40, 86, f'Block {st["block"]} · round {st["rnd"]} · {st["phase"]}', 21, '#5cc8ff',
        weight='600')
    gas = a['gas'] + (b['gas'] - a['gas']) * e
    txt(o, 1560, 86, f'block gas: {gas:.0f} / {LIMIT}', 20, LIGHT, anchor='end')
    if st['heavy']:
        txt(o, 40, 114, 'Heavy load — blocks fill early', 19, AMBER, weight='700')
    else:
        txt(o, 40, 114, 'Light load', 19, LIGHT)
    txt(o, 1560, 114, 'Magenta = TwP (high tip)  ·  +n = anti-starvation boost', 18, LIGHT,
        anchor='end')

    # ---- stage panels
    panel(o, S1X, STAGE_Y, S1W, STAGE_H)
    txt(o, S1X + 20, STAGE_Y + 30, 'Stage 1 · waiting list (unordered)', 18, LIGHT)
    panel(o, S2X, STAGE_Y, S2W, STAGE_H)
    txt(o, S2X + 20, STAGE_Y + 30, 'Stage 2 · priority queue (tip + boost)', 18, LIGHT)
    o.append(f'<path d="M{S1X + S1W + 14} 196 L{S2X - 16} 196" fill="none" stroke="{LIGHT}" '
             f'stroke-width="2.5" marker-end="url(#arrow)"/>')

    # ---- active block
    sealed_now = not st['building']
    bc = CYAN if sealed_now else '#9dcced'
    bw = 3 if sealed_now else 2
    bop = 1.0 if sealed_now else 0.45
    rect(o, 40, AB_Y, 1520, AB_H, 16, '#ffffff', op=0.05, stroke=bc, sop=bop, sw=bw)
    panel(o, R1X, RND_Y, R1W, RND_H, rx=12)
    txt(o, R1X + 16, RND_Y + 26, 'Round 1', 17, LIGHT)
    panel(o, R2X, RND_Y, R2W, RND_H, rx=12)
    txt(o, R2X + 16, RND_Y + 26, 'Round 2', 17, LIGHT)
    if st['r2_skipped']:
        txt(o, R2X + R2W / 2, RND_Y + 66, 'Skipped — the block filled in round 1', 19, CYAN,
            anchor='middle', weight='600')
    lbl = f'Active block {st["block"]} · ' + ('sealed' if sealed_now else 'building')
    txt(o, 60, AB_Y + 168, lbl, 20, PALE, weight='700')
    if sealed_now:
        bd = BLOCKS[st['block'] - 1]
        txt(o, 1540, AB_Y + 168,
            'full — sealed early' if bd['early'] else 'sealed at round boundary',
            19, CYAN, anchor='end', weight='600')
    rect(o, 60, AB_Y + 178, 1480, 8, 4, '#ffffff', op=0.14)
    frac = min(1.0, gas / LIMIT)
    if frac > 0:
        rect(o, 60, AB_Y + 178, 1480 * frac, 8, 4, MAGENTA if gas >= LIMIT else CYAN)

    # ---- sealed blocks
    txt(o, 40, 512, 'Sealed blocks — full ordering preserved (most recent on the right)', 18,
        PALE)
    slots_a, _ = card_slots(a['sealed'])
    slots_b, vis_b = card_slots(b['sealed'])
    for s in vis_b:
        xa = slots_a.get(s['n'])
        xb = slots_b[s['n']]
        x = xb if xa is None else xa + (xb - xa) * e
        newborn = xa is None
        al = e if newborn else 1.0
        sc = 0.94 + 0.06 * e if newborn else 1.0
        draw_card(o, s, x, al, sc, latest=(s is vis_b[-1]))

    # ---- chips
    pa, pb = positions(a), positions(b)
    for cid in set(pa) | set(pb):
        c = CHIPS[cid]
        if cid in pa and cid in pb:
            (x0, y0), (x1, y1) = pa[cid], pb[cid]
            draw_chip(o, c, x0 + (x1 - x0) * e, y0 + (y1 - y0) * e)
        elif cid in pb:
            x, y = pb[cid]
            draw_chip(o, c, x, y, alpha=e, scale=0.8 + 0.2 * e)
        else:
            x, y = pa[cid]
            draw_chip(o, c, x, y, alpha=1 - e, scale=1 - 0.15 * e)

    # ---- timeline
    draw_timeline(o, a, b, e, st)

    o.append('</g>')
    o.append('<defs>'
             f'<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" '
             f'markerHeight="7" orient="auto-start-reverse">'
             f'<path d="M0 0 L10 5 L0 10 z" fill="{LIGHT}"/></marker></defs>')
    o.append('</svg>')
    return '\n'.join(o)


def draw_card(o, s, x, alpha, scale, latest):
    g = ''
    if scale != 1.0:
        cx, cy = x + CARD_W / 2, CARD_Y + CARD_H / 2
        g = (f' transform="translate({cx:.1f} {cy:.1f}) scale({scale:.3f}) '
             f'translate({-cx:.1f} {-cy:.1f})"')
    o.append(f'<g opacity="{alpha:.3f}"{g}>')
    rect(o, x, CARD_Y, CARD_W, CARD_H, 12, NAVY,
         stroke=CYAN if latest else '#ffffff', sop=1.0 if latest else 0.16,
         sw=2 if latest else 1)
    txt(o, x + 16, CARD_Y + 32, f'Block {s["n"]}', 20, '#ffffff', weight='700')
    if s['early']:
        txt(o, x + CARD_W - 16, CARD_Y + 32, 'sealed early', 15, CYAN, anchor='end', weight='600')
    for i, (lab, chips) in enumerate((('R1', s['r1']), ('R2', s['r2']))):
        ry = CARD_Y + 58 + i * 46
        txt(o, x + 16, ry + 20, lab, 15, SUBTLE, weight='700')
        if chips is None:
            txt(o, x + 48, ry + 20, '— round skipped —', 15, SUBTLE, extra=' opacity="0.65"')
        else:
            cx = x + 48
            for c in chips:
                cx += draw_chip(o, c, cx, ry, small=True) + 8
    o.append('</g>')


def draw_timeline(o, a, b, e, st):
    rect(o, TL_X, TL_Y, TL_W, TL_H, 16, NAVY, stroke='#ffffff', sop=0.16)
    o.append(f'<path d="M{AX_X0} {AX_Y} L{AX_X1} {AX_Y}" stroke="{LIGHT}" stroke-width="2" '
             f'opacity="0.7" fill="none"/>')
    span = AX_X1 - AX_X0
    for ms in (0, 125, 250, 375, 500):
        x = AX_X0 + span * ms / 500
        o.append(f'<path d="M{x:.1f} {AX_Y - 7} L{x:.1f} {AX_Y + 7}" stroke="{LIGHT}" '
                 f'stroke-width="2" opacity="0.7"/>')
        txt(o, x, AX_Y + 30, f'{ms} ms', 16, SUBTLE, anchor='middle')
    for i in range(4):
        x = AX_X0 + span * (i * 125 + 62.5) / 500
        txt(o, x, AX_Y + 54, 'round boundary', 14, SUBTLE, anchor='middle',
            extra=' opacity="0.7"')
    for m in st['marks']:
        x = AX_X0 + span * m / 500
        o.append(f'<path d="M{x:.1f} {AX_Y - 25} l7 13 l-14 0 z" fill="{CYAN}"/>')
    t = a['t'] + (b['t'] - a['t']) * e
    cx = AX_X0 + span * t / 500
    o.append(f'<path d="M{cx:.1f} {AX_Y - 26} L{cx:.1f} {AX_Y + 12}" stroke="{MAGENTA}" '
             f'stroke-width="3"/>')
    txt(o, AX_X0, TL_Y + 148,
        '▲ = block sealed  ·  B = 250 ms, K = 2 rounds, round = 125 ms  ·  slowed for viewing',
        16, SUBTLE)


# ---------------------------------------------------------------- driver
def main():
    build()
    total = sum(d for d, _ in KEYS)
    print(f'{len(KEYS)} keyframes, {total:.2f} s, {int(total * FPS)} frames')
    OUT.mkdir(parents=True, exist_ok=True)
    if '--one' in sys.argv:
        i = int(sys.argv[sys.argv.index('--one') + 1])
        probe = OUT / 'probe.svg'
        probe.write_text(render(KEYS[i][1], KEYS[i][1], 1.0, inline_bg=True))
        print(f'wrote {probe}')
        return

    FRAMES.mkdir(parents=True, exist_ok=True)
    for old in FRAMES.glob('*.svg'):
        old.unlink()
    n = 0
    for i, (dur, stb) in enumerate(KEYS):
        sta = KEYS[i - 1][1] if i else stb
        cnt = max(1, int(round(dur * FPS)))
        for k in range(cnt):
            u = (k + 1) / cnt
            (FRAMES / f'{n:05d}.svg').write_text(render(sta, stb, u))
            n += 1
    print(f'wrote {n} frame svgs')


if __name__ == '__main__':
    main()
