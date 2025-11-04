#!/bin/bash
# scripts/ci/determine-image-tags.sh
# Determines Docker image tags based on Git ref type

set -e

SERVICE="$1"
ECR_REGISTRY="$2"

if [ -z "$SERVICE" ] || [ -z "$ECR_REGISTRY" ]; then
  echo " Usage: $0 <service-name> <ecr-registry>"
  exit 1
fi

ECR_REPOSITORY="konecta-${SERVICE}"

# Determine version based on Git ref type
if [[ "${GITHUB_REF_TYPE}" == "tag" ]]; then
  VERSION=${GITHUB_REF_NAME}
  echo "  Using Git tag as version: $VERSION"
else
  SHORT_SHA=$(git rev-parse --short HEAD)
  BRANCH=$(echo "${GITHUB_REF_NAME}" | sed 's/\//-/g')
  VERSION="${BRANCH}-${SHORT_SHA}"
  echo " Using branch and commit: $VERSION"
fi

# Build image tags
DOCKER_TAG="${ECR_REGISTRY}/${ECR_REPOSITORY}:${VERSION}"
DOCKER_LATEST="${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"

# Output to GitHub Actions
echo "version=${VERSION}" >> "$GITHUB_OUTPUT"
echo "docker_tag=${DOCKER_TAG}" >> "$GITHUB_OUTPUT"
echo "docker_latest=${DOCKER_LATEST}" >> "$GITHUB_OUTPUT"
echo "ecr_registry=${ECR_REGISTRY}" >> "$GITHUB_OUTPUT"
echo "ecr_repository=${ECR_REPOSITORY}" >> "$GITHUB_OUTPUT"

# Log for visibility
echo " Version: $VERSION"
echo " Docker tag: $DOCKER_TAG"
echo " Docker latest: $DOCKER_LATEST"
