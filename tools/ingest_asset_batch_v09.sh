#!/usr/bin/env bash
set -euo pipefail

BATCH="${1:-}"
ZIP_PATH="${2:-}"
PUSH="${3:-}"

case "$BATCH" in B00|B01|B02|B03|B04) ;; *) echo "Usage: $0 B00|B01|B02|B03|B04 /path/to/batch.zip [--push]" >&2; exit 2;; esac
[[ -f "$ZIP_PATH" ]] || { echo "ZIP not found: $ZIP_PATH" >&2; exit 2; }
[[ -d .git ]] || { echo "Run from the swa-hebraico repository root." >&2; exit 2; }

branch="assets/ingest-${BATCH,,}"
temp="$(mktemp -d)"
trap 'rm -rf "$temp"' EXIT

unzip -q "$ZIP_PATH" -d "$temp"
[[ -d "$temp/assets" ]] || { echo "Batch ZIP must contain assets/ at root." >&2; exit 3; }

git fetch origin
git switch main
git pull --ff-only origin main
if git show-ref --verify --quiet "refs/heads/$branch"; then git switch "$branch"; else git switch -c "$branch"; fi

mkdir -p assets
cp -R "$temp/assets/." assets/

node tools/validate_asset_batches_v08.mjs --batch="$BATCH"

git add assets
if git diff --cached --quiet; then
  echo "No asset changes detected for $BATCH"
  exit 0
fi

git commit -m "assets: ingest ALEPH 119 premium batch $BATCH"

if [[ "$PUSH" == "--push" ]]; then
  git push -u origin "$branch"
  echo "Pushed $branch. Open a PR to main and wait for gates before merging."
else
  echo "Committed locally on $branch. Re-run with --push to publish."
fi
