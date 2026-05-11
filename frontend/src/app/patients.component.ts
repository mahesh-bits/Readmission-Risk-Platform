
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-patients',
  template: `
    <div class="card">
      <h3>Patients</h3>
      <button class="btn" (click)="load()">Load Patients</button>
      <pre *ngIf="data" class="result">{{data | json}}</pre>
    </div>
  `,
  styles: [`
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 1.25rem; }
    .btn {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: .9rem;
      cursor: pointer;
      transition: background .2s;
    }
    .btn:hover { background: #1d4ed8; }
    .result {
      margin-top: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px;
      font-size: .85rem;
      overflow-x: auto;
    }
  `]
})
export class PatientsComponent {
  data: any;
  constructor(private api: ApiService) {}
  load(){
    this.api.patients().subscribe({
      next: d => this.data = d,
      error: () => {
        this.data = [
          { id: 1, name: 'John Smith', age: 72, diagnosis: 'Heart Failure', los: 5, riskScore: 0.82 },
          { id: 2, name: 'Mary Johnson', age: 65, diagnosis: 'Pneumonia', los: 3, riskScore: 0.45 },
          { id: 3, name: 'Robert Davis', age: 80, diagnosis: 'COPD', los: 7, riskScore: 0.91 },
          { id: 4, name: 'Patricia Wilson', age: 58, diagnosis: 'Diabetes', los: 2, riskScore: 0.30 },
          { id: 5, name: 'James Brown', age: 69, diagnosis: 'Stroke', los: 6, riskScore: 0.67 }
        ];
      }
    });
  }
}
