import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../shared/components/card.component';
import { RiskLevelPipe } from '../../shared/pipes/risk-level.pipe';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface PatientRow {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  age: number | null;
  diagnosis: string | null;
  riskScore: number | null;
  riskBucket: string | null;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, RiskLevelPipe],
  selector: 'app-provider-patients',
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">My Patients</h2>
        <a routerLink="/provider" class="back-link">← Back to Panel</a>
      </div>

      <div *ngIf="loading" class="state-msg">Loading patients…</div>
      <div *ngIf="error"   class="state-msg error">{{ error }}</div>

      <app-card *ngIf="!loading && !error">
        <table class="table">
          <thead>
            <tr>
              <th>MRN</th>
              <th>Name</th>
              <th>Age</th>
              <th>Diagnosis</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of patients" [routerLink]="['/patient', p.id]" class="clickable">
              <td class="mono">{{ p.mrn }}</td>
              <td>{{ p.firstName }} {{ p.lastName }}</td>
              <td>{{ p.age ?? '—' }}</td>
              <td>{{ p.diagnosis ?? '—' }}</td>
              <td>{{ p.riskScore != null ? (p.riskScore | number:'1.2-2') : '—' }}</td>
              <td>
                <span *ngIf="p.riskBucket || p.riskScore != null"
                      class="bucket-badge"
                      [class]="bucketClass(p.riskBucket, p.riskScore)">
                  {{ p.riskBucket ?? (p.riskScore | riskLevel) }}
                </span>
                <span *ngIf="!p.riskBucket && p.riskScore == null">—</span>
              </td>
            </tr>
            <tr *ngIf="patients.length === 0">
              <td colspan="6" class="empty">No patients found.</td>
            </tr>
          </tbody>
        </table>
      </app-card>
    </div>
  `,
  styles: [`
    .page { padding: 0 16px 32px; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 20px; }
    .page-title { font-size: 1.3rem; font-weight: 700; color: #0f172a; margin: 0; }
    .back-link { color: #2563eb; text-decoration: none; font-size: .88rem; }
    .back-link:hover { text-decoration: underline; }

    .table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .table th { text-align: left; padding: 8px 12px; background: #f1f5f9; color: #475569; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
    .table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .clickable { cursor: pointer; }
    .clickable:hover td { background: #f8fafc; }
    .mono { font-family: monospace; font-size: .85rem; color: #475569; }
    .empty { text-align: center; color: #94a3b8; padding: 24px; }

    .high   { color: #dc2626; font-weight: 600; }
    .medium { color: #d97706; font-weight: 600; }
    .low    { color: #16a34a; font-weight: 600; }

    .bucket-badge {
      display: inline-block;
      border-radius: 999px;
      padding: 3px 10px;
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: .03em;
    }
    .bucket-badge.high   { background: #fee2e2; color: #991b1b; }
    .bucket-badge.medium { background: #fef3c7; color: #92400e; }
    .bucket-badge.low    { background: #dcfce7; color: #166534; }

    .state-msg { padding: 24px; text-align: center; color: #64748b; font-size: .95rem; }
    .state-msg.error { color: #b91c1c; background: #fef2f2; border-radius: 8px; }
  `]
})
export class ProviderPatientsComponent implements OnInit {
  patients: PatientRow[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const profile    = this.auth.getProfile();
    const providerId = profile?.role === 'provider' ? profile.id : undefined;

    this.api.patients(providerId).subscribe({
      next: (data: any) => {
        this.patients = data as PatientRow[];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load patients — ensure the backend is running.';
        this.loading = false;
      }
    });
  }

  riskClass(score: number | null): string {
    if (score == null) return '';
    return score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low';
  }

  bucketClass(bucket: string | null, score: number | null): string {
    const b = (bucket ?? '').toLowerCase();
    if (['high', 'medium', 'low'].includes(b)) return b;
    return this.riskClass(score);
  }
}
