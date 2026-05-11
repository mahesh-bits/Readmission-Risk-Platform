
package com.rrm.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity @Table(name = "patients")
public class Patient {
  @Id @GeneratedValue
  private UUID id;
  private String mrn;
  private String firstName;
  private String lastName;
  // getters/setters
  public UUID getId(){return id;} public void setId(UUID id){this.id=id;}
  public String getMrn(){return mrn;} public void setMrn(String mrn){this.mrn=mrn;}
  public String getFirstName(){return firstName;} public void setFirstName(String s){this.firstName=s;}
  public String getLastName(){return lastName;} public void setLastName(String s){this.lastName=s;}
}
