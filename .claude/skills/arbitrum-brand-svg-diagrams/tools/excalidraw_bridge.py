#!/usr/bin/env python3
"""Bridge between brand SVG diagrams and Excalidraw scene files (.excalidraw).

    excalidraw_bridge.py import  scene.excalidraw  out.svg        # Excalidraw -> brand SVG
    excalidraw_bridge.py export  diagram.svg       out.excalidraw # brand SVG -> Excalidraw

Scope = this skill's diagram vocabulary: rectangles (`<rect>`), text (`<text>`),
and straight arrows/lines (`<line>`). Author diagrams with plain `<rect rx=…>`
(not `<path>` rounded rects) so they round-trip cleanly. `roughness` is 0 so
Excalidraw renders the clean, non-hand-drawn style that matches the docs.
Output is deterministic (fixed seeds) — no randomness, so diffs stay stable.
"""
import json
import sys
import xml.etree.ElementTree as ET

SVG_NS = "http://www.w3.org/2000/svg"
_n = [0]


def _nid():
    _n[0] += 1
    return f"el{_n[0]:04d}"


def _seed():
    _n[0] += 1
    return 100000 + _n[0]


def _base(t, x, y, w, h):
    return {
        "id": _nid(), "type": t, "x": x, "y": y, "width": w, "height": h,
        "angle": 0, "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
        "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
        "roughness": 0, "opacity": 100, "groupIds": [], "frameId": None,
        "roundness": None, "seed": _seed(), "version": 1, "versionNonce": _seed(),
        "isDeleted": False, "boundElements": [], "updated": 1, "link": None, "locked": False,
    }


def _scene(elements):
    return {"type": "excalidraw", "version": 2,
            "source": "arbitrum-brand-svg-diagrams",
            "elements": elements,
            "appState": {"gridSize": None, "viewBackgroundColor": "#ffffff"},
            "files": {}}


def _esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ---------------- Excalidraw -> brand SVG ----------------
def excalidraw_to_svg(scene):
    els = [e for e in scene.get("elements", []) if not e.get("isDeleted")]
    xs = [e["x"] for e in els] or [0]
    ys = [e["y"] for e in els] or [0]
    xe = [e["x"] + e.get("width", 0) for e in els] or [10]
    ye = [e["y"] + e.get("height", 0) for e in els] or [10]
    minx, miny, pad = min(xs), min(ys), 20
    w = max(xe) - minx + 2 * pad
    h = max(ye) - miny + 2 * pad

    def X(v):
        return v - minx + pad

    def Y(v):
        return v - miny + pad

    out = [f'<svg xmlns="{SVG_NS}" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" '
           f'height="{h:.0f}" font-family="Inter, ui-sans-serif, system-ui, sans-serif">',
           '<defs><marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" '
           'markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" '
           'fill="#12aaff"/></marker></defs>']
    for e in els:  # connectors first, under the boxes
        if e["type"] in ("arrow", "line"):
            pts = e.get("points") or [[0, 0], [e.get("width", 0), e.get("height", 0)]]
            d = "M" + " L".join(f"{X(e['x'] + px):.1f},{Y(e['y'] + py):.1f}" for px, py in pts)
            mk = ' marker-end="url(#ah)"' if e["type"] == "arrow" else ""
            out.append(f'<path d="{d}" fill="none" stroke="{e.get("strokeColor", "#12aaff")}" '
                       f'stroke-width="3" stroke-linejoin="round"{mk}/>')
    for e in els:
        if e["type"] in ("rectangle", "ellipse"):
            fill = e.get("backgroundColor") or "#213147"
            if fill == "transparent":
                fill = "#213147"
            rx = 10 if e.get("roundness") else 0
            out.append(f'<rect x="{X(e["x"]):.1f}" y="{Y(e["y"]):.1f}" width="{e["width"]:.1f}" '
                       f'height="{e["height"]:.1f}" rx="{rx}" fill="{fill}"/>')
    for e in els:
        if e["type"] == "text":
            fs = e.get("fontSize", 16)
            cx = X(e["x"]) + e.get("width", 0) / 2
            cy = Y(e["y"]) + fs
            for i, line in enumerate(e.get("text", "").split("\n")):
                out.append(f'<text x="{cx:.1f}" y="{cy + i * fs * 1.25:.1f}" text-anchor="middle" '
                           f'fill="{e.get("strokeColor", "#ffffff")}" font-size="{fs}" '
                           f'font-weight="600">{_esc(line)}</text>')
    out.append("</svg>")
    return "\n".join(out) + "\n"


# ---------------- brand SVG -> Excalidraw ----------------
def svg_to_excalidraw(svg_text):
    root = ET.fromstring(svg_text)
    els = []
    for e in root.iter():
        t = e.tag.split("}")[-1]
        if t == "rect":
            r = _base("rectangle", float(e.get("x", 0)), float(e.get("y", 0)),
                      float(e.get("width", 0)), float(e.get("height", 0)))
            r["backgroundColor"] = e.get("fill", "#213147")
            r["strokeColor"] = "transparent"
            if e.get("rx"):
                r["roundness"] = {"type": 3}
            els.append(r)
        elif t == "text":
            txt = "".join(e.itertext()).strip()
            if not txt:
                continue
            fs = float(e.get("font-size", 16))
            x, y = float(e.get("x", 0)), float(e.get("y", 0))
            te = _base("text", x - 60, y - fs, 120, fs * 1.25)
            te.update({"text": txt, "originalText": txt, "fontSize": fs, "fontFamily": 2,
                       "textAlign": "center", "verticalAlign": "top",
                       "strokeColor": e.get("fill", "#ffffff"), "roundness": None,
                       "lineHeight": 1.25, "containerId": None})
            els.append(te)
        elif t == "line":
            x1, y1 = float(e.get("x1", 0)), float(e.get("y1", 0))
            x2, y2 = float(e.get("x2", 0)), float(e.get("y2", 0))
            a = _base("arrow", x1, y1, x2 - x1, y2 - y1)
            a.update({"points": [[0, 0], [x2 - x1, y2 - y1]],
                      "strokeColor": e.get("stroke", "#12aaff"),
                      "startArrowhead": None, "endArrowhead": "arrow"})
            els.append(a)
    return _scene(els)


def main():
    if len(sys.argv) != 4 or sys.argv[1] not in ("import", "export"):
        print(__doc__)
        sys.exit(2)
    mode, src, dst = sys.argv[1:4]
    if mode == "import":
        with open(dst, "w") as f:
            f.write(excalidraw_to_svg(json.load(open(src))))
    else:
        json.dump(svg_to_excalidraw(open(src).read()), open(dst, "w"), indent=2)
    print(f"wrote {dst}")


if __name__ == "__main__":
    main()
