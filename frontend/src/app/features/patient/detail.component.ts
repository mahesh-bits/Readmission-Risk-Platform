import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';
import { RiskLevelPipe } from '../../shared/pipes/risk-level.pipe';

interface PredictionResult {
  id: string;
  patientId: string;
  admissionId: string;
  modelVersion: string;
  riskScore: number;
  riskBucket: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  predictedAt: string;
  cached: boolean;
  topFeatures: Array<{ name: string; impact: number }> | null;
}

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

        <!-- Patient Info Card -->
        <app-card [title]="patient.firstName + ' ' + patient.lastName">
          <div class="detail-grid">
            <div class="detail-row"><span class="label">MRN</span><span class="mono">{{ patient.mrn }}</span></div>
            <div class="detail-row"><span class="label">Date of Birth</span><span>{{ patient.dob ?? '—' }}</span></div>
            <div class="detail-row"><span class="label">Age</span><span>{{ patient.age ?? '—' }}</span></div>
            <div class="detail-row"><span class="label">Sex</span><span>{{ patient.sex ?? '—' }}</span></div>
            <div class="detail-row"><span class="label">Primary Diagnosis</span><span>{{ patient.diagnosis ?? '—' }}</span></div>
            <div class="detail-row"><span class="label">Length of Stay</span><span>{{ patient.los != null ? patient.los + ' days' : '—' }}</span></div>
          </div>
        </app-card>

        <!-- Readmission Risk Card -->
        <div class="pred-card">
          <div class="pred-card-header">
            <h3 class="pred-card-title">30-Day Readmission Risk</h3>
            <button
              class="btn-refresh"
              (click)="loadPrediction()"
              [disabled]="predLoading || !patient">
              {{ predLoading ? 'Loading…' : prediction ? 'Refresh' : 'Run Prediction' }}
            </button>
          </div>

          <!-- No admission -->
          <p *ngIf="predError === 'NO_ADMISSION'" class="muted-msg">No admission record found for this patient.</p>

          <!-- Loading -->
          <div *ngIf="predLoading" class="pred-loading">
            <div class="spinner"></div>
            <span>Computing prediction…</span>
          </div>

          <!-- Error -->
          <p *ngIf="predError && predError !== 'NO_ADMISSION' && !predLoading" class="pred-error">{{ predError }}</p>

          <!-- Result -->
          <div *ngIf="prediction && !predLoading" class="pred-body">

            <!-- Score + Bucket -->
            <div class="score-row">
              <div class="score-block">
                <div class="score-number">{{ prediction.riskScore | number:'1.2-2' }}</div>
                <div class="score-sub">Risk Score</div>
              </div>
              <div class="bucket-badge" [class]="bucketClass(prediction.riskBucket)">
                {{ prediction.riskBucket }}
              </div>
            </div>

            <!-- Meter -->
            <div class="meter">
              <div class="meter-fill" [style.width.%]="prediction.riskScore * 100"
                   [class]="'meter-fill ' + bucketFillClass(prediction.riskBucket)"></div>
            </div>

            <!-- Meta row -->
            <div class="pred-meta">
              <span class="meta-chip">
                <span class="meta-icon">🤖</span> {{ prediction.modelVersion ?? 'unknown' }}
              </span>
              <span class="meta-chip">
                <span class="meta-icon">🕐</span> {{ prediction.predictedAt | date:'MMM d, y, h:mm a' }}
              </span>
              <span class="cache-chip" [class.chip-cached]="prediction.cached" [class.chip-fresh]="!prediction.cached">
                {{ prediction.cached ? '⚡ Cached' : '✨ Fresh' }}
              </span>
            </div>

            <!-- Top Features -->
            <div *ngIf="prediction.topFeatures?.length" class="features-section">
              <h4 class="features-title">Top Contributing Factors</h4>
              <div class="features-list">
                <div *ngFor="let f of prediction.topFeatures" class="feature-row">
                  <span class="feature-name">{{ f.name }}</span>
                  <div class="feature-bar-track">
                    <div class="feature-bar-fill" [style.width.%]="featureBarPct(f.impact)"></div>
                  </div>
                  <span class="feature-impact">{{ f.impact | number:'1.3-3' }}</span>
                </div>
              </div>
            </div>

            <!-- No top features -->
            <p *ngIf="!prediction.topFeatures?.length" class="muted-msg" style="margin-top:12px">
              No feature breakdown available for this prediction.
            </p>
          </div>

          <!-- Empty state before first load -->
          <div *ngIf="!prediction && !predLoading && !predError && patient" class="pred-empty">
            <div class="empty-icon">📊</div>
            <p>Click <strong>Run Prediction</strong> to compute the 30-day readmission risk for this admission.</p>
          </div>
        </div>

        <!-- Sub-navigation -->
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

    /* Patient info */
    .detail-grid { display: flex; flex-direction: column; gap: 2px; }
    .detail-row { display: flex; padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-size: .9rem; }
    .detail-row:last-child { border-bottom: none; }
    .label { width: 180px; flex-shrink: 0; color: #64748b; font-weight: 600; font-size: .82rem; text-transform: uppercase; letter-spacing: .04em; padding-top: 2px; }
    .mono { font-family: monospace; color: #475569; }

    /* Prediction card */
    .pred-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
      padding: 20px;
      margin-top: 16px;
    }
    .pred-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .pred-card-title { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }

    .btn-refresh {
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      background: #0f766e;
      color: #fff;
      font-weight: 600;
      font-size: .83rem;
      cursor: pointer;
      transition: background .15s;
    }
    .btn-refresh:hover:enabled { background: #115e59; }
    .btn-refresh:disabled { opacity: .55; cursor: not-allowed; }

    /* Loading */
    .pred-loading {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 0;
      color: #64748b;
      font-size: .9rem;
    }
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid #e2e8f0;
      border-top-color: #0f766e;
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Errors / messages */
    .pred-error {
      color: #b91c1c;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: .88rem;
      margin: 0;
    }
    .muted-msg { color: #94a3b8; font-size: .9rem; margin: 4px 0; }

    /* Score row */
    .score-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .score-number { font-size: 2.4rem; font-weight: 800; color: #0f172a; line-height: 1; }
    .score-sub { font-size: .75rem; color: #64748b; text-transform: uppercase; letter-spacing: .05em; margin-top: 4px; }

    /* Bucket badge */
    .bucket-badge {
      border-radius: 999px;
      padding: 7px 16px;
      font-size: .85rem;
      font-weight: 700;
      letter-spacing: .03em;
    }
    .bucket-badge.high   { background: #fee2e2; color: #991b1b; }
    .bucket-badge.medium { background: #fef3c7; color: #92400e; }
    .bucket-badge.low    { background: #dcfce7; color: #166534; }

    /* Meter */
    .meter {
      width: 100%; height: 10px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 14px;
    }
    .meter-fill { height: 100%; border-radius: 999px; transition: width .4s ease; }
    .meter-fill.high   { background: #ef4444; }
    .meter-fill.medium { background: #f59e0b; }
    .meter-fill.low    { background: #22c55e; }

    /* Meta */
    .pred-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .meta-chip {
      background: #f1f5f9;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: .78rem;
      color: #475569;
    }
    .meta-icon { margin-right: 3px; }
    .cache-chip {
      border-radius: 999px;
      padding: 4px 10px;
      font-size: .78rem;
      font-weight: 600;
    }
    .chip-cached { background: #eff6ff; color: #1d4ed8; }
    .chip-fresh  { background: #f0fdf4; color: #15803d; }

    /* Features */
    .features-section { border-top: 1px solid #f1f5f9; padding-top: 14px; }
    .features-title { margin: 0 0 10px; font-size: .88rem; font-weight: 700; color: #334155; }
    .features-list { display: flex; flex-direction: column; gap: 8px; }
    .feature-row {
      display: grid;
      grid-template-columns: 160px 1fr 56px;
      align-items: center;
      gap: 10px;
      font-size: .83rem;
    }
    .feature-name { color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .feature-bar-track {
      height: 8px;
      background: #f1f5f9;
      border-radius: 999px;
      overflow: hidden;
    }
    .feature-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #0ea5e9, #0f766e);
      border-radius: 999px;
      transition: width .3s ease;
    }
    .feature-impact { color: #475569; text-align: right; font-variant-numeric: tabular-nums; }

    /* Empty state */
    .pred-empty {
      text-align: center;
      padding: 28px 16px;
      color: #64748b;
      font-size: .9rem;
    }
    .empty-icon { font-size: 2rem; margin-bottom: 8px; }
    .pred-empty p { margin: 0; line-height: 1.5; }

    /* Sub-nav */
    .sub-nav { display: flex; gap: 12px; margin-top: 16px; }
    .nav-btn {
      padding: 8px 20px; background: #0f766e; color: #fff; border-radius: 8px;
      text-decoration: none; font-size: .88rem; font-weight: 600;
    }
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

  prediction: PredictionResult | null = null;
  predLoading = false;
  predError = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.api.patient(this.id).subscribe({
      next: (d: any) => {
        this.patient = d;
        this.loading = false;
        if (d.admissionId) {
          this.loadPrediction();
        }
      },
      error: () => { this.error = 'Failed to load patient.'; this.loading = false; }
    });
  }

  loadPrediction() {
    if (!this.id) return;
    this.predLoading = true;
    this.predError = '';
    this.api.patientPrediction(this.id).subscribe({
      next: (p: any) => { this.prediction = p; this.predLoading = false; },
      error: (err: any) => {
        this.predError = err.status === 404
          ? 'NO_ADMISSION'
          : 'Unable to load prediction — ensure the backend and ML service are running.';
        this.predLoading = false;
      }
    });
  }

  bucketClass(bucket: string): string {
    const b = (bucket ?? '').toLowerCase();
    return ['high', 'medium', 'low'].includes(b) ? b : 'medium';
  }

  bucketFillClass(bucket: string): string {
    return this.bucketClass(bucket);
  }

  featureBarPct(impact: number): number {
    const values = (this.prediction?.topFeatures ?? []).map(f => f.impact);
    const max = values.length ? Math.max(...values) : 1;
    return max > 0 ? Math.round((impact / max) * 100) : 0;
  }
}
