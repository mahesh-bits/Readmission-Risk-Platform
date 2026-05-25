
package com.rrm.repo;

import com.rrm.domain.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PredictionRepo extends JpaRepository<Prediction, UUID> {

  @Query("SELECT p FROM Prediction p WHERE p.patientId = :patientId ORDER BY p.predictedAt DESC LIMIT 1")
  Optional<Prediction> findLatestByPatientId(@Param("patientId") UUID patientId);

  @Query(value = """
      SELECT DISTINCT ON (patient_id) *
      FROM predictions
      WHERE patient_id IN :patientIds
      ORDER BY patient_id, predicted_at DESC
      """, nativeQuery = true)
  List<Prediction> findLatestPerPatient(@Param("patientIds") List<UUID> patientIds);
}
