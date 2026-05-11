-- Depends on patients and admissions.
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    admission_id UUID NOT NULL,
    model_version TEXT NOT NULL,
    risk_score NUMERIC(5,4) NOT NULL,
    risk_bucket TEXT,
    shap_values JSONB,
    top_features JSONB,
    predicted_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT fk_predictions_patient
    FOREIGN KEY (patient_id)
    REFERENCES patients(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_predictions_admission
    FOREIGN KEY (admission_id)
    REFERENCES admissions(id)
    ON DELETE CASCADE,

    CONSTRAINT chk_risk_score
    CHECK (risk_score BETWEEN 0 AND 1)
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_predictions_patient_id
    ON predictions(patient_id);

CREATE INDEX IF NOT EXISTS idx_predictions_admission_id
    ON predictions(admission_id);

CREATE INDEX IF NOT EXISTS idx_predictions_predicted_at
    ON predictions(predicted_at);