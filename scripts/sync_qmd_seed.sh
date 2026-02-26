#!/usr/bin/env bash
set -euo pipefail

cd /root/.openclaw/workspace

node scripts/generate_qmd_seed.mjs
openclaw memory index --agent main >/tmp/openclaw/qmd-seed-index.log 2>&1 || true
