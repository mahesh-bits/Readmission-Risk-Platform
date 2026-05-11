-- Sample seed data (safe for dev/demo)

-- =========================
-- Patients
-- =========================
INSERT INTO patients (
    id, mrn, first_name, last_name, dob, sex, chronic_conditions, created_at
) VALUES
      (
          '11111111-1111-1111-1111-111111111111',
          'MRN1001',
          'Amit',
          'Sharma',
          '1968-02-14',
          'M',
          '{"diabetes": true, "hypertension": true}',
          now() - interval '6 months'
      ),
      (
          '22222222-2222-2222-2222-222222222222',
          'MRN1002',
          'Neha',
          'Verma',
          '1985-11-09',
          'F',
          '{"asthma": true}',
          now() - interval '4 months'
      ),
      (
          '33333333-3333-3333-3333-333333333333',
          'MRN1003',
          'Rakesh',
          'Rao',
          '1956-06-21',
          'M',
          '{"ckd": true, "cad": true}',
          now() - interval '8 months'
      ),
      (
          '44444444-4444-4444-4444-444444444444',
          'MRN1004',
          'Sneha',
          'Iyer',
          '1992-04-02',
          'F',
          '{"obesity": true}',
          now() - interval '3 months'
      );


-- =========================
-- Admissions
-- =========================
INSERT INTO admissions (
    id, patient_id, admit_ts, discharge_ts,
    primary_dx, length_of_stay, vitals, labs
) VALUES
      (
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          '11111111-1111-1111-1111-111111111111',
          now() - interval '45 days',
          now() - interval '40 days',
          'Diabetic ketoacidosis',
          5,
          '{"hr": 108, "bp": "158/96"}',
          '{"glucose": 410}'
      ),
      (
          'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          '22222222-2222-2222-2222-222222222222',
          now() - interval '32 days',
          now() - interval '30 days',
          'Asthma exacerbation',
          2,
          '{"hr": 94, "spo2": 93}',
          '{"wbc": 10.8}'
      );

-- =========================
-- Predictions
-- =========================
INSERT INTO predictions (
    id, patient_id, admission_id,
    model_version, risk_score, risk_bucket,
    shap_values, top_features, predicted_at
) VALUES
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'gbm_v1.2',
        0.87,
        'HIGH',
        '{"diabetes": 0.32, "glucose": 0.29}',
        '["diabetes","glucose"]',
        now() - interval '41 days'
    );

-- Dashboard

-- SELECT risk_bucket, COUNT(*) FROM predictions GROUP BY risk_bucket;



-- Patient detail page

-- SELECT * FROM admissions WHERE patient_id = 'p0001-0000-0000-0000-000000000001';



-- Explanation UI

-- SELECT shap_values, top_features

-- FROM predictions

-- WHERE admission_id = 'a1001-0000-0000-0000-000000000001';