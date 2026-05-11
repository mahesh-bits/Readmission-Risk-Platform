-- Depends on patients.

CREATE TABLE IF NOT EXISTS admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    admit_ts TIMESTAMPTZ NOT NULL,
    discharge_ts TIMESTAMPTZ,
    primary_dx TEXT,
    length_of_stay INT,
    vitals JSONB,
    labs JSONB,

    CONSTRAINT fk_admissions_patient
    FOREIGN KEY (patient_id)
    REFERENCES patients(id)
    ON DELETE CASCADE
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admissions_patient_id
    ON admissions(patient_id);

CREATE INDEX IF NOT EXISTS idx_admissions_admit_ts
    ON admissions(admit_ts);