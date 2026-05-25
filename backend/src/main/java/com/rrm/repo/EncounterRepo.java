package com.rrm.repo;

import com.rrm.domain.Encounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface EncounterRepo extends JpaRepository<Encounter, UUID> {

  @Query("SELECT e FROM Encounter e WHERE e.patientId = :patientId ORDER BY e.encounterTs DESC")
  List<Encounter> findByPatientIdOrderByDesc(@Param("patientId") UUID patientId);
}
