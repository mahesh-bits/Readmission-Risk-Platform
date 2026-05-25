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

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  selector: 'app-provider-score',
  template: `
    <app-card title="ML Risk Score Check">
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

      <p *ngIf="error" class="error">{{ error }}</p>

      <section *ngIf="result" class="result-wrap">
        <div class="score-header">
          <div>
            <span class="label">Risk Score</span>
            <div class="score-value">{{ result.risk_score | number:'1.2-2' }}</div>
          </div>
          <div class="bucket" [class]="bucketClass(result.risk_bucket)">{{ result.risk_bucket }}</div>
        </div>

        <div class="meter">
          <div class="meter-fill" [style.width.%]="result.risk_score * 100"></div>
        </div>

        <h4>Top Features</h4>
        <table class="table" *ngIf="result.top_features?.length; else noTopFeatures">
          <thead>
            <tr><th>Feature</th><th>Impact</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of result.top_features">
              <td>{{ item.name }}</td>
              <td>{{ item.impact | number:'1.3-3' }}</td>
            </tr>
          </tbody>
        </table>

        <ng-template #noTopFeatures>
          <p class="muted">No top feature details returned by the API.</p>
        </ng-template>
      </section>
    </app-card>
  `,
  styles: [`
    .subtitle {
      margin: 0 0 14px;
      color: #475569;
      font-size: .92rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 12px;
      align-items: end;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .field label {
      font-size: .8rem;
      color: #334155;
      font-weight: 600;
    }
    .field input {
      padding: 9px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: .9rem;
    }
    .field input:focus {
      outline: none;
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, .12);
    }
    .actions {
      display: flex;
      justify-content: flex-start;
    }
    .btn {
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      background: #0f766e;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: background .2s ease;
    }
    .btn:hover:enabled { background: #115e59; }
    .btn:disabled { opacity: .65; cursor: not-allowed; }
    .error {
      color: #b91c1c;
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 10px 12px;
      border-radius: 8px;
      margin-top: 12px;
    }
    .result-wrap {
      margin-top: 16px;
      border: 1px solid #dbeafe;
      background: #f8fbff;
      border-radius: 10px;
      padding: 14px;
    }
    .score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .label {
      color: #64748b;
      font-size: .78rem;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .score-value {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1;
      margin-top: 4px;
    }
    .bucket {
      border-radius: 999px;
      padding: 6px 12px;
      font-size: .8rem;
      font-weight: 700;
      letter-spacing: .03em;
    }
    .bucket.low {
      background: #dcfce7;
      color: #166534;
    }
    .bucket.medium {
      background: #fef3c7;
      color: #92400e;
    }
    .bucket.high {
      background: #fee2e2;
      color: #991b1b;
    }
    .meter {
      width: 100%;
      height: 10px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 14px;
    }
    .meter-fill {
      height: 100%;
      background: linear-gradient(90deg, #22c55e 0%, #eab308 60%, #ef4444 100%);
      transition: width .3s ease;
    }
    h4 {
      margin: 0 0 8px;
      color: #1e293b;
      font-size: .95rem;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: .88rem;
    }
    .table th,
    .table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
    }
    .table th {
      color: #334155;
      font-weight: 600;
      background: #eff6ff;
    }
    .muted {
      color: #64748b;
      margin: 0;
    }
  `]
})
export class ProviderScoreComponent {
  loading = false;
  error = '';
  result: MlPredictResponse | null = null;

  features = {
    age: 65,
    los: 4,
    bp_systolic: 130,
    comorbidities: 2,
    previous_admissions: 1
  };

  constructor(private api: ApiService) {}

  checkScore() {
    this.loading = true;
    this.error = '';

    this.api.predictMl(this.features).subscribe({
      next: (res: MlPredictResponse) => {
        this.result = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to fetch score from ML service. Verify mlServiceBaseUrl and service health.';
      }
    });
  }

  bucketClass(bucket: string): string {
    const normalized = (bucket || '').toLowerCase();
    return normalized === 'high' || normalized === 'medium' || normalized === 'low'
      ? `bucket ${normalized}`
      : 'bucket medium';
  }
}
