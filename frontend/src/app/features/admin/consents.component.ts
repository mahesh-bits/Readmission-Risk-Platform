import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, CardComponent],
  selector: 'app-admin-consents',
  template: `
    <app-card title="Consent Management">
      <table class="table">
        <thead><tr><th>Patient</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          <tr *ngFor="let c of consents">
            <td>{{c.patient}}</td><td>{{c.type}}</td>
            <td [class]="c.status === 'Granted' ? 'granted' : 'revoked'">{{c.status}}</td>
            <td>{{c.date}}</td>
          </tr>
        </tbody>
      </table>
    </app-card>
  `,
  styles: [`
    .table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .table th { text-align: left; padding: 8px 12px; background: #f1f5f9; color: #475569; font-weight: 600; }
    .table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .granted { color: #16a34a; font-weight: 600; }
    .revoked { color: #dc2626; font-weight: 600; }
  `]
})
export class ConsentsComponent {
  consents = [
    { patient: 'John Smith', type: 'Data Sharing', status: 'Granted', date: '2026-03-10' },
    { patient: 'Mary Johnson', type: 'Research', status: 'Granted', date: '2026-03-12' },
    { patient: 'Robert Davis', type: 'Data Sharing', status: 'Revoked', date: '2026-03-20' },
    { patient: 'Patricia Wilson', type: 'Research', status: 'Granted', date: '2026-04-01' }
  ];
}
