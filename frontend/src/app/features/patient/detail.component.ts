import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  selector: 'app-patient-detail',
  template: `
    <a routerLink="/patient" class="back">&larr; Back to Patients</a>
    <app-card [title]="'Patient #' + id">
      <div *ngIf="patient" class="detail">
        <p><strong>Name:</strong> {{patient.name}}</p>
        <p><strong>Age:</strong> {{patient.age}}</p>
        <p><strong>Diagnosis:</strong> {{patient.diagnosis}}</p>
        <p><strong>Length of Stay:</strong> {{patient.los}} days</p>
      </div>
      <div *ngIf="!patient" class="hint">Loading patient data...</div>
      <nav class="sub-nav">
        <a [routerLink]="['/patient', id, 'encounters']" class="link">Encounters</a>
        <a [routerLink]="['/patient', id, 'docs']" class="link">Documents</a>
      </nav>
    </app-card>
  `,
  styles: [`
    .detail p { margin: 4px 0; font-size: .9rem; color: #334155; }
    .hint { color: #64748b; font-size: .9rem; }
    .back {
      display: inline-block; margin-bottom: 12px; color: #2563eb; text-decoration: none;
      font-size: .9rem; font-weight: 500;
    }
    .back:hover { text-decoration: underline; }
    .sub-nav { margin-top: 16px; display: flex; gap: 16px; }
    .link { color: #2563eb; text-decoration: none; font-weight: 500; }
    .link:hover { text-decoration: underline; }
  `]
})
export class PatientDetailComponent implements OnInit {
  id = '';
  patient: any = null;
  constructor(private route: ActivatedRoute, private api: ApiService) {}
  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.api.patient(this.id).subscribe({
      next: (d: any) => this.patient = d,
      error: () => {
        this.patient = { id: this.id, name: 'John Smith', age: 72, diagnosis: 'Heart Failure', los: 5 };
      }
    });
  }
}
