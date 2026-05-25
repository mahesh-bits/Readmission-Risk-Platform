package com.rrm.api;

import com.rrm.domain.AppUser;
import com.rrm.repo.AppUserRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4300", "http://localhost:3000"})
public class AdminController {

  private final AppUserRepo userRepo;

  public AdminController(AppUserRepo userRepo) {
    this.userRepo = userRepo;
  }

  // ── Users ────────────────────────────────────────────────────────────────

  @GetMapping("/users")
  public List<UserResponse> listUsers() {
    return userRepo.findAll().stream().map(UserResponse::from).toList();
  }

  @PostMapping("/users")
  public ResponseEntity<?> createUser(@RequestBody UserRequest req) {
    if (req.name == null || req.name.isBlank())  return bad("name is required");
    if (req.email == null || req.email.isBlank()) return bad("email is required");
    if (req.role == null || req.role.isBlank())   return bad("role is required");
    if (userRepo.existsByEmail(req.email.trim())) return bad("email already exists");

    AppUser u = new AppUser();
    u.setName(req.name.trim());
    u.setEmail(req.email.trim());
    u.setRole(req.role.trim());
    u.setActive(req.active);
    return ResponseEntity.ok(UserResponse.from(userRepo.save(u)));
  }

  @PutMapping("/users/{id}")
  public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserRequest req) {
    UUID uuid;
    try { uuid = UUID.fromString(id); } catch (IllegalArgumentException e) {
      return bad("invalid user id: " + id);
    }
    return userRepo.findById(uuid).map(u -> {
      if (req.name != null && !req.name.isBlank())   u.setName(req.name.trim());
      if (req.email != null && !req.email.isBlank()) {
        if (userRepo.existsByEmailAndIdNot(req.email.trim(), uuid))
          return bad("email already exists");
        u.setEmail(req.email.trim());
      }
      if (req.role != null && !req.role.isBlank()) u.setRole(req.role.trim());
      u.setActive(req.active);
      return (ResponseEntity<?>) ResponseEntity.ok(UserResponse.from(userRepo.save(u)));
    }).orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/users/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable String id) {
    UUID uuid;
    try { uuid = UUID.fromString(id); } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
    if (!userRepo.existsById(uuid)) return ResponseEntity.notFound().build();
    userRepo.deleteById(uuid);
    return ResponseEntity.noContent().build();
  }

  // ── Stub endpoints (roles / consents / audit) ────────────────────────────

  @GetMapping("/roles")
  public List<Map<String, String>> listRoles() {
    return List.of(
        Map.of("id", "admin",    "label", "Administrator"),
        Map.of("id", "provider", "label", "Clinical Provider"),
        Map.of("id", "nurse",    "label", "Nurse"),
        Map.of("id", "viewer",   "label", "Read-only Viewer")
    );
  }

  @GetMapping("/consents")
  public List<Object> listConsents() { return List.of(); }

  @GetMapping("/audit")
  public List<Object> listAudit() { return List.of(); }

  // ── DTOs ─────────────────────────────────────────────────────────────────

  public static class UserRequest {
    public String name;
    public String email;
    public String role;
    public boolean active = true;
  }

  public static class UserResponse {
    public UUID    id;
    public String  name;
    public String  email;
    public String  role;
    public boolean active;

    static UserResponse from(AppUser u) {
      UserResponse r = new UserResponse();
      r.id     = u.getId();
      r.name   = u.getName();
      r.email  = u.getEmail();
      r.role   = u.getRole();
      r.active = u.isActive();
      return r;
    }
  }

  private static ResponseEntity<Map<String, String>> bad(String msg) {
    return ResponseEntity.badRequest().body(Map.of("error", msg));
  }
}
