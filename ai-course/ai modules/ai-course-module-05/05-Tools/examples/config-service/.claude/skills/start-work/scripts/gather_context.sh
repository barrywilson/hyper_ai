#!/usr/bin/env bash
# gather_context.sh — Collects grounded facts about the current state of the
# Configuration Service repo for the start-work skill.
#
# Output is a single Markdown document on stdout, with H2 sections the LLM
# can read directly. Designed to be deterministic and fast; no test runs.
#
# Sections emitted (in order):
#   ## Branch
#   ## Recent commits
#   ## Touched files (last 10 commits)
#   ## Per-file recent history
#   ## Open TODO/FIXME/HACK markers
#   ## Workflow status
#   ## Active work item
#   ## Test status (cached)
#   ## Plan documents
#
# Missing data is reported explicitly ("none found") rather than omitted, so
# the LLM can tell "absent" from "not checked".

set -uo pipefail

# Locate the repo root robustly. The skill is invoked from anywhere inside the
# project, so anchor to git's top-level rather than $PWD.
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${REPO_ROOT}" ]]; then
  echo "ERROR: not inside a git repository" >&2
  exit 1
fi
cd "${REPO_ROOT}"

emit_section() {
  printf '\n## %s\n\n' "$1"
}

# --- Branch ---------------------------------------------------------------
emit_section "Branch"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
printf '%s\n' "${BRANCH}"

# --- Recent commits -------------------------------------------------------
emit_section "Recent commits"
git log --oneline -10 || echo "(no commits)"

# --- Touched files (last 10 commits) --------------------------------------
emit_section "Touched files (last 10 commits)"
# Filter to files that still exist; deleted files create noise for orientation.
TOUCHED=$(git diff --name-only HEAD~10..HEAD 2>/dev/null | sort -u | while read -r f; do
  [[ -e "$f" ]] && printf '%s\n' "$f"
done)
if [[ -z "${TOUCHED}" ]]; then
  echo "(none — fewer than 10 commits, or no files changed)"
else
  printf '%s\n' "${TOUCHED}"
fi

# --- Per-file recent history ---------------------------------------------
emit_section "Per-file recent history"
if [[ -n "${TOUCHED}" ]]; then
  # Cap at 15 files to keep output reasonable on busy branches.
  echo "${TOUCHED}" | head -15 | while read -r f; do
    printf '### %s\n' "$f"
    git log --oneline -5 -- "$f" 2>/dev/null || echo "(no history)"
    printf '\n'
  done
else
  echo "(no files to inspect)"
fi

# --- Open TODO/FIXME/HACK markers ----------------------------------------
emit_section "Open TODO/FIXME/HACK markers"
if [[ -n "${TOUCHED}" ]]; then
  found_any=0
  echo "${TOUCHED}" | while read -r f; do
    # Skip binary files and very large files.
    if [[ -f "$f" ]] && file "$f" | grep -q text; then
      # Match comment-style markers only (after #, //, /*, or as standalone words
      # in source). Bare "XXX" inside docs creates false positives.
      matches=$(grep -nE "(^|[^A-Za-z0-9_])(TODO|FIXME|HACK)([^A-Za-z0-9_]|$)" "$f" 2>/dev/null || true)
      if [[ -n "$matches" ]]; then
        printf '### %s\n' "$f"
        printf '%s\n\n' "$matches"
        found_any=1
      fi
    fi
  done
  # Note: subshell makes found_any unreliable; if no output printed, that's the signal.
else
  echo "(no files to inspect)"
fi

# --- Workflow status (this project's convention) -------------------------
emit_section "Workflow status"
if [[ -f "memory/WORKFLOW_STATUS.md" ]]; then
  # Extract the "Current Status" section only — full file is too long.
  awk '/^## Current Status/,/^## [^C]/' memory/WORKFLOW_STATUS.md | head -40
else
  echo "(memory/WORKFLOW_STATUS.md not found)"
fi

# --- Active work item ----------------------------------------------------
emit_section "Active work item"
# Find the most recently modified docs/NNN-*.md, which by project convention
# is the active work item file.
ACTIVE_DOC=$(ls -t docs/[0-9]*-*.md 2>/dev/null | head -1 || true)
if [[ -n "${ACTIVE_DOC}" ]]; then
  printf 'File: %s\n\n' "${ACTIVE_DOC}"
  # Print up to the first ~80 lines — enough for problem statement and
  # acceptance criteria headers, without dumping the whole document.
  head -80 "${ACTIVE_DOC}"
else
  echo "(no docs/NNN-*.md work item file found)"
fi

# --- Test status (cached only — no live run) -----------------------------
emit_section "Test status (cached)"
# Look for pytest/coverage caches; report freshness rather than running tests.
CACHE_FOUND=0
if [[ -d ".pytest_cache" ]]; then
  LAST_RUN=$(stat -f '%Sm' -t '%Y-%m-%d %H:%M' .pytest_cache 2>/dev/null || stat -c '%y' .pytest_cache 2>/dev/null | cut -d. -f1)
  printf '.pytest_cache last modified: %s\n' "${LAST_RUN}"
  if [[ -f ".pytest_cache/v/cache/lastfailed" ]]; then
    LASTFAILED=$(cat .pytest_cache/v/cache/lastfailed)
    if [[ "${LASTFAILED}" == "{}" ]]; then
      echo "Last cached run: all tests passed"
    else
      echo "Last cached run: had failures — see .pytest_cache/v/cache/lastfailed"
      printf '%s\n' "${LASTFAILED}" | head -20
    fi
  fi
  CACHE_FOUND=1
fi
if [[ "${CACHE_FOUND}" -eq 0 ]]; then
  echo "(no test cache found — tests have not been run recently, or cache is elsewhere)"
fi
echo "Note: full suite NOT run by this skill. Run 'make test' to refresh."

# --- Plan documents ------------------------------------------------------
emit_section "Plan documents"
if [[ -d "docs/plans" ]]; then
  ls -t docs/plans/*.md 2>/dev/null | head -5 || echo "(no plan documents)"
else
  echo "(no docs/plans/ directory)"
fi
