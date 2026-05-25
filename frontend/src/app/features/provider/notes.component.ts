import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent } from '../../shared/components/card.component';

interface NoteRow {
  id:            string;
  patientId:     string;
  patientName:   string;
  noteType:      string;
  priority:      string;
  noteText:      string;
  followUpDate:  string | null;
  hasAttachment: boolean;
  createdAt:     string;
  providerName:  string;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  selector: 'app-provider-notes',
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Clinical Notes</h2>
        <a routerLink="/provider" class="back-link">← Back to Panel</a>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar">
        <button *ngFor="let p of ['All', 'Routine', 'Urgent', 'Critical']"
                class="filter-btn"
                [class.active]="priorityFilter === p"
                (click)="priorityFilter = p">
          {{ p }}
        </button>
        <span class="count">{{ filtered.length }} note{{ filtered.length !== 1 ? 's' : '' }}</span>
      </div>

      <div *ngIf="loading" class="state-msg">Loading notes…</div>
      <div *ngIf="error"   class="state-msg error">{{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <div *ngIf="filtered.length === 0" class="state-msg">No notes found.</div>

        <div *ngFor="let n of filtered" class="note-card">
          <div class="note-head">
            <a [routerLink]="['/patient', n.patientId, 'notes']" class="patient-link">
              {{ n.patientName || 'Unknown Patient' }}
            </a>
            <span class="badge" [class]="typeClass(n.noteType)">{{ n.noteType }}</span>
            <span class="badge" [class]="n.priority.toLowerCase()">{{ n.priority }}</span>
            <span *ngIf="n.hasAttachment" class="attach-tag">📎</span>
            <span class="spacer"></span>
            <span class="meta">{{ n.providerName }}</span>
            <span class="meta">{{ n.createdAt | date:'MMM d, y' }}</span>
          </div>
          <p class="note-body">{{ n.noteText | slice:0:200 }}{{ n.noteText.length > 200 ? '…' : '' }}</p>
          <div *ngIf="n.followUpDate" class="follow-up">
            Follow-up: <strong>{{ n.followUpDate | date:'MMM d, y' }}</strong>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .page { padding: 0 16px 32px; max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 16px; }
    .page-title { font-size: 1.3rem; font-weight: 700; color: #0f172a; margin: 0; }
    .back-link { color: #2563eb; text-decoration: none; font-size: .88rem; }
    .back-link:hover { text-decoration: underline; }

    .filter-bar { display: flex; gap: 8px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-btn { padding: 5px 14px; border: 1px solid #cbd5e1; border-radius: 999px; background: #fff; font-size: .82rem; cursor: pointer; font-weight: 500; color: #475569; }
    .filter-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }
    .filter-btn:hover:not(.active) { background: #f1f5f9; }
    .count { margin-left: auto; font-size: .82rem; color: #94a3b8; }

    .note-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; background: #fff; }
    .note-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .patient-link { font-weight: 700; color: #0f172a; font-size: .92rem; text-decoration: none; }
    .patient-link:hover { color: #2563eb; text-decoration: underline; }
    .spacer { flex: 1; }
    .meta { font-size: .78rem; color: #94a3b8; }
    .attach-tag { font-size: .78rem; color: #64748b; }
    .note-body { margin: 0 0 6px; font-size: .88rem; color: #334155; line-height: 1.6; }
    .follow-up { font-size: .8rem; color: #64748b; }
    .follow-up strong { color: #0f172a; }

    .badge { padding: 2px 9px; border-radius: 999px; font-size: .75rem; font-weight: 600; white-space: nowrap; }
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

    .state-msg { padding: 24px; text-align: center; color: #64748b; font-size: .95rem; }
    .state-msg.error { color: #b91c1c; background: #fef2f2; border-radius: 8px; }
  `]
})
export class ProviderNotesComponent implements OnInit {
  notes:          NoteRow[] = [];
  loading         = true;
  error           = '';
  priorityFilter  = 'All';

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const profile    = this.auth.getProfile();
    const providerId = profile?.role === 'provider' ? profile.id : undefined;

    this.api.providerNotes(providerId).subscribe({
      next: (d: any) => { this.notes = d as NoteRow[]; this.loading = false; },
      error: () => { this.error = 'Failed to load notes.'; this.loading = false; }
    });
  }

  get filtered(): NoteRow[] {
    if (this.priorityFilter === 'All') return this.notes;
    return this.notes.filter(n => n.priority === this.priorityFilter);
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
    return map[type] ?? '';
  }
}
