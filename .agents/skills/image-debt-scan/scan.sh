#!/usr/bin/env bash
# Image-debt scan: find heavy rasters AND raster-in-SVG files masquerading as
# vector, map each to the MDX pages that reference it, rank by size.
#
# Usage:
#   .agents/skills/image-debt-scan/scan.sh                 # whole repo
#   .agents/skills/image-debt-scan/scan.sh content/docs/how-arbitrum-works   # scope refs to a section
#   THRESHOLD_KB=500 .agents/skills/image-debt-scan/scan.sh          # raise raster threshold
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

SCOPE="${1:-}"                       # optional docs subpath; only report images referenced under it
THRESHOLD_KB="${THRESHOLD_KB:-300}"
DOCS_DIR="${SCOPE:-content}"

# Bash arithmetic evaluates expressions recursively. Accept bounded decimal data only,
# including before multiplying the threshold, and never put a filename in an expression.
if [[ ! "$THRESHOLD_KB" =~ ^[0-9]{1,12}$ ]]; then
  printf 'THRESHOLD_KB must be a non-negative decimal integer of at most 12 digits\n' >&2
  exit 1
fi
THRESHOLD_KB=$((10#$THRESHOLD_KB))
THRESHOLD_BYTES=$((THRESHOLD_KB * 1024))

if stat -f '%z' . >/dev/null 2>&1; then
  STAT_STYLE=bsd
else
  STAT_STYLE=gnu
fi

file_bytes() {
  local bytes
  if [ "$STAT_STYLE" = bsd ]; then bytes=$(stat -f '%z' "$1")
  else bytes=$(stat -c '%s' -- "$1"); fi
  if [[ ! "$bytes" =~ ^[0-9]{1,18}$ ]]; then
    printf 'stat returned an invalid file size for %q\n' "$1" >&2
    return 1
  fi
  printf '%s\n' "$((10#$bytes))"
}

refs_for() { grep -rlF -- "$1" "$DOCS_DIR" 2>/dev/null || true; }
emit() {  # size_kb  path  [tag]
  local kb="$1" path="$2" tag="${3:-}" base refs
  base=$(basename "$path"); refs=$(refs_for "$base")
  if [ -n "$SCOPE" ] && [ -z "$refs" ]; then return; fi   # scoped: skip out-of-scope images
  if [ -n "$tag" ]; then printf '%7d KB  %q  [%s]\n' "$kb" "$path" "$tag"
  else printf '%7d KB  %q\n' "$kb" "$path"; fi
  if [ -n "$refs" ]; then printf '%s\n' "$refs" | sed 's/^/           /'
  else echo '           (unreferenced: candidate for deletion)'; fi
}

scan() {
  local kind="$1" candidate bytes index tag count=0
  local -a image_paths image_sizes
  image_paths=()
  image_sizes=()
  # Keep paths separate from sizes: a newline in a name cannot forge a stat row.
  while IFS= read -r -d '' candidate; do
    bytes=$(file_bytes "$candidate")
    if [ "$kind" = svg ]; then
      grep -qm1 'data:image/[a-z]*;base64' "$candidate" || continue
    elif ((bytes <= THRESHOLD_BYTES)); then continue; fi
    image_paths[count]="$candidate"
    image_sizes[count]="$bytes"
    count=$((count + 1))
  done < <(if [ "$kind" = svg ]; then
    find public/img -type f -iname '*.svg' -print0
  else
    find public/img -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.gif' \) -print0
  fi)

  # Only validated numbers enter this line-oriented stream. The paths stay in the array.
  for ((index = 0; index < count; index++)); do
    printf '%s %d\n' "${image_sizes[index]}" "$index"
  done | sort -rn | while read -r bytes index; do
    candidate="${image_paths[index]}"
    tag=''
    if [ "$kind" = svg ]; then
      tag='embedded-raster'
      if grep -qm1 'mxfile' "$candidate"; then tag='draw.io PNG-in-SVG'; fi
    fi
    emit "$((bytes / 1024))" "$candidate" "$tag"
  done
}

echo "== Raster-in-SVG (draw.io / embedded-raster wearing a .svg extension: top debt) =="
# A .svg that contains a base64 raster is not real vector; often 1 to 6 MB.
scan svg

echo
echo "== Raster images over ${THRESHOLD_KB} KB (convert diagrams; keep photos/screenshots) =="
scan raster
