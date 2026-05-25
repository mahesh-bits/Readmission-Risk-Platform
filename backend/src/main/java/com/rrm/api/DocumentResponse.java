package com.rrm.api;

import com.rrm.domain.Document;

public class DocumentResponse {
  public String name;
  public String type;
  public String date;
  public String summary;

  public static DocumentResponse from(Document d) {
    DocumentResponse r = new DocumentResponse();
    r.name    = d.getTitle();
    r.type    = d.getDocType();
    r.date    = d.getCreatedAt() != null ? d.getCreatedAt().toLocalDate().toString() : null;
    r.summary = d.getSummary();
    return r;
  }
}
