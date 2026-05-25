package com.rrm.repo;

import com.rrm.domain.ClinicalNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ClinicalNoteRepo extends JpaRepository<ClinicalNote, UUID> {
}
