# Backend CI Pipeline Documentation

## Overview

This GitHub Actions workflow provides a comprehensive CI/CD pipeline for backend microservices with enterprise-grade security scanning, testing, and deployment capabilities. The pipeline is designed to automatically detect changes, build affected services, and ensure code quality and security before deployment.

## Pipeline Architecture

```
┌─────────────────────┐
│  Secret Scanning    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Detect Changes     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Dependency Scan     │ (SBOM + Trivy)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Build & Test       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Code Quality       │ (SonarQube)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Docker Build & Scan │ (Trivy)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  CodeQL Analysis    │
└─────────────────────┘
```

## Pipeline Stages

### Stage 1: Secret Scanning
- **Tool**: Gitleaks
- **Purpose**: Detects exposed secrets, API keys, and credentials in the codebase
- **Features**:
  - Scans entire repository history
  - Generates SARIF reports
  - Prevents credential leaks before they reach production
  - 30-day retention for audit trails

### Stage 2: Change Detection
- **Purpose**: Identifies modified backend services to optimize CI/CD execution
- **Features**:
  - Dynamic service discovery
  - Compares against base branch (PR) or previous commit (push)
  - Generates matrix strategy for parallel processing
  - Skips pipeline if no backend changes detected

### Stage 3: Dependency Scanning (SBOM + Trivy)
- **Tools**: CycloneDX Maven Plugin + Trivy
- **Purpose**: Identifies known CVEs in direct and transitive dependencies via SBOM
- **Features**:
  - Fails build on HIGH/CRITICAL (on main/protected branches)
  - Generates CycloneDX JSON SBOM and SARIF results
  - Uploads findings to GitHub Security tab
  - Caches Trivy vulnerability database for faster scans
  - Skips on PRs when `pom.xml` unchanged (fast path)

### Stage 4: Build & Test
- **Framework**: Maven with JUnit
- **Purpose**: Compiles code and runs unit/integration tests
- **Features**:
  - Java 21 with Temurin distribution
  - Maven dependency caching
  - JaCoCo code coverage reports
  - Test result publishing with visual reports
  - JAR artifact generation
  - Parallel execution per service

### Stage 5: Code Quality (SonarQube)
- **Tool**: SonarQube
- **Purpose**: Static code analysis and quality gate enforcement
- **Features**:
  - Code smell detection
  - Security hotspot identification
  - Test coverage analysis
  - Technical debt calculation
  - Quality gate enforcement (blocks on failure)
  - Historical trend tracking

### Stage 6: Docker Build & Security Scan
- **Tools**: Docker Buildx, Trivy
- **Purpose**: Containerize services and scan for vulnerabilities
- **Features**:
  - Multi-platform build support with Buildx
  - Smart tagging (branch-SHA or semver)
  - Image size monitoring (warns if >1GB)
  - Smoke tests before security scanning
  - Trivy vulnerability scanning (OS & libraries)
  - SBOM (Software Bill of Materials) generation in SPDX format
  - SARIF upload to GitHub Security
  - Build cache optimization
  - Blocks push on critical vulnerabilities
  - Automatic `latest` tag on main branch

### Stage 7: CodeQL Analysis
- **Tool**: GitHub CodeQL
- **Purpose**: Advanced semantic code analysis
- **Features**:
  - Detects security vulnerabilities
  - Identifies code quality issues
  - Language-specific analysis (Java)
  - Integration with GitHub Security tab

## Trigger Conditions

The pipeline runs on:
- **Push** to `main` or `develop` branches (when backend files change)
- **Pull Request** targeting `main` or `develop` (when backend files change)
- **Manual Dispatch** (via GitHub UI)

## Required Secrets

Configure these secrets in your GitHub repository settings:

| Secret | Description | Example |
|--------|-------------|---------|
| `DOCKER_USERNAME` | Docker Hub username | `your-dockerhub-user` |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_xxxxx` |
| `SONAR_TOKEN` | SonarQube authentication token | `squ_xxxxx` |
| `SONAR_URL` | SonarQube server URL | `https://sonar.example.com` |

## Environment Variables

