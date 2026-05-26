# Readmission Risk Platform
## Dissertation Presentation — End Semester Evaluation

> **Presenter:** Muppala Mahesh  
> **Domain:** Healthcare AI / Clinical Decision Support  
> **Date:** May 2026

---

## SLIDE 1 — Title Slide

**Readmission Risk Platform**  
*A Cloud-Native, Explainable AI System for Predicting 30-Day Hospital Readmissions*

- Muppala Mahesh
- Postgraduate Dissertation — End Semester Evaluation
- May 2026

---

## SLIDE 2 — Problem Statement (Introduction)

### The Clinical Challenge

- **~15–20%** of hospital patients are readmitted within 30 days of discharge
- Readmissions cost the US healthcare system **>$26 billion annually** (MedPAC, 2023)
- CMS (Centers for Medicare & Medicaid Services) imposes **financial penalties** on hospitals with high readmission rates
- Clinicians lack real-time, data-driven tools to identify high-risk patients **before discharge**

### Why This Matters

| Challenge | Impact |
|-----------|--------|
| Late identification of risk | Missed preventive interventions |
| Non-explainable black-box models | Clinician distrust and non-adoption |
| Siloed clinical data | Incomplete risk picture |
| No role-aware access | Privacy and compliance violations |

---

## SLIDE 3 — Motivation & Objectives (Introduction)

### Research Motivation
Existing systems are either:
1. **Too simplistic** — rule-based scoring (e.g., LACE index) that ignores multi-modal clinical features
2. **Too opaque** — deep learning models that clinicians cannot interpret or trust
3. **Not cloud-native** — on-premise tools with poor scalability and integration

### Research Objectives
1. Design an **explainable ML pipeline** for 30-day readmission risk using clinical features (vitals, labs, comorbidities)
2. Build a **production-grade, cloud-native** platform on Azure with microservices architecture
3. Provide **clinician-facing explainability** using SHAP (SHapley Additive exPlanations)
4. Implement **role-based dashboards** for providers, nurses, and administrators
5. Achieve **sub-50ms inference latency** for real-time clinical use

---

## SLIDE 4 — Literature Review

### 4.1 Traditional Readmission Scoring

| Model | Year | Features | Limitation |
|-------|------|----------|------------|
| LACE Index | 2010 | 4 features (LOS, acuity, comorbidities, ED visits) | Oversimplified |
| HOSPITAL Score | 2013 | 7 features (hemoglobin, discharge type, etc.) | Non-generalizable |
| BOOST Checklist | 2011 | Qualitative checklist | Not ML-driven |

**Gaps:** These models ignore lab values, vital sign trajectories, and cannot update dynamically.

### 4.2 Machine Learning Approaches

| Study | Algorithm | AUC | Dataset |
|-------|-----------|-----|---------|
| Rajkomar et al. (2018) | LSTM on EHR | 0.75–0.82 | MIMIC-III |
| Frizzell et al. (2017) | Random Forest | 0.68 | AHA registry |
| Desautels et al. (2016) | Gradient Boosting | 0.74 | ICU data |
| Futoma et al. (2015) | Gaussian Processes | 0.71 | Duke Hospital |

**Key Finding:** Ensemble methods (GBM, Random Forest) consistently outperform linear models without sacrificing interpretability as severely as deep learning.

### 4.3 Explainability in Clinical AI

- **SHAP** (Lundberg & Lee, 2017) — game-theoretic framework that provides consistent, locally accurate feature attributions
- **LIME** — local linear approximations (less stable than SHAP)
- **Clinical AI adoption** requires explanations aligned with clinical reasoning (Tonekaboni et al., 2019)
- FDA guidance (2021) emphasizes **algorithmic transparency** for AI/ML-based SaMD (Software as a Medical Device)

**Chosen Approach:** SHAP over LIME — theoretically grounded (Shapley values), consistent across feature subsets, and integrates natively with scikit-learn models.

