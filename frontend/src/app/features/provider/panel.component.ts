import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../shared/components/card.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  selector: 'app-provider-panel',
  template: `
    <app-card title="Provider Dashboard">
      <div class="stats" *ngIf="summary; else loading">
        <div class="stat"><span class="num">{{ summary.totalPatients }}</span><span class="label">Total Patients</span></div>
        <div class="stat high"><span class="num">{{ highRisk }}</span><span class="label">High-Risk Admissions</span></div>
        <div class="stat"><span class="num">{{ summary.readmissionRate }}%</span><span class="label">30-day Readmission Rate</span></div>
        <div class="stat"><span class="num">{{ summary.avgLos }}</span><span class="label">Avg Length of Stay (days)</span></div>
      </div>
      <ng-template #loading><p class="muted">Loading stats…</p></ng-template>
      <nav class="sub-nav">
        <a routerLink="dashboard" class="link primary">Analytics Dashboard</a>
        <a routerLink="patients"  class="link">My Patients</a>
        <a routerLink="notes"     class="link">Clinical Notes</a>
        <a routerLink="score"     class="link">ML Score Check</a>
      </nav>
    </app-card>
  `,
  styles: [`
    .stats { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 20px; }
    .stat { text-align: center; min-width: 100px; }
    .num { display: block; font-size: 1.8rem; font-weight: 700; color: #1e3a5f; }
    .stat.high .num { color: #dc2626; }
    .label { font-size: .8rem; color: #64748b; }
    .sub-nav { display: flex; gap: 16px; flex-wrap: wrap; }
    .link { color: #2563eb; text-decoration: none; font-weight: 500; }
    .link.primary { background: #0f766e; color: #fff; padding: 6px 14px; border-radius: 8px; }
    .link.primary:hover { background: #115e59; }
    .link:hover { text-decoration: underline; }
    .muted { color: #64748b; font-size: .88rem; }
  `]
})
export class ProviderPanelComponent implements OnInit {
  summary: any = null;
  highRisk = 0;

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const profile    = this.auth.getProfile();
    const providerId = profile?.role === 'provider' ? profile.id : undefined;

    this.api.dashboard(providerId).subscribe({
      next: (d: any) => {
        this.summary = d;
        this.highRisk = (d.conditionGroups as any[])
          .filter(g => g.conditionCount >= 3)
          .reduce((sum: number, g: any) => sum + g.admissions, 0);
      },
      error: () => { this.summary = { totalPatients: '—', readmissionRate: '—', avgLos: '—' }; }
    });
  }
}
