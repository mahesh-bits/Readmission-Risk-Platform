package com.rrm.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "clinical_notes")
public class ClinicalNote {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "patient_id", nullable = false)
  private UUID patientId;

  @Column(name = "provider_id")
  private UUID providerId;

  @Column(name = "note_type", nullable = false)
  private String noteType;

  @Column(name = "priority", nullable = false)
  private String priority;

  @Column(name = "note_text", nullable = false)
  private String noteText;

  @Column(name = "follow_up_date")
  private LocalDate followUpDate;

  @Column(name = "has_attachment", nullable = false)
  private boolean hasAttachment;

  @Column(name = "created_at", insertable = false, updatable = false)
  private OffsetDateTime createdAt;

  public UUID getId()                    { return id; }
  public UUID getPatientId()             { return patientId; }
  public void setPatientId(UUID v)       { this.patientId = v; }
  public UUID getProviderId()            { return providerId; }
  public void setProviderId(UUID v)      { this.providerId = v; }
  public String getNoteType()            { return noteType; }
  public void setNoteType(String v)      { this.noteType = v; }
  public String getPriority()            { return priority; }
  public void setPriority(String v)      { this.priority = v; }
  public String getNoteText()            { return noteText; }
  public void setNoteText(String v)      { this.noteText = v; }
  public LocalDate getFollowUpDate()     { return followUpDate; }
  public void setFollowUpDate(LocalDate v) { this.followUpDate = v; }
  public boolean isHasAttachment()       { return hasAttachment; }
  public void setHasAttachment(boolean v){ this.hasAttachment = v; }
  public OffsetDateTime getCreatedAt()   { return createdAt; }
}
