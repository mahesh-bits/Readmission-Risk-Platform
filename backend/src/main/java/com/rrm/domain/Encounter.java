package com.rrm.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "encounters")
public class Encounter {
  @Id @GeneratedValue
  private UUID id;

  @Column(name = "patient_id")
  private UUID patientId;

  @Column(name = "admission_id")
  private UUID admissionId;

  @Column(name = "encounter_type")
  private String encounterType;

  @Column(name = "encounter_ts")
  private OffsetDateTime encounterTs;

  @Column(name = "provider_name")
  private String providerName;

  @Column(name = "notes")
  private String notes;

  public UUID getId()                   { return id; }
  public UUID getPatientId()            { return patientId; }
  public UUID getAdmissionId()          { return admissionId; }
  public String getEncounterType()      { return encounterType; }
  public OffsetDateTime getEncounterTs(){ return encounterTs; }
  public String getProviderName()       { return providerName; }
  public String getNotes()              { return notes; }
}
