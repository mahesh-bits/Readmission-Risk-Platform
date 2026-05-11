-- Repeatable Flyway script (re-runs automatically when changed)

REFRESH MATERIALIZED VIEW CONCURRENTLY mv_patient_admission_features;
