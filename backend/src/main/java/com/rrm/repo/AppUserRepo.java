package com.rrm.repo;

import com.rrm.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AppUserRepo extends JpaRepository<AppUser, UUID> {
  boolean existsByEmailAndIdNot(String email, UUID id);
  boolean existsByEmail(String email);
  Optional<AppUser> findByEmail(String email);
}
