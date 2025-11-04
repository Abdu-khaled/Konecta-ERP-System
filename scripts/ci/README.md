# CI/CD Scripts

This directory contains reusable shell scripts for GitHub Actions CI/CD pipelines.

##  Scripts Overview

### Backend Scripts

#### `detect-backend-changes.sh`
**Purpose:** Detects which backend services have changed in the current commit/PR.

**Usage:**
```bash
export GITHUB_EVENT_NAME="push"  # or "pull_request"
export GITHUB_BASE_SHA="abc123"  # For PRs
bash scripts/ci/detect-backend-changes.sh
```

**Outputs:**
- `changed`: `true` or `false`
- `matrix`: JSON matrix with changed services and their types

**Service Types Detected:**
- `java` - Services with `pom.xml`
- `csharp` - Services with `.csproj` files
- `unknown` - Other service types

---

#### `determine-image-tags.sh`
**Purpose:** Generates Docker image tags based on Git ref (tag or branch+commit).

**Usage:**
```bash
bash scripts/ci/determine-image-tags.sh <service-name> <ecr-registry>
```

**Example:**
```bash
bash scripts/ci/determine-image-tags.sh auth-service 123456789012.dkr.ecr.us-east-1.amazonaws.com
```

**Outputs:**
- `version`: Git tag or `branch-sha`
- `docker_tag`: Full ECR image tag
- `docker_latest`: Latest tag
- `ecr_registry`: ECR registry URL
- `ecr_repository`: ECR repository name

**Tag Format:**
- **For tags:** `konecta-service:v1.0.0`
- **For branches:** `konecta-service:develop-abc123`

---

#### `check-docker-vulnerabilities.sh`
**Purpose:** Analyzes Trivy scan results and fails if critical vulnerabilities found.

**Usage:**
```bash
bash scripts/ci/check-docker-vulnerabilities.sh trivy-report.json
```

**Features:**
- Displays all vulnerabilities by severity
- Shows summary count (Critical, High, Medium, Low)
- Exits with code 1 if critical vulnerabilities found
- Color-coded output with emojis for readability

**Example Output:**
```
🔍 Security scan results:
==================================================
[CRITICAL] CVE-2023-12345 - openssl (1.1.1f)
[HIGH] CVE-2023-67890 - libcurl (7.68.0)
==================================================
 Summary:
    Critical: 1
    High:     2
    Medium:   5
    Low:      10
==================================================
 CRITICAL vulnerabilities found in image!
```

---

#### `check-image-size.sh`
**Purpose:** Checks Docker image size and warns if it exceeds threshold.

**Usage:**
```bash
bash scripts/ci/check-image-size.sh <image-tag> [max-size-mb]
```

**Example:**
```bash
# Check if image is larger than 1000MB (default)
bash scripts/ci/check-image-size.sh myapp:latest

# Check if image is larger than 500MB
bash scripts/ci/check-image-size.sh myapp:latest 500
```

**Outputs:**
- `size_mb`: Image size in megabytes

**Features:**
- Warns if image exceeds threshold
- Provides optimization suggestions
- Does not fail the build (warning only)

---

### Frontend Scripts

#### `detect-frontend-changes.sh`
**Purpose:** Detects if any frontend files have changed.

**Usage:**
```bash
export GITHUB_EVENT_NAME="push"  # or "pull_request"
export GITHUB_BASE_SHA="abc123"  # For PRs
bash scripts/ci/detect-frontend-changes.sh
```

**Outputs:**
- `changed`: `true` or `false`

---

## 🔧 Testing Scripts Locally

### Prerequisites
```bash
# Install required tools
sudo apt-get install -y jq git docker.io
```

### Test Backend Change Detection
```bash
cd /path/to/Konecta-ERP-System

# Simulate environment variables
export GITHUB_EVENT_NAME="push"
export GITHUB_OUTPUT="/tmp/github_output.txt"

# Run script
bash scripts/ci/detect-backend-changes.sh

# Check output
cat /tmp/github_output.txt
```

