
package com.rrm.repo;

import com.rrm.domain.Admission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdmissionRepo extends JpaRepository<Admission, UUID> {

  @Query("SELECT a FROM Admission a WHERE a.patientId = :patientId ORDER BY a.admitTs DESC LIMIT 1")
  Optional<Admission> findLatestByPatientId(@Param("patientId") UUID patientId);

  @Query(value = "SELECT DISTINCT ON (patient_id) * FROM admissions WHERE patient_id IN :patientIds ORDER BY patient_id, admit_ts DESC", nativeQuery = true)
  List<Admission> findLatestPerPatient(@Param("patientIds") List<UUID> patientIds);

  @Query("SELECT DISTINCT a.patientId FROM Admission a WHERE a.providerId = :providerId")
  List<UUID> findPatientIdsByProvider(@Param("providerId") UUID providerId);
}
