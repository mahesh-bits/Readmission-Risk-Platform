
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  template: `
    <header>
      <a routerLink="/" class="brand">Readmission Risk Platform</a>
      <nav>
        <ng-container *ngIf="auth.isAuthenticated(); else loginNav">
          <a routerLink="/patient"   routerLinkActive="active">Patients</a>
          <a routerLink="/provider"  routerLinkActive="active"
             *ngIf="isProviderOrAdmin()">Provider</a>
          <a routerLink="/admin"     routerLinkActive="active"
             *ngIf="isAdmin()">Admin</a>
          <a routerLink="/auth/profile" routerLinkActive="active">Profile</a>
          <a (click)="logout()" class="logout">Sign Out</a>
        </ng-container>
        <ng-template #loginNav>
          <a routerLink="/auth/login" routerLinkActive="active">Sign In</a>
        </ng-template>
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
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,.15);
    }
    .brand {
      color: #fff; text-decoration: none;
      font-size: 1.2rem; font-weight: 700; letter-spacing: -.01em;
    }
    nav { display: flex; gap: 6px; align-items: center; }
    nav a {
      color: rgba(255,255,255,.85);
      text-decoration: none;
      font-weight: 500;
      padding: 6px 13px;
      border-radius: 6px;
      transition: background .15s, color .15s;
      font-size: .88rem;
      cursor: pointer;
    }
    nav a:hover { background: rgba(255,255,255,.15); color: #fff; }
    nav a.active { background: rgba(255,255,255,.2); color: #fff; }
    .logout { border: 1px solid rgba(255,255,255,.3); }
    .logout:hover { background: rgba(255,255,255,.15); }
    main { max-width: 1100px; margin: 28px auto; padding: 0 24px; }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}
  isAdmin()           { return this.auth.getRole() === 'admin'; }
  isProviderOrAdmin() { return ['provider', 'admin'].includes(this.auth.getRole()); }
  logout()            { this.auth.logout(); this.router.navigate(['/auth/login']); }
}
