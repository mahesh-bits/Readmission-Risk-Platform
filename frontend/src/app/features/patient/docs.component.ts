import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';

interface DocRow {
  name: string;
  type: string;
  date: string;
  summary: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  selector: 'app-docs',
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Documents</h2>
        <a [routerLink]="['/patient', id]" class="back-link">← Back to Patient</a>
      </div>

      <div *ngIf="loading" class="state-msg">Loading documents…</div>
      <div *ngIf="error"   class="state-msg error">{{ error }}</div>

      <app-card *ngIf="!loading && !error">
        <ul *ngIf="docs.length; else empty" class="doc-list">
          <li *ngFor="let d of docs" class="doc-item">
            <div class="doc-left">
              <span class="doc-icon">{{ typeIcon(d.type) }}</span>
            </div>
            <div class="doc-body">
              <div class="doc-title">{{ d.name }}</div>
              <div class="doc-summary">{{ d.summary }}</div>
            </div>
            <div class="doc-meta">
              <span class="doc-type-badge" [class]="typeBadge(d.type)">{{ d.type }}</span>
              <span class="doc-date">{{ d.date }}</span>
            </div>
          </li>
        </ul>
        <ng-template #empty><p class="hint">No documents on record.</p></ng-template>
      </app-card>
    </div>
  `,
  styles: [`
    .page { padding: 0 16px 32px; max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 20px; }
    .page-title { font-size: 1.3rem; font-weight: 700; color: #0f172a; margin: 0; }
    .back-link { color: #2563eb; text-decoration: none; font-size: .88rem; }
    .back-link:hover { text-decoration: underline; }

    .doc-list { list-style: none; padding: 0; margin: 0; }
    .doc-item {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 14px 0; border-bottom: 1px solid #f1f5f9;
    }
    .doc-item:last-child { border-bottom: none; }
    .doc-left { flex-shrink: 0; }
    .doc-icon { font-size: 1.6rem; }
    .doc-body { flex: 1; min-width: 0; }
    .doc-title { font-weight: 600; color: #0f172a; font-size: .9rem; margin-bottom: 3px; }
    .doc-summary { color: #64748b; font-size: .82rem; line-height: 1.4; }
    .doc-meta { flex-shrink: 0; text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
    .doc-date { font-size: .8rem; color: #94a3b8; font-family: monospace; }

    .doc-type-badge { padding: 2px 8px; border-radius: 999px; font-size: .75rem; font-weight: 600; }
    .clinical       { background: #dbeafe; color: #1e40af; }
    .diagnostic     { background: #dcfce7; color: #166534; }
    .administrative { background: #f3e8ff; color: #6b21a8; }

    .hint { color: #64748b; font-size: .9rem; margin: 0; }
    .state-msg { padding: 24px; text-align: center; color: #64748b; font-size: .95rem; }
    .state-msg.error { color: #b91c1c; background: #fef2f2; border-radius: 8px; }
  `]
})
export class DocsComponent implements OnInit {
  id = '';
  docs: DocRow[] = [];
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.api.documents(this.id).subscribe({
      next: (d: any) => { this.docs = d; this.loading = false; },
      error: () => { this.error = 'Failed to load documents.'; this.loading = false; }
    });
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      'Clinical':       '🩺',
      'Diagnostic':     '🔬',
      'Administrative': '📋',
    };
    return map[type] ?? '📄';
  }

  typeBadge(type: string): string {
    return type?.toLowerCase() ?? '';
  }
}
