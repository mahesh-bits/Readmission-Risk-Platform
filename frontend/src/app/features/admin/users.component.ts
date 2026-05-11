import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, CardComponent],
  selector: 'app-admin-users',
  template: `
    <app-card title="User Management">
      <button class="btn" (click)="load()">Load Users</button>
      <table *ngIf="users.length" class="table">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td>{{u.id}}</td><td>{{u.name}}</td><td>{{u.email}}</td><td>{{u.role}}</td>
            <td [class]="u.active ? 'active' : 'inactive'">{{u.active ? 'Active' : 'Inactive'}}</td>
          </tr>
        </tbody>
      </table>
    </app-card>
  `,
  styles: [`
    .btn {
      background: #2563eb; color: #fff; border: none; padding: 10px 20px;
      border-radius: 6px; font-size: .9rem; cursor: pointer; margin-bottom: 16px;
    }
    .btn:hover { background: #1d4ed8; }
    .table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .table th { text-align: left; padding: 8px 12px; background: #f1f5f9; color: #475569; font-weight: 600; }
    .table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .active { color: #16a34a; font-weight: 600; }
    .inactive { color: #dc2626; font-weight: 600; }
  `]
})
export class UsersComponent {
  users: any[] = [];
  constructor(private api: ApiService) {}
  load() {
    this.api.users().subscribe({
      next: (d: any) => this.users = d,
      error: () => {
        this.users = [
          { id: 1, name: 'Dr. Sarah Garcia', email: 'sgarcia@hospital.org', role: 'provider', active: true },
          { id: 2, name: 'Admin User', email: 'admin@hospital.org', role: 'admin', active: true },
          { id: 3, name: 'Dr. Raj Patel', email: 'rpatel@hospital.org', role: 'provider', active: true },
          { id: 4, name: 'Nurse Kelly', email: 'nkelly@hospital.org', role: 'nurse', active: false }
        ];
      }
    });
  }
}
