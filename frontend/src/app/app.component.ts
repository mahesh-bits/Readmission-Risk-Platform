
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  template: `
    <header>
      <h1>Readmission Risk Platform</h1>
      <nav>
        <a routerLink="/patient" routerLinkActive="active">Patients</a>
        <a routerLink="/provider" routerLinkActive="active">Provider</a>
        <a routerLink="/admin" routerLinkActive="active">Admin</a>
        <a routerLink="/auth/profile" routerLinkActive="active">Profile</a>
        <a routerLink="/auth/login" routerLinkActive="active">Login</a>
      </nav>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    header {
      background: linear-gradient(135deg, #1e3a5f, #2563eb);
      color: #fff;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,.15);
    }
    h1 { margin: 0; font-size: 1.4rem; font-weight: 600; }
    nav { display: flex; gap: 12px; }
    nav a {
      color: rgba(255,255,255,.8);
      text-decoration: none;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: 6px;
      transition: background .2s, color .2s;
      font-size: .9rem;
    }
    nav a:hover { background: rgba(255,255,255,.15); color: #fff; }
    nav a.active { background: rgba(255,255,255,.2); color: #fff; }
    main { max-width: 960px; margin: 24px auto; padding: 0 24px; }
  `]
})
export class AppComponent {}
