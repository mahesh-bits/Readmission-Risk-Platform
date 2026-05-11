
package com.rrm.api;

import com.rrm.domain.Patient;
import com.rrm.repo.PatientRepo;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/patients")
public class PatientController {
  private final PatientRepo repo;
  public PatientController(PatientRepo repo){ this.repo = repo; }

  @GetMapping
  public List<Patient> list(){
    return repo.findAll();
  }
}
