
package com.rrm.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "predictions")
public class Prediction {
  @Id @GeneratedValue
  private UUID id;

  @Column(name = "patient_id")
  private UUID patientId;

  @Column(name = "admission_id")
  private UUID admissionId;

  @Column(name = "model_version")
  private String modelVersion;

  @Column(name = "risk_score")
  private BigDecimal riskScore;

  @Column(name = "risk_bucket")
  private String riskBucket;

  @Column(name = "predicted_at")
  private OffsetDateTime predictedAt;

  public UUID getId()                  { return id; }
  public UUID getPatientId()           { return patientId; }
  public UUID getAdmissionId()         { return admissionId; }
  public String getModelVersion()      { return modelVersion; }
  public BigDecimal getRiskScore()     { return riskScore; }
  public String getRiskBucket()        { return riskBucket; }
  public OffsetDateTime getPredictedAt(){ return predictedAt; }
}