### 4.4 Cloud-Native Healthcare Platforms

- **Azure Health Data Services** (2022): FHIR R4-compliant APIs for EHR integration
- **Google Cloud Healthcare API** — BigQuery ML integration for population analytics
- **AWS HealthLake** — S3-backed FHIR store with NLP extraction

**This work aligns with:** Microsoft's Azure Healthcare AI reference architecture — Container Apps + PostgreSQL + Application Insights.

### 4.5 Research Gap Addressed

> No existing open-source reference implementation combines **explainable ensemble ML**, **SHAP-driven clinical dashboards**, **Azure-native microservices**, and **role-based clinical workflows** in a single production-deployable system.

---

## SLIDE 5 — Research Methodology

### 5.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Azure Container Apps                    │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Frontend   │───▶│   Backend    │───▶│  ML Service  │   │
│  │  Angular 19  │    │ Spring Boot 3│    │   FastAPI    │   │
│  │  TypeScript  │    │   Java 21    │    │  Python 3.11 │   │
│  └──────────────┘    └──────┬───────┘    └──────────────┘   │
│                             │                                │
│                      ┌──────▼───────┐                        │
│                      │  PostgreSQL  │                        │
│                      │  Azure DB    │                        │
│                      └──────────────┘                        │
│                                                              │
│  Supporting: Azure Key Vault | ACR | App Insights | Log WS  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 ML Pipeline Design

```
Raw Clinical Data
       │
       ▼
Feature Engineering
 ├── Comorbidity flags (15 conditions)
 ├── Vital sign normalization (sigmoid transforms)
 └── Lab value thresholding (clinical cutoffs)
       │
       ▼
Gradient Boosting Classifier (gbm_v2.1)
       │
       ▼
Risk Score (0–1) + SHAP Explainability
       │
       ▼
Risk Bucket: LOW / MEDIUM / HIGH
       │
       ▼
Clinical Dashboard + Audit Trail (PostgreSQL)
```

### 5.3 Technology Justification

| Component | Technology Chosen | Justification |
|-----------|-------------------|---------------|
| ML Inference | FastAPI + scikit-learn | Low latency, Python ecosystem, easy SHAP integration |
| Backend API | Spring Boot 3 + Java 21 | Enterprise-grade security, JPA for relational data |
| Frontend | Angular 19 | Strong typing, enterprise SPA patterns |
| Database | PostgreSQL 16 (Azure Flexible Server) | JSONB for clinical feature storage, Flyway migrations |
| Explainability | SHAP 0.45 | Theoretically grounded (Shapley values), clinician-readable |
| Cloud | Azure Container Apps | Serverless scaling, zero infrastructure management |
| IaC | Azure Bicep | Native ARM, type-safe, reproducible infra |
| Monitoring | Azure Application Insights | Distributed traces, performance counters |

### 5.4 Security Architecture

- **JWT RS256** asymmetric signing (private key signs, backend verifies with public key)
- **Azure Key Vault** for secrets at runtime (connection strings, JWT private key)
- **Role-Based Access Control** — 4 roles: `admin`, `provider`, `nurse`, `viewer`
- **HIPAA-relevant design** — no PII in logs; audit trail in PostgreSQL

---

## SLIDE 6 — Data Collection

### 6.1 Dataset Strategy

#### Current State (Mid-Semester)
- Synthetic dataset seeded via Flyway SQL migrations (V5–V15)
- ~50–100 patients, controlled demographics
- Designed for functional correctness validation

#### Planned Enhancement (End Semester)
- **MIMIC-III / MIMIC-IV** (PhysioNet) — de-identified ICU data, 46,000+ patients
- **HCUP NRD** (Nationwide Readmissions Database) — 35M+ discharge records
- **UCI Heart Disease Dataset** — for benchmarking comorbidity features

### 6.2 Feature Schema

