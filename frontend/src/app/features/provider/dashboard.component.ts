import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent } from '../../shared/components/card.component';

interface AgeBucket      { ageGroup: string;      count: number;      readmissions: number; }
interface ConditionGroup { conditionCount: number; admissions: number; }
interface MonthlyTrend   { month: string;          admissions: number; readmissions: number; }
interface LosBucket      { losRange: string;       count: number; }

interface DashboardStats {
  totalAdmissions:  number;
  totalPatients:    number;
  readmissions:     number;
  readmissionRate:  number;
  avgLos:           number;
  avgAge:           number;
  maleCount:        number;
  femaleCount:      number;
  ageBuckets:       AgeBucket[];
  conditionGroups:  ConditionGroup[];
  monthlyTrend:     MonthlyTrend[];
  losBuckets:       LosBucket[];
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, DecimalPipe],
  selector: 'app-dashboard',
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Readmission Analytics Dashboard</h2>
        <a routerLink="/provider" class="back-link">← Back to Panel</a>
      </div>

      <!-- Loading / Error -->
      <div *ngIf="loading" class="state-msg">Loading dashboard data…</div>
      <div *ngIf="error"   class="state-msg error">{{ error }}</div>

      <ng-container *ngIf="stats && !loading">

        <!-- KPI row -->
        <div class="kpi-row">
          <div class="kpi">
            <span class="kpi-value">{{ stats.totalPatients }}</span>
            <span class="kpi-label">Total Patients</span>
          </div>
          <div class="kpi">
            <span class="kpi-value">{{ stats.totalAdmissions }}</span>
            <span class="kpi-label">Total Admissions</span>
          </div>
          <div class="kpi accent-red">
            <span class="kpi-value">{{ stats.readmissionRate }}%</span>
            <span class="kpi-label">30-day Readmission Rate</span>
            <span class="kpi-sub">{{ stats.readmissions }} readmissions</span>
          </div>
          <div class="kpi accent-blue">
            <span class="kpi-value">{{ stats.avgLos | number:'1.1-1' }}</span>
            <span class="kpi-label">Avg Length of Stay (days)</span>
          </div>
          <div class="kpi">
            <span class="kpi-value">{{ stats.avgAge | number:'1.1-1' }}</span>
            <span class="kpi-label">Avg Patient Age</span>
          </div>
          <div class="kpi accent-teal">
            <span class="kpi-value">{{ malePct }}% M / {{ femalePct }}% F</span>
            <span class="kpi-label">Sex Distribution</span>
            <span class="kpi-sub">{{ stats.maleCount }} male · {{ stats.femaleCount }} female</span>
          </div>
        </div>

        <!-- Charts row -->
        <div class="charts-row">

          <!-- Monthly Admissions Trend -->
          <app-card title="Monthly Admissions (Last 6 Months)">
            <div *ngIf="stats.monthlyTrend.length; else noData" class="bar-chart">
              <div *ngFor="let m of stats.monthlyTrend" class="bar-group">
                <div class="bars">
                  <div class="bar adm"
                       [style.height.px]="barPx(m.admissions, maxMonthlyAdm)"
                       [title]="m.admissions + ' admissions'"></div>
                  <div class="bar rdm"
                       [style.height.px]="barPx(m.readmissions, maxMonthlyAdm)"
                       [title]="m.readmissions + ' readmissions'"></div>
                </div>
                <span class="bar-label">{{ m.month | slice:5 }}</span>
              </div>
            </div>
            <div class="legend">
              <span class="dot adm"></span> Admissions &nbsp;
              <span class="dot rdm"></span> Readmissions
            </div>
            <ng-template #noData><p class="muted">No data in the last 6 months.</p></ng-template>
          </app-card>

          <!-- Age Distribution -->
          <app-card title="Age Distribution">
            <table class="dist-table">
              <thead>
                <tr><th>Age Group</th><th>Admissions</th><th>Readmitted</th><th>Rate</th><th></th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of stats.ageBuckets">
                  <td class="group-label">{{ b.ageGroup }}</td>
                  <td>{{ b.count }}</td>
                  <td>{{ b.readmissions }}</td>
                  <td>{{ pct(b.readmissions, b.count) }}%</td>
                  <td class="bar-cell">
                    <div class="h-bar" [style.width.%]="pctNum(b.count, maxAgeBucket)"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </app-card>

        </div>

        <!-- Second row -->
        <div class="charts-row">

          <!-- Chronic Condition Load -->
          <app-card title="Chronic Condition Load">
            <table class="dist-table">
              <thead>
                <tr><th>Conditions</th><th>Admissions</th><th>Share</th><th></th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let g of stats.conditionGroups">
                  <td class="group-label">
                    <span class="badge" [class]="condBadge(g.conditionCount)">
                      {{ g.conditionCount === 0 ? 'None' : g.conditionCount + (g.conditionCount === 1 ? ' condition' : ' conditions') }}
                    </span>
                  </td>
                  <td>{{ g.admissions }}</td>
                  <td>{{ pct(g.admissions, stats.totalAdmissions) }}%</td>
                  <td class="bar-cell">
                    <div class="h-bar cond" [style.width.%]="pctNum(g.admissions, maxCondGroup)"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </app-card>

          <!-- LOS Distribution -->
          <app-card title="Length of Stay Distribution">
            <table class="dist-table">
              <thead>
                <tr><th>LOS Range</th><th>Admissions</th><th>Share</th><th></th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let l of stats.losBuckets">
                  <td class="group-label">{{ l.losRange }}</td>
                  <td>{{ l.count }}</td>
                  <td>{{ pct(l.count, stats.totalAdmissions) }}%</td>
                  <td class="bar-cell">
                    <div class="h-bar los" [style.width.%]="pctNum(l.count, maxLosBucket)"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </app-card>

        </div>

        <!-- Sex readmission breakdown -->
        <app-card title="Readmission Rate by Sex">
          <div class="sex-row">
            <div *ngFor="let s of sexStats" class="sex-card">
              <div class="sex-icon">{{ s.sex === 'M' ? '♂' : '♀' }}</div>
              <div class="sex-count">{{ s.count }}</div>
              <div class="sex-label">{{ s.sex === 'M' ? 'Male' : 'Female' }} admissions</div>
              <div class="sex-pct">{{ s.share }}% of total</div>
            </div>
          </div>
        </app-card>

      </ng-container>
    </div>
  `,
  styles: [`
    .page { padding: 0 16px 32px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 20px; }
    .page-title { font-size: 1.3rem; font-weight: 700; color: #0f172a; margin: 0; }
    .back-link { color: #2563eb; text-decoration: none; font-size: .88rem; }
    .back-link:hover { text-decoration: underline; }

    /* KPI */
    .kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 20px; }
    .kpi {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 18px 16px; display: flex; flex-direction: column; gap: 4px;
    }
    .kpi.accent-red  { border-left: 4px solid #ef4444; }
    .kpi.accent-blue { border-left: 4px solid #3b82f6; }
    .kpi.accent-teal { border-left: 4px solid #0f766e; }
    .kpi-value { font-size: 1.7rem; font-weight: 700; color: #0f172a; line-height: 1; }
    .kpi-label { font-size: .76rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
    .kpi-sub   { font-size: .75rem; color: #94a3b8; }

    /* Charts grid */
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    @media (max-width: 720px) { .charts-row { grid-template-columns: 1fr; } }

    /* Vertical bar chart */
    .bar-chart { display: flex; gap: 8px; align-items: flex-end; height: 140px; padding-bottom: 4px; }
    .bar-group { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
    .bars      { display: flex; gap: 2px; align-items: flex-end; }
    .bar { width: 14px; border-radius: 3px 3px 0 0; min-height: 3px; transition: height .3s ease; }
    .bar.adm { background: #3b82f6; }
    .bar.rdm { background: #ef4444; }
    .bar-label { font-size: .7rem; color: #64748b; }
    .legend { display: flex; gap: 12px; margin-top: 10px; font-size: .78rem; color: #475569; align-items: center; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }
    .dot.adm { background: #3b82f6; }
    .dot.rdm { background: #ef4444; }

    /* Distribution table */
    .dist-table { width: 100%; border-collapse: collapse; font-size: .85rem; }
    .dist-table th { text-align: left; padding: 6px 8px; background: #f8fafc; color: #475569; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
    .dist-table td { padding: 7px 8px; border-bottom: 1px solid #f1f5f9; }
    .group-label { font-weight: 500; color: #1e293b; }
    .bar-cell { width: 100px; }
    .h-bar { height: 8px; border-radius: 999px; background: #3b82f6; min-width: 2px; transition: width .3s ease; }
    .h-bar.cond { background: #8b5cf6; }
    .h-bar.los  { background: #0d9488; }

    /* Badges */
    .badge { padding: 2px 8px; border-radius: 999px; font-size: .78rem; font-weight: 600; }
    .badge.none  { background: #f1f5f9; color: #475569; }
    .badge.low   { background: #dcfce7; color: #166534; }
    .badge.med   { background: #fef3c7; color: #92400e; }
    .badge.high  { background: #fee2e2; color: #991b1b; }

    /* Sex row */
    .sex-row { display: flex; gap: 24px; flex-wrap: wrap; }
    .sex-card { background: #f8fafc; border-radius: 10px; padding: 16px 24px; text-align: center; min-width: 140px; }
    .sex-icon  { font-size: 2rem; }
    .sex-count { font-size: 1.6rem; font-weight: 700; color: #0f172a; }
    .sex-label { font-size: .8rem; color: #475569; }
    .sex-pct   { font-size: .75rem; color: #94a3b8; margin-top: 2px; }

    /* States */
    .state-msg { padding: 24px; text-align: center; color: #64748b; font-size: .95rem; }
    .state-msg.error { color: #b91c1c; background: #fef2f2; border-radius: 8px; }
    .muted { color: #94a3b8; font-size: .85rem; margin: 0; }
  `]
})
export class DashboardComponent implements OnInit {
  stats:   DashboardStats | null = null;
  loading  = true;
  error    = '';

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const profile    = this.auth.getProfile();
    const providerId = profile?.role === 'provider' ? profile.id : undefined;

    this.api.dashboard(providerId).subscribe({
      next: (d: any) => { this.stats = d; this.loading = false; },
      error: () => { this.error = 'Failed to load dashboard — ensure the backend is running.'; this.loading = false; }
    });
  }

  get malePct()  { return this.stats ? this.pct(this.stats.maleCount,   this.stats.totalAdmissions) : 0; }
  get femalePct(){ return this.stats ? this.pct(this.stats.femaleCount, this.stats.totalAdmissions) : 0; }

  get maxMonthlyAdm() { return Math.max(...(this.stats?.monthlyTrend.map(m => m.admissions) ?? [1]), 1); }
  get maxAgeBucket()  { return Math.max(...(this.stats?.ageBuckets.map(b => b.count)         ?? [1]), 1); }
  get maxCondGroup()  { return Math.max(...(this.stats?.conditionGroups.map(g => g.admissions)  ?? [1]), 1); }
  get maxLosBucket()  { return Math.max(...(this.stats?.losBuckets.map(l => l.count)         ?? [1]), 1); }

  get sexStats() {
    if (!this.stats) return [];
    return [
      { sex: 'M', count: this.stats.maleCount,   share: this.pct(this.stats.maleCount,   this.stats.totalAdmissions) },
      { sex: 'F', count: this.stats.femaleCount, share: this.pct(this.stats.femaleCount, this.stats.totalAdmissions) }
    ];
  }

  barPx(val: number, max: number): number {
    return max > 0 ? Math.max(4, Math.round((val / max) * 120)) : 4;
  }

  pct(part: number, total: number): number {
    return total > 0 ? Math.round((part / total) * 1000) / 10 : 0;
  }

  pctNum(part: number, max: number): number {
    return max > 0 ? Math.round((part / max) * 100) : 0;
  }

  condBadge(count: number): string {
    if (count === 0) return 'badge none';
    if (count <= 1)  return 'badge low';
    if (count <= 2)  return 'badge med';
    return 'badge high';
  }
}
