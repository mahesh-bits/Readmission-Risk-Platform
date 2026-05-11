import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';
import { RiskLevelPipe } from '../../shared/pipes/risk-level.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, RiskLevelPipe],
  selector: 'app-patient-search',
  template: `
    <app-card title="Patient Search">
      <button class="btn" (click)="load()">Load Patients</button>
      <table *ngIf="patients" class="table">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Age</th><th>Diagnosis</th><th>LOS</th><th>Risk</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of patients">
            <td>{{p.id}}</td><td>{{p.name}}</td><td>{{p.age}}</td><td>{{p.diagnosis}}</td>
            <td>{{p.los}} days</td><td [class]="riskClass(p.riskScore)">{{p.riskScore | riskLevel}}</td>
            <td><a [routerLink]="['/patient', p.id]" class="link">View</a></td>
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
    .high { color: #dc2626; font-weight: 600; }
    .medium { color: #d97706; font-weight: 600; }
    .low { color: #16a34a; font-weight: 600; }
    .link { color: #2563eb; text-decoration: none; }
    .link:hover { text-decoration: underline; }
  `]
})
export class PatientSearchComponent {
  patients: any[] | null = null;
  constructor(private api: ApiService) {}
  load() {
    this.api.patients().subscribe({
      next: (d: any) => this.patients = d,
      error: () => {
        this.patients = [
          { id: 1, name: 'John Smith', age: 72, diagnosis: 'Heart Failure', los: 5, riskScore: 0.82 },
          { id: 2, name: 'Mary Johnson', age: 65, diagnosis: 'Pneumonia', los: 3, riskScore: 0.45 },
          { id: 3, name: 'Robert Davis', age: 80, diagnosis: 'COPD', los: 7, riskScore: 0.91 },
          { id: 4, name: 'Patricia Wilson', age: 58, diagnosis: 'Diabetes', los: 2, riskScore: 0.30 },
          { id: 5, name: 'James Brown', age: 69, diagnosis: 'Stroke', los: 6, riskScore: 0.67 }
        ];
      }
    });
  }
  riskClass(score: number) { return score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'; }
}
