import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';

interface EncounterRow {
  date: string;
  type: string;
  provider: string;
  notes: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  selector: 'app-encounters',
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Encounters</h2>
        <a [routerLink]="['/patient', id]" class="back-link">← Back to Patient</a>
      </div>

      <div *ngIf="loading" class="state-msg">Loading encounters…</div>
      <div *ngIf="error"   class="state-msg error">{{ error }}</div>

      <app-card *ngIf="!loading && !error">
        <table *ngIf="encounters.length; else empty" class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Provider</th>
              <th>Clinical Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of encounters">
              <td class="date-cell">{{ e.date }}</td>
              <td><span class="badge" [class]="typeBadge(e.type)">{{ e.type }}</span></td>
              <td class="provider">{{ e.provider }}</td>
              <td class="notes">{{ e.notes }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #empty><p class="hint">No encounters on record.</p></ng-template>
      </app-card>
    </div>
  `,
  styles: [`
    .page { padding: 0 16px 32px; max-width: 1000px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 20px; }
    .page-title { font-size: 1.3rem; font-weight: 700; color: #0f172a; margin: 0; }
    .back-link { color: #2563eb; text-decoration: none; font-size: .88rem; }
    .back-link:hover { text-decoration: underline; }

    .table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .table th { text-align: left; padding: 8px 12px; background: #f1f5f9; color: #475569; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
    .table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .date-cell { white-space: nowrap; color: #475569; font-size: .85rem; font-family: monospace; }
    .provider { white-space: nowrap; color: #1e293b; font-weight: 500; }
    .notes { color: #334155; max-width: 420px; line-height: 1.5; }

    .badge { padding: 2px 8px; border-radius: 999px; font-size: .78rem; font-weight: 600; white-space: nowrap; }
    .inpatient  { background: #fee2e2; color: #991b1b; }
    .emergency  { background: #fef3c7; color: #92400e; }
    .outpatient { background: #dbeafe; color: #1e40af; }
    .follow-up  { background: #dcfce7; color: #166534; }
    .telehealth { background: #f3e8ff; color: #6b21a8; }

    .hint { color: #64748b; font-size: .9rem; margin: 0; }
    .state-msg { padding: 24px; text-align: center; color: #64748b; font-size: .95rem; }
    .state-msg.error { color: #b91c1c; background: #fef2f2; border-radius: 8px; }
  `]
})
export class EncountersComponent implements OnInit {
  id = '';
  encounters: EncounterRow[] = [];
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.api.encounters(this.id).subscribe({
      next: (d: any) => { this.encounters = d; this.loading = false; },
      error: () => { this.error = 'Failed to load encounters.'; this.loading = false; }
    });
  }

  typeBadge(type: string): string {
    const map: Record<string, string> = {
      'Inpatient':  'inpatient',
      'Emergency':  'emergency',
      'Outpatient': 'outpatient',
      'Follow-up':  'follow-up',
      'Telehealth': 'telehealth',
    };
    return map[type] ?? '';
  }
}
