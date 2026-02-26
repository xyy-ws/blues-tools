#!/usr/bin/env bash
set -euo pipefail

cd /root/.openclaw/workspace

STATE_DIR="/tmp/openclaw"
STATE_FILE="$STATE_DIR/qmd-seed-sync.fingerprint"
INDEX_LOG="$STATE_DIR/qmd-seed-index.log"

mkdir -p "$STATE_DIR"

# Fingerprint source memory inputs. If unchanged, skip regeneration/reindex.
FINGERPRINT="$(
  {
    [ -f MEMORY.md ] && sha256sum MEMORY.md
    [ -d memory ] && find memory -type f -name '*.md' -print0 | sort -z | xargs -0 sha256sum 2>/dev/null || true
    [ -d task-progress ] && find task-progress -type f -name '*.md' -print0 | sort -z | xargs -0 sha256sum 2>/dev/null || true
  } | sha256sum | awk '{print $1}'
)"

OLD=""
[ -f "$STATE_FILE" ] && OLD="$(cat "$STATE_FILE")"

if [ "$FINGERPRINT" = "$OLD" ]; then
  echo "[$(date -Is)] no changes detected; skip qmd seed sync"
  exit 0
fi

echo "[$(date -Is)] changes detected; regenerate seed + reindex"
node scripts/generate_qmd_seed.mjs
openclaw memory index --agent main >"$INDEX_LOG" 2>&1 || true

echo "$FINGERPRINT" > "$STATE_FILE"
echo "[$(date -Is)] sync done"
