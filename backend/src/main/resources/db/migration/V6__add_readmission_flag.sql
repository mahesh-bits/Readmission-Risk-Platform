-- Adds readmission labeling (critical for ML)

ALTER TABLE admissions
    ADD COLUMN IF NOT EXISTS readmitted_30d BOOLEAN;

UPDATE admissions a
SET readmitted_30d = EXISTS (
    SELECT 1
    FROM admissions a2
    WHERE a2.patient_id = a.patient_id
      AND a2.admit_ts > a.discharge_ts
      AND a2.admit_ts <= a.discharge_ts + interval '30 days'
);


--This creates your ground‑truth label for supervised learning.