-- Add clinical fields to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS diagnosis TEXT,
ADD COLUMN IF NOT EXISTS los INTEGER;
