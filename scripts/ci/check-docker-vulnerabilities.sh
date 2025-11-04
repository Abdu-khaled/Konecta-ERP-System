#!/bin/bash
# scripts/ci/check-docker-vulnerabilities.sh
# Checks Docker image vulnerabilities from Trivy scan results

set -e

TRIVY_REPORT="$1"

if [ -z "$TRIVY_REPORT" ] || [ ! -f "$TRIVY_REPORT" ]; then
  echo " Usage: $0 <trivy-report.json>"
  echo " Report file not found: $TRIVY_REPORT"
  exit 1
fi

echo " Security scan results:"
echo "=================================================="

# Display vulnerabilities
cat "$TRIVY_REPORT" | jq -r '.Results[]?.Vulnerabilities[]? | select(. != null) | "[\(.Severity)] \(.VulnerabilityID) - \(.PkgName) (\(.InstalledVersion))"' || echo "No detailed vulnerabilities found"

# Count by severity
CRITICAL=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity=="CRITICAL")] | length' "$TRIVY_REPORT")
HIGH=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity=="HIGH")] | length' "$TRIVY_REPORT")
MEDIUM=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity=="MEDIUM")] | length' "$TRIVY_REPORT")
LOW=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity=="LOW")] | length' "$TRIVY_REPORT")

echo ""
echo "=================================================="
echo " Summary:"
echo "    Critical: $CRITICAL"
echo "    High:     $HIGH"
echo "    Medium:   $MEDIUM"
echo "    Low:      $LOW"
echo "=================================================="

# Fail if critical vulnerabilities found
if [ "$CRITICAL" -gt "0" ]; then
  echo ""
  echo " CRITICAL vulnerabilities found in image!"
  echo "  Please update vulnerable dependencies before pushing to production."
  exit 1
fi

echo ""
echo "No critical vulnerabilities detected"
exit 0
