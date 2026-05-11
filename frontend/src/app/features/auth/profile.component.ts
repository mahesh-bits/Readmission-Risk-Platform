import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, CardComponent],
  selector: 'app-profile',
  template: `
    <app-card title="Profile">
      <div class="info">
        <p><strong>Role:</strong> {{auth.getRole()}}</p>
        <p><strong>Status:</strong> {{auth.isAuthenticated() ? 'Authenticated' : 'Not logged in'}}</p>
      </div>
      <button class="btn" (click)="logout()">Logout</button>
    </app-card>
  `,
  styles: [`
    .info p { margin: 4px 0; font-size: .9rem; color: #334155; }
    .btn {
      margin-top: 16px; background: #dc2626; color: #fff; border: none; padding: 10px 20px;
      border-radius: 6px; font-size: .9rem; cursor: pointer;
    }
    .btn:hover { background: #b91c1c; }
  `]
})
export class ProfileComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout() { this.auth.logout(); this.router.navigate(['/auth/login']); }
}
