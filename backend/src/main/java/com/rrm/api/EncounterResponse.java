package com.rrm.api;

import com.rrm.domain.Document;
import com.rrm.domain.Encounter;
import java.time.LocalDate;

public class EncounterResponse {
  public String date;
  public String type;
  public String provider;
  public String notes;

  public static EncounterResponse from(Encounter e) {
    EncounterResponse r = new EncounterResponse();
    r.date     = e.getEncounterTs() != null ? e.getEncounterTs().toLocalDate().toString() : null;
    r.type     = e.getEncounterType();
    r.provider = e.getProviderName();
    r.notes    = e.getNotes();
    return r;
  }
}
