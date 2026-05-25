import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';
import { RiskLevelPipe } from '../../shared/pipes/risk-level.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, RiskLevelPipe],
  selector: 'app-patient-detail',
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Patient Detail</h2>
        <a routerLink="/patient" class="back-link">← Back to Search</a>
      </div>

      <div *ngIf="loading" class="state-msg">Loading patient…</div>
      <div *ngIf="error"   class="state-msg error">{{ error }}</div>

      <ng-container *ngIf="patient && !loading">
        <app-card [title]="patient.firstName + ' ' + patient.lastName">
          <div class="detail-grid">
            <div class="detail-row"><span class="label">MRN</span><span class="mono">{{ patient.mrn }}</span></div>
            <div class="detail-row"><span class="label">Date of Birth</span><span>{{ patient.dob ?? '—' }}</span></div>
            <div class="detail-row"><span class="label">Age</span><span>{{ patient.age ?? '—' }}</span></div>
            <div class="detail-row"><span class="label">Sex</span><span>{{ patient.sex ?? '—' }}</span></div>
            <div class="detail-row"><span class="label">Primary Diagnosis</span><span>{{ patient.diagnosis ?? '—' }}</span></div>
            <div class="detail-row"><span class="label">Length of Stay</span><span>{{ patient.los != null ? patient.los + ' days' : '—' }}</span></div>
            <div class="detail-row">
              <span class="label">Risk Score</span>
              <span [class]="riskClass(patient.riskScore)">
                {{ patient.riskScore != null ? (patient.riskScore | number:'1.2-2') : '—' }}
                <span *ngIf="patient.riskScore != null" class="risk-label">({{ patient.riskScore | riskLevel }})</span>
              </span>
            </div>
          </div>
        </app-card>

        <div class="sub-nav">
          <a [routerLink]="['/patient', id, 'encounters']" class="nav-btn">Encounters</a>
          <a [routerLink]="['/patient', id, 'docs']"       class="nav-btn">Documents</a>
          <a [routerLink]="['/patient', id, 'notes']"      class="nav-btn notes-btn">Clinical Notes</a>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .page { padding: 0 16px 32px; max-width: 700px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 20px; }
    .page-title { font-size: 1.3rem; font-weight: 700; color: #0f172a; margin: 0; }
    .back-link { color: #2563eb; text-decoration: none; font-size: .88rem; }
    .back-link:hover { text-decoration: underline; }

    .detail-grid { display: flex; flex-direction: column; gap: 2px; }
    .detail-row { display: flex; padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-size: .9rem; }
    .detail-row:last-child { border-bottom: none; }
    .label { width: 180px; flex-shrink: 0; color: #64748b; font-weight: 600; font-size: .82rem; text-transform: uppercase; letter-spacing: .04em; padding-top: 2px; }
    .mono { font-family: monospace; color: #475569; }

    .high   { color: #dc2626; font-weight: 700; }
    .medium { color: #d97706; font-weight: 700; }
    .low    { color: #16a34a; font-weight: 700; }
    .risk-label { font-size: .85em; margin-left: 4px; font-weight: 500; }

    .sub-nav { display: flex; gap: 12px; margin-top: 16px; }
    .nav-btn {
      padding: 8px 20px; background: #0f766e; color: #fff; border-radius: 8px;
      text-decoration: none; font-size: .88rem; font-weight: 600;
    }
    .nav-btn { background: #0f766e; }
    .nav-btn.notes-btn { background: #6d28d9; }
    .nav-btn:hover { filter: brightness(0.9); }

    .state-msg { padding: 24px; text-align: center; color: #64748b; font-size: .95rem; }
    .state-msg.error { color: #b91c1c; background: #fef2f2; border-radius: 8px; }
  `]
})
export class PatientDetailComponent implements OnInit {
  id = '';
  patient: any = null;
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.api.patient(this.id).subscribe({
      next: (d: any) => { this.patient = d; this.loading = false; },
      error: () => { this.error = 'Failed to load patient.'; this.loading = false; }
    });
  }

  riskClass(score: number | null): string {
    if (score == null) return '';
    return score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low';
  }
}
