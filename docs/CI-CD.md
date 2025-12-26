# Konecta ERP System CI/CD Pipelines

[![Pipeline Status](https://img.shields.io/badge/Pipeline-Enterprise%20Ready-brightgreen)](https://github.com/konecta/erp-system/actions)
[![Security](https://img.shields.io/badge/Security-Scanning%20Enabled-red)](https://github.com/konecta/erp-system/security)
[![Quality](https://img.shields.io/badge/Quality-SonarQube%20Integrated-blue)](https://sonarcloud.io)
[![GitOps](https://img.shields.io/badge/GitOps-ArgoCD-blue)](https://argo-cd.readthedocs.io/)

> **Enterprise-grade CI/CD pipelines for the Konecta ERP System with comprehensive security scanning, automated testing, quality assurance, and GitOps-based continuous deployment.**

## Table of Contents

- [Overview](#overview)
- [CI Pipeline Architecture](#ci-pipeline-architecture)
- [Frontend CI Pipeline](#frontend-ci-pipeline)
- [Backend CI Pipeline](#backend-ci-pipeline)
- [Continuous Deployment (CD)](#continuous-deployment-cd)
  - [CD Overview](#cd-overview)
  - [GitOps Architecture](#gitops-architecture)
  - [ArgoCD Configuration](#argocd-configuration)
  - [ArgoCD Image Updater](#argocd-image-updater)
  - [Helm Charts](#helm-charts)
  - [Ingress & Load Balancing](#ingress--load-balancing)
  - [Secrets Management](#secrets-management)
  - [Environment Management](#environment-management)
  - [Cloud Team Collaboration](#cloud-team-collaboration)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Monitoring & Reports](#monitoring--reports)
- [Troubleshooting](#troubleshooting)
- [Metrics & KPIs](#metrics--kpis)
- [Roadmap](#roadmap)
- [Best Practices](#best-practices)
- [Support & Maintenance](#support--maintenance)

## Overview

The Konecta ERP System features **comprehensive CI/CD pipelines** designed for enterprise-scale development and deployment:

| Pipeline | Technology Stack | Purpose | Key Features |
|----------|------------------|---------|--------------|
| **Frontend CI** | Angular, Node.js, Docker | UI/UX Development | Security scanning, automated testing, containerization |
| **Backend CI** | Java Spring Boot, .NET, Docker | Microservices Development | Multi-language support, secret scanning, quality gates |
| **CD (GitOps)** | ArgoCD, Helm, Kubernetes, AWS | Automated Deployment | GitOps-based deployment, image auto-updates, multi-environment |

### Key Benefits

**CI Pipeline:**
- **Enterprise Security**: Multi-layer vulnerability scanning with Trivy, Gitleaks, and SonarQube
- **Smart Optimization**: Change detection, intelligent caching, and parallel processing
- **Comprehensive Testing**: Unit tests, integration tests, and code coverage analysis
- **Container Security**: Docker image scanning and SBOM generation
- **Quality Assurance**: SonarQube integration with configurable quality gates

**CD Pipeline:**
- **GitOps Compliance**: All infrastructure and application changes tracked in Git
- **Automated Deployments**: Continuous deployment with ArgoCD and automated image updates
- **Multi-Environment Support**: Separate dev and production environments with appropriate configurations
- **Cloud-Native**: Integration with AWS services (ECR, RDS, ALB, ACM, Secrets Manager)
- **Self-Healing**: Automatic reconciliation of cluster state with Git repository
- **Rollback Capabilities**: Easy rollback to previous versions via Git history

## CI Pipeline Architecture

```mermaid
graph TB
    subgraph "Frontend CI Pipeline"
        A1[Detect Changes] --> A2[Dependency Scan]
        A2 --> A3[Build & Test]
        A3 --> A4[Code Quality]
        A4 --> A5[Docker Build & Scan]
        A5 --> A6[Push to ECR]
    end
    
    subgraph "Backend CI Pipeline"
        B1[Secret Scanning] --> B2[Detect Changes]
        B2 --> B3[Dependency Scan]
        B3 --> B4[Build & Test]
        B4 --> B5[Code Quality]
        B5 --> B6[Docker Build & Scan]
        B6 --> B7[Push to ECR]
    end
    
    A1 -.->|Path: frontend/**| Trigger[Trigger Events]
    B1 -.->|Path: backend/**| Trigger
    
    Trigger --> |Push/PR to main/develop| A1
    Trigger --> |Push/PR to main/develop| B1
    
    A6 --> CD[Continuous Deployment]
    B7 --> CD
```

## Frontend CI Pipeline

> **Angular-based UI pipeline with enterprise security and quality standards**

### Pipeline Summary

| Stage | Duration | Tools | Purpose |
|-------|----------|-------|---------|
| **Change Detection** | ~2 min | Git | Identify modified frontend files |
| **Dependency Scan** | ~5 min | Trivy | Scan npm packages for vulnerabilities |
| **Build & Test** | ~8 min | Angular, npm | Compile and test application |
| **Code Quality** | ~6 min | SonarQube | Static analysis and quality gates |
| **Docker Build** | ~10 min | Docker, Trivy | Containerize and security scan |
| **Push to ECR** | ~2 min | AWS CLI | Push image to AWS ECR |

### Stage Details

#### 1. **Change Detection**
```yaml
Purpose: Smart pipeline optimization
Trigger: frontend/** file changes
Features:
  - Compares against base branch (PR) or previous commit (push)
  - Skips entire pipeline if no frontend changes detected
  - Optimizes CI/CD execution time
```

#### 2. **Dependency Vulnerability Scan**
```yaml
Tool: Trivy SCA
Target: package-lock.json, node_modules
Severity: CRITICAL, HIGH
Features:
  - Scans npm dependencies for known vulnerabilities
  - Generates SARIF reports for GitHub Security tab
  - Fails pipeline on critical vulnerabilities
  - Ignores unfixed vulnerabilities
```

#### 3. **Build & Test**
```yaml
Framework: Angular 17+ with Node.js 18
Features:
  - npm dependency caching for faster builds
  - Conditional linting (if configured)
  - Smart test execution (only if test files exist)
  - Production-optimized Angular build
  - Code coverage collection and reporting
  - Artifact upload for build outputs
```

#### 4. **Code Quality Analysis**
```yaml
Tool: SonarQube Scanner
Target: TypeScript/Angular source code
Features:
  - Analyzes TypeScript source code
  - Integrates test coverage data
  - Quality gate enforcement
  - Excludes test files and build artifacts
  - Generates comprehensive quality reports
```

#### 5. **Docker Build & Security Scan**
```yaml
Tools: Docker Buildx, Trivy
Features:
  - Multi-stage Docker build optimization
  - Nginx-based production image
  - Image size monitoring (warns if >500MB)
  - Trivy vulnerability scanning (OS & libraries)
  - SBOM generation in SPDX format
  - SARIF upload to GitHub Security
  - Push to AWS ECR with versioned tags
  - Automatic 'latest' tag on main branch
```

## Backend CI Pipeline

> **Multi-language microservices pipeline supporting Java Spring Boot and C# .NET**

### Pipeline Summary

| Stage | Duration | Tools | Purpose |
|-------|----------|-------|---------|
| **Secret Scanning** | ~3 min | Gitleaks | Detect exposed credentials |
| **Change Detection** | ~2 min | Git | Identify modified services |
| **Dependency Scan** | ~5 min | Trivy | Scan dependencies for vulnerabilities |
| **Build & Test** | ~12 min | Maven/.NET | Compile and test services |
| **Code Quality** | ~8 min | SonarQube | Static analysis and quality gates |
| **Docker Build** | ~15 min | Docker, Trivy | Containerize and security scan |
| **Push to ECR** | ~2 min | AWS CLI | Push image to AWS ECR |

### Stage Details

#### 1. **Secret Scanning**
```yaml
Tool: Gitleaks v8.18.4
Target: Entire repository history
Features:
  - Scans for exposed API keys, passwords, tokens
  - Generates SARIF reports for GitHub Security
  - Prevents credential leaks before production
  - 30-day retention for audit trails
  - Redacts sensitive information in reports
```

#### 2. **Change Detection**
```yaml
Purpose: Dynamic service discovery and optimization
Features:
  - Auto-detects Java (Maven) and C# (.NET) services
  - Compares against base branch (PR) or previous commit
  - Generates matrix strategy for parallel processing
  - Skips pipeline if no backend changes detected
  - Supports mixed-language microservices architecture
```

#### 3. **Dependency Vulnerability Scan**
```yaml
Tool: Trivy SCA
Target: backend/ directory
Severity: CRITICAL, HIGH
Features:
  - Scans Maven and NuGet dependencies
  - Generates SARIF reports for GitHub Security
  - Fails pipeline on critical vulnerabilities
  - Ignores unfixed vulnerabilities
```

#### 4. **Build & Test**
```yaml
Frameworks: Maven (Java 21) + .NET 8.0
Features:
  Java Services:
    - Java 21 with Temurin distribution
    - Maven dependency caching
    - JUnit test execution with coverage
    - JaCoCo code coverage reports
    - JAR artifact generation
  C# Services:
    - .NET 8.0 with conditional test execution
    - TRX test result generation
    - OpenCover code coverage collection
  - Parallel execution per service
  - Visual test result reporting
```

#### 5. **Code Quality Analysis**
```yaml
Tool: SonarQube
Target: Java + C# source code
Features:
  Java Analysis:
    - Maven SonarQube plugin integration
    - JaCoCo coverage data integration
    - Quality gate enforcement
  C# Analysis:
    - .NET SonarQube Scanner
    - OpenCover coverage integration
    - Quality gate enforcement
  - Service-specific project keys
  - Historical trend tracking
```

#### 6. **Docker Build & Security Scan**
```yaml
Tools: Docker Buildx, Trivy
Features:
  - Service-specific Dockerfile selection
  - Multi-platform build support
  - Smart tagging (branch-SHA or semver)
  - Image size monitoring (warns if >1GB)
  - Smoke tests before security scanning
  - Trivy vulnerability scanning (OS & libraries)
  - SBOM generation in SPDX format
  - SARIF upload to GitHub Security
  - Push to AWS ECR with versioned tags
  - Automatic 'latest' tag on main branch
```

## Continuous Deployment (CD)

### CD Overview

The Continuous Deployment pipeline leverages **GitOps principles** to automate the deployment of containerized applications to Kubernetes clusters. The CD process is managed entirely through Git, ensuring that all changes are version-controlled, auditable, and reversible.

**CD Workflow:**
1. **CI Pipeline Completion**: After successful CI pipeline execution, Docker images are pushed to AWS ECR
2. **Image Detection**: ArgoCD Image Updater monitors ECR for new images
3. **Git Update**: Image Updater automatically updates Helm values in Git repository
4. **ArgoCD Sync**: ArgoCD detects Git changes and syncs to Kubernetes cluster
5. **Deployment**: Helm charts are rendered and deployed to target namespace
6. **Health Monitoring**: ArgoCD continuously monitors application health

### GitOps Architecture

```mermaid
graph TB
    subgraph "CI Pipeline"
        CI[Build & Push to ECR]
    end
    
    subgraph "Git Repository"
        GIT[GitOps Repo]
        HELM[Helm Charts]
        VALUES[values.yaml]
    end
    
    subgraph "ArgoCD"
        IMG_UPD[Image Updater]
        APP_CTRL[Application Controller]
        REPO_SERVER[Repo Server]
    end
    
    subgraph "Kubernetes Cluster"
        K8S[EKS Cluster]
        NS_DEV[konecta-dev]
        NS_PROD[konecta-prod]
    end
    
    subgraph "AWS Services"
        ECR[AWS ECR]
        RDS[AWS RDS]
        ALB[AWS ALB]
        SECRETS[AWS Secrets Manager]
    end
    
    CI --> ECR
    ECR --> IMG_UPD
    IMG_UPD --> GIT
    GIT --> REPO_SERVER
    REPO_SERVER --> APP_CTRL
    APP_CTRL --> K8S
    K8S --> NS_DEV
    K8S --> NS_PROD
    NS_DEV --> ALB
    NS_PROD --> ALB
    K8S --> RDS
    K8S --> SECRETS
```

### ArgoCD Configuration

#### App of Apps Pattern

The deployment uses the **App of Apps pattern** for centralized management:

```yaml
# app-of-apps.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: konecta-platform
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/Abdu-khaled/konecta-erp-gitops.git
    targetRevision: main
    path: gitops-helm-repo/argocd/apps
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

**Benefits:**
- **Single Command Deployment**: Deploy entire platform with one manifest
- **Ordered Deployment**: Sync waves control deployment order
- **Centralized Management**: All applications managed from one place
- **Easy Environment Switching**: Different app-of-apps for dev/prod

#### Sync Waves

Applications deploy in a specific order using sync wave annotations:

| Wave | Application | Purpose |
|------|-------------|---------|
| **Wave 0** | `konecta-platform` (App of Apps) | Parent application |
| **Wave 1** | External Secrets Operator | Secret management infrastructure |
| **Wave 2** | `konecta-erp-dev` / `konecta-erp-prod` | Main application deployment |
| **Wave 3** | Ingress resources | Application ingress configuration |

#### Application Configuration

**Development Environment:**
```yaml
# konecta-erp-dev.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: konecta-erp-dev
  namespace: argocd
  annotations:
    argocd.argoproj.io/sync-wave: "2"
spec:
  source:
    repoURL: https://github.com/Abdu-khaled/konecta-erp-gitops.git
    targetRevision: main
    path: gitops-helm-repo/charts/erp
    helm:
      valueFiles:
        - values.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: konecta-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
```

**Production Environment:**
```yaml
# konecta-erp-prod.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: konecta-erp-prod
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/Abdu-khaled/konecta-erp-gitops.git
    targetRevision: main
    path: gitops-helm-repo/charts/erp
    helm:
      valueFiles:
        - values-prod.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: konecta-prod
  syncPolicy:
    # Manual sync for production safety
    syncOptions:
      - CreateNamespace=true
```

**Key Differences:**

| Feature | Development | Production |
|---------|-------------|------------|
| **Sync Policy** | Automated (prune, selfHeal) | Manual sync required |
| **Replicas** | 1-2 per service | 2-3 per service |
| **Resources** | Lower limits | Higher limits |
| **Image Tag Strategy** | `develop-*` pattern | Semantic versioning |
| **Database** | Dev RDS instance | Prod RDS instance |
| **Secrets** | Values file | External Secrets |

### ArgoCD Image Updater

**ArgoCD Image Updater** automatically monitors container registries and updates Helm values when new images are available.

#### Configuration

**Image Updater ConfigMap:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-image-updater-config
  namespace: argocd
data:
  registries.conf: |
    registries:
    - name: ECR
      prefix: 712416034227.dkr.ecr.us-east-1.amazonaws.com
      api_url: https://712416034227.dkr.ecr.us-east-1.amazonaws.com
      credentials: pullsecret:argocd/ecr-credentials
      default: true
  git.user: argocd-image-updater
  git.email: argocd-image-updater@konecta.local
```

#### Application Annotations

**Development Environment (Latest Tag Strategy):**
```yaml
annotations:
  # Image list
  argocd-image-updater.argoproj.io/image-list: |
    discovery=712416034227.dkr.ecr.us-east-1.amazonaws.com/konecta-discovery-server,
    gateway=712416034227.dkr.ecr.us-east-1.amazonaws.com/konecta-gateway-service,
    auth=712416034227.dkr.ecr.us-east-1.amazonaws.com/konecta-auth-service
  
  # Update strategy: latest matching develop-* pattern
  argocd-image-updater.argoproj.io/discovery.update-strategy: latest
  argocd-image-updater.argoproj.io/discovery.allow-tags: regexp:^develop-[a-f0-9]{7}$
  
  # Helm values paths
  argocd-image-updater.argoproj.io/discovery.helm.image-name: discovery.image
  argocd-image-updater.argoproj.io/discovery.helm.image-tag: discovery.tag
  
  # Git write-back
  argocd-image-updater.argoproj.io/write-back-method: git
  argocd-image-updater.argoproj.io/git-branch: main
```

**Production Environment (Semantic Versioning):**
```yaml
annotations:
  # Update strategy: semantic versioning
  argocd-image-updater.argoproj.io/discovery.update-strategy: semver
  argocd-image-updater.argoproj.io/discovery.allow-tags: regexp:^v?\d+\.\d+\.\d+$
```

#### Update Strategies

| Strategy | Environment | Description | Example Tags |
|----------|-------------|-------------|--------------|
| **latest** | Development | Picks latest tag matching pattern | `develop-69822e4`, `develop-abc1234` |
| **semver** | Production | Picks latest semantic version | `1.0.0`, `v2.1.3` |

#### How It Works

1. **Image Monitoring**: Image Updater polls ECR every configured interval
2. **Tag Matching**: Filters tags based on `allow-tags` regex pattern
3. **Version Selection**: Selects latest matching tag based on strategy
4. **Git Update**: Updates Helm values file in Git repository
5. **ArgoCD Sync**: ArgoCD detects Git change and syncs application
6. **Deployment**: New image is deployed to Kubernetes cluster

### Helm Charts

#### Umbrella Chart Pattern

The project uses an **umbrella Helm chart** that orchestrates all microservices:

```
charts/erp/
├── Chart.yaml              # Umbrella chart metadata
├── values.yaml             # Development values
├── values-prod.yaml        # Production values
└── templates/
    ├── discovery.yaml      # Discovery service (Eureka)
    ├── gateway.yaml        # API Gateway
    ├── frontend.yaml       # Angular frontend
    ├── microservices.yaml  # All microservices
    ├── postgres.yaml       # PostgreSQL (disabled, using RDS)
    ├── rabbitmq.yaml       # RabbitMQ message broker
    ├── n8n.yaml            # Workflow automation
    └── pgadmin.yaml        # Database admin UI
```

#### Chart Structure

**Chart.yaml:**
```yaml
apiVersion: v2
name: konecta-erp
description: Konecta ERP - Complete microservices application
type: application
version: 0.1.0
appVersion: "1.0.0"
```

#### Service Configuration

**Example Service Configuration (values.yaml):**
```yaml
# Auth Service
auth:
  enabled: true
  image: 712416034227.dkr.ecr.us-east-1.amazonaws.com/konecta-auth-service
  tag: develop-69822e4
  replicas: 2
  port: 8081
  env:
    SPRING_DATASOURCE_URL: "jdbc:postgresql://konecta-erp-dev.cybqicyoeshh.us-east-1.rds.amazonaws.com:5432/auth-service"
    SPRING_DATASOURCE_USERNAME: "postgres"
    SPRING_PROFILES_ACTIVE: "docker"
  resources:
    requests:
      cpu: 200m
      memory: 512Mi
    limits:
      cpu: 500m
      memory: 1Gi
```

#### Environment-Specific Values

**Development (values.yaml):**
- Lower resource limits
- Single replica for most services
- Development RDS endpoint
- MailHog enabled for email testing

**Production (values-prod.yaml):**
- Higher resource limits
- Multiple replicas for HA
- Production RDS endpoint
- External Secrets for credentials
- Health probes configured
- MailHog disabled

### Ingress & Load Balancing

#### AWS ALB Controller

The project uses **AWS Load Balancer Controller** to create Application Load Balancers (ALB) for ingress traffic.

#### Ingress Configuration

**Application Ingress:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: konecta-ingress
  namespace: konecta-dev
  annotations:
    # AWS ALB annotations
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    # ACM Certificate
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:712416034227:certificate/929c3024-6c1f-4e27-87ca-dcadadaf5504
    # Health checks
    alb.ingress.kubernetes.io/healthcheck-path: /
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: '30'
    alb.ingress.kubernetes.io/healthcheck-timeout-seconds: '5'
    alb.ingress.kubernetes.io/success-codes: '200,301,302,404'
spec:
  ingressClassName: alb
  rules:
    - host: konectasync.me
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```

#### Features

- **SSL/TLS Termination**: Uses AWS Certificate Manager (ACM) certificates
- **HTTP to HTTPS Redirect**: Automatic redirect configured
- **Health Checks**: Custom health check paths and intervals
- **Multiple Hosts**: Supports multiple domain names
- **Path-Based Routing**: Routes traffic based on URL paths

#### ArgoCD Ingress

ArgoCD UI is also exposed via ALB for easy access:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-ingress
  namespace: argocd
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/certificate-arn: <certificate-arn>
spec:
  ingressClassName: alb
  rules:
    - host: argocd.konectasync.me
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 443
```

### Secrets Management

#### External Secrets Operator

The project uses **External Secrets Operator** to integrate Kubernetes secrets with AWS Secrets Manager.

#### Cluster Secret Store

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: aws-secrets-manager
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets
            namespace: external-secrets-system
```

#### External Secret Example

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: rds-credentials
  namespace: konecta-prod
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: rds-credentials
    creationPolicy: Owner
  dataFrom:
  - extract:
      key: konecta-erp-rds  # Secret name in AWS Secrets Manager
```

#### Usage in Deployments

```yaml
envFrom:
  - secretRef:
      name: rds-credentials  # Created by External Secrets Operator
```

#### IAM Role Configuration

The External Secrets Operator uses IAM Roles for Service Accounts (IRSA):

```yaml
serviceAccount:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::712416034227:role/eksctl-konecta-erp-default-addon-iamserviceac-Role1-CqWOqmVPD6Hw
```

### Environment Management

#### Development Environment

**Characteristics:**
- **Namespace**: `konecta-dev`
- **Sync Policy**: Automated with prune and selfHeal
- **Replicas**: 1-2 per service
- **Resources**: Lower limits (256Mi-512Mi memory)
- **Image Strategy**: Latest `develop-*` tags
- **Database**: Dev RDS instance
- **Secrets**: Inline in values.yaml (for development only)

**Configuration:**
```yaml
# values.yaml
discovery:
  replicas: 1
  resources:
    requests:
      memory: 512Mi
    limits:
      memory: 1Gi
```

#### Production Environment

**Characteristics:**
- **Namespace**: `konecta-prod`
- **Sync Policy**: Manual sync (safety)
- **Replicas**: 2-3 per service (HA)
- **Resources**: Higher limits (512Mi-1Gi memory)
- **Image Strategy**: Semantic versioning
- **Database**: Production RDS instance
- **Secrets**: External Secrets from AWS Secrets Manager

**Configuration:**
```yaml
# values-prod.yaml
discovery:
  replicas: 2
  resources:
    requests:
      memory: 512Mi
      cpu: 250m
    limits:
      memory: 1Gi
      cpu: 500m
  livenessProbe:
    httpGet:
      path: /actuator/health
      port: 8761
    initialDelaySeconds: 60
    periodSeconds: 30
```

#### Environment Separation

| Aspect | Development | Production |
|--------|-------------|------------|
| **RDS Endpoint** | `konecta-erp-dev.cybqicyoeshh.us-east-1.rds.amazonaws.com` | `konecta-erp-prod.cybqicyoeshh.us-east-1.rds.amazonaws.com` |
| **Domain** | `konectasync.me` | `konecta-erp.com` (planned) |
| **Auto-Sync** | Enabled | Disabled (manual) |
| **Image Updates** | Automatic | Automatic (with approval) |
| **Resource Limits** | Lower | Higher |
| **Monitoring** | Basic | Comprehensive |

### Cloud Team Collaboration

The DevOps team collaborates closely with the **Cloud Team** to provision and manage AWS infrastructure:

#### AWS Services Used

| Service | Purpose | Managed By | Configuration |
|---------|---------|------------|---------------|
| **Amazon EKS** | Kubernetes cluster | Cloud Team | Cluster provisioning, node groups |
| **Amazon ECR** | Container registry | DevOps Team | Image storage, lifecycle policies |
| **Amazon RDS** | PostgreSQL database | Cloud Team | Instance provisioning, backups |
| **AWS ALB** | Application load balancer | DevOps Team | Created via ALB Controller |
| **ACM** | SSL/TLS certificates | Cloud Team | Certificate provisioning |
| **AWS Secrets Manager** | Secret storage | Cloud Team | Secret creation, rotation |
| **IAM** | Access control | Cloud Team | IRSA roles, policies |

#### Infrastructure Provisioning

**EKS Cluster:**
- Provisioned by Cloud Team using Terraform or eksctl
- Node groups configured for appropriate instance types
- Networking (VPC, subnets) configured by Cloud Team

**RDS Instances:**
- Development and production instances provisioned separately
- Multi-AZ enabled for production
- Automated backups configured
- Security groups configured by Cloud Team

**ECR Repositories:**
- Created by DevOps Team or Cloud Team
- Lifecycle policies for image retention
- Repository per microservice

**ACM Certificates:**
- Requested by DevOps Team
- Validated and issued by Cloud Team
- ARN provided to DevOps for ingress configuration

**IAM Roles:**
- Service account roles created by Cloud Team
- Policies attached for ECR, Secrets Manager access
- ARN provided to DevOps for External Secrets configuration

#### Collaboration Workflow

1. **Infrastructure Request**: DevOps team requests infrastructure (RDS, certificates, etc.)
2. **Provisioning**: Cloud team provisions resources using Infrastructure as Code
3. **Configuration Sharing**: Cloud team provides endpoints, ARNs, connection strings
4. **Integration**: DevOps team configures applications to use provided resources
5. **Monitoring**: Both teams monitor infrastructure health

#### Shared Responsibilities

**Cloud Team:**
- EKS cluster management and scaling
- RDS instance provisioning and maintenance
- Network configuration (VPC, subnets, security groups)
- IAM role and policy management
- Certificate management
- Cost optimization

**DevOps Team:**
- Application deployment and configuration
- Helm chart development
- ArgoCD configuration
- Ingress configuration
- Application monitoring
- Secret management integration

## Quick Start

### CI Pipeline

1. **Clone the repository**
   ```bash
   git clone https://github.com/konecta/erp-system.git
   cd erp-system
   ```

2. **Configure secrets** (see [Configuration](#-configuration) section)

3. **Make changes** to frontend or backend code

4. **Push to trigger pipelines**
   ```bash
   git push origin develop
   ```

5. **Monitor progress** in GitHub Actions tab

### CD Pipeline

1. **Prerequisites**
   ```bash
   # Verify ArgoCD is installed
   kubectl get namespace argocd
   
   # Verify cluster access
   kubectl cluster-info
   ```

2. **Deploy App of Apps**
   ```bash
   kubectl apply -f gitops-helm-repo/argocd/app-of-apps.yaml
   ```

3. **Monitor deployment**
   ```bash
   # Watch applications
   kubectl get applications -n argocd -w
   
   # Check pods
   kubectl get pods -n konecta-dev
   ```

4. **Access ArgoCD UI**
   ```bash
   # Port forward
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   
   # Get admin password
   kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
   
   # Open https://localhost:8080
   ```

### Repository Structure

```
konecta-erp-gitops/
├── gitops-helm-repo/
│   ├── argocd/
│   │   ├── app-of-apps.yaml          # Parent application
│   │   ├── apps/                     # Child applications
│   │   │   ├── konecta-erp-dev.yaml
│   │   │   ├── konecta-erp-prod.yaml
│   │   │   ├── external-secrets.yaml
│   │   │   └── konecta-ingress.yaml
│   │   ├── ingress/                  # Ingress manifests
│   │   ├── secrets/                  # External Secrets
│   │   ├── image-updater-config.yaml
│   │   └── konecta-project.yaml
│   └── charts/
│       └── erp/                       # Helm umbrella chart
│           ├── Chart.yaml
│           ├── values.yaml            # Dev values
│           ├── values-prod.yaml       # Prod values
│           └── templates/              # Helm templates
├── CI-documentation.md                # CI documentation
└── CI-CD-documentation.md             # This file
```

## Configuration

### CI Pipeline Secrets

Configure these in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret | Description | Example | Required For |
|--------|-------------|---------|--------------|
| `DOCKER_USERNAME` | Docker Hub username | `your-dockerhub-user` | Both Pipelines |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_xxxxx` | Both Pipelines |
| `SONAR_TOKEN` | SonarQube authentication token | `squ_xxxxx` | Both Pipelines |
| `SONAR_URL` | SonarQube server URL | `https://sonar.example.com` | Both Pipelines |
| `AWS_ACCESS_KEY_ID` | AWS access key for ECR | `AKIAIOSFODNN7EXAMPLE` | Both Pipelines |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for ECR | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | Both Pipelines |

### CD Pipeline Configuration

#### ArgoCD Access

**Repository Access:**
- ArgoCD must have read access to Git repository
- Configure repository credentials in ArgoCD:
  ```bash
  argocd repo add https://github.com/Abdu-khaled/konecta-erp-gitops.git \
    --type git \
    --username <git-username> \
    --password <git-token>
  ```

**ECR Access:**
- Image Updater needs ECR pull credentials
- Create Kubernetes secret:
  ```bash
  kubectl create secret docker-registry ecr-credentials \
    --docker-server=712416034227.dkr.ecr.us-east-1.amazonaws.com \
    --docker-username=AWS \
    --docker-password=$(aws ecr get-login-password --region us-east-1) \
    -n argocd
  ```

#### Image Updater Git Access

Image Updater needs write access to Git repository:

1. **Create Git token** with repo write permissions
2. **Create Kubernetes secret**:
   ```bash
   kubectl create secret generic git-credentials \
     --from-literal=username=<git-username> \
     --from-literal=password=<git-token> \
     -n argocd
   ```
3. **Configure in Image Updater** (see image-updater-secret.yaml)

### Environment Variables

| Variable | Default | Description | Pipeline |
|----------|---------|-------------|----------|
| `JAVA_VERSION` | `21` | Java SDK version for backend services | Backend CI |
| `NODE_VERSION` | `18` | Node.js version for frontend | Frontend CI |
| `ECR_REGISTRY` | `712416034227.dkr.ecr.us-east-1.amazonaws.com` | AWS ECR registry | Both CI |
| `AWS_REGION` | `us-east-1` | AWS region | Both CI |

### Trigger Conditions

| Event | Frontend | Backend | Description |
|-------|----------|---------|-------------|
| **Push** | `frontend/**` changes | `backend/**` changes | Automatic trigger on code changes |
| **Pull Request** | `frontend/**` changes | `backend/**` changes | Quality checks before merge |
| **Manual Dispatch** | - | - | Manual trigger via GitHub UI |

## Monitoring & Reports

### CI Pipeline Monitoring

#### GitHub Integration

| Feature | Description | Location |
|---------|-------------|----------|
| **Security Tab** | All SARIF reports automatically uploaded | Repository > Security |
| **Actions Tab** | Visual workflow execution and logs | Repository > Actions |
| **Artifacts** | Downloadable reports and build outputs | Workflow run > Artifacts |

#### Generated Artifacts

**Security Reports (30-90 day retention):**
- **Gitleaks SARIF**: Secret scanning results (Backend only)
- **Trivy SARIF**: Dependency and container vulnerability reports
- **SBOM Files**: Software Bill of Materials in SPDX format (90-day retention)

**Build Artifacts (7-day retention):**
- **Frontend**: Angular build output, test results, coverage reports
- **Backend**: JAR files, .NET artifacts, test results, coverage reports

**Docker Images:**
- **Format**: `712416034227.dkr.ecr.us-east-1.amazonaws.com/konecta-{component}:{version}`
- **Versioning**: `{branch}-{short-sha}` or `{tag}` for releases
- **Latest**: Automatically tagged on main branch pushes

### CD Pipeline Monitoring

#### ArgoCD UI

**Application Status:**
- **Healthy**: All resources synced and healthy
- **Progressing**: Deployment in progress
- **Degraded**: Some resources unhealthy
- **Suspended**: Application sync suspended
- **Unknown**: Status cannot be determined

**Access ArgoCD UI:**
```bash
# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Or via ingress
https://argocd.konectasync.me
```

#### Application Health

ArgoCD monitors:
- **Deployment health**: Replica availability
- **Pod status**: Running, Pending, Failed
- **Service availability**: Endpoint readiness
- **Resource sync status**: Git vs cluster state

#### Image Updater Logs

```bash
# Check Image Updater logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater

# Check for image update events
kubectl get events -n argocd --field-selector involvedObject.name=argocd-image-updater
```

#### Kubernetes Monitoring

```bash
# Check application pods
kubectl get pods -n konecta-dev
kubectl get pods -n konecta-prod

# Check services
kubectl get svc -n konecta-dev

# Check ingress
kubectl get ingress -n konecta-dev

# View logs
kubectl logs -n konecta-dev -l app=gateway-service
```

### Quality Gates

#### CI Pipeline

**Security Scanning:**
- **FAIL**: Critical vulnerabilities detected
- **WARN**: High-severity vulnerabilities (varies by tool)

**Docker Security:**
- **FAIL**: Critical vulnerabilities in container image
- **WARN**: 
  - Frontend: Image size > 500MB
  - Backend: Image size > 1GB

**Code Quality:**
- **FAIL**: SonarQube quality gate not met

**Testing:**
- **FAIL**: Any unit or integration test fails
- **PASS**: All tests pass or no tests exist

#### CD Pipeline

**Sync Status:**
- **Synced**: Cluster state matches Git
- **OutOfSync**: Drift detected
- **Unknown**: Cannot determine status

**Health Status:**
- **Healthy**: All resources healthy
- **Degraded**: Some resources unhealthy
- **Progressing**: Deployment in progress

## Troubleshooting

### CI Pipeline Issues

#### Pipeline Fails on Secret Scan (Backend)
```yaml
Cause: Exposed credentials in code
Solution:
  - Review Gitleaks report in artifacts
  - Remove or rotate exposed credentials
  - Add false positives to .gitleaksignore
```

#### Docker Push to ECR Fails
```yaml
Cause: Authentication or permissions issues
Solution:
  - Verify AWS credentials in GitHub Secrets
  - Check ECR repository exists
  - Verify IAM permissions for ECR push
  - Check AWS region configuration
```

#### Dependency Scan Timeout
```yaml
Cause: Large dependency tree or network issues
Solution:
  - Check internet connectivity
  - Consider increasing timeout
  - Review dependency count
```

### CD Pipeline Issues

#### Application Stuck in "Progressing"
```bash
# Check application status
argocd app get konecta-erp-dev

# Check pods
kubectl get pods -n konecta-dev

# Check events
kubectl get events -n konecta-dev --sort-by='.lastTimestamp'

# Describe failing pod
kubectl describe pod <pod-name> -n konecta-dev
```

#### Image Updater Not Updating Images
```bash
# Check Image Updater logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater

# Verify ECR credentials
kubectl get secret ecr-credentials -n argocd

# Check Git credentials
kubectl get secret git-credentials -n argocd

# Verify image annotations
kubectl get application konecta-erp-dev -n argocd -o yaml | grep image-updater
```

#### ArgoCD Sync Fails
```bash
# Check sync status
argocd app get konecta-erp-dev

# Force sync
argocd app sync konecta-erp-dev --prune --force

# Check repository access
argocd repo list

# Verify Helm chart
helm template test . --values values.yaml
```

#### Ingress Not Creating ALB
```bash
# Check ingress status
kubectl get ingress -n konecta-dev

# Check ALB Controller logs
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller

# Verify IAM role for ALB Controller
kubectl get sa aws-load-balancer-controller -n kube-system -o yaml

# Check for errors
kubectl describe ingress konecta-ingress -n konecta-dev
```

#### External Secrets Not Working
```bash
# Check External Secrets Operator
kubectl get pods -n external-secrets-system

# Check ExternalSecret status
kubectl get externalsecret -n konecta-prod

# Check ClusterSecretStore
kubectl get clustersecretstore

# Verify IAM role
kubectl get sa external-secrets -n external-secrets-system -o yaml

# Check logs
kubectl logs -n external-secrets-system -l app.kubernetes.io/name=external-secrets
```

#### RDS Connection Issues
```bash
# Check pod logs
kubectl logs -n konecta-dev -l app=auth-service

# Verify RDS endpoint
kubectl get configmap -n konecta-dev -o yaml | grep RDS

# Test connectivity from pod
kubectl exec -it -n konecta-dev <pod-name> -- nc -zv <rds-endpoint> 5432

# Check security groups (Cloud Team)
# Verify RDS is accessible from EKS nodes
```

### Debugging Steps

1. **Check Logs**: Review ArgoCD, Image Updater, and application logs
2. **Verify Configuration**: Check Helm values, ArgoCD applications, and annotations
3. **Test Locally**: Render Helm charts locally to verify configuration
4. **Check Resources**: Verify pods, services, ingress, and secrets exist
5. **Network Connectivity**: Test connectivity to RDS, ECR, and other services
6. **IAM Permissions**: Verify IAM roles and policies for service accounts

## Metrics & KPIs

### CI Pipeline Metrics

**Pipeline Health:**
- **Execution Time**: Average time per stage and overall
- **Success Rate**: Percentage of successful pipeline runs
- **Failure Rate**: Most common failure points
- **Resource Usage**: CPU, memory, and storage utilization

**Security Metrics:**
- **Vulnerability Detection**: Number of issues found per scan
- **Time to Fix**: Average time to resolve security issues
- **Coverage**: Percentage of code covered by security scans

**Quality Metrics:**
- **Code Coverage**: Test coverage percentage
- **Quality Gate**: SonarQube quality gate pass rate
- **Technical Debt**: Code quality trends over time

### CD Pipeline Metrics

**Deployment Metrics:**
- **Deployment Frequency**: Number of deployments per day/week
- **Lead Time**: Time from code commit to production
- **Mean Time to Recovery (MTTR)**: Average time to recover from failures
- **Change Failure Rate**: Percentage of deployments causing incidents

**Application Health:**
- **Pod Availability**: Percentage of pods in Running state
- **Service Uptime**: Service availability percentage
- **Error Rate**: Application error rate
- **Response Time**: Average response time

**GitOps Metrics:**
- **Sync Success Rate**: Percentage of successful ArgoCD syncs
- **Drift Detection**: Number of times cluster drifts from Git
- **Image Update Frequency**: How often images are updated
- **Rollback Frequency**: Number of rollbacks per period

## Roadmap

### Planned CI Features
- [ ] **Integration Testing**: Add Testcontainers for service integration tests
- [ ] **Performance Testing**: Include load and stress testing stages
- [ ] **Chaos Engineering**: Add failure injection testing
- [ ] **Multi-Environment CI**: Support for staging and production builds

### Planned CD Features
- [ ] **Progressive Deployment**: Implement blue-green or canary deployments
- [ ] **Automated Rollback**: Implement rollback on health check failure
- [ ] **Multi-Cluster Deployment**: Support for multiple Kubernetes clusters
- [ ] **Advanced Monitoring**: Add Prometheus/Grafana integration
- [ ] **Cost Optimization**: Implement resource right-sizing automation
- [ ] **Disaster Recovery**: Automated backup and restore procedures

### Security Enhancements
- [ ] **SAST Integration**: Add static application security testing
- [ ] **DAST Integration**: Add dynamic application security testing
- [ ] **License Compliance**: Add license scanning and compliance checks
- [ ] **Secrets Rotation**: Implement automated secret rotation
- [ ] **Network Policies**: Implement Kubernetes network policies
- [ ] **Pod Security Policies**: Enforce pod security standards

## Best Practices

### CI Pipeline

**Development:**
1. **Commit Messages**: Use clear, descriptive messages for better change tracking
2. **Branch Strategy**: Use feature branches with descriptive names
3. **Code Quality**: Maintain high test coverage and code standards
4. **Dependencies**: Regularly update to avoid security vulnerabilities

**Security:**
1. **Secret Management**: Never commit secrets to repository
2. **Dependency Updates**: Keep all dependencies current
3. **Image Security**: Use minimal base images and scan regularly
4. **Access Control**: Limit Docker Hub, ECR, and SonarQube access

**Performance:**
1. **Build Optimization**: Use multi-stage Docker builds
2. **Caching**: Leverage GitHub Actions caching features
3. **Parallel Execution**: Design services for independent builds
4. **Resource Management**: Monitor and optimize build times

### CD Pipeline

**GitOps:**
1. **Git as Source of Truth**: All changes must go through Git
2. **Immutable Infrastructure**: Never make manual changes to cluster
3. **Version Control**: Tag releases and maintain changelog
4. **Pull Request Reviews**: Require reviews for production changes

**Deployment:**
1. **Environment Parity**: Keep dev and prod as similar as possible
2. **Gradual Rollouts**: Use canary or blue-green deployments
3. **Health Checks**: Implement comprehensive health checks
4. **Rollback Plan**: Always have a rollback strategy

**Security:**
1. **Secrets Management**: Use External Secrets, never commit secrets
2. **RBAC**: Implement least-privilege access control
3. **Network Policies**: Restrict pod-to-pod communication
4. **Image Scanning**: Scan images before deployment

**Monitoring:**
1. **Observability**: Implement comprehensive logging and monitoring
2. **Alerting**: Set up alerts for critical issues
3. **Dashboards**: Create dashboards for key metrics
4. **Incident Response**: Document and practice incident response

## Support & Maintenance

### Getting Help

1. **Documentation**: Review this documentation and inline comments
2. **Logs**: Check ArgoCD, Image Updater, and application logs
3. **ArgoCD UI**: Use ArgoCD UI for visual debugging
4. **Issues**: Create GitHub issues for bugs or feature requests
5. **Cloud Team**: Contact Cloud Team for infrastructure issues

### Maintenance Tasks

**Daily:**
- Monitor ArgoCD application health
- Review failed deployments
- Check for image update issues

**Weekly:**
- Review security scan results and address critical issues
- Check for ArgoCD sync issues
- Review resource utilization

**Monthly:**
- Update dependencies and base images
- Review and update Helm chart versions
- Audit IAM roles and permissions
- Review and optimize resource limits

**Quarterly:**
- Review and update quality gate thresholds
- Evaluate and update ArgoCD configuration
- Review disaster recovery procedures
- Cost optimization review

**Annually:**
- Evaluate and update pipeline tools and versions
- Review and update security policies
- Conduct disaster recovery drills
- Review and update documentation

---

<div align="center">

**Konecta ERP System CI/CD Pipelines**

*Enterprise-grade automation for modern development and deployment*

**Version**: 1.0 | **Last Updated**: December 2025 | **Maintainer**: DevOps Team

[![Pipeline Status](https://img.shields.io/badge/Pipeline-Enterprise%20Ready-brightgreen)](https://github.com/konecta/erp-system/actions)
[![Security](https://img.shields.io/badge/Security-Scanning%20Enabled-red)](https://github.com/konecta/erp-system/security)
[![Quality](https://img.shields.io/badge/Quality-SonarQube%20Integrated-blue)](https://sonarcloud.io)
[![GitOps](https://img.shields.io/badge/GitOps-ArgoCD-blue)](https://argo-cd.readthedocs.io/)

</div>
