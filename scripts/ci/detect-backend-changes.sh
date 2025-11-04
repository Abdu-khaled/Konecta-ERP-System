#!/bin/bash
# scripts/ci/detect-backend-changes.sh
# Detects which backend services have changed and outputs a matrix for GitHub Actions

set -e

echo " Detecting changed backend services..."

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

# Detect changed services
SERVICES=()
SERVICE_TYPES=()

for dir in $(ls backend 2>/dev/null); do
  if [ -d "backend/$dir" ]; then
    if echo "$CHANGED_FILES" | grep -q "^backend/$dir/"; then
      SERVICES+=("$dir")
      
      # Detect service type
      if [ -f "backend/$dir/pom.xml" ]; then
        SERVICE_TYPES+=("java")
        echo " Detected Java service: $dir"
      elif [ -f "backend/$dir/ReportingService/ReportingService.csproj" ]; then
        SERVICE_TYPES+=("csharp")
        echo " Detected C# service: $dir"
      else
        SERVICE_TYPES+=("unknown")
        echo "  Unknown service type: $dir"
      fi
    fi
  fi
done

# Build matrix JSON
if [ ${#SERVICES[@]} -eq 0 ]; then
  echo " No changed backend services detected — skipping build."
  MATRIX_JSON='{"include":[]}'
  echo "changed=false" >> "$GITHUB_OUTPUT"
else
  echo " Building matrix for ${#SERVICES[@]} service(s)"
  
  # Create proper matrix with service and serviceType pairs
  MATRIX_INCLUDES=""
  for i in "${!SERVICES[@]}"; do
    if [ $i -gt 0 ]; then
      MATRIX_INCLUDES="$MATRIX_INCLUDES,"
    fi
    MATRIX_INCLUDES="$MATRIX_INCLUDES{\"service\":\"${SERVICES[$i]}\",\"serviceType\":\"${SERVICE_TYPES[$i]}\"}"
  done
  
  MATRIX_JSON="{\"include\":[$MATRIX_INCLUDES]}"
  echo "changed=true" >> "$GITHUB_OUTPUT"
fi

echo "matrix=$MATRIX_JSON" >> "$GITHUB_OUTPUT"
echo " Matrix JSON: $MATRIX_JSON"