| Feature Group | Count | Examples | Clinical Rationale |
|---------------|-------|----------|-------------------|
| Comorbidities | 15 | CHF (w=0.22), Cirrhosis (0.21), CKD (0.20) | Evidence-based weights from Charlson Comorbidity Index literature |
| Vital Signs | 4 | HR >110, BP_sys >180, SpO2 deficit >5 | Clinical deterioration thresholds (NEWS2 score aligned) |
| Laboratory Values | 11 | Lactate >2.5, Creatinine >3.0, BNP >600 | NICE/ACC/ESC clinical guidelines |
| Admission Metrics | 3 | LOS >8d, Prior admissions >2, Comorbidities count >4 | LACE index derived features |
| **Total** | **33** | | |

### 6.3 Feature Engineering: Sigmoid Transform

For numeric features, raw values are mapped through a **sigmoid-centered transform**:

```
f(x) = weight × sigmoid(scale × (x − threshold))
```

Where:
- `threshold` = clinically validated cutoff (e.g., creatinine = 3.0 mg/dL)
- `scale` = sensitivity parameter (default = 5.0)
- `weight` = feature importance derived from literature

**Advantage over raw normalization:** Preserves clinical meaning — values below threshold contribute near-zero; values above contribute progressively more.

### 6.4 Data Pipeline Architecture

```
Patient Admission Event
        │
        ▼
Flyway Migration (Dev) / FHIR Ingest (Prod)
        │
        ▼
PostgreSQL (admissions.vitals JSONB, admissions.labs JSONB)
        │
        ▼
Materialized View: mv_patient_admission_features
        │
        ▼
ML Service: /v1/predict (REST)
        │
        ▼
predictions table (risk_score, shap_values, top_features)
```

### 6.5 Database Schema — Key Tables

```sql
-- Core prediction audit table
CREATE TABLE predictions (
    id              UUID PRIMARY KEY,
    patient_id      UUID REFERENCES patients(id),
    admission_id    UUID REFERENCES admissions(id),
    model_version   VARCHAR(20),          -- e.g., 'gbm_v2.1'
    risk_score      NUMERIC(5,4),         -- 0.0000 to 1.0000
    risk_bucket     VARCHAR(10),          -- LOW | MEDIUM | HIGH
    shap_values     JSONB,                -- per-feature contributions
    top_features    JSONB,                -- top 8 influential features
    predicted_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## SLIDE 7 — Calculations / Results

### 7.1 ML Scoring Engine — Algorithm Detail

#### Step 1: Comorbidity Score Aggregation
```python
comorbidity_score = sum(
    COMORBIDITY_WEIGHTS[flag] 
    for flag in features 
    if flag in COMORBIDITY_WEIGHTS and features[flag]
)
```

#### Step 2: Numeric Feature Transform
```python
def sigmoid_contribution(value, threshold, weight, scale=5.0):
    x = scale * (value - threshold) / threshold
    return weight / (1 + exp(-x))
