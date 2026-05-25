-- V14: add provider_id to admissions and establish provider-patient relationship

ALTER TABLE admissions
  ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES app_users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_admissions_provider_id ON admissions(provider_id);

-- Assign providers round-robin by admission order across the 4 provider accounts
WITH numbered_providers AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY email) - 1) AS idx
  FROM app_users
  WHERE role = 'provider'
),
provider_count AS (
  SELECT COUNT(*) AS cnt FROM app_users WHERE role = 'provider'
),
numbered_admissions AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY admit_ts) - 1) AS idx
  FROM admissions
)
UPDATE admissions a
SET provider_id = (
  SELECT np.id
  FROM numbered_providers np, provider_count pc
  WHERE np.idx = (na.idx % pc.cnt)
)
FROM numbered_admissions na
WHERE a.id = na.id;

REFRESH MATERIALIZED VIEW CONCURRENTLY mv_patient_admission_features;
