#!/bin/zsh
set -euo pipefail

optimize_files() {
  local project="$1"
  shift
  local output_dir="assets/images/projects/${project}/web"
  local index=1

  mkdir -p "$output_dir"
  for source in "$@"; do
    local output
    output=$(printf "%s/%02d.jpg" "$output_dir" "$index")
    sips -Z 1800 -s format jpeg -s formatOptions 82 "$source" --out "$output" >/dev/null
    index=$((index + 1))
  done
}

sips -s format jpeg -s formatOptions 88 \
  "assets/images/projects/vesna/drive/source.pdf" \
  --out "assets/images/projects/vesna/drive/01.jpg" >/dev/null

optimize_files "city-park" assets/images/projects/city-park/drive/{01..10}.jpg
optimize_files "vesna" assets/images/projects/vesna/drive/01.jpg
optimize_files "mushu" assets/images/projects/mushu/drive/{01..18}.jpg
optimize_files "smit" assets/images/projects/smit/drive/{1..20}.jpg
optimize_files "novo-ochakovo" assets/images/projects/novo-ochakovo/drive/*.(jpg|jpeg|JPG)
optimize_files "georg-landrin" assets/images/projects/georg-landrin/drive/*.jpg
optimize_files "dom-daryino" assets/images/projects/dom-daryino/drive/{01..07}.jpg
