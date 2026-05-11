import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-card',
  template: `
    <div class="card">
      <h3 *ngIf="title">{{title}}</h3>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
      margin-bottom: 16px;
    }
    h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 1.25rem; }
  `]
})
export class CardComponent {
  @Input() title = '';
}
