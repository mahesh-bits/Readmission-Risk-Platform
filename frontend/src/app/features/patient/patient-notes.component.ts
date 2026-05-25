import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent } from '../../shared/components/card.component';

interface ClinicalNote {
  id:            string;
  noteType:      string;
  priority:      string;
  noteText:      string;
  followUpDate:  string | null;
  hasAttachment: boolean;
  createdAt:     string;
  providerName:  string;
}

const NOTE_TYPES  = ['Progress Note', 'Discharge Summary', 'Consult Note', 'Follow-up Note', 'Nursing Note', 'Physician Order', 'Lab Note'];
const PRIORITIES  = ['Routine', 'Urgent', 'Critical'];

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardComponent],
  selector: 'app-patient-notes',
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Clinical Notes</h2>
        <a [routerLink]="['/patient', id]" class="back-link">← Back to Patient</a>
      </div>

      <div *ngIf="loading" class="state-msg">Loading notes…</div>
      <div *ngIf="error"   class="state-msg error">{{ error }}</div>

      <ng-container *ngIf="!loading">

        <!-- New Note Form -->
        <app-card title="Add Clinical Note">
          <form (ngSubmit)="submit()" class="note-form">
            <div class="form-row">
              <div class="field">
                <label>Note Type</label>
                <select [(ngModel)]="form.noteType" name="noteType">
                  <option *ngFor="let t of noteTypes" [value]="t">{{ t }}</option>
                </select>
              </div>
              <div class="field">
                <label>Priority</label>
                <select [(ngModel)]="form.priority" name="priority" [class]="'priority-select ' + priorityClass(form.priority)">
                  <option *ngFor="let p of priorities" [value]="p">{{ p }}</option>
                </select>
              </div>
              <div class="field">
                <label>Follow-up Date</label>
                <input type="date" [(ngModel)]="form.followUpDate" name="followUpDate" />
              </div>
            </div>
            <div class="field full">
              <label>Note Text <span class="req">*</span></label>
              <textarea [(ngModel)]="form.noteText" name="noteText"
                        rows="4" placeholder="Enter clinical note details…" required></textarea>
            </div>
            <div class="form-footer">
              <label class="attachment-label">
                <input type="checkbox" [(ngModel)]="form.hasAttachment" name="hasAttachment" />
                <span>Attachment included</span>
              </label>
              <p *ngIf="formError" class="form-error">{{ formError }}</p>
              <button class="btn" type="submit" [disabled]="saving">
                {{ saving ? 'Saving…' : 'Save Note' }}
              </button>
            </div>
          </form>
        </app-card>

        <!-- Notes List -->
        <app-card [title]="'Notes (' + notes.length + ')'">
          <div *ngIf="notes.length === 0" class="empty">No clinical notes on record.</div>
          <div *ngFor="let n of notes" class="note-card">
            <div class="note-head">
              <span class="badge" [class]="typeClass(n.noteType)">{{ n.noteType }}</span>
              <span class="badge priority" [class]="priorityClass(n.priority)">{{ n.priority }}</span>
              <span *ngIf="n.hasAttachment" class="attachment-badge" title="Attachment included">📎 Attachment</span>
              <span class="spacer"></span>
              <span class="meta">{{ n.providerName }}</span>
              <span class="meta">{{ n.createdAt | date:'MMM d, y, h:mm a' }}</span>
            </div>
            <p class="note-body">{{ n.noteText }}</p>
            <div *ngIf="n.followUpDate" class="follow-up">
              Follow-up: <strong>{{ n.followUpDate | date:'MMM d, y' }}</strong>
            </div>
          </div>
        </app-card>

      </ng-container>
    </div>
  `,
  styles: [`
    .page { padding: 0 16px 32px; max-width: 860px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 20px; }
    .page-title { font-size: 1.3rem; font-weight: 700; color: #0f172a; margin: 0; }
    .back-link { color: #2563eb; text-decoration: none; font-size: .88rem; }
    .back-link:hover { text-decoration: underline; }

    /* Form */
    .note-form { display: flex; flex-direction: column; gap: 14px; }
    .form-row { display: flex; gap: 14px; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 160px; }
    .field.full { flex: none; width: 100%; }
    .field label { font-size: .78rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .04em; }
    .req { color: #dc2626; }
    .field input, .field select, .field textarea {
      padding: 9px 11px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: .9rem; font-family: inherit;
    }
    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.12);
    }
    .field textarea { resize: vertical; }
    .form-footer { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .attachment-label { display: flex; align-items: center; gap: 7px; font-size: .88rem; color: #475569; cursor: pointer; }
    .attachment-label input { width: auto; }
    .spacer-btn { flex: 1; }
    .btn {
      margin-left: auto; background: #2563eb; color: #fff; border: none; padding: 10px 24px;
      border-radius: 6px; font-size: .9rem; font-weight: 600; cursor: pointer;
    }
    .btn:disabled { background: #93c5fd; cursor: not-allowed; }
    .btn:not(:disabled):hover { background: #1d4ed8; }
    .form-error { color: #dc2626; font-size: .85rem; margin: 0; flex: 1; }

    /* Priority select color */
    .priority-select.routine  { color: #166534; }
    .priority-select.urgent   { color: #92400e; }
    .priority-select.critical { color: #991b1b; }

    /* Notes list */
    .note-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; }
    .note-card:last-child { margin-bottom: 0; }
    .note-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .spacer { flex: 1; }
    .meta { font-size: .78rem; color: #94a3b8; }
    .note-body { margin: 0 0 8px; font-size: .9rem; color: #1e293b; line-height: 1.6; }
    .follow-up { font-size: .82rem; color: #64748b; }
    .follow-up strong { color: #0f172a; }
    .empty { text-align: center; color: #94a3b8; padding: 24px 0; font-size: .9rem; }

    /* Badges */
    .badge { padding: 2px 9px; border-radius: 999px; font-size: .76rem; font-weight: 600; white-space: nowrap; }
    .progress-note     { background: #dbeafe; color: #1e40af; }
    .discharge-summary { background: #dcfce7; color: #166534; }
    .consult-note      { background: #fef3c7; color: #92400e; }
    .follow-up-note    { background: #f3e8ff; color: #6b21a8; }
    .nursing-note      { background: #fce7f3; color: #9d174d; }
    .physician-order   { background: #e0f2fe; color: #075985; }
    .lab-note          { background: #f1f5f9; color: #475569; }
    .routine           { background: #dcfce7; color: #166534; }
    .urgent            { background: #fef3c7; color: #92400e; }
    .critical          { background: #fee2e2; color: #991b1b; }
    .attachment-badge  { font-size: .76rem; color: #475569; background: #f1f5f9; padding: 2px 8px; border-radius: 999px; }

    .state-msg { padding: 24px; text-align: center; color: #64748b; font-size: .95rem; }
    .state-msg.error { color: #b91c1c; background: #fef2f2; border-radius: 8px; }
  `]
})
export class PatientNotesComponent implements OnInit {
  id        = '';
  notes:    ClinicalNote[] = [];
  loading   = true;
  error     = '';
  saving    = false;
  formError = '';

  noteTypes = NOTE_TYPES;
  priorities = PRIORITIES;

  form = { noteType: 'Progress Note', priority: 'Routine', noteText: '', followUpDate: '', hasAttachment: false };

  constructor(
    private route: ActivatedRoute,
    private api:   ApiService,
    private auth:  AuthService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load() {
    this.api.patientNotes(this.id).subscribe({
      next: (d: any) => { this.notes = d; this.loading = false; },
      error: () => { this.error = 'Failed to load notes.'; this.loading = false; }
    });
  }

  submit() {
    this.formError = '';
    if (!this.form.noteText.trim()) { this.formError = 'Note text is required.'; return; }
    this.saving = true;

    const profile = this.auth.getProfile();
    const body = {
      providerId:    profile?.id ?? null,
      noteType:      this.form.noteType,
      priority:      this.form.priority,
      noteText:      this.form.noteText.trim(),
      followUpDate:  this.form.followUpDate || null,
      hasAttachment: this.form.hasAttachment
    };

    this.api.createNote(this.id, body).subscribe({
      next: (n: any) => {
        this.notes.unshift(n);
        this.form = { noteType: 'Progress Note', priority: 'Routine', noteText: '', followUpDate: '', hasAttachment: false };
        this.saving = false;
      },
      error: () => { this.formError = 'Failed to save note.'; this.saving = false; }
    });
  }

  typeClass(type: string): string {
    const map: Record<string, string> = {
      'Progress Note':      'progress-note',
      'Discharge Summary':  'discharge-summary',
      'Consult Note':       'consult-note',
      'Follow-up Note':     'follow-up-note',
      'Nursing Note':       'nursing-note',
      'Physician Order':    'physician-order',
      'Lab Note':           'lab-note',
    };
    return 'badge ' + (map[type] ?? '');
  }

  priorityClass(p: string): string {
    return p?.toLowerCase() ?? 'routine';
  }
}
