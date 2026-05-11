import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card.component';
import { RiskLevelPipe } from '../../shared/pipes/risk-level.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, CardComponent, RiskLevelPipe],
  selector: 'app-provider-patients',
  template: `
    <app-card title="My Patients">
      <table class="table">
        <thead><tr><th>Name</th><th>Age</th><th>Diagnosis</th><th>Risk</th></tr></thead>
        <tbody>
          <tr *ngFor="let p of patients">
            <td>{{p.name}}</td><td>{{p.age}}</td><td>{{p.diagnosis}}</td>
            <td [class]="riskClass(p.riskScore)">{{p.riskScore | riskLevel}}</td>
          </tr>
        </tbody>
      </table>
    </app-card>
  `,
  styles: [`
    .table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .table th { text-align: left; padding: 8px 12px; background: #f1f5f9; color: #475569; font-weight: 600; }
    .table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .high { color: #dc2626; font-weight: 600; }
    .medium { color: #d97706; font-weight: 600; }
    .low { color: #16a34a; font-weight: 600; }
  `]
})
export class ProviderPatientsComponent {
  patients = [
    { name: 'John Smith', age: 72, diagnosis: 'Heart Failure', riskScore: 0.82 },
    { name: 'Mary Johnson', age: 65, diagnosis: 'Pneumonia', riskScore: 0.45 },
    { name: 'Robert Davis', age: 80, diagnosis: 'COPD', riskScore: 0.91 }
  ];
  riskClass(score: number) { return score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'; }
}
