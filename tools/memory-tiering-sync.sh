#!/usr/bin/env bash
set -euo pipefail

WS="/root/.openclaw/workspace"
MEM_DIR="$WS/memory"
TIER_BASE="$MEM_DIR/_tiers"
HOT_DIR="$TIER_BASE/hot"
WARM_DIR="$TIER_BASE/warm"
COLD_DIR="$TIER_BASE/cold"
BREAK_GLASS_FILE="$MEM_DIR/tiering-break-glass.txt"
LOG_FILE="/root/.openclaw/logs/memory-tiering.log"

mkdir -p "$HOT_DIR" "$WARM_DIR" "$COLD_DIR" "$(dirname "$LOG_FILE")"

# reset tier links (keep root memory files untouched)
find "$HOT_DIR" -maxdepth 1 -type l -delete 2>/dev/null || true
find "$WARM_DIR" -maxdepth 1 -type l -delete 2>/dev/null || true
find "$COLD_DIR" -maxdepth 1 -type l -delete 2>/dev/null || true

if [ ! -f "$BREAK_GLASS_FILE" ]; then
  cat > "$BREAK_GLASS_FILE" <<'EOF'
# one filename per line, e.g. 2026-03-10.md
# listed files stay in HOT tier regardless of age
EOF
fi

is_break_glass() {
  local f="$1"
  grep -v '^\s*#' "$BREAK_GLASS_FILE" | grep -v '^\s*$' | grep -Fxq "$f"
}

hot_count=0
warm_count=0
cold_count=0

# tiering rule: <=7d HOT, 8-30d WARM, >30d COLD
for p in "$MEM_DIR"/*.md; do
  [ -e "$p" ] || continue
  bn="$(basename "$p")"
  [[ "$bn" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}\.md$ ]] || continue

  d="${bn%.md}"
  today_s=$(date -u +%s)
  file_s=$(date -u -d "$d" +%s 2>/dev/null || true)
  [ -n "$file_s" ] || continue
  age_days=$(( (today_s - file_s) / 86400 ))

  target="$COLD_DIR"
  if is_break_glass "$bn"; then
    target="$HOT_DIR"
  elif [ "$age_days" -le 7 ]; then
    target="$HOT_DIR"
  elif [ "$age_days" -le 30 ]; then
    target="$WARM_DIR"
  else
    target="$COLD_DIR"
  fi

  ln -sfn "../../$bn" "$target/$bn"

  if [ "$target" = "$HOT_DIR" ]; then hot_count=$((hot_count+1)); fi
  if [ "$target" = "$WARM_DIR" ]; then warm_count=$((warm_count+1)); fi
  if [ "$target" = "$COLD_DIR" ]; then cold_count=$((cold_count+1)); fi
 done

# ensure MEMORY.md is always in HOT for decision relevance
ln -sfn "../../../MEMORY.md" "$HOT_DIR/MEMORY.md"

# refresh qmd collections for tiered retrieval
qmd collection remove memory-hot >/dev/null 2>&1 || true
qmd collection remove memory-warm >/dev/null 2>&1 || true
qmd collection remove memory-cold >/dev/null 2>&1 || true

qmd collection add "$HOT_DIR" --name memory-hot --mask "**/*.md" >/dev/null
qmd collection add "$WARM_DIR" --name memory-warm --mask "**/*.md" >/dev/null
qmd collection add "$COLD_DIR" --name memory-cold --mask "**/*.md" >/dev/null
qmd update >/dev/null

printf "%s hot=%d warm=%d cold=%d\n" "$(date -u +'%F %T')" "$hot_count" "$warm_count" "$cold_count" | tee -a "$LOG_FILE"
