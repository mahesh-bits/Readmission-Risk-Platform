import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, CardComponent],
  selector: 'app-admin-roles',
  template: `
    <app-card title="Role Management">
      <table class="table">
        <thead><tr><th>Role</th><th>Permissions</th><th>Users</th></tr></thead>
        <tbody>
          <tr *ngFor="let r of roles">
            <td class="role-name">{{r.name}}</td>
            <td>{{r.permissions.join(', ')}}</td>
            <td>{{r.count}}</td>
          </tr>
        </tbody>
      </table>
    </app-card>
  `,
  styles: [`
    .table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .table th { text-align: left; padding: 8px 12px; background: #f1f5f9; color: #475569; font-weight: 600; }
    .table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .role-name { font-weight: 600; color: #1e3a5f; }
  `]
})
export class RolesComponent {
  roles = [
    { name: 'Admin', permissions: ['read', 'write', 'delete', 'manage-users'], count: 2 },
    { name: 'Provider', permissions: ['read', 'write', 'predict'], count: 8 },
    { name: 'Nurse', permissions: ['read', 'write'], count: 15 },
    { name: 'Viewer', permissions: ['read'], count: 5 }
  ];
}
