import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  selector: 'app-provider-panel',
  template: `
    <app-card title="Provider Dashboard">
      <div class="stats">
        <div class="stat"><span class="num">12</span><span class="label">Active Patients</span></div>
        <div class="stat"><span class="num">3</span><span class="label">High Risk</span></div>
        <div class="stat"><span class="num">5</span><span class="label">Pending Reviews</span></div>
      </div>
      <nav class="sub-nav">
        <a routerLink="patients" class="link">My Patients</a>
        <a routerLink="notes" class="link">Clinical Notes</a>
      </nav>
    </app-card>
  `,
  styles: [`
    .stats { display: flex; gap: 24px; margin-bottom: 20px; }
    .stat { text-align: center; }
    .num { display: block; font-size: 1.8rem; font-weight: 700; color: #1e3a5f; }
    .label { font-size: .8rem; color: #64748b; }
    .sub-nav { display: flex; gap: 16px; }
    .link { color: #2563eb; text-decoration: none; font-weight: 500; }
    .link:hover { text-decoration: underline; }
  `]
})
export class ProviderPanelComponent {}