### Test Image Tags
```bash
export GITHUB_REF_TYPE="branch"
export GITHUB_REF_NAME="develop"
export GITHUB_OUTPUT="/tmp/github_output.txt"

bash scripts/ci/determine-image-tags.sh auth-service 123456789012.dkr.ecr.us-east-1.amazonaws.com

cat /tmp/github_output.txt
```

### Test Vulnerability Check
```bash
# First, run Trivy to generate report
docker pull nginx:latest
trivy image --format json --output trivy-report.json nginx:latest

# Then check vulnerabilities
bash scripts/ci/check-docker-vulnerabilities.sh trivy-report.json
```

### Test Image Size Check
```bash
docker pull nginx:latest
bash scripts/ci/check-image-size.sh nginx:latest 500
```

---

## Best Practices

### Script Standards

1. **Always use `set -e`** - Exit on error
2. **Validate inputs** - Check required arguments
3. **Provide clear output** - Use emojis and colors for readability
4. **Exit codes** - 0 for success, 1 for failure
5. **Documentation** - Include usage comments at top of script

### Error Handling

```bash
# Good: Check if file exists
if [ ! -f "$FILE" ]; then
  echo " Error: File not found"
  exit 1
fi

# Good: Validate required arguments
if [ -z "$SERVICE" ]; then
  echo " Usage: $0 <service-name>"
  exit 1
fi
```

### Output Format

```bash
# Use GitHub Actions output format
echo "key=value" >> "$GITHUB_OUTPUT"

# Use clear logging
echo "Success message"
echo "Error message"
echo "Warning message"
echo "Info message"
```

---

## Integration with GitHub Actions

### Backend Pipeline Example

```yaml
- name: Detect changed services
  id: detect
  env:
    GITHUB_EVENT_NAME: ${{ github.event_name }}
    GITHUB_BASE_SHA: ${{ github.event.pull_request.base.sha }}
  run: |
    git fetch origin --depth=2
    bash scripts/ci/detect-backend-changes.sh

- name: Determine image tags
  id: tags
  run: bash scripts/ci/determine-image-tags.sh "${{ matrix.service }}" "${{ steps.ecr.outputs.registry }}"

- name: Check vulnerabilities
  run: bash scripts/ci/check-docker-vulnerabilities.sh trivy-report.json
```

### Frontend Pipeline Example

```yaml
- name: Detect frontend changes
  id: detect
  env:
    GITHUB_EVENT_NAME: ${{ github.event_name }}
    GITHUB_BASE_SHA: ${{ github.event.pull_request.base.sha }}
  run: |
    git fetch origin --depth=2
    bash scripts/ci/detect-frontend-changes.sh

- name: Check image size
  run: bash scripts/ci/check-image-size.sh "${{ steps.tags.outputs.docker_tag }}" 500
```

---

##  Maintenance

### Adding New Scripts

1. Create script in `scripts/ci/`
2. Make it executable: `chmod +x scripts/ci/your-script.sh`
3. Add documentation to this README
4. Test locally before committing
5. Update pipelines to use the script

### Modifying Existing Scripts

1. Test changes locally first
2. Ensure backward compatibility
3. Update documentation if usage changes
4. Review all pipelines using the script

### Script Naming Convention

- Use lowercase with hyphens: `check-image-size.sh`
- Use descriptive names: `detect-backend-changes.sh` not `detect.sh`
- Include `.sh` extension

---

## Troubleshooting

### Script not executable
```bash
chmod +x scripts/ci/*.sh
```

### Script not found in pipeline
```bash
# Ensure scripts are committed to Git
git add scripts/ci/
git commit -m "Add CI scripts"
git push
```

### Environment variables not set
```bash
# Check if GITHUB_OUTPUT is set
echo "${GITHUB_OUTPUT:-/tmp/github_output.txt}"

# Set manually for local testing
export GITHUB_OUTPUT="/tmp/test_output.txt"
```

### jq not available
```bash
# Install jq
sudo apt-get install -y jq

# Or use Docker
docker run --rm -i stedolan/jq
```

---

