-- Creates the base entity table.

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mrn TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE,
    sex TEXT,
    chronic_conditions JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
    );

CREATE INDEX IF NOT EXISTS idx_patients_mrn
    ON patients(mrn);

CREATE INDEX IF NOT EXISTS idx_patients_created_at
    ON patients(created_at);