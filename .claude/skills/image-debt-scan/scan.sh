#!/usr/bin/env bash
# Image-debt scan: find heavy rasters AND raster-in-SVG files masquerading as
# vector, map each to the MDX pages that reference it, rank by size.
#
# Usage:
#   .claude/skills/image-debt-scan/scan.sh                 # whole repo
#   .claude/skills/image-debt-scan/scan.sh docs/how-arbitrum-works   # scope refs to a section
#   THRESHOLD_KB=500 .claude/skills/image-debt-scan/scan.sh          # raise raster threshold
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

SCOPE="${1:-}"                       # optional docs subpath; only report images referenced under it
THRESHOLD_KB="${THRESHOLD_KB:-300}"
DOCS_DIR="${SCOPE:-docs}"

refs_for() { grep -rl -- "$1" "$DOCS_DIR" 2>/dev/null || true; }
emit() {  # size_kb  path  [tag]
  local kb="$1" path="$2" tag="${3:-}" base refs
  base=$(basename "$path"); refs=$(refs_for "$base")
  if [ -n "$SCOPE" ] && [ -z "$refs" ]; then return; fi   # scoped: skip out-of-scope images
  if [ -n "$tag" ]; then printf '%7d KB  %s  [%s]\n' "$kb" "$path" "$tag"
  else printf '%7d KB  %s\n' "$kb" "$path"; fi
  if [ -n "$refs" ]; then printf '%s\n' "$refs" | sed 's/^/           /'
  else echo '           (unreferenced — candidate for deletion)'; fi
}

echo "== Raster-in-SVG (draw.io / embedded-raster wearing a .svg extension — top debt) =="
# A .svg that contains a base64 raster is not real vector; often 1–6 MB.
find static/img -type f -iname '*.svg' -print0 \
  | xargs -0 stat -f '%z %N' | sort -rn \
  | while read -r bytes path; do
      grep -qm1 'data:image/[a-z]*;base64' "$path" || continue
      tag='embedded-raster'
      grep -qm1 'mxfile' "$path" && tag='draw.io PNG-in-SVG'
      emit "$((bytes/1024))" "$path" "$tag"
    done

echo
echo "== Raster images over ${THRESHOLD_KB} KB (convert diagrams; keep photos/screenshots) =="
find static/img -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.gif' \) -print0 \
  | xargs -0 stat -f '%z %N' \
  | awk -v t=$((THRESHOLD_KB*1024)) '$1>t' | sort -rn \
  | while read -r bytes path; do emit "$((bytes/1024))" "$path"; done
