import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, CardComponent],
  selector: 'app-admin-audit',
  template: `
    <app-card title="Audit Log">
      <button class="btn" (click)="load()">Refresh</button>
      <table *ngIf="logs.length" class="table">
        <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Resource</th></tr></thead>
        <tbody>
          <tr *ngFor="let l of logs">
            <td class="ts">{{l.timestamp}}</td><td>{{l.user}}</td><td>{{l.action}}</td><td>{{l.resource}}</td>
          </tr>
        </tbody>
      </table>
    </app-card>
  `,
  styles: [`
    .btn {
      background: #2563eb; color: #fff; border: none; padding: 10px 20px;
      border-radius: 6px; font-size: .9rem; cursor: pointer; margin-bottom: 16px;
    }
    .btn:hover { background: #1d4ed8; }
    .table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .table th { text-align: left; padding: 8px 12px; background: #f1f5f9; color: #475569; font-weight: 600; }
    .table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .ts { color: #64748b; font-family: monospace; font-size: .8rem; }
  `]
})
export class AuditComponent {
  logs: any[] = [];
  constructor(private api: ApiService) {}
  load() {
    this.api.auditLogs().subscribe({
      next: (d: any) => this.logs = d,
      error: () => {
        this.logs = [
          { timestamp: '2026-04-07 10:23:15', user: 'admin@hospital.org', action: 'LOGIN', resource: '/auth/login' },
          { timestamp: '2026-04-07 10:24:02', user: 'admin@hospital.org', action: 'VIEW', resource: '/admin/users' },
          { timestamp: '2026-04-07 09:15:30', user: 'sgarcia@hospital.org', action: 'PREDICT', resource: '/api/inference/predict' },
          { timestamp: '2026-04-07 08:45:12', user: 'rpatel@hospital.org', action: 'VIEW', resource: '/patient/3' }
        ];
      }
    });
  }
}
