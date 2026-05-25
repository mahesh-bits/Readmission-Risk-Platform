package com.rrm.service;

import com.rrm.api.PredictionResponse;
import com.rrm.domain.Admission;
import com.rrm.domain.Patient;
import com.rrm.domain.Prediction;
import com.rrm.repo.PatientRepo;
import com.rrm.repo.PredictionRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PredictionService {

    private final PredictionRepo predictionRepo;
    private final PatientRepo patientRepo;
    private final RestClient restClient;

    public PredictionService(
            PredictionRepo predictionRepo,
            PatientRepo patientRepo,
            @Value("${ML_BASE_URL:http://localhost:8082}") String mlBaseUrl) {
        this.predictionRepo = predictionRepo;
        this.patientRepo    = patientRepo;
        this.restClient     = RestClient.builder().baseUrl(mlBaseUrl).build();
    }

    public PredictionResponse getOrCompute(Admission admission) {
        return predictionRepo.findLatestByAdmissionId(admission.getId())
                .map(p -> PredictionResponse.from(p))
                .orElseGet(() -> computeAndSave(admission));
    }

    @SuppressWarnings("unchecked")
    private PredictionResponse computeAndSave(Admission admission) {
        Patient patient = patientRepo.findById(admission.getPatientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        @SuppressWarnings("unchecked")
        Map<String, Object> mlResult = (Map<String, Object>) restClient.post()
                .uri("/v1/predict")
                .body(Map.of("features", buildFeatures(patient, admission)))
                .retrieve()
                .body(Map.class);

        Prediction prediction = new Prediction();
        prediction.setPatientId(admission.getPatientId());
        prediction.setAdmissionId(admission.getId());
        prediction.setModelVersion((String) mlResult.getOrDefault("model_version", "unknown"));
        prediction.setRiskScore(new BigDecimal(mlResult.get("risk_score").toString()));
        prediction.setRiskBucket((String) mlResult.get("risk_bucket"));
        prediction.setPredictedAt(OffsetDateTime.now());
        predictionRepo.save(prediction);

        return PredictionResponse.from(prediction, mlResult);
    }

    private Map<String, Object> buildFeatures(Patient patient, Admission admission) {
        Map<String, Object> f = new HashMap<>();
        if (patient.getAge()            != null) f.put("age",            patient.getAge());
        if (admission.getLengthOfStay() != null) f.put("length_of_stay", admission.getLengthOfStay());
        if (admission.getPrimaryDx()    != null) f.put("primary_dx",     admission.getPrimaryDx());
        if (patient.getDiagnosis()      != null) f.put("diagnosis",      patient.getDiagnosis());
        return f;
    }
}
