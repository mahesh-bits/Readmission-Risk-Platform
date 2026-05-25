
package com.rrm.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "admissions")
public class Admission {
  @Id @GeneratedValue
  private UUID id;

  @Column(name = "patient_id")
  private UUID patientId;

  @Column(name = "admit_ts")
  private OffsetDateTime admitTs;

  @Column(name = "discharge_ts")
  private OffsetDateTime dischargeTs;

  @Column(name = "primary_dx")
  private String primaryDx;

  @Column(name = "length_of_stay")
  private Integer lengthOfStay;

  @Column(name = "provider_id")
  private UUID providerId;

  public UUID getId()                    { return id; }
  public UUID getPatientId()             { return patientId; }
  public OffsetDateTime getAdmitTs()     { return admitTs; }
  public OffsetDateTime getDischargeTs() { return dischargeTs; }
  public String getPrimaryDx()           { return primaryDx; }
  public Integer getLengthOfStay()       { return lengthOfStay; }
  public UUID getProviderId()            { return providerId; }
}
