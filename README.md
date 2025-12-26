# Konecta ERP System

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI/CD Status](https://img.shields.io/badge/CI%2FCD-Automated-brightgreen)](docs/CI-CD.md)
[![Infrastructure](https://img.shields.io/badge/Infrastructure-AWS%20EKS-orange)](infrastructure/terraform/README.md)
[![Frontend](https://img.shields.io/badge/Frontend-Angular%2017-red)](frontend/erp-ui)
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%20%2B%20.NET-blue)](backend)

> **Enterprise-grade ERP system with cloud-native microservices architecture, comprehensive CI/CD pipelines, and GitOps-based deployment on AWS.**

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Microservices](#microservices)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

Konecta ERP System is a modern, cloud-native Enterprise Resource Planning platform designed to streamline business operations across multiple domains including Human Resources, Finance, Inventory, and Operations Management. Built with a microservices architecture, it provides scalability, resilience, and flexibility for enterprise-scale deployments.

### Key Highlights

- **Cloud-Native**: Deployed on AWS EKS with Fargate for serverless container execution
- **Enterprise Security**: Multi-layer security with JWT authentication, RBAC, secret scanning, and vulnerability management
- **Comprehensive Modules**: HR, Finance, Inventory, Operations, and Reporting
- **AI/ML Integration**: AI-powered document processing and predictive analytics
- **GitOps Ready**: Automated deployments with ArgoCD and Helm charts
- **CI/CD Pipelines**: Automated testing, quality gates, and security scanning
- **Multi-Region Support**: Disaster recovery with cross-region read replicas
- **Observable**: Integrated monitoring, logging, and alerting with CloudWatch

## Architecture

### Infrastructure Architecture

- **VPC**: Multi-AZ deployment with public/private subnets
- **EKS Cluster**: Kubernetes 1.32 with Fargate serverless execution
- **RDS**: PostgreSQL 15.8 with cross-region read replicas
- **ECR**: Private container registries for all microservices
- **Secrets Manager**: Secure credential and configuration management
- **CloudWatch**: Comprehensive monitoring and alerting
- **ALB**: Application Load Balancer with SSL/TLS termination
- **Route53**: DNS management and traffic routing

## Technology Stack

### Frontend
- **Framework**: Angular 17
- **Styling**: Tailwind CSS
- **Build Tool**: Angular CLI
- **HTTP Client**: RxJS
- **State Management**: Signals (Angular 17+)
- **Testing**: Jasmine + Karma

### Backend
- **Java Services**: Spring Boot 3.5.6, Java 21
- **.NET Service**: ASP.NET Core 8.0, C# 12
- **API Gateway**: Spring Cloud Gateway
- **Service Discovery**: Netflix Eureka
- **Configuration**: Spring Cloud Config Server
- **Security**: Spring Security + JWT
- **Database**: PostgreSQL 15.8
- **ORM**: JPA/Hibernate (Java), Entity Framework Core (.NET)
- **Testing**: JUnit 5, Mockito, xUnit

### Infrastructure & DevOps
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes (AWS EKS)
- **IaC**: Terraform 1.0+
- **CI/CD**: GitHub Actions
- **GitOps**: ArgoCD + Helm
- **Registry**: AWS ECR
- **Cloud Provider**: AWS (EKS, RDS, ECR, ALB, Route53, Secrets Manager)
- **Monitoring**: AWS CloudWatch, Prometheus-compatible

### Security & Quality
- **Secret Scanning**: Gitleaks
- **Dependency Scanning**: Trivy
- **Code Quality**: SonarQube
- **Container Scanning**: Trivy
- **SBOM Generation**: SPDX format
- **Authentication**: JWT + OAuth2
- **Authorization**: Role-Based Access Control (RBAC)

## Features

### Core Modules

#### Authentication & Authorization (Auth Service)
- JWT-based authentication with refresh tokens
- Role-based access control (ADMIN, HR, FINANCE, INVENTORY, EMPLOYEE)
- OTP verification for secure registration
- Email-based user invitations
- Password reset and account management
- Multi-tenant support ready

#### Human Resources (HR Service)
- **Employee Management**: Complete employee lifecycle management
- **Leave Management**: Leave requests, approvals, and balance tracking
- **Training & Development**: Training programs, enrollments, and certification generation
- **Performance Management**: Appraisals and performance tracking
- **Recruitment**: Job postings and applicant tracking
- **AI Integration**: AI-powered HR workflows via webhook integration

#### Finance (Finance Service)
- **Invoice Management**: Create, send, and track invoices
- **Expense Management**: Employee expense submission and approval workflow
- **Payroll Processing**: Automated payroll calculations and account management
- **Financial Accounts**: Multi-card type support (Debit, Credit, Savings)
- **Import/Export**: Excel and CSV import for bulk data operations
- **AI Extraction**: Automated invoice data extraction via AI webhook

#### Inventory (Inventory Service)
- **Item Management**: SKU-based inventory tracking
- **Warehouse Management**: Multi-warehouse support
- **Stock Movements**: IN, OUT, and ADJUST movement types
- **Low Stock Alerts**: Automated reorder level monitoring
- **Real-time Tracking**: Current stock levels across warehouses
- **Reporting**: Stock level reports and movement history

#### Reporting & Analytics (Reporting Service - .NET)
- **Activity Feed**: Real-time system activity tracking
- **Business Intelligence**: Cross-module reporting
- **PDF Generation**: QuestPDF-based report generation
- **Excel Export**: EPPlus-based data exports
- **Dashboard Metrics**: Key performance indicators

#### Infrastructure Services
- **Gateway Service**: Centralized API routing and load balancing
- **Discovery Server**: Eureka-based service registration and discovery
- **Config Server**: Centralized configuration management

## Microservices

### Service Details

| Service | Technology | Port | Database | Purpose |
|---------|-----------|------|----------|---------|
| **auth-service** | Java 21 + Spring Boot | 8081 | auth_service | Authentication & Authorization |
| **hr-service** | Java 21 + Spring Boot | 8082 | hr_service | Human Resources Management |
| **finance-service** | Java 21 + Spring Boot | 8083 | finance_service | Financial Operations |
| **inventory-service** | Java 21 + Spring Boot | 8084 | inventory_service | Inventory & Warehouse Management |
| **gateway-service** | Java 21 + Spring Cloud | 8080 | - | API Gateway & Routing |
| **discovery-server** | Java 21 + Eureka | 8761 | - | Service Discovery |
| **config-server** | Java 21 + Spring Cloud | 8888 | - | Configuration Management |
| **reporting-service** | .NET 8.0 + ASP.NET Core | 5000 | reporting_service | Reporting & Analytics |
| **erp-ui** | Angular 17 + Nginx | 4200/80 | - | Frontend Application |

## Getting Started

### Prerequisites

- **Docker**: 20.10+ with Docker Compose
- **Node.js**: 18+ (for frontend development)
- **Java**: 21+ (for backend development)
- **.NET SDK**: 8.0+ (for reporting service)
- **Maven**: 3.8+ (for Java services)
- **PostgreSQL**: 15+ (if running locally without Docker)
- **Git**: Latest version

### Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abdu-khaled/Konecta-ERP-System.git
   cd Konecta-ERP-System
   ```

2. **Configure environment variables**
   ```bash
   # Create .env file from template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

   Required environment variables:
   ```env
   # SMTP Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_AUTH=true
   SMTP_STARTTLS=true
   SMTP_SSL=false
   MAIL_FROM=noreply@konecta.com
   
   # Application URLs
   REGISTRATION_URL_BASE=http://localhost:4200
   CHATBOT_URL=http://localhost:5000
   
   # AI Webhooks (Optional)
   AI_WEBHOOK_URL=https://your-ai-webhook-url
   AI_EXTRACTION_URL=https://your-extraction-webhook
   AI_EXTRACTION_BEARER=your-bearer-token
   
   # RabbitMQ (Optional)
   RABBITMQ_USER=guest
   RABBITMQ_PASS=guest
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - **Frontend**: http://localhost:4200
   - **API Gateway**: http://localhost:8080
   - **Discovery Server**: http://localhost:8761
   
5. **Create PostgreSQL databases** (if not using Docker for DB)
   ```sql
   CREATE DATABASE auth_service;
   CREATE DATABASE hr_service;
   CREATE DATABASE finance_service;
   CREATE DATABASE inventory_service;
   CREATE DATABASE reporting_service;
   ```

### Default Credentials

Initial admin user will be created automatically. Check auth-service logs for credentials or configure via environment variables.

## Development

### Frontend Development

```bash
cd frontend/erp-ui
npm install
npm start
```

Frontend will be available at `http://localhost:4200` with hot-reload enabled.

### Backend Development (Java Services)

```bash
cd backend
mvn clean install
cd auth-service
mvn spring-boot:run
```

Repeat for each service you want to run locally.

### Reporting Service Development (.NET)

```bash
cd backend/reporting-service/ReportingService
dotnet restore
dotnet run
```

### Running Tests

**Frontend:**
```bash
cd frontend/erp-ui
npm test
```

**Backend (Java):**
```bash
cd backend
mvn test
```

**Reporting Service (.NET):**
```bash
cd backend/reporting-service/ReportingService
dotnet test
```

## Deployment

### CI/CD Pipeline

The project includes comprehensive CI/CD pipelines with:

- **Frontend CI**: Angular build, test, security scanning, Docker image creation
- **Backend CI**: Multi-language support, parallel builds, code quality gates
- **Security Scanning**: Gitleaks (secrets), Trivy (dependencies & containers), SonarQube (code quality)
- **Automated Deployment**: GitOps with ArgoCD and Helm charts

See [CI/CD Documentation](docs/CI-CD.md) for detailed information.

### Infrastructure Deployment

**Using Terraform:**

```bash
cd infrastructure/terraform/environments/dev/us-east-1

# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan

# Apply infrastructure
terraform apply
```

See [Infrastructure Documentation](infrastructure/terraform/README.md) for detailed deployment instructions.

### Kubernetes Deployment

**Using Helm Charts:**

```bash
# Add Helm repository (if applicable)
helm repo add konecta-erp https://charts.konecta.com
helm repo update

# Install ERP system
helm install konecta-erp konecta-erp/erp-system \
  --namespace production \
  --create-namespace \
  --values values-production.yaml
```

### GitOps with ArgoCD

Applications are automatically deployed using ArgoCD:

1. Push changes to Git repository
2. ArgoCD detects changes
3. Automatic synchronization to Kubernetes cluster
4. Image updater automatically updates container versions

## Documentation

- **[CI/CD Pipelines](docs/CI-CD.md)**: Comprehensive CI/CD documentation with pipeline architecture
- **[Infrastructure](infrastructure/terraform/README.md)**: Terraform modules and deployment guides
- **[Frontend Guide](frontend/README.md)**: Angular application documentation
- **[Backend Guide](backend/README.md)**: Microservices documentation
- **[AI/ML Components](ai-ml/README.md)**: AI integration documentation
- **[API Documentation](docs/API.md)**: REST API endpoints and usage (Coming Soon)

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- **Frontend**: Follow Angular style guide
- **Backend**: Follow Spring Boot and .NET best practices
- **Testing**: Maintain >80% code coverage
- **Documentation**: Update relevant documentation with changes
- **Security**: Never commit secrets or sensitive data

## Security

- All secrets managed via AWS Secrets Manager
- JWT tokens with refresh token rotation
- HTTPS/TLS encryption in transit
- Database encryption at rest
- Regular security scanning in CI/CD
- RBAC for fine-grained access control

To report security vulnerabilities, please email security@konecta.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Spring Boot and Spring Cloud teams
- Angular team
- AWS for cloud infrastructure
- Open-source community for amazing tools and libraries

## Support

- **Issues**: [GitHub Issues](https://github.com/Abdu-khaled/Konecta-ERP-System/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Abdu-khaled/Konecta-ERP-System/discussions)
- **Documentation**: [docs/](docs/)

---

**Built with love by the Konecta Team**

