
package com.rrm.api;

import com.rrm.domain.Admission;
import com.rrm.domain.Patient;
import com.rrm.domain.Prediction;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

public class PatientDetailResponse {
  private UUID id;
  private String mrn;
  private String firstName;
  private String lastName;
  private LocalDate dob;
  private Integer age;
  private String sex;
  private Integer los;
  private String diagnosis;
  private BigDecimal riskScore;
  private String riskBucket;
  private UUID admissionId;

  public static PatientDetailResponse from(Patient p, Admission a, Prediction pred) {
    PatientDetailResponse r = new PatientDetailResponse();
    r.id        = p.getId();
    r.mrn       = p.getMrn();
    r.firstName = p.getFirstName();
    r.lastName  = p.getLastName();
    r.dob       = p.getDob();
    r.age       = p.getDob() != null ? Period.between(p.getDob(), LocalDate.now()).getYears() : null;
    r.sex       = p.getSex();
    if (a != null) {
      r.admissionId = a.getId();
      r.los         = a.getLengthOfStay();
      r.diagnosis   = a.getPrimaryDx();
    }
    if (pred != null) {
      r.riskScore  = pred.getRiskScore();
      r.riskBucket = pred.getRiskBucket();
    }
    return r;
  }

  public UUID getId()           { return id; }
  public String getMrn()        { return mrn; }
  public String getFirstName()  { return firstName; }
  public String getLastName()   { return lastName; }
  public LocalDate getDob()     { return dob; }
  public Integer getAge()       { return age; }
  public String getSex()        { return sex; }
  public Integer getLos()       { return los; }
  public String getDiagnosis()  { return diagnosis; }
  public BigDecimal getRiskScore()  { return riskScore; }
  public String getRiskBucket()     { return riskBucket; }
  public UUID getAdmissionId()      { return admissionId; }
}
