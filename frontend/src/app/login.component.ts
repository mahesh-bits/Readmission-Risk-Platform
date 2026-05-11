
import { Component } from '@angular/core';
@Component({
  standalone: true,
  selector: 'app-login',
  template: `
    <div class="card">
      <h3>Login</h3>
      <p class="hint">JWT authentication flows will be wired later.</p>
    </div>
  `,
  styles: [`
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
      max-width: 420px;
    }
    h3 { margin: 0 0 12px; color: #1e3a5f; font-size: 1.25rem; }
    .hint { color: #64748b; font-size: .9rem; margin: 0; }
  `]
})
export class LoginComponent {}
