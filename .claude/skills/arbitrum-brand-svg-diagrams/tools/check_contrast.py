#!/usr/bin/env python3
"""Check every <text> in a brand SVG against WCAG AA contrast.

Renders the diagram twice - once as authored, once with all <text> stripped -
then samples the text-free render underneath each label to learn that label's
true background. This works uniformly for text on an opaque box and for text
sitting straight on the brand gradient, where the backdrop varies by position.

Usage:
    python3 check_contrast.py static/img/NAME.svg

Exits 1 if any label fails, so it can gate a build step.
"""

import re
import subprocess
import sys
import xml.dom.minidom

# WCAG AA: 4.5:1 normal text, 3:1 "large" text (>=24px, or >=18.66px bold).
AA_NORMAL, AA_LARGE = 4.5, 3.0


def luminance(hex_color):
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def contrast(fg, bg):
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def render(svg_path, png_path):
    subprocess.run(["rsvg-convert", "-b", "#ffffff", "-z", "1", svg_path,
                    "-o", png_path], check=True)


def read_ppm(png_path):
    """Return (width, height, bytes) of RGB8 pixel data."""
    ppm = png_path.rsplit(".", 1)[0] + ".ppm"
    subprocess.run(["magick", png_path, "-depth", "8", ppm], check=True)
    data = open(ppm, "rb").read()
    fields, pos = [], 0
    while len(fields) < 4:                      # magic, width, height, maxval
        while data[pos:pos + 1].isspace():
            pos += 1
        if data[pos:pos + 1] == b"#":           # skip comment line
            pos = data.index(b"\n", pos) + 1
            continue
        start = pos
        while not data[pos:pos + 1].isspace():
            pos += 1
        fields.append(data[start:pos])
    return int(fields[1]), int(fields[2]), data[pos + 1:]


def collect_text(svg_path):
    """Yield (label, fill, font_size, weight, x, y) for each <text>."""
    doc = xml.dom.minidom.parse(svg_path)
    for node in doc.getElementsByTagName("text"):
        fill = node.getAttribute("fill") or "#000000"
        if not fill.startswith("#"):
            continue                            # url()/currentColor: skip
        try:
            size = float(node.getAttribute("font-size") or 16)
            x, y = float(node.getAttribute("x")), float(node.getAttribute("y"))
        except ValueError:
            continue
        weight = node.getAttribute("font-weight") or "400"
        label = "".join(n.data for n in node.childNodes
                        if n.nodeType == n.TEXT_NODE).strip()
        yield label, fill.lower(), size, weight, x, y


def main(svg_path):
    stripped = "/tmp/_notext.svg"
    src = open(svg_path).read()
    open(stripped, "w").write(re.sub(r"<text\b.*?</text>", "", src, flags=re.S))

    render(stripped, "/tmp/_notext.png")
    w, h, px = read_ppm("/tmp/_notext.png")

    failures = []
    print(f"{'ratio':>7}  {'need':>5}  {'size':>5}  text")
    print("-" * 72)
    for label, fill, size, weight, x, y in collect_text(svg_path):
        # Sample the visual middle of the glyphs, not the baseline.
        sx, sy = int(x), int(y - size * 0.35)
        if not (0 <= sx < w and 0 <= sy < h):
            continue
        i = (sy * w + sx) * 3
        bg = "#%02x%02x%02x" % (px[i], px[i + 1], px[i + 2])
        bold = weight in ("600", "700", "800", "900", "bold", "bolder")
        need = AA_LARGE if (size >= 24 or (size >= 18.66 and bold)) else AA_NORMAL
        ratio = contrast(fill, bg)
        ok = ratio >= need
        if not ok:
            failures.append((label, fill, bg, ratio, need))
        print(f"{ratio:7.2f}  {need:5.1f}  {size:5.0f}  "
              f"{'' if ok else 'FAIL '}{label[:46]}")

    print()
    if failures:
        print(f"{len(failures)} label(s) below WCAG AA:")
        for label, fill, bg, ratio, need in failures:
            print(f"  {ratio:.2f}:1 (need {need})  {fill} on {bg}  — {label[:50]}")
        return 1
    print("All text passes WCAG AA.")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    sys.exit(main(sys.argv[1]))
