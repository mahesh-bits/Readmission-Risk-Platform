package com.rrm.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "app_users")
public class AppUser {
  @Id @GeneratedValue
  private UUID id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String role;

  @Column(nullable = false)
  private boolean active;

  @Column(name = "created_at", insertable = false, updatable = false)
  private OffsetDateTime createdAt;

  public UUID getId()                  { return id; }
  public String getName()              { return name; }
  public String getEmail()             { return email; }
  public String getRole()              { return role; }
  public boolean isActive()            { return active; }
  public OffsetDateTime getCreatedAt() { return createdAt; }

  public void setName(String name)     { this.name = name; }
  public void setEmail(String email)   { this.email = email; }
  public void setRole(String role)     { this.role = role; }
  public void setActive(boolean active){ this.active = active; }
}
