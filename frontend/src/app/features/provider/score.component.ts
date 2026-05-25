import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';

interface MlPredictResponse {
  risk_score: number;
  risk_bucket: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  shap: Record<string, number>;
  top_features: Array<{ name: string; impact: number }>;
  model_version: string;
}

interface AdmissionPrediction {
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
  imports: [CommonModule, FormsModule, CardComponent],
  selector: 'app-provider-score',
  template: `
    <app-card title="ML Risk Score Check">

      <!-- Mode toggle -->
      <div class="mode-tabs">
        <button class="mode-tab" [class.active]="mode === 'manual'"    (click)="switchMode('manual')">Manual Features</button>
        <button class="mode-tab" [class.active]="mode === 'admission'" (click)="switchMode('admission')">By Admission ID</button>
      </div>

      <!-- ── MANUAL MODE ── -->
      <ng-container *ngIf="mode === 'manual'">
        <p class="subtitle">Enter patient features and run a live score check from the ML service.</p>
        <form class="form-grid" (ngSubmit)="checkScore()">
          <div class="field">
            <label for="age">Age</label>
            <input id="age" name="age" type="number" min="0" [(ngModel)]="features.age" required>
          </div>
          <div class="field">
            <label for="los">Length of stay (days)</label>
            <input id="los" name="los" type="number" min="0" [(ngModel)]="features.los" required>
          </div>
          <div class="field">
            <label for="bp">Systolic BP</label>
            <input id="bp" name="bp" type="number" min="0" [(ngModel)]="features.bp_systolic" required>
          </div>
          <div class="field">
            <label for="comorbidities">Comorbidities</label>
            <input id="comorbidities" name="comorbidities" type="number" min="0" [(ngModel)]="features.comorbidities" required>
          </div>
          <div class="field">
            <label for="admissions">Previous admissions</label>
            <input id="admissions" name="admissions" type="number" min="0" [(ngModel)]="features.previous_admissions" required>
          </div>
          <div class="actions">
            <button class="btn" type="submit" [disabled]="loading">
              {{ loading ? 'Checking...' : 'Check Score' }}
            </button>
          </div>
        </form>

        <p *ngIf="error" class="error-box">{{ error }}</p>

        <section *ngIf="manualResult" class="result-wrap">
          <div class="score-header">
            <div>
              <span class="meta-label">Risk Score</span>
              <div class="score-value">{{ manualResult.risk_score | number:'1.2-2' }}</div>
            </div>
            <div class="bucket" [class]="bucketCls(manualResult.risk_bucket)">{{ manualResult.risk_bucket }}</div>
          </div>
          <div class="meter"><div class="meter-fill" [style.width.%]="manualResult.risk_score * 100"></div></div>
          <h4>Top Features</h4>
          <table class="table" *ngIf="manualResult.top_features?.length; else noFeatures">
            <thead><tr><th>Feature</th><th>Impact</th></tr></thead>
            <tbody>
              <tr *ngFor="let item of manualResult.top_features">
                <td>{{ item.name }}</td>
                <td>{{ item.impact | number:'1.3-3' }}</td>
              </tr>
            </tbody>
          </table>
          <ng-template #noFeatures><p class="muted">No top feature details returned.</p></ng-template>
        </section>
      </ng-container>

      <!-- ── BY ADMISSION ID MODE ── -->
      <ng-container *ngIf="mode === 'admission'">
        <p class="subtitle">Enter an admission ID to fetch or compute the readmission risk from the backend.</p>

        <form class="admission-form" (ngSubmit)="checkByAdmission()">
          <div class="field admission-field">
            <label for="admId">Admission ID</label>
            <input
              id="admId"
              name="admId"
              type="text"
              placeholder="e.g. aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
              [(ngModel)]="admissionId"
              required>
          </div>
          <button class="btn" type="submit" [disabled]="admLoading || !admissionId.trim()">
            {{ admLoading ? 'Running…' : 'Run Prediction' }}
          </button>
        </form>

        <p *ngIf="admError" class="error-box">{{ admError }}</p>

        <section *ngIf="admResult" class="result-wrap">

          <!-- Score + bucket -->
          <div class="score-header">
            <div>
              <span class="meta-label">Risk Score</span>
              <div class="score-value">{{ admResult.riskScore | number:'1.2-2' }}</div>
            </div>
            <div class="bucket" [class]="bucketCls(admResult.riskBucket)">{{ admResult.riskBucket }}</div>
          </div>

          <!-- Meter -->
          <div class="meter">
            <div class="meter-fill adm-fill"
                 [style.width.%]="admResult.riskScore * 100"
                 [class]="'meter-fill adm-fill ' + bucketCls(admResult.riskBucket)"></div>
          </div>

          <!-- Meta chips -->
          <div class="meta-row">
            <span class="meta-chip">🤖 {{ admResult.modelVersion ?? 'unknown' }}</span>
            <span class="meta-chip">🕐 {{ admResult.predictedAt | date:'MMM d, y, h:mm a' }}</span>
            <span class="cache-chip" [class.chip-cached]="admResult.cached" [class.chip-fresh]="!admResult.cached">
              {{ admResult.cached ? '⚡ Cached' : '✨ Fresh' }}
            </span>
          </div>

          <!-- Admission + patient IDs -->
          <div class="id-row">
            <span class="id-item"><span class="id-label">Admission</span><code>{{ admResult.admissionId }}</code></span>
            <span class="id-item"><span class="id-label">Patient</span><code>{{ admResult.patientId }}</code></span>
          </div>

          <!-- Top features bar chart -->
          <div *ngIf="admResult.topFeatures?.length" class="features-section">
            <h4>Top Contributing Factors</h4>
            <div class="features-list">
              <div *ngFor="let f of admResult.topFeatures" class="feature-row">
                <span class="feature-name">{{ f.name }}</span>
                <div class="feature-track">
                  <div class="feature-bar" [style.width.%]="featurePct(f.impact)"></div>
                </div>
                <span class="feature-val">{{ f.impact | number:'1.3-3' }}</span>
              </div>
            </div>
          </div>
          <p *ngIf="!admResult.topFeatures?.length" class="muted">No feature breakdown available.</p>
        </section>
      </ng-container>

    </app-card>
  `,
  styles: [`
    /* Mode tabs */
    .mode-tabs {
      display: flex;
      gap: 0;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 18px;
    }
    .mode-tab {
      flex: 1;
      padding: 9px 0;
      border: none;
      background: #f8fafc;
      color: #475569;
      font-size: .85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .15s, color .15s;
    }
    .mode-tab:first-child { border-right: 1px solid #e2e8f0; }
    .mode-tab.active { background: #0f766e; color: #fff; }
    .mode-tab:not(.active):hover { background: #f1f5f9; }

    .subtitle { margin: 0 0 14px; color: #475569; font-size: .92rem; }

    /* Manual form */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 12px;
      align-items: end;
    }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: .8rem; color: #334155; font-weight: 600; }
    .field input {
      padding: 9px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: .9rem;
    }
    .field input:focus { outline: none; border-color: #0284c7; box-shadow: 0 0 0 3px rgba(2,132,199,.12); }
    .actions { display: flex; align-items: flex-end; }

    /* Admission form */
    .admission-form {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      margin-bottom: 4px;
    }
    .admission-field { flex: 1; }
    .admission-field input { width: 100%; box-sizing: border-box; font-family: monospace; font-size: .88rem; }

    .btn {
      border: none;
      border-radius: 8px;
      padding: 10px 18px;
      background: #0f766e;
      color: white;
      font-weight: 600;
      font-size: .88rem;
      cursor: pointer;
      white-space: nowrap;
      transition: background .15s;
    }
    .btn:hover:enabled { background: #115e59; }
    .btn:disabled { opacity: .55; cursor: not-allowed; }

    .error-box {
      color: #b91c1c; background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 10px 12px; border-radius: 8px;
      margin-top: 12px; font-size: .88rem;
    }

    /* Result */
    .result-wrap {
      margin-top: 16px;
      border: 1px solid #dbeafe;
      background: #f8fbff;
      border-radius: 10px;
      padding: 16px;
    }
    .score-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .meta-label { color: #64748b; font-size: .78rem; text-transform: uppercase; letter-spacing: .04em; }
    .score-value { font-size: 2rem; font-weight: 700; color: #0f172a; line-height: 1; margin-top: 4px; }

    .bucket { border-radius: 999px; padding: 6px 14px; font-size: .82rem; font-weight: 700; letter-spacing: .03em; }
    .bucket.high   { background: #fee2e2; color: #991b1b; }
    .bucket.medium { background: #fef3c7; color: #92400e; }
    .bucket.low    { background: #dcfce7; color: #166534; }

    .meter { width: 100%; height: 10px; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin-bottom: 14px; }
    .meter-fill { height: 100%; background: linear-gradient(90deg,#22c55e 0%,#eab308 60%,#ef4444 100%); transition: width .35s; }
    .adm-fill { background: none; }
    .adm-fill.high   { background: #ef4444; }
    .adm-fill.medium { background: #f59e0b; }
    .adm-fill.low    { background: #22c55e; }

    /* Meta + IDs */
    .meta-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .meta-chip { background: #f1f5f9; border-radius: 999px; padding: 3px 10px; font-size: .77rem; color: #475569; }
    .cache-chip { border-radius: 999px; padding: 3px 10px; font-size: .77rem; font-weight: 600; }
    .chip-cached { background: #eff6ff; color: #1d4ed8; }
    .chip-fresh  { background: #f0fdf4; color: #15803d; }

    .id-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
    .id-item { display: flex; flex-direction: column; gap: 2px; }
    .id-label { font-size: .7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; }
    .id-item code { font-size: .78rem; color: #475569; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }

    /* Features */
    .features-section { border-top: 1px solid #e2e8f0; padding-top: 12px; }
    h4 { margin: 0 0 8px; color: #1e293b; font-size: .9rem; }
    .features-list { display: flex; flex-direction: column; gap: 7px; }
    .feature-row { display: grid; grid-template-columns: 150px 1fr 52px; align-items: center; gap: 10px; font-size: .83rem; }
    .feature-name { color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .feature-track { height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
    .feature-bar { height: 100%; background: linear-gradient(90deg,#0ea5e9,#0f766e); border-radius: 999px; transition: width .3s; }
    .feature-val { color: #475569; text-align: right; font-variant-numeric: tabular-nums; }

    .table { width: 100%; border-collapse: collapse; font-size: .88rem; }
    .table th, .table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    .table th { color: #334155; font-weight: 600; background: #eff6ff; }
    .muted { color: #64748b; margin: 0; font-size: .88rem; }
  `]
})
export class ProviderScoreComponent {
  mode: 'manual' | 'admission' = 'admission';

