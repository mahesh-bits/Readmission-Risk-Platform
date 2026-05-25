package com.rrm.repo;

import com.rrm.domain.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface DocumentRepo extends JpaRepository<Document, UUID> {

  @Query("SELECT d FROM Document d WHERE d.patientId = :patientId ORDER BY d.createdAt DESC")
  List<Document> findByPatientIdOrderByDesc(@Param("patientId") UUID patientId);
}
