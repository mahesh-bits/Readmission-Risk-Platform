package com.rrm.api;

import com.rrm.domain.AppUser;
import com.rrm.repo.AppUserRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4300", "http://localhost:3000"})
public class AuthController {

  private final AppUserRepo userRepo;

  public AuthController(AppUserRepo userRepo) {
    this.userRepo = userRepo;
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    if (req.email == null || req.email.isBlank())
      return ResponseEntity.badRequest().body(Map.of("error", "email is required"));

    Optional<AppUser> found = userRepo.findByEmail(req.email.trim());

    if (found.isEmpty() || !found.get().isActive())
      return ResponseEntity.status(401).body(Map.of("error", "user not found or inactive"));

    AppUser u = found.get();
    LoginResponse r = new LoginResponse();
    r.id    = u.getId();
    r.name  = u.getName();
    r.email = u.getEmail();
    r.role  = u.getRole();
    return ResponseEntity.ok(r);
  }

  public static class LoginRequest {
    public String email;
    public String password;
  }

  public static class LoginResponse {
    public UUID   id;
    public String name;
    public String email;
    public String role;
  }
}
