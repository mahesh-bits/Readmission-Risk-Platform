
package com.rrm.repo;

import com.rrm.domain.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PatientRepo extends JpaRepository<Patient, UUID> {}
