CREATE UNIQUE INDEX IF NOT EXISTS ux_mv_patient_admission_features_admission
    ON mv_patient_admission_features(admission_id);