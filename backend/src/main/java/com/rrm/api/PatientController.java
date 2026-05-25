package com.rrm.api;

import com.rrm.domain.Admission;
import com.rrm.domain.Patient;
import com.rrm.domain.Prediction;
import com.rrm.repo.AdmissionRepo;
import com.rrm.repo.DocumentRepo;
import com.rrm.repo.EncounterRepo;
import com.rrm.repo.PatientRepo;
import com.rrm.repo.PredictionRepo;
import com.rrm.service.PredictionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4300", "http://localhost:3000"})
public class PatientController {

  private final PatientRepo repo;
  private final AdmissionRepo admissionRepo;
  private final PredictionRepo predictionRepo;
  private final EncounterRepo encounterRepo;
  private final DocumentRepo documentRepo;
  private final PredictionService predictionService;

  public PatientController(PatientRepo repo, AdmissionRepo admissionRepo,
                           PredictionRepo predictionRepo, EncounterRepo encounterRepo,
                           DocumentRepo documentRepo, PredictionService predictionService) {
    this.repo = repo;
    this.admissionRepo = admissionRepo;
    this.predictionRepo = predictionRepo;
    this.encounterRepo = encounterRepo;
    this.documentRepo = documentRepo;
    this.predictionService = predictionService;
  }

  @GetMapping
  public List<PatientDetailResponse> list(@RequestParam(required = false) UUID providerId) {
    List<Patient> patients;
    if (providerId != null) {
      List<UUID> patientIds = admissionRepo.findPatientIdsByProvider(providerId);
      if (patientIds.isEmpty()) return List.of();
      patients = repo.findAllById(patientIds);
    } else {
      patients = repo.findAll();
    }
    if (patients.isEmpty()) return List.of();

    List<UUID> ids = patients.stream().map(Patient::getId).toList();

    Map<UUID, Admission> admissionByPatient = admissionRepo
        .findLatestPerPatient(ids)
        .stream()
        .collect(Collectors.toMap(Admission::getPatientId, a -> a));

    Map<UUID, Prediction> predictionByPatient = predictionRepo
        .findLatestPerPatient(ids)
        .stream()
        .collect(Collectors.toMap(Prediction::getPatientId, p -> p));

    return patients.stream()
        .map(p -> PatientDetailResponse.from(
            p,
            admissionByPatient.get(p.getId()),
            predictionByPatient.get(p.getId())))
        .toList();
  }

  @GetMapping("/{id}")
  public ResponseEntity<PatientDetailResponse> findById(@PathVariable UUID id) {
    return repo.findById(id)
        .map(patient -> {
          var admission  = admissionRepo.findLatestByPatientId(id).orElse(null);
          var prediction = predictionRepo.findLatestByPatientId(id).orElse(null);
          return ResponseEntity.ok(PatientDetailResponse.from(patient, admission, prediction));
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/{id}/encounters")
  public List<EncounterResponse> encounters(@PathVariable UUID id) {
    return encounterRepo.findByPatientIdOrderByDesc(id)
        .stream().map(EncounterResponse::from).toList();
  }

  @GetMapping("/{id}/documents")
  public List<DocumentResponse> documents(@PathVariable UUID id) {
    return documentRepo.findByPatientIdOrderByDesc(id)
        .stream().map(DocumentResponse::from).toList();
  }

  @GetMapping("/{id}/prediction")
  public ResponseEntity<PredictionResponse> prediction(@PathVariable UUID id) {
    var admission = admissionRepo.findLatestByPatientId(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No admission found for patient"));
    return ResponseEntity.ok(predictionService.getOrCompute(admission));
  }
}
