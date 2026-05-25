-- V15: clinical notes per patient

CREATE TABLE clinical_notes (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id     UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id    UUID                 REFERENCES app_users(id) ON DELETE SET NULL,
  note_type      VARCHAR(50) NOT NULL DEFAULT 'Progress Note',
  priority       VARCHAR(20) NOT NULL DEFAULT 'Routine',
  note_text      TEXT        NOT NULL,
  follow_up_date DATE,
  has_attachment BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clinical_notes_patient  ON clinical_notes(patient_id);
CREATE INDEX idx_clinical_notes_provider ON clinical_notes(provider_id);

-- Seed: 3 notes per patient for the first 10 patients (ordered by last name)
INSERT INTO clinical_notes (patient_id, provider_id, note_type, priority, note_text, follow_up_date, has_attachment)
SELECT p.id, a.provider_id,
  'Progress Note', 'Routine',
  'Patient is stable. Vitals within normal limits. Continue current medication regimen and monitor daily labs.',
  CURRENT_DATE + 7, FALSE
FROM (SELECT id FROM patients ORDER BY last_name LIMIT 10) p
JOIN LATERAL (
  SELECT provider_id FROM admissions
  WHERE patient_id = p.id AND provider_id IS NOT NULL
  ORDER BY admit_ts DESC LIMIT 1
) a ON TRUE;

INSERT INTO clinical_notes (patient_id, provider_id, note_type, priority, note_text, follow_up_date, has_attachment)
SELECT p.id, a.provider_id,
  'Discharge Summary', 'Routine',
  'Patient discharged in stable condition. Reviewed discharge instructions. Follow-up appointment scheduled. Patient verbalized understanding of medications and warning signs.',
  CURRENT_DATE + 14, TRUE
FROM (SELECT id FROM patients ORDER BY last_name LIMIT 8) p
JOIN LATERAL (
  SELECT provider_id FROM admissions
  WHERE patient_id = p.id AND provider_id IS NOT NULL
  ORDER BY admit_ts DESC LIMIT 1
) a ON TRUE;

INSERT INTO clinical_notes (patient_id, provider_id, note_type, priority, note_text, follow_up_date, has_attachment)
SELECT p.id, a.provider_id,
  'Consult Note', 'Urgent',
  'Specialist consult placed due to elevated readmission risk indicators. Patient requires close monitoring. Recommend 72-hour follow-up with care team.',
  CURRENT_DATE + 3, FALSE
FROM (SELECT id FROM patients ORDER BY last_name OFFSET 2 LIMIT 5) p
JOIN LATERAL (
  SELECT provider_id FROM admissions
  WHERE patient_id = p.id AND provider_id IS NOT NULL
  ORDER BY admit_ts DESC LIMIT 1
) a ON TRUE;

INSERT INTO clinical_notes (patient_id, provider_id, note_type, priority, note_text, follow_up_date, has_attachment)
SELECT p.id, a.provider_id,
  'Follow-up Note', 'Routine',
  'Post-discharge follow-up completed. Patient reports improved symptoms. No signs of deterioration. Medication adherence confirmed. Next follow-up in 4 weeks.',
  CURRENT_DATE + 28, FALSE
FROM (SELECT id FROM patients ORDER BY last_name OFFSET 1 LIMIT 6) p
JOIN LATERAL (
  SELECT provider_id FROM admissions
  WHERE patient_id = p.id AND provider_id IS NOT NULL
  ORDER BY admit_ts DESC LIMIT 1
) a ON TRUE;

INSERT INTO clinical_notes (patient_id, provider_id, note_type, priority, note_text, follow_up_date, has_attachment)
SELECT p.id, a.provider_id,
  'Nursing Note', 'Critical',
  'Patient status deteriorating. Increased respiratory distress noted. Physician notified immediately. Patient transferred to step-down unit for closer monitoring.',
  CURRENT_DATE + 1, TRUE
FROM (SELECT id FROM patients ORDER BY last_name OFFSET 4 LIMIT 3) p
JOIN LATERAL (
  SELECT provider_id FROM admissions
  WHERE patient_id = p.id AND provider_id IS NOT NULL
  ORDER BY admit_ts DESC LIMIT 1
) a ON TRUE;
