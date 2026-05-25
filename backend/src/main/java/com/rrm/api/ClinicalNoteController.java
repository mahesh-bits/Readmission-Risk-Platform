package com.rrm.api;

import com.rrm.domain.ClinicalNote;
import com.rrm.repo.ClinicalNoteRepo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4300", "http://localhost:3000"})
public class ClinicalNoteController {

  private final ClinicalNoteRepo noteRepo;

  @PersistenceContext
  private EntityManager em;

  public ClinicalNoteController(ClinicalNoteRepo noteRepo) {
    this.noteRepo = noteRepo;
  }

  // ── Per-patient notes ────────────────────────────────────────────────────

  @GetMapping("/api/patients/{patientId}/notes")
  public List<NoteResponse> getNotes(@PathVariable UUID patientId) {
    @SuppressWarnings("unchecked")
    List<Object[]> rows = em.createNativeQuery("""
        SELECT cn.id, cn.note_type, cn.priority, cn.note_text,
               cn.follow_up_date, cn.has_attachment, cn.created_at,
               u.name AS provider_name, NULL AS patient_name, cn.patient_id
        FROM clinical_notes cn
        LEFT JOIN app_users u ON u.id = cn.provider_id
        WHERE cn.patient_id = :patientId
        ORDER BY cn.created_at DESC
        """)
        .setParameter("patientId", patientId)
        .getResultList();

    return rows.stream().map(ClinicalNoteController::toResponse).toList();
  }

  @PostMapping("/api/patients/{patientId}/notes")
  public ResponseEntity<NoteResponse> createNote(
      @PathVariable UUID patientId,
      @RequestBody NoteRequest req) {

    if (req.noteText == null || req.noteText.isBlank())
      return ResponseEntity.badRequest().build();

    ClinicalNote note = new ClinicalNote();
    note.setPatientId(patientId);
    note.setProviderId(req.providerId != null ? UUID.fromString(req.providerId) : null);
    note.setNoteType(req.noteType   != null ? req.noteType : "Progress Note");
    note.setPriority(req.priority   != null ? req.priority : "Routine");
    note.setNoteText(req.noteText.trim());
    note.setFollowUpDate(req.followUpDate != null ? LocalDate.parse(req.followUpDate) : null);
    note.setHasAttachment(req.hasAttachment);

    ClinicalNote saved = noteRepo.save(note);

    @SuppressWarnings("unchecked")
    List<Object[]> rows = em.createNativeQuery("""
        SELECT cn.id, cn.note_type, cn.priority, cn.note_text,
               cn.follow_up_date, cn.has_attachment, cn.created_at,
               u.name AS provider_name, NULL AS patient_name, cn.patient_id
        FROM clinical_notes cn
        LEFT JOIN app_users u ON u.id = cn.provider_id
        WHERE cn.id = :id
        """)
        .setParameter("id", saved.getId())
        .getResultList();

    NoteResponse response = rows.isEmpty()
        ? fallback(saved)
        : toResponse(rows.get(0));

    return ResponseEntity.ok(response);
  }

  // ── Provider-wide notes list ─────────────────────────────────────────────

  @GetMapping("/api/notes")
  public List<NoteResponse> getProviderNotes(@RequestParam(required = false) UUID providerId) {
    String whereClause = providerId != null ? "WHERE cn.provider_id = :providerId" : "";

    jakarta.persistence.Query q = em.createNativeQuery("""
        SELECT cn.id, cn.note_type, cn.priority, cn.note_text,
               cn.follow_up_date, cn.has_attachment, cn.created_at,
               u.name AS provider_name,
               (p.first_name || ' ' || p.last_name) AS patient_name,
               cn.patient_id
        FROM clinical_notes cn
        LEFT JOIN app_users u ON u.id = cn.provider_id
        LEFT JOIN patients  p ON p.id = cn.patient_id
        \s""" + whereClause + """

        ORDER BY cn.created_at DESC
        """);

    if (providerId != null) q.setParameter("providerId", providerId);

    @SuppressWarnings("unchecked")
    List<Object[]> rows = q.getResultList();
    return rows.stream().map(ClinicalNoteController::toResponse).toList();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private static NoteResponse toResponse(Object[] r) {
    NoteResponse nr = new NoteResponse();
    nr.id            = r[0].toString();
    nr.noteType      = (String) r[1];
    nr.priority      = (String) r[2];
    nr.noteText      = (String) r[3];
    nr.followUpDate  = r[4] != null ? r[4].toString() : null;
    nr.hasAttachment = (Boolean) r[5];
    nr.createdAt     = r[6] != null ? r[6].toString() : "";
    nr.providerName  = r[7] != null ? (String) r[7] : "Unknown";
    nr.patientName   = r[8] != null ? (String) r[8] : null;
    nr.patientId     = r[9] != null ? r[9].toString() : null;
    return nr;
  }

  private static NoteResponse fallback(ClinicalNote n) {
    NoteResponse nr = new NoteResponse();
    nr.id            = n.getId().toString();
    nr.noteType      = n.getNoteType();
    nr.priority      = n.getPriority();
    nr.noteText      = n.getNoteText();
    nr.followUpDate  = n.getFollowUpDate() != null ? n.getFollowUpDate().toString() : null;
    nr.hasAttachment = n.isHasAttachment();
    nr.createdAt     = "";
    nr.providerName  = "Unknown";
    return nr;
  }

  // ── DTOs ─────────────────────────────────────────────────────────────────

  public static class NoteRequest {
    public String  providerId;
    public String  noteType;
    public String  priority;
    public String  noteText;
    public String  followUpDate;
    public boolean hasAttachment;
  }

  public static class NoteResponse {
    public String  id;
    public String  patientId;
    public String  patientName;
    public String  noteType;
    public String  priority;
    public String  noteText;
    public String  followUpDate;
    public boolean hasAttachment;
    public String  createdAt;
    public String  providerName;
  }
}
