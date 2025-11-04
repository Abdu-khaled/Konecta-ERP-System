#!/bin/bash
# scripts/ci/check-image-size.sh
# Checks Docker image size and warns if too large

set -e

IMAGE_TAG="$1"
MAX_SIZE_MB="${2:-1000}"  # Default 1GB

if [ -z "$IMAGE_TAG" ]; then
  echo " Usage: $0 <image-tag> [max-size-mb]"
  exit 1
fi

echo " Checking image size for: $IMAGE_TAG"

# Get image size
SIZE=$(docker image inspect "$IMAGE_TAG" --format='{{.Size}}')
SIZE_MB=$((SIZE / 1024 / 1024))

echo " Image size: ${SIZE_MB} MB"

# Check if size is too large
if [ $SIZE_MB -gt "$MAX_SIZE_MB" ]; then
  echo "  WARNING: Image larger than ${MAX_SIZE_MB}MB!"
  echo "  Consider:"
  echo "   - Using multi-stage builds"
  echo "   - Using alpine base images"
  echo "   - Removing unnecessary dependencies"
  echo "   - Using .dockerignore"
else
  echo " Image size is acceptable"
fi

# Output for GitHub Actions
echo "size_mb=${SIZE_MB}" >> "$GITHUB_OUTPUT"
