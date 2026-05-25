package com.rrm.api;

import com.rrm.domain.Prediction;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record PredictionResponse(
        UUID id,
        UUID patientId,
        UUID admissionId,
        String modelVersion,
        BigDecimal riskScore,
        String riskBucket,
        OffsetDateTime predictedAt,
        boolean cached,
        List<Map<String, Object>> topFeatures
) {
    public static PredictionResponse from(Prediction p) {
        return new PredictionResponse(
                p.getId(), p.getPatientId(), p.getAdmissionId(),
                p.getModelVersion(), p.getRiskScore(), p.getRiskBucket(),
                p.getPredictedAt(), true, null);
    }

    @SuppressWarnings("unchecked")
    public static PredictionResponse from(Prediction p, Map<String, Object> mlResult) {
        return new PredictionResponse(
                p.getId(), p.getPatientId(), p.getAdmissionId(),
                p.getModelVersion(), p.getRiskScore(), p.getRiskBucket(),
                p.getPredictedAt(), false,
                (List<Map<String, Object>>) mlResult.get("top_features"));
    }
}
