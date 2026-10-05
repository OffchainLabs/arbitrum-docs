#!/usr/bin/env python3
"""PreToolUse guard: keep heavy raster bloat out of static/img.

Blocks (exit 2) a Write/Edit that would:
  1. create a raster (.png/.jpg/.jpeg/.gif/.webp/.bmp/.tiff) under static/img, or
  2. write an .svg under static/img that embeds a base64 raster
     (`data:image/...;base64`) — the draw.io "PNG-in-SVG" export that bloats a
     2 KB diagram into 1-2 MB.

Everything else passes through untouched. This only sees the Write/Edit tools;
rasters copied in via Bash (cp/curl) are out of scope — enforce those in CI.
"""
import json
import re
import sys

RASTER = re.compile(r"\.(png|jpe?g|gif|webp|bmp|tiff?)$", re.I)
EMBEDDED = re.compile(r"data:image/(png|jpe?g|gif);base64", re.I)


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # never break the tool on a parse hiccup

    if data.get("tool_name") not in ("Write", "Edit"):
        sys.exit(0)

    ti = data.get("tool_input", {})
    path = ti.get("file_path", "")
    if "static/img/" not in path:
        sys.exit(0)

    if RASTER.search(path):
        sys.stderr.write(
            f"Blocked: {path} is a raster asset in static/img.\n"
            "Docs diagrams should be lean hand-authored SVGs, not rasters. "
            "Use the 'arbitrum-brand-svg-diagrams' skill. "
            "(Screenshots/photos that must stay raster: place them elsewhere or override.)\n"
        )
        sys.exit(2)

    if path.lower().endswith(".svg"):
        body = ti.get("content", "") or ti.get("new_string", "")
        if EMBEDDED.search(body):
            sys.stderr.write(
                f"Blocked: {path} embeds a base64 raster inside an SVG "
                "(the draw.io PNG-in-SVG export pattern that bloats diagrams to MBs).\n"
                "Author real vector shapes instead — see 'arbitrum-brand-svg-diagrams'.\n"
            )
            sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
