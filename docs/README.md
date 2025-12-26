# Konecta ERP - Setup & Usage Guide

This file explains how to start the project, what to install, how to create the first admin, and how roles map to the main APIs.

## 1. Prerequisites

You can run everything with Docker, which is the easiest option. For local development you may also want the language runtimes and IDE tooling.

- Docker Desktop (with Docker Compose)
- PostgreSQL 14+ running on your machine
- Git

Optional for development:

- Java 21 and Maven (or the included mvnw) for the Spring Boot microservices
- Node.js 18+ for the Angular frontend
- .NET 8 SDK for the reporting service
- An IDE with Docker / Java / C# / Angular extensions

## 2. Quick start with Docker

1. Clone the repository and go to its root folder.
2. Make sure PostgreSQL is running and create databases:
   - auth_service
   - hr_service
   - finance_service
   - inventory_service
   - reporting_service
3. Open the .env file in the root and set:
   - SMTP settings for sending emails
   - Optional AI URLs
   - The registration URL base (usually http://localhost:4200/register)
4. From the project root run:
   - docker-compose up --build
5. When all containers are up:
   - Frontend: http://localhost:4200
   - Auth service: http://localhost:8089/api/auth
   - HR: http://localhost:8088/api/hr
   - Finance: http://localhost:8087/api/finance
   - Inventory: http://localhost:8086/api/inventory
   - Reporting: http://localhost:5160

## 3. Creating the first admin user

The auth-service controls users and roles. There is no open self-registration, so you must seed one admin user in the users table.

1. Start the auth-service (via Docker or Maven) so it creates the schema in the auth_service database.
2. Choose an admin email and password.
3. Generate a BCrypt hash for the password (for example using a small temporary Java program that calls BCryptPasswordEncoder.encode(...) or any trusted BCrypt generator).
4. Using your SQL client, insert a row into the users table with:
   - username and email set to the admin email
   - password set to the BCrypt hash
   - role = ADMIN
   - status = ACTIVE
   - otp_verified = TRUE
5. Restart the stack if needed, then log in in the UI with that email and password. This user will have full admin permissions and can invite other users from the UI.

## 4. Roles and authorization overview

Roles are defined in backend/auth-service/src/main/java/auth_service/model/Role.java.

- ADMIN: full access; manage users and roles; can invite users.
- HR: HR module; employees, departments, attendance, leaves, training.
- FINANCE: finance module; accounts, invoices, expenses, payroll.
- EMPLOYEE: own data; attendance, leaves, performance, expenses, payroll.
- INVENTORY: inventory module; items, warehouses, stock movements.
- IT_OPERATION, OPERATIONS, SALES_ONLY: ops/sales/reporting oriented roles, mainly used in reporting and audit APIs.

Main API base paths:

- Auth: /api/auth/...
- HR: /api/hr/...
- Finance: /api/finance/...
- Inventory: /api/inventory/...
- Reporting: /api/reporting/...

Typical authorization patterns (from @PreAuthorize in controllers):

- User management (/api/auth/users/**): ADMIN, HR
- Role changes (/api/auth/users/{id}/role): ADMIN
- HR employee and department management: ADMIN, HR (with some FINANCE and EMPLOYEE views)
- Finance expenses and payroll: ADMIN, FINANCE, plus limited EMPLOYEE and HR access
- Inventory stock and items: ADMIN, INVENTORY
- Reporting: combinations of ADMIN, MANAGER, HR, FINANCE, EMPLOYEE, INVENTORY, IT_OPERATION, SALES_ONLY, OPERATIONS

For complete endpoint lists and payloads, refer to docs/APIs.pdf and the other architecture PDFs in this folder.