- `JAVA_VERSION`: Java SDK version (default: 21)
- `NODE_VERSION`: Node.js version for frontend tasks (default: 18)

## Artifacts Generated

### Security Reports (30-day retention)
- Gitleaks SARIF report
- SBOM (CycloneDX JSON) and Trivy vulnerability SARIF
- Trivy container image vulnerability reports
- SBOM files (90-day retention)

### Build Artifacts (7-day retention)
- Compiled JAR files
- Test results (JUnit XML)
- Code coverage reports (JaCoCo XML)

### Docker Images
- Tagged images in Docker Hub
- Format: `{username}/konecta-{service}:{version}`
- Latest tag on main branch pushes

## Repository Structure

```
├── backend/
│   ├── service-1/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── src/
│   ├── service-2/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── src/
│   └── ...
├── .github/
│   └── workflows/
│       └── backend-ci.yml
└── .trivyignore (optional)
```

## Matrix Strategy

The pipeline uses GitHub Actions matrix strategy to run jobs in parallel for each detected service change, significantly reducing total execution time.

## Quality Gates

### Dependency Scanning
- ❌ **FAIL**: Critical vulnerabilities detected
- ⚠️ **WARN**: More than 5 high-severity vulnerabilities

### Docker Security
- ❌ **FAIL**: Critical vulnerabilities in container image
- ⚠️ **WARN**: Image size exceeds 1GB

### Code Quality
- ❌ **FAIL**: SonarQube quality gate not met

### Testing
- ❌ **FAIL**: Any unit or integration test fails

## Optimization Features

1. **Smart Caching**
   - Maven dependencies cached by POM hash
   - Docker layer caching using registry
   - Trivy vulnerability database caching

2. **Selective Execution**
   - Only builds changed services
   - Skips entire pipeline if no backend changes

3. **Parallel Processing**
   - Multiple services build simultaneously
   - Independent security scans per service

4. **Timeout Protection**
   - Stage 2: 5 minutes
   - Stage 3: 15 minutes
   - Stage 4: 20 minutes
   - Stage 6: 25 minutes
   - Stage 7: 30 minutes

## Monitoring & Reporting

All security findings are automatically uploaded to:
- **GitHub Security** tab (SARIF format)
- **Workflow Artifacts** (downloadable reports)
- **Test Reporter** (visual test results)

## Best Practices

1. **Commit Messages**: Use clear, descriptive messages for better change tracking
2. **Dependency Updates**: Regularly update dependencies to avoid accumulating vulnerabilities
3. **Ignore Rules**: Document any accepted exceptions in `.trivyignore`
4. **Docker Images**: Keep base images updated and minimize image layers
5. **Test Coverage**: Maintain high test coverage for quality gate compliance

## Troubleshooting

### Pipeline Fails on Secret Scan
- Review Gitleaks report in artifacts
- Remove or rotate exposed credentials
- Add false positives to `.gitleaksignore`

### Dependency Scan Issues (SBOM/Trivy)
- Clear Trivy cache: Remove cache key `trivy-db-*`
- Ensure Trivy can download vulnerability DB (network egress allowed)
- Consider increasing timeout if initial DB download is slow

### Docker Push Fails
- Verify Docker Hub credentials are correct
- Check Docker Hub rate limits
- Ensure repository exists or set auto-create

### SonarQube Quality Gate Fails
- Review issues in SonarQube dashboard
- Fix code smells, bugs, and security hotspots
- Adjust quality gate settings if needed

## Metrics

Track these metrics for pipeline health:
- Average execution time per stage
- Vulnerability detection rate
- Quality gate pass rate
- Build success rate
- Time to detect issues

## Future Enhancements

- [ ] Add integration testing with Testcontainers
- [ ] Implement progressive deployment strategies
- [ ] Add performance testing stage
- [ ] Integrate chaos engineering tools
- [ ] Add automated rollback on quality gate failure
- [ ] Implement deployment to Kubernetes/OCI

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review artifact reports
3. Consult team documentation
4. Create an issue in the repository

---

**Version**: 1.0  
**Last Updated**: October 2025  
**Maintainer**: DevOps Team
