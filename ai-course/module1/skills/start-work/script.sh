#!/usr/bin/env bash
# start-work orientation script
# Gathers context for the config-service project

set -euo pipefail

PROJECT_ROOT="${1:-.}"

echo "# 🚀 Work Session Orientation"
echo "Generated: $(date -Iseconds)"
echo ""

# 1. Git snapshot
echo "## Recent Commits"
git -C "$PROJECT_ROOT" log --oneline -10 2>/dev/null || echo "_No git history available_"
echo ""

echo "## Uncommitted Changes"
git -C "$PROJECT_ROOT" status --short 2>/dev/null || echo "_Not a git repo_"
echo ""

# 2. Infrastructure check
echo "## Infrastructure Status"
if command -v docker-compose &>/dev/null; then
  docker-compose -f "$PROJECT_ROOT/docker-compose.yml" ps 2>/dev/null || echo "_docker-compose not running_"
elif command -v docker &>/dev/null; then
  docker compose -f "$PROJECT_ROOT/docker-compose.yml" ps 2>/dev/null || echo "_docker compose not running_"
else
  echo "_Docker not available_"
fi
echo ""

# 3. Memory files
echo "## Project Memory Files"
if [ -d "$PROJECT_ROOT/memory" ]; then
  for f in "$PROJECT_ROOT"/memory/*.md; do
    [ -f "$f" ] && echo "- $(basename "$f"): $(head -1 "$f")"
  done
else
  echo "_No memory/ directory found_"
fi
echo ""

# 4. Code health flags — commented-out code
echo "## ⚠️ Commented-Out Code (potential incomplete work)"
grep -rn "// \(kafka\|await kafka\|const kafka\)" "$PROJECT_ROOT" \
  --include="*.js" \
  --exclude-dir=node_modules \
  --exclude-dir=.git 2>/dev/null || echo "_None found_"
echo ""

# 5. TODOs
echo "## 📝 TODOs"
grep -rn "TODO\|FIXME\|HACK\|XXX" "$PROJECT_ROOT" \
  --include="*.js" --include="*.md" \
  --exclude-dir=node_modules \
  --exclude-dir=.git 2>/dev/null | head -20 || echo "_None found_"
