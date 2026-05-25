# Readmission Risk Platform

A cloud-native healthcare platform that predicts 30-day hospital readmission risk using machine learning. It provides role-based clinical dashboards, patient risk scoring with explainability (SHAP), and full Azure deployment via Container Apps and DevOps pipelines.

> **Note:** This repository uses placeholder secrets and resource names. Replace all secrets before deploying to production.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Services](#services)
  - [Frontend (Angular 19)](#frontend-angular-19)
  - [Backend (Spring Boot 3)](#backend-spring-boot-3)
  - [ML Service (FastAPI)](#ml-service-fastapi)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Database Schema](#database-schema)
- [Security (JWT RS256)](#security-jwt-rs256)
- [Monitoring (Azure Application Insights)](#monitoring-azure-application-insights)
- [Azure Deployment](#azure-deployment)
- [CI/CD Pipelines](#cicd-pipelines)
- [Infrastructure as Code (Bicep)](#infrastructure-as-code-bicep)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Cloud                          │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐  ┌─────────────┐  │
│  │  Frontend    │   │   Backend    │  │ ML Service  │  │
│  │  Angular 19  │──▶│ Spring Boot 3│─▶│  FastAPI    │  │
│  │  NGINX/IIS   │   │  Port 8081   │  │  Port 8082  │  │
│  │  Port 8080   │   └──────┬───────┘  └─────────────┘  │
│  └──────────────┘          │                            │
│                     ┌──────▼───────┐                    │
│                     │  PostgreSQL  │                    │
│                     │  (Flexible   │                    │
│                     │   Server)    │                    │
│                     └──────────────┘                    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Key Vault   │  │  App Insights│  │     ACR      │  │
│  │  (Secrets)   │  │ (Monitoring) │  │  (Images)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

All three services run as **Azure Container Apps** in production and as **Docker Compose** services locally.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Angular, TypeScript | 19 / 5.8 |
| Backend | Spring Boot, Java | 3.2.4 / 21 |
| ML Service | FastAPI, Python | 0.110 / 3.11 |
| Database | PostgreSQL | 16 |
| ML Library | scikit-learn, SHAP | 1.4.1 / 0.45 |
| Monitoring | Azure Application Insights | — |
| Container Orchestration | Docker Compose / Azure Container Apps | — |
| Infrastructure as Code | Bicep | — |
| CI/CD | Azure DevOps YAML Pipelines | — |
| Security | JWT RS256, Spring Security | — |

---

## Project Structure

```
readmission-risk-platform/
├─ frontend/                    # Angular 19 SPA
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ core/               # Auth service, API service, interceptors, guards
│  │  │  ├─ features/
│  │  │  │  ├─ auth/            # Login, profile, callback
│  │  │  │  ├─ patient/         # Patient search, detail, encounters, documents, notes
│  │  │  │  ├─ provider/        # Provider dashboard, patient panel, risk scores, clinical notes
│  │  │  │  └─ admin/           # User management, roles, consents, audit logs
│  │  │  ├─ app.component.ts    # Root component with role-based navigation
│  │  │  └─ app.routes.ts       # Lazy-loaded feature routes
│  │  └─ assets/config.json     # Runtime API endpoint configuration
│  ├─ nginx.conf                 # NGINX config for SPA routing
│  ├─ server.js                  # Optional Node.js server (for App Service)
│  ├─ web.config                 # IIS URL rewrite rules (Azure App Service)
│  └─ Dockerfile                 # Multi-stage: node:20 → nginx:alpine
│
├─ backend/                     # Spring Boot 3 REST API
│  ├─ src/main/java/com/rrm/
│  │  ├─ controller/            # REST controllers (Patient, Auth, Dashboard, Admin, Inference)
│  │  ├─ domain/                # JPA entities (Patient, Admission, Prediction, AppUser, etc.)
│  │  ├─ repo/                  # Spring Data JPA repositories
│  │  ├─ service/               # Business logic & ML proxy service
│  │  ├─ security/              # JWT filter, RS256 verification
│  │  └─ config/                # SecurityConfig, CORS, App Insights config
│  ├─ src/main/resources/
│  │  ├─ application.yaml       # Application configuration
│  │  ├─ db/migration/          # Flyway SQL migrations (V1–V15)
│  │  └─ keys/dev-public.pem    # DEV ONLY — JWT public key
│  └─ Dockerfile                 # Multi-stage: maven:3.9 → eclipse-temurin:21-jre
│
├─ ml-service/                  # FastAPI inference engine
│  ├─ app/
│  │  └─ main.py                # FastAPI app with /healthz and /v1/predict endpoints
│  ├─ requirements.txt
│  └─ Dockerfile                 # python:3.11-slim + uvicorn
│
├─ infra/
│  ├─ bicep/main.bicep          # Azure resource definitions
│  └─ pipelines/azure-devops/
│     ├─ infra-deploy.yml       # Provision shared Azure resources
│     ├─ backend.yml            # Build & deploy backend Container App
│     ├─ frontend.yml           # Build & deploy frontend Container App
│     └─ ml-service.yml         # Build & deploy ML service Container App
│
└─ docker-compose.yml           # Local orchestration (postgres, backend, ml-service)
```

---

## Local Development

### Prerequisites

- Docker Desktop (with Compose v2)
- Node.js 20+ (for frontend development outside Docker)
- Java 21 + Maven 3.9 (for backend development outside Docker)
- Python 3.11 (for ML service development outside Docker)

### Quick Start

```bash
# Clone the repo
git clone <repo-url>
cd readmission-risk-platform

# Start all services
docker compose up --build -d

# Access the apps
# UI:      http://localhost:8080
# API:     http://localhost:8081
# ML API:  http://localhost:8082
```

### Frontend Development (without Docker)

```bash
cd frontend
npm install
npm start          # Serves on http://localhost:4300
npm run build      # Production build to dist/
```

### Backend Development (without Docker)

```bash
cd backend
mvn spring-boot:run   # Requires local PostgreSQL on port 5432
```

### ML Service Development (without Docker)

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8082
```

---

## Services

### Frontend (Angular 19)

A standalone-component Angular SPA with lazy-loaded feature modules and role-based navigation.

**Routes:**

| Path | Feature | Roles |
|------|---------|-------|
| `/auth/login` | Login page | Public |
| `/patient` | Patient search & detail | All authenticated |
| `/patient/:id/encounters` | Clinical encounters | All authenticated |
| `/patient/:id/documents` | Clinical documents | All authenticated |
| `/provider/dashboard` | Provider analytics dashboard | Provider |
| `/provider/risk-scores` | Risk score panel | Provider |
| `/provider/clinical-notes` | Clinical notes | Provider |
| `/admin/users` | User management | Admin |
| `/admin/audit` | Audit logs | Admin |

**Runtime Configuration** (`frontend/src/assets/config.json`):

```json
{
  "apiBaseUrl": "https://<your-backend-url>",
  "mlServiceBaseUrl": "https://<your-ml-service-url>",
  "appInsightsConnectionString": "<optional>"
}
```

**Key services:**
- `ApiService` — loads `config.json` at startup, wraps all HTTP calls
- `AuthService` — in-memory JWT store with login/logout
- `AuthInterceptor` — attaches `Authorization: Bearer <token>` to every request
- `AuthGuard` / `RoleGuard` — protects routes by authentication and role

---

### Backend (Spring Boot 3)

A REST API that serves patient data, proxies ML predictions, and manages users.

**REST API Reference:**

| Controller | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| PatientController | GET | `/api/patients` | List patients (filter by `provider_id`) |
| PatientController | GET | `/api/patients/{id}` | Patient detail with latest admission & prediction |
| PatientController | GET | `/api/patients/{id}/encounters` | Clinical encounters |
| PatientController | GET | `/api/patients/{id}/documents` | Clinical documents |
| InferenceController | POST | `/api/inference/predict` | Proxy prediction to ML service |
| AuthController | POST | `/api/auth/login` | Login — returns JWT |
| DashboardController | GET | `/api/dashboard` | Stats: admissions, readmission rate, trends |
| AdminController | GET/POST/PUT/DELETE | `/api/admin/users` | User CRUD |
| AdminController | GET | `/api/admin/roles` | Available roles |
| AdminController | GET | `/api/admin/consents` | Consent records (stub) |
| AdminController | GET | `/api/admin/audit` | Audit log (stub) |

**Domain Entities:**

| Entity | Key Fields |
|--------|-----------|
| Patient | mrn, name, dob, sex, diagnosis, length_of_stay |
| Admission | patient_id, admit_ts, discharge_ts, primary_dx, provider_id |
| Prediction | patient_id, admission_id, risk_score (0–1), risk_bucket (LOW/MEDIUM/HIGH), model_version |
| AppUser | id, name, email, role, active |
| Encounter | patient_id, encounter type, date |
| Document | patient_id, document type, content |
| ClinicalNote | patient_id, note text, author |

---

### ML Service (FastAPI)

A Python inference engine that computes 30-day readmission risk using a clinical risk model with SHAP explainability.

**Endpoints:**

```
GET  /healthz
     → { "status": "ok" }

POST /v1/predict
     Request:  { "features": { <clinical features> } }
     Response: { "risk_score": 0.73, "risk_bucket": "HIGH",
                 "shap": { ... }, "top_features": [...], "latency_ms": 12 }
```

**Risk Thresholds:**

| Bucket | Score Range |
|--------|------------|
| HIGH | ≥ 0.70 |
| MEDIUM | 0.40 – 0.69 |
| LOW | < 0.40 |

**Clinical Feature Groups:**

| Type | Features |
|------|---------|
| Comorbidities | CHF, CKD, Cirrhosis, Cancer, COPD, CAD, Stroke, Diabetes, AF, Hypertension, etc. |
| Vitals | age, heart_rate, bp_systolic, spo2_deficit |
| Labs | lactate, creatinine, BNP, glucose, troponin, WBC, pCO2, potassium, HbA1c, INR |
| Admission | length_of_stay, previous_admissions, comorbidities_count |

---

## Configuration & Environment Variables

### Frontend (`assets/config.json`)

| Key | Description | Example |
|-----|-------------|---------|
| `apiBaseUrl` | Backend REST API base URL | `https://rrm-backend.azurewebsites.net` |
| `mlServiceBaseUrl` | ML Service base URL | `https://ml-service.<env>.azurecontainerapps.io` |
| `appInsightsConnectionString` | Azure Application Insights (optional) | `InstrumentationKey=...` |

### Backend (environment variables)

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_URL` | JDBC PostgreSQL URL | — |
| `DB_USER` | Database username | — |
| `DB_PASSWORD` | Database password | — |
| `ML_BASE_URL` | ML service base URL | `http://localhost:8082` |
| `JWT_PUBLIC_KEY_PATH` | Path to RS256 public key PEM | `classpath:keys/dev-public.pem` |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights (optional) | — |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | — |

### ML Service (environment variables)

| Variable | Description |
|----------|-------------|
| `MODEL_PATH` | Path to joblib model file (optional) |
| `AI_CONNECTION_STRING` | Azure Application Insights (optional) |

---

## Database Schema

Managed by **Flyway** with versioned migrations (`backend/src/main/resources/db/migration/`):

| Migration | Description |
|-----------|-------------|
| V1 | PostgreSQL extensions (UUID, etc.) |
| V2 | `patients` table with MRN index |
| V3 | `admissions` table |
| V4 | `predictions` table |
| V5 | Seed data |
| V6 | 30-day readmission flag |
| V7 | Materialized view `mv_patient_admission_features` |
| V8 | Unique indexes on materialized views |
| V9 | Patient clinical fields |
| V10 | Synthetic patient data |
| V11 | `encounters` and `documents` tables |
| V12 | `app_users` table with admin seed |
| V14 | Provider–patient relationships |
| V15 | `clinical_notes` table |

---

## Security (JWT RS256)

The platform uses **RS256 asymmetric JWT** for authentication.

**Development:**
- Public key: `backend/src/main/resources/keys/dev-public.pem` (loaded by default)
- Private key: `backend/keys/dev-private.pem` — for issuing dev tokens only
- **Do NOT use dev keys in production.**

**Production:**
1. Issue tokens from your Identity Provider (e.g., Azure AD, Auth0)
2. Store only the **public key** in **Azure Key Vault** as secret `JwtPublicKey`
3. Set `JWT_PUBLIC_KEY_PATH` to a mounted Key Vault secret path in the Container App

**CORS (Backend):**
Currently allows `localhost:4200`, `localhost:4300`, `localhost:3000` — update `SecurityConfig.java` to allow your production frontend domain before deploying.

---

## Monitoring (Azure Application Insights)

All three services support Application Insights telemetry:

| Service | SDK | Activation |
|---------|-----|-----------|
| Backend (Java) | `applicationinsights-agent` / SDK | Set `APPLICATIONINSIGHTS_CONNECTION_STRING` |
| ML Service (Python) | `opencensus-ext-azure` | Set `AI_CONNECTION_STRING` |
| Frontend (Angular) | `@microsoft/applicationinsights-web` | Set `appInsightsConnectionString` in `config.json` |

The Application Insights resource is connected to a **Log Analytics Workspace** provisioned by the Bicep template.

---

## Azure Deployment

### Step 1 — Provision Infrastructure

Run the `infra-deploy.yml` pipeline (or `az deployment` manually):

```bash
az deployment group create \
  --resource-group <rg> \
  --template-file infra/bicep/main.bicep \
  --parameters namePrefix=rrm location=southindia
```

This creates:
- Log Analytics Workspace
- Application Insights
- Key Vault (RBAC-enabled)
- Azure Container Registry (ACR)
- Container Apps Environment
- PostgreSQL 16 Flexible Server

### Step 2 — Store Secrets in Key Vault

```bash
# JWT public key
az keyvault secret set --vault-name <kv-name> --name JwtPublicKey --file backend/src/main/resources/keys/prod-public.pem

# Database password
az keyvault secret set --vault-name <kv-name> --name DbPassword --value "<strong-password>"

# App Insights connection string
az keyvault secret set --vault-name <kv-name> --name AppInsightsConnectionString --value "<connection-string>"
```

### Step 3 — Deploy ML Service

The ML service is the dependency for the backend. Deploy it first:

```bash
# Build and push image
az acr build --registry <acr-name> --image ml-service:latest ./ml-service

# Create Container App
az containerapp create \
  --name rrm-ml-service \
  --resource-group <rg> \
  --environment <container-apps-env> \
  --image <acr-name>.azurecr.io/ml-service:latest \
  --target-port 8082 \
  --ingress external \
  --min-replicas 1
```

Then update `mlServiceBaseUrl` in `frontend/src/assets/config.json` with the assigned URL.

### Step 4 — Deploy Backend

```bash
az acr build --registry <acr-name> --image rrm-backend:latest ./backend

az containerapp create \
  --name rrm-backend \
  --resource-group <rg> \
  --environment <container-apps-env> \
  --image <acr-name>.azurecr.io/rrm-backend:latest \
  --target-port 8081 \
  --ingress external \
  --env-vars \
      DB_URL=<jdbc-url> \
      DB_USER=appadmin \
      ML_BASE_URL=https://rrm-ml-service.<env>.<region>.azurecontainerapps.io
```

### Step 5 — Deploy Frontend

```bash
az acr build --registry <acr-name> --image rrm-frontend:latest ./frontend

az containerapp create \
  --name rrm-frontend \
  --resource-group <rg> \
  --environment <container-apps-env> \
  --image <acr-name>.azurecr.io/rrm-frontend:latest \
  --target-port 8080 \
  --ingress external
```

Update `frontend/src/assets/config.json` with the backend Container App URL:

```json
{
  "apiBaseUrl": "https://rrm-backend.<env>.<region>.azurecontainerapps.io",
  "mlServiceBaseUrl": "https://rrm-ml-service.<env>.<region>.azurecontainerapps.io",
  "appInsightsConnectionString": "<from-key-vault>"
}
```

---

## CI/CD Pipelines

Pipelines are in `infra/pipelines/azure-devops/`.

| Pipeline | Trigger | Purpose |
|----------|---------|---------|
| `infra-deploy.yml` | Manual | Provision all Azure infrastructure |
| `backend.yml` | Push to `main` (backend changes) | Build, push, deploy backend |
| `frontend.yml` | Push to `main` (frontend changes) | Build, push, deploy frontend |
| `ml-service.yml` | Push to `main` (ml-service changes) | Build, push, deploy ML service |

**Required Pipeline Variables:**

| Variable | Description |
|----------|-------------|
| `AZURE_SUBSCRIPTION` | Azure DevOps service connection name |
| `AZURE_RESOURCE_GROUP` | Target resource group |
| `AZURE_LOCATION` | Azure region (e.g., `southindia`) |
| `ACR_NAME` | Container registry name |
| `CONTAINERAPPS_ENV` | Container Apps environment name |
| `KEYVAULT_NAME` | Key Vault name for secret references |
| `POSTGRES_HOST` | PostgreSQL server hostname |
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database admin username |
| `POSTGRES_PASSWORD` | Database password (use Key Vault reference) |

---

## Infrastructure as Code (Bicep)

`infra/bicep/main.bicep` provisions all shared Azure resources:

| Resource | SKU / Tier | Notes |
|----------|-----------|-------|
| Log Analytics Workspace | PerGB2018 | 30-day retention |
| Application Insights | Web | Linked to Log Analytics |
| Key Vault | Standard (RBAC) | Stores JWT key, DB password, AppInsights string |
| Container Registry | Basic | Admin user enabled |
| Container Apps Environment | Consumption | Logs to Log Analytics |
| PostgreSQL Flexible Server | Burstable B1ms, 64GB | v16, public network, admin: `appadmin` |

**Parameters:** `namePrefix` (default: `rrm`), `location`

---

## User Roles

| Role | Access |
|------|--------|
| `admin` | Full access including user management, audit logs, roles |
| `provider` | Patient list, risk scores, clinical notes, provider dashboard |
| `nurse` | Patient detail, encounters, documents |
| `viewer` | Read-only patient and encounter data |
