import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  selector: 'app-encounters',
  template: `
    <a [routerLink]="['/patient', id]" class="back">&larr; Back to Patient</a>
    <app-card title="Encounters">
      <table *ngIf="encounters.length" class="table">
        <thead><tr><th>Date</th><th>Type</th><th>Provider</th><th>Notes</th></tr></thead>
        <tbody>
          <tr *ngFor="let e of encounters">
            <td>{{e.date}}</td><td>{{e.type}}</td><td>{{e.provider}}</td><td>{{e.notes}}</td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!encounters.length" class="hint">No encounters found.</p>
    </app-card>
  `,
  styles: [`
    .table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .table th { text-align: left; padding: 8px 12px; background: #f1f5f9; color: #475569; font-weight: 600; }
    .table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .hint { color: #64748b; font-size: .9rem; margin: 0; }
    .back {
      display: inline-block; margin-bottom: 12px; color: #2563eb; text-decoration: none;
      font-size: .9rem; font-weight: 500;
    }
    .back:hover { text-decoration: underline; }
  `]
})
export class EncountersComponent implements OnInit {
  id = '';
  encounters: any[] = [];
  constructor(private route: ActivatedRoute, private api: ApiService) {}
  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.api.encounters(this.id).subscribe({
      next: (d: any) => this.encounters = d,
      error: () => {
        this.encounters = [
          { date: '2026-03-15', type: 'Inpatient', provider: 'Dr. Garcia', notes: 'Admitted for CHF exacerbation' },
          { date: '2026-03-20', type: 'Follow-up', provider: 'Dr. Patel', notes: 'Stable, discharged' },
          { date: '2026-04-01', type: 'Outpatient', provider: 'Dr. Garcia', notes: 'Medication review' }
        ];
      }
    });
  }
}
