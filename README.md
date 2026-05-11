
# Readmission Risk Platform

This iteration upgrades the starter to include:

- **Angular 17 workspace (scaffold)** with real modules/components and an API service
- **Spring Boot** with **Flyway migrations** and **JWT (RS256) scaffolding**
- **ML FastAPI** with App Insights (optional) telemetry hooks
- **Azure Application Insights** SDK/agent configuration
- **Expanded Bicep** for ACR, Container Apps, PostgreSQL Flexible Server, Key Vault, App Insights
- **Azure DevOps YAML** updated with container app secret wiring hooks

> This repository is a *template*; some values are placeholders. Replace secrets and resource names before deploying.

## Local quickstart
```bash
docker compose up --build -d
# UI: http://localhost:8080
# API: http://localhost:8081
# ML : http://localhost:8082
```

---
## Directory structure
```
readmission-risk-platform-iter2/
├─ frontend/            # Angular 17 scaffold (build in Docker)
├─ backend/             # Spring Boot 3 + Flyway + JWT RS256 (scaffold)
├─ ml-service/          # FastAPI inference (mock) + telemetry hook
├─ infra/               # Bicep + Azure DevOps pipelines
├─ docker-compose.yml
└─ .env.example
```

## JWT (RS256) — development only
- Set `JWT_PUBLIC_KEY_PATH` (backend) to a path with your **public** key (PEM). For local quick runs, a **placeholder** key file is provided at `backend/keys/dev-public.pem` (DO NOT use in prod).
- For issuing tokens locally during development, use `keys/dev-private.pem` (again, **dev only**). In production, issue tokens via your Identity Provider and store **only the public key** in Key Vault.

## Application Insights
- **Backend (Java)**: configured to use the agent or SDK if `APPLICATIONINSIGHTS_CONNECTION_STRING` is set.
- **ML (Python)**: when `AI_CONNECTION_STRING` is set, custom events will be sent.
- **Frontend**: uses `@microsoft/applicationinsights-web` if `APPINSIGHTS_CONNECTION_STRING` is present in `assets/config.json`.

## Deploy on Azure (high level)
1. Run `infra/pipelines/azure-devops/infra-deploy.yml` pipeline to provision shared resources (ACR, Container Apps Env, Key Vault, App Insights, Postgres FS).
2. Upload **JWT public key**, Postgres secrets to **Key Vault**.
3. Run `frontend.yml`, `backend.yml`, `ml-service.yml` to build, push, and deploy Container Apps.
4. Configure **Container App secrets** to reference Key Vault (see pipeline steps comments).
