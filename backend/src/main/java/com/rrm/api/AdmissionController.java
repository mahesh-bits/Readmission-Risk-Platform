package com.rrm.api;

import com.rrm.repo.AdmissionRepo;
import com.rrm.service.PredictionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/admissions")
public class AdmissionController {

    private final AdmissionRepo admissionRepo;
    private final PredictionService predictionService;

    public AdmissionController(AdmissionRepo admissionRepo, PredictionService predictionService) {
        this.admissionRepo     = admissionRepo;
        this.predictionService = predictionService;
    }

    @GetMapping("/{admissionId}/prediction")
    public ResponseEntity<PredictionResponse> getPrediction(@PathVariable UUID admissionId) {
        var admission = admissionRepo.findById(admissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admission not found"));
        return ResponseEntity.ok(predictionService.getOrCompute(admission));
    }
}
