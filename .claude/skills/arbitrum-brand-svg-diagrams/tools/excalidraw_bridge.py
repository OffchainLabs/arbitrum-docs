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
import math
import re
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


def _number(value, name, minimum=None):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be a number")
    if not math.isfinite(value) or (minimum is not None and value < minimum):
        raise ValueError(f"invalid {name}: require a finite number" +
                         (f" >= {minimum}" if minimum is not None else ""))
    return value


def _color(value, name):
    if not isinstance(value, str) or not (
        value in ("transparent", "none") or
        re.fullmatch(r"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})", value)
    ):
        raise ValueError(f"{name} must be a hex color, transparent, or none")
    return value


# ---------------- Excalidraw -> brand SVG ----------------
def excalidraw_to_svg(scene):
    if not isinstance(scene, dict) or not isinstance(scene.get("elements", []), list):
        raise ValueError("scene must contain an elements array")
    if any(not isinstance(e, dict) for e in scene.get("elements", [])):
        raise ValueError("each element must be an object")
    els = [e for e in scene.get("elements", []) if not e.get("isDeleted")]
    for e in els:
        for name in ("x", "y"):
            _number(e[name], name)
        for name in ("width", "height"):
            _number(e.get(name, 0), name, minimum=0)
        if e.get("type") in ("arrow", "line"):
            _color(e.get("strokeColor", "#12aaff"), "strokeColor")
            points = e.get("points")
            if points is not None:
                if not isinstance(points, list):
                    raise ValueError("points must be an array")
                for point in points:
                    if not isinstance(point, list) or len(point) != 2:
                        raise ValueError("each point must contain two numbers")
                    for value in point:
                        _number(value, "point")
        elif e.get("type") in ("rectangle", "ellipse"):
            _color(e.get("backgroundColor") or "#213147", "backgroundColor")
        elif e.get("type") == "text":
            _color(e.get("strokeColor", "#ffffff"), "strokeColor")
            _number(e.get("fontSize", 16), "fontSize", minimum=1)
            if not isinstance(e.get("text", ""), str):
                raise ValueError("text must be a string")
    xs = [e["x"] for e in els] or [0]
    ys = [e["y"] for e in els] or [0]
    xe = [e["x"] + e.get("width", 0) for e in els] or [10]
    ye = [e["y"] + e.get("height", 0) for e in els] or [10]
    minx, miny, pad = min(xs), min(ys), 20
    w = _number(max(xe) - minx + 2 * pad, "viewBox width", minimum=1)
    h = _number(max(ye) - miny + 2 * pad, "viewBox height", minimum=1)

    def X(v):
        return _number(v - minx + pad, "transformed x")

    def Y(v):
        return _number(v - miny + pad, "transformed y")

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
            cx = _number(X(e["x"]) + e.get("width", 0) / 2, "text x")
            cy = _number(Y(e["y"]) + fs, "text y")
            for i, line in enumerate(e.get("text", "").split("\n")):
                out.append(f'<text x="{cx:.1f}" y="{cy + i * fs * 1.25:.1f}" text-anchor="middle" '
                           f'fill="{e.get("strokeColor", "#ffffff")}" font-size="{fs}" '
                           f'font-weight="600">{_esc(line)}</text>')
    out.append("</svg>")
    # Parse the validated markup and serialize it as XML, rather than emitting
    # unchecked fragments. ElementTree also rejects invalid XML text characters.
    root = ET.fromstring("\n".join(out))
    ET.register_namespace("", SVG_NS)
    ET.indent(root)
    return ET.tostring(root, encoding="unicode") + "\n"


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
    with open(src) as source:
        if mode == "import":
            output = excalidraw_to_svg(json.load(source))
        else:
            output = json.dumps(svg_to_excalidraw(source.read()), indent=2)
    # Validate the complete input before opening (and truncating) the destination.
    with open(dst, "w") as destination:
        destination.write(output)
    print(f"wrote {dst}")


if __name__ == "__main__":
    main()