  // Manual mode
  loading = false;
  error = '';
  manualResult: MlPredictResponse | null = null;
  features = { age: 65, los: 4, bp_systolic: 130, comorbidities: 2, previous_admissions: 1 };

  // Admission mode
  admissionId = '';
  admLoading = false;
  admError = '';
  admResult: AdmissionPrediction | null = null;

  constructor(private api: ApiService) {}

  switchMode(m: 'manual' | 'admission') {
    this.mode = m;
    this.manualResult = null;
    this.admResult = null;
    this.error = '';
    this.admError = '';
  }

  checkScore() {
    this.loading = true;
    this.error = '';
    this.api.predictMl(this.features).subscribe({
      next: (res: MlPredictResponse) => { this.manualResult = res; this.loading = false; },
      error: () => { this.error = 'Unable to reach ML service. Check mlServiceBaseUrl and service health.'; this.loading = false; }
    });
  }

  checkByAdmission() {
    if (!this.admissionId.trim()) return;
    this.admLoading = true;
    this.admError = '';
    this.admResult = null;
    this.api.admissionPrediction(this.admissionId.trim()).subscribe({
      next: (res: any) => { this.admResult = res; this.admLoading = false; },
      error: (err: any) => {
        this.admError = err.status === 404
          ? `Admission "${this.admissionId}" not found.`
          : 'Failed to fetch prediction — ensure the backend and ML service are running.';
        this.admLoading = false;
      }
    });
  }

  bucketCls(bucket: string): string {
    const b = (bucket ?? '').toLowerCase();
    return ['high', 'medium', 'low'].includes(b) ? b : 'medium';
  }

  featurePct(impact: number): number {
    const values = (this.admResult?.topFeatures ?? []).map(f => f.impact);
    const max = values.length ? Math.max(...values) : 1;
    return max > 0 ? Math.round((impact / max) * 100) : 0;
  }
}
