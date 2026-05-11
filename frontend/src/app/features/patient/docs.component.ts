import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  selector: 'app-docs',
  template: `
    <a [routerLink]="['/patient', id]" class="back">&larr; Back to Patient</a>
    <app-card title="Documents">
      <ul *ngIf="docs.length" class="doc-list">
        <li *ngFor="let d of docs" class="doc-item">
          <span class="doc-name">{{d.name}}</span>
          <span class="doc-type">{{d.type}}</span>
          <span class="doc-date">{{d.date}}</span>
        </li>
      </ul>
      <p *ngIf="!docs.length" class="hint">No documents found.</p>
    </app-card>
  `,
  styles: [`
    .doc-list { list-style: none; padding: 0; margin: 0; }
    .doc-item {
      display: flex; gap: 16px; padding: 10px 0;
      border-bottom: 1px solid #e2e8f0; font-size: .9rem;
    }
    .doc-name { flex: 1; color: #1e293b; font-weight: 500; }
    .doc-type { color: #64748b; min-width: 100px; }
    .doc-date { color: #94a3b8; min-width: 100px; }
    .hint { color: #64748b; font-size: .9rem; margin: 0; }
    .back {
      display: inline-block; margin-bottom: 12px; color: #2563eb; text-decoration: none;
      font-size: .9rem; font-weight: 500;
    }
    .back:hover { text-decoration: underline; }
  `]
})
export class DocsComponent implements OnInit {
  id = '';
  docs: any[] = [];
  constructor(private route: ActivatedRoute, private api: ApiService) {}
  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.api.documents(this.id).subscribe({
      next: (d: any) => this.docs = d,
      error: () => {
        this.docs = [
          { name: 'Discharge Summary', type: 'Clinical', date: '2026-03-20' },
          { name: 'Lab Results', type: 'Diagnostic', date: '2026-03-18' },
          { name: 'Consent Form', type: 'Administrative', date: '2026-03-15' }
        ];
      }
    });
  }
}
