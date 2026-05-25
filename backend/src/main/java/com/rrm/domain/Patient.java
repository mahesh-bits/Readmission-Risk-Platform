
package com.rrm.domain;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;


@Entity
@Table(name = "patients")
public class Patient {
  @Id @GeneratedValue
  private UUID id;
  private String mrn;
  private String firstName;
  private String lastName;
  private LocalDate dob;
  private String sex;
  private String diagnosis;
  private Integer los;

  // getters/setters
  public UUID getId(){return id;} public void setId(UUID id){this.id=id;}
  public String getMrn(){return mrn;} public void setMrn(String mrn){this.mrn=mrn;}
  public String getFirstName(){return firstName;} public void setFirstName(String s){this.firstName=s;}
  public String getLastName(){return lastName;} public void setLastName(String s){this.lastName=s;}
  public LocalDate getDob(){return dob;} public void setDob(LocalDate dob){this.dob=dob;}
  public String getSex(){return sex;} public void setSex(String sex){this.sex=sex;}
  public String getDiagnosis(){return diagnosis;} public void setDiagnosis(String diagnosis){this.diagnosis=diagnosis;}
  public Integer getLos(){return los;} public void setLos(Integer los){this.los=los;}

  public Integer getAge(){
    if(dob == null) return null;
    return Period.between(dob, LocalDate.now()).getYears();
  }
}