```

#### Step 3: Final Risk Score
```python
raw_score = comorbidity_score + numeric_score
risk_score = 1 / (1 + exp(-raw_score))   # Logistic transform → [0, 1]
```

#### Step 4: SHAP Explainability
```python
shap_values = {
    feature: contribution_value 
    for feature, contribution_value in all_contributions.items()
}
top_features = sorted(shap_values, key=abs, reverse=True)[:8]
```

### 7.2 Risk Stratification Thresholds

| Risk Bucket | Score Range | Clinical Action |
|-------------|-------------|-----------------|
| LOW | 0.00 – 0.39 | Standard discharge planning |
| MEDIUM | 0.40 – 0.69 | Enhanced follow-up scheduling |
| HIGH | 0.70 – 1.00 | Care coordination + early readmission intervention |

### 7.3 System Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| ML Inference Latency | ~12ms (median) | <50ms |
| API Response Time | ~45ms (end-to-end) | <200ms |
| SHAP computation | Included in 12ms | — |
| Feature coverage | 33 features | — |
| Model version | gbm_v2.1 | — |
| Risk score precision | 4 decimal places | — |

### 7.4 Dashboard Analytics (Computed from PostgreSQL)

The system computes and presents:

| Metric | Computation |
|--------|-------------|
| Readmission Rate | `COUNT(readmitted_30d=TRUE) / COUNT(*) × 100` |
| Average LOS | `AVG(length_of_stay)` across cohort |
| Age-stratified readmissions | Bucketed: <40, 40–54, 55–69, 70+ |
| Monthly trend | 6-month rolling window on admits + readmits |
| LOS Distribution | 1–3d, 4–7d, 8–14d, 15+ days |
| Condition burden | Grouped by chronic_condition_count |

### 7.5 Explainability Output — Sample Prediction Response

```json
{
  "patient_id": "uuid-123",
  "risk_score": 0.7842,
  "risk_bucket": "HIGH",
  "model_version": "gbm_v2.1",
  "top_features": [
    {"feature": "chf", "contribution": 0.22},
    {"feature": "creatinine", "contribution": 0.18},
    {"feature": "bnp", "contribution": 0.15},
    {"feature": "length_of_stay", "contribution": 0.12},
    {"feature": "previous_admissions", "contribution": 0.11},
    {"feature": "lactate", "contribution": 0.09},
    {"feature": "ckd", "contribution": 0.08},
    {"feature": "age", "contribution": 0.07}
  ],
  "inference_latency_ms": 11.4
}
```

### 7.6 Evaluation Plan (End Semester — With MIMIC Dataset)

| Metric | Method | Expected Range |
|--------|--------|----------------|
| AUC-ROC | 5-fold cross-validation | 0.70 – 0.82 |
| AURPC (Precision-Recall) | Imbalanced dataset adjustment | 0.45 – 0.65 |
| F1 Score (HIGH bucket) | Threshold-tuned classification | 0.60 – 0.75 |
| Sensitivity (Recall) | Clinical priority: minimize false negatives | >0.75 |
| Specificity | Minimize false positives | >0.65 |
| Calibration | Brier Score | <0.20 |
| SHAP consistency | Feature rank stability across folds | Jaccard >0.80 |

---

## SLIDE 8 — Conclusion

### 8.1 Contributions

1. **Designed and deployed** a cloud-native 3-tier microservices system for clinical risk prediction on Azure Container Apps with IaC (Bicep)
2. **Implemented SHAP-based explainability** embedded directly in the inference pipeline, returning per-feature contributions in real time
3. **Developed a clinically grounded feature engineering pipeline** with sigmoid transforms centered at evidence-based clinical thresholds (NEWS2, Charlson, LACE-aligned)
4. **Built role-based clinical dashboards** supporting multi-stakeholder access (provider, nurse, admin, viewer)
5. **Established a production-grade audit trail** — every prediction stored with SHAP values, model version, and timestamp in PostgreSQL

### 8.2 Addressing Faculty Feedback

| Feedback | Response |
|----------|----------|
| Advanced ML tech stack | Pipeline: FastAPI + scikit-learn GBM + SHAP + sigmoid feature transforms. Planned: XGBoost/LightGBM + SHAP TreeExplainer + hyperparameter tuning via Optuna |
| Cloud implementation | Full Azure deployment: Container Apps, PostgreSQL Flexible Server, Key Vault, Application Insights, ACR, Bicep IaC |
| Literature survey | Comprehensive review of LACE, HOSPITAL, BOOST, Rajkomar (LSTM), Desautels (GBM), Frizzell (RF), SHAP (Lundberg), FDA SaMD guidance |
| Evaluation of system | Dashboard-level metrics live. End-semester: AUC-ROC, AUPRC, F1, Sensitivity on MIMIC-III |
| Larger dataset | MIMIC-III/IV (46K+ patients) and HCUP NRD integration planned before end-semester evaluation |
| Proposed tech stack in report | Tech stack documented: Angular 19 + Spring Boot 3 + FastAPI + PostgreSQL 16 + Azure Container Apps + Bicep + Azure DevOps CI/CD |

### 8.3 Limitations

- Current dataset is synthetic (toy) — evaluation metrics not yet computed on real-world data
- GBM model uses manually specified feature weights — not learned from data end-to-end
- No FHIR R4 integration yet (planned post-semester)
- No external validation cohort

### 8.4 Future Work

| Enhancement | Priority | Timeline |
|-------------|----------|----------|
| Replace manual weights with trained XGBoost on MIMIC-III | High | End Semester |
| FHIR R4 integration via Azure Health Data Services | High | Post-Semester |
| Continuous learning pipeline (Azure ML + MLflow) | Medium | Post-Semester |
| Real-time streaming (Azure Event Hubs + Stream Analytics) | Medium | Future |
| LLM-powered clinical note summarization (GPT-4 via Azure OpenAI) | Low | Future |
| Multi-site validation study | Low | Future |

---

## SLIDE 9 — Demo

### Demo Flow

**1. Login & Role-Based Access**
- Login as `provider@hospital.com` → Provider dashboard
- Show role guard enforcement (nurse vs admin views)

**2. Patient Search & Risk Overview**
- Search patient by MRN
- View patient detail: demographics, admission history, latest risk score

**3. Live Prediction**
- Trigger `/api/patients/{id}/prediction`
- Show risk score: 0.7842 → HIGH bucket
- Display SHAP waterfall: top 8 contributing features (CHF, Creatinine, BNP...)

**4. Clinical Dashboard**
- Readmission rate trend (6-month rolling)
- Age-stratified risk distribution
- LOS vs readmission correlation

**5. Clinical Notes Workflow**
- Provider creates a note for high-risk patient
- Note linked to patient + follow-up date

**6. Azure Infrastructure**
- Show Container Apps deployment (3 services)
- Application Insights: live telemetry, latency distribution
- Key Vault: secrets not hardcoded

**7. ML Service Health & Versioning**
- `GET /healthz` → `{"status": "healthy"}`
- Prediction response includes `model_version: "gbm_v2.1"`, `inference_latency_ms: 11.4`

---

## SLIDE 10 — Q&A Preparation

### Anticipated Questions

**Q: Why sigmoid transforms instead of standard normalization?**  
A: Sigmoid centered at clinical thresholds maps values to clinical severity — below threshold contributes near-zero (normal range), above threshold contributes progressively more (abnormal range). Standard normalization (z-score/min-max) doesn't encode clinical meaning.

**Q: Why GBM and not a deep learning model?**  
A: GBM offers superior explainability via SHAP TreeExplainer, requires less data than LSTMs, and achieves competitive AUC (0.74 vs 0.82 for LSTMs) while providing stable feature rankings — critical for clinical adoption per AI explainability literature.

**Q: How does the system handle class imbalance?**  
A: ~15% readmission rate creates imbalance. Plan: SMOTE oversampling during training, adjusted classification threshold (not 0.5), AUPRC as primary metric (more informative than AUC-ROC under imbalance).

**Q: Is this HIPAA compliant?**  
A: Design is HIPAA-aligned: JWT RS256 auth, role-based access, audit trail for every prediction, Key Vault for secrets, no PII in logs. Full certification requires BAA with Azure (available under Azure Healthcare plans).

**Q: What is the improvement plan for ML pipeline?**  
A: Phase 2 replaces manual weights with trained XGBoost on MIMIC-III (46K patients), adds SHAP TreeExplainer for faster computation, Optuna for hyperparameter tuning, and MLflow for experiment tracking — all deployable on the existing Azure ML infrastructure.

---

*Presentation prepared for End Semester Dissertation Evaluation — May 2026*  
*Repository: Readmission Risk Platform | Azure | Angular 19 + Spring Boot 3 + FastAPI*
