import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  selector: 'app-login',
  template: `
    <app-card title="Login">
      <form (ngSubmit)="onLogin()" class="login-form">
        <div class="field">
          <label for="user">Username</label>
          <input id="user" [(ngModel)]="username" name="username" placeholder="Enter username">
        </div>
        <div class="field">
          <label for="pass">Password</label>
          <input id="pass" [(ngModel)]="password" name="password" type="password" placeholder="Enter password">
        </div>
        <p *ngIf="error" class="error">{{error}}</p>
        <button class="btn" type="submit">Sign In</button>
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
      border-radius: 6px; font-size: .9rem; cursor: pointer;
    }
    .btn:hover { background: #1d4ed8; }
    .error { color: #dc2626; font-size: .85rem; margin: 0 0 12px; }
  `]
})
export class LoginComponent {
  username = ''; password = ''; error = '';
  constructor(private auth: AuthService, private router: Router) {}
  onLogin() {
    if (this.auth.login(this.username, this.password)) {
      this.router.navigate(['/patient']);
    } else {
      this.error = 'Invalid credentials';
    }
  }
}
