import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  selector: 'app-login',
  template: `
    <app-card title="Sign In">
      <form (ngSubmit)="onLogin()" class="login-form">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" [(ngModel)]="email" name="email" type="email"
                 placeholder="you@hospital.org" autocomplete="email" />
        </div>
        <div class="field">
          <label for="pass">Password</label>
          <input id="pass" [(ngModel)]="password" name="password" type="password"
                 placeholder="Any value (dev mode)" autocomplete="current-password" />
        </div>
        <p *ngIf="error" class="error">{{ error }}</p>
        <button class="btn" type="submit" [disabled]="loading">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
        <p class="hint">
          Try <code>admin&#64;hospital.org</code> (Admin) or
          <code>sgarcia&#64;hospital.org</code> (Provider)
        </p>
      </form>
    </app-card>
  `,
  styles: [`
    .login-form { max-width: 360px; }
    .field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
    .field label { font-size: .8rem; font-weight: 600; color: #475569; }
    .field input {
      padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: .9rem;
    }
    .field input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.15); }
    .btn {
      background: #2563eb; color: #fff; border: none; padding: 10px 24px;
      border-radius: 6px; font-size: .9rem; cursor: pointer; width: 100%;
    }
    .btn:disabled { background: #93c5fd; cursor: not-allowed; }
    .btn:not(:disabled):hover { background: #1d4ed8; }
    .error { color: #dc2626; font-size: .85rem; margin: 0 0 12px; }
    .hint { font-size: .78rem; color: #94a3b8; margin-top: 12px; }
    .hint code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; color: #475569; }
  `]
})
export class LoginComponent {
  email    = '';
  password = '';
  loading  = false;
  error    = '';

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

  onLogin() {
    if (!this.email.trim()) { this.error = 'Email is required'; return; }
    this.loading = true;
    this.error   = '';

    this.api.login(this.email.trim(), this.password).subscribe({
      next: (profile: any) => {
        this.auth.setProfile(profile);
        this.router.navigate([profile.role === 'admin' ? '/admin' : '/provider']);
      },
      error: () => {
        this.error   = 'User not found or inactive.';
        this.loading = false;
      }
    });
  }
}
