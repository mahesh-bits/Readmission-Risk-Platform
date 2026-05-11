CREATE MATERIALIZED VIEW IF NOT EXISTS mv_patient_admission_features AS
SELECT
    p.id AS patient_id,
    a.id AS admission_id,
    p.sex,
    date_part('year', age(a.admit_ts, p.dob))::int AS age,

    -- ✅ Portable JSON object key count (works everywhere)
    (
        SELECT COUNT(*)
        FROM jsonb_each(
                COALESCE(p.chronic_conditions, '{}'::jsonb)
             )
    ) AS chronic_condition_count,

    a.length_of_stay,
    a.readmitted_30d,
    a.admit_ts

FROM patients p
         JOIN admissions a
              ON a.patient_id = p.id;

-- ✅ Required for CONCURRENT refresh
CREATE UNIQUE INDEX IF NOT EXISTS
    ux_mv_patient_admission_features_admission
    ON mv_patient_admission_features(admission_id);