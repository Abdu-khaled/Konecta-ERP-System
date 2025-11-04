#!/bin/bash
# scripts/ci/detect-frontend-changes.sh
# Detects if frontend files have changed

set -e

echo " Detecting frontend file changes..."

# Determine base SHA for comparison
if [ "$GITHUB_EVENT_NAME" = "pull_request" ]; then
  BASE_SHA="$GITHUB_BASE_SHA"
else
  BASE_SHA=$(git rev-parse HEAD^)
fi

echo " Base SHA: $BASE_SHA"

# Get changed files
CHANGED_FILES=$(git diff --name-only "$BASE_SHA" HEAD || true)
echo " Changed files:"
echo "$CHANGED_FILES"

# Check if frontend files changed
if echo "$CHANGED_FILES" | grep -q "^frontend/"; then
  echo " Frontend files changed — proceeding with build."
  echo "changed=true" >> "$GITHUB_OUTPUT"
else
  echo " No frontend files changed — skipping build."
  echo "changed=false" >> "$GITHUB_OUTPUT"
fi
