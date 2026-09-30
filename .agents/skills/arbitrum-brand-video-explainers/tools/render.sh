#!/usr/bin/env bash
#
# Composite per-frame SVGs over the Arbitrum brand background and encode an MP4.
#
#   render.sh <svg-dir> <out.mp4> [fps]
#
# <svg-dir> holds zero-padded TRANSPARENT frame SVGs: 00000.svg, 00001.svg, ...
# The background is rasterised once and composited by ffmpeg. Inlining the 44 KB
# background into every frame instead produces an identical picture but makes
# the rasterise step several times slower, so keep frame SVGs transparent.
#
# Env overrides: WIDTH HEIGHT FPS CRF JOBS BG_FRAG KEEP
set -euo pipefail

SVG_DIR=${1:?usage: render.sh <svg-dir> <out.mp4> [fps]}
OUT=${2:?usage: render.sh <svg-dir> <out.mp4> [fps]}
FPS=${3:-${FPS:-30}}

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
BG_FRAG=${BG_FRAG:-$HERE/../../arbitrum-brand-svg-diagrams/assets/bg-frag.svg}
WIDTH=${WIDTH:-1600}
HEIGHT=${HEIGHT:-900}
CRF=${CRF:-18}
JOBS=${JOBS:-$(sysctl -n hw.ncpu 2>/dev/null || echo 8)}

for bin in rsvg-convert ffmpeg ffprobe; do
  command -v "$bin" >/dev/null 2>&1 ||
    {
      printf 'missing %s — brew install librsvg ffmpeg\n' "$bin" >&2
      exit 1
    }
done
[ -d "$SVG_DIR" ] || {
  printf 'no such frame dir: %s\n' "$SVG_DIR" >&2
  exit 1
}
[ -f "$BG_FRAG" ] || {
  printf 'background not found: %s\n' "$BG_FRAG" >&2
  exit 1
}

shopt -s nullglob
frames=("$SVG_DIR"/*.svg)
[ ${#frames[@]} -gt 0 ] || {
  printf 'no .svg frames in %s\n' "$SVG_DIR" >&2
  exit 1
}

WORK=$(mktemp -d "${TMPDIR:-/tmp}/brand-video.XXXXXX")
mkdir -p "$WORK/png"

# bg-frag.svg is a bare <g>; wrap it so rsvg-convert will render it.
printf '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" width="%s" height="%s">%s</svg>' \
  "$WIDTH" "$HEIGHT" "$WIDTH" "$HEIGHT" "$(cat "$BG_FRAG")" >"$WORK/bg.svg"
rsvg-convert -w "$WIDTH" "$WORK/bg.svg" -o "$WORK/bg.png"

printf 'rasterising %d frames at %d-way parallelism...\n' "${#frames[@]}" "$JOBS"
# shellcheck disable=SC2016  # single quotes are required: $1..$3 must expand in
# the sh -c child, not here, or every parallel job would rasterise the same file.
printf '%s\n' "${frames[@]}" |
  xargs -P "$JOBS" -I{} sh -c \
    'rsvg-convert -w "$1" "$2" -o "$3/$(basename "$2" .svg).png"' _ "$WIDTH" {} "$WORK/png"

# yuv420p is required for QuickTime and Safari; without it the file plays in
# ffplay and VLC but shows a black frame in a browser.
ffmpeg -v error -loop 1 -i "$WORK/bg.png" \
  -framerate "$FPS" -start_number 0 -i "$WORK/png/%05d.png" \
  -filter_complex "[0][1]overlay=shortest=1,format=yuv420p" \
  -r "$FPS" -c:v libx264 -crf "$CRF" -preset slow -movflags +faststart \
  -y "$OUT"

ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=width,height,r_frame_rate,nb_frames \
  -of default=noprint_wrappers=1 "$OUT"

if [ -n "${KEEP:-}" ]; then
  printf 'intermediates kept in %s\n' "$WORK"
elif command -v trash >/dev/null 2>&1; then
  trash "$WORK"
else
  printf 'intermediates left in %s (no trash command on PATH)\n' "$WORK"
fi
