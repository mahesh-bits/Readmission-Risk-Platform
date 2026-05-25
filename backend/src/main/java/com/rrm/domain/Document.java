package com.rrm.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents")
public class Document {
  @Id @GeneratedValue
  private UUID id;

  @Column(name = "patient_id")
  private UUID patientId;

  @Column(name = "encounter_id")
  private UUID encounterId;

  @Column(name = "doc_type")
  private String docType;

  @Column(name = "title")
  private String title;

  @Column(name = "summary")
  private String summary;

  @Column(name = "created_at")
  private OffsetDateTime createdAt;

  public UUID getId()                  { return id; }
  public UUID getPatientId()           { return patientId; }
  public UUID getEncounterId()         { return encounterId; }
  public String getDocType()           { return docType; }
  public String getTitle()             { return title; }
  public String getSummary()           { return summary; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
}
