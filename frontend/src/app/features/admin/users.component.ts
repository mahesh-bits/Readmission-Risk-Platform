import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card.component';
import { ApiService } from '../../core/services/api.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const ROLES = ['admin', 'provider', 'nurse', 'viewer'];

const SEED_USERS: User[] = [
  { id: '1', name: 'Dr. Sarah Garcia',   email: 'sgarcia@hospital.org',   role: 'provider', active: true  },
  { id: '2', name: 'Admin User',          email: 'admin@hospital.org',     role: 'admin',    active: true  },
  { id: '3', name: 'Dr. Raj Patel',       email: 'rpatel@hospital.org',    role: 'provider', active: true  },
  { id: '4', name: 'Nurse Kelly',         email: 'nkelly@hospital.org',    role: 'nurse',    active: false },
  { id: '5', name: 'Dr. Linda Chen',      email: 'lchen@hospital.org',     role: 'provider', active: true  },
  { id: '6', name: 'Dr. Marcus Williams', email: 'mwilliams@hospital.org', role: 'provider', active: true  },
  { id: '7', name: 'Ana Rodriguez',       email: 'arodriguez@hospital.org',role: 'nurse',    active: true  },
  { id: '8', name: 'Data Viewer',         email: 'viewer@hospital.org',    role: 'viewer',   active: false },
];

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  selector: 'app-admin-users',
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">User Management</h2>
        <button class="btn-primary" (click)="openAdd()">+ Add User</button>
      </div>

      <app-card>
        <div *ngIf="loading" class="state-msg">Loading users…</div>

        <div *ngIf="error" class="state-msg error">
          {{ error }}
          <button class="btn-retry" (click)="ngOnInit()">Retry</button>
        </div>

        <ng-container *ngIf="!loading && !error">
        <!-- Filter bar -->
        <div class="toolbar">
          <input class="search" [(ngModel)]="search" placeholder="Search name or email…" />
          <select class="role-filter" [(ngModel)]="roleFilter">
            <option value="">All roles</option>
            <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
          </select>
          <span class="count">{{ filtered.length }} user{{ filtered.length === 1 ? '' : 's' }}</span>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of filtered" [class.inactive-row]="!u.active">
              <td class="name-cell">
                <span class="avatar">{{ initials(u.name) }}</span>
                {{ u.name }}
              </td>
              <td class="email-cell">{{ u.email }}</td>
              <td><span class="role-badge" [class]="'role-' + u.role">{{ u.role }}</span></td>
              <td>
                <span class="status-badge" [class]="u.active ? 'status-active' : 'status-inactive'">
                  {{ u.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="action-btns">
                <button class="btn-icon edit" title="Edit user" (click)="openEdit(u)">✏️</button>
                <button class="btn-icon delete" title="Delete user"
                        (click)="confirmDelete === u.id ? deleteUser(u) : startDelete(u)">
                  {{ confirmDelete === u.id ? '✓ Confirm' : '🗑' }}
                </button>
                <button *ngIf="confirmDelete === u.id" class="btn-icon cancel"
                        title="Cancel" (click)="confirmDelete = null">✕</button>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="5" class="empty">No users match the current filter.</td>
            </tr>
          </tbody>
        </table>
        </ng-container>
      </app-card>
    </div>

    <!-- Modal backdrop -->
    <div class="modal-backdrop" *ngIf="modalOpen" (click)="closeModal()"></div>

    <!-- Add / Edit modal -->
    <div class="modal" *ngIf="modalOpen" role="dialog">
      <div class="modal-header">
        <h3>{{ editingId == null ? 'Add User' : 'Edit User' }}</h3>
        <button class="modal-close" (click)="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="field">
          <label>Full Name *</label>
          <input [(ngModel)]="form.name" placeholder="Dr. First Last" [class.invalid]="submitted && !form.name.trim()" />
          <span class="err" *ngIf="submitted && !form.name.trim()">Required</span>
        </div>
        <div class="field">
          <label>Email *</label>
          <input [(ngModel)]="form.email" type="email" placeholder="user@hospital.org"
                 [class.invalid]="submitted && !validEmail(form.email)" />
          <span class="err" *ngIf="submitted && !validEmail(form.email)">Valid email required</span>
        </div>
        <div class="field">
          <label>Role *</label>
          <select [(ngModel)]="form.role">
            <option value="">— select —</option>
            <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
          </select>
          <span class="err" *ngIf="submitted && !form.role">Required</span>
        </div>
        <div class="field field-row">
          <label>Active</label>
          <label class="toggle">
            <input type="checkbox" [(ngModel)]="form.active" />
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" (click)="closeModal()">Cancel</button>
        <button class="btn-primary" (click)="saveUser()">
          {{ editingId == null ? 'Add User' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" *ngIf="toast" [class]="'toast ' + toastType">{{ toast }}</div>
  `,
  styles: [`
    .page { padding: 0 16px 32px; max-width: 1000px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 20px; }
    .page-title { font-size: 1.3rem; font-weight: 700; color: #0f172a; margin: 0; }

    /* Toolbar */
    .toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
    .search { flex: 1; min-width: 200px; padding: 7px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: .88rem; }
    .search:focus { outline: 2px solid #3b82f6; }
    .role-filter { padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: .88rem; background: #fff; }
    .count { font-size: .82rem; color: #94a3b8; white-space: nowrap; }

    /* Table */
    .table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .table th { text-align: left; padding: 8px 12px; background: #f8fafc; color: #475569; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
    .table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .inactive-row td { opacity: .55; }
    .actions-col { width: 110px; }

    .name-cell { display: flex; align-items: center; gap: 10px; font-weight: 500; color: #0f172a; }
    .avatar { width: 30px; height: 30px; border-radius: 50%; background: #dbeafe; color: #1e40af; font-size: .72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .email-cell { color: #475569; font-size: .85rem; }

    .role-badge { padding: 2px 9px; border-radius: 999px; font-size: .76rem; font-weight: 600; text-transform: capitalize; }
    .role-admin    { background: #fee2e2; color: #991b1b; }
    .role-provider { background: #dbeafe; color: #1e40af; }
    .role-nurse    { background: #dcfce7; color: #166534; }
    .role-viewer   { background: #f3e8ff; color: #6b21a8; }

    .status-badge { padding: 2px 9px; border-radius: 999px; font-size: .76rem; font-weight: 600; }
    .status-active   { background: #dcfce7; color: #166534; }
    .status-inactive { background: #f1f5f9; color: #64748b; }

    .action-btns { display: flex; gap: 4px; align-items: center; }
    .btn-icon { background: none; border: 1px solid transparent; border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: .82rem; transition: background .15s; }
    .btn-icon:hover { background: #f1f5f9; }
    .btn-icon.delete:hover { color: #dc2626; }
    .btn-icon.edit:hover   { border-color: #3b82f6; }
    .btn-icon.cancel       { color: #64748b; font-size: .78rem; }

    .empty { text-align: center; padding: 24px; color: #94a3b8; }

    /* State messages */
    .state-msg { padding: 24px; text-align: center; color: #64748b; font-size: .95rem; }
    .state-msg.error { color: #b91c1c; background: #fef2f2; border-radius: 8px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .btn-retry { background: #dc2626; color: #fff; border: none; padding: 7px 18px; border-radius: 6px; font-size: .85rem; cursor: pointer; }
    .btn-retry:hover { background: #b91c1c; }

    /* Buttons */
    .btn-primary { background: #0f766e; color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-size: .88rem; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #115e59; }
    .btn-ghost { background: none; border: 1px solid #e2e8f0; color: #475569; padding: 8px 18px; border-radius: 8px; font-size: .88rem; cursor: pointer; }
    .btn-ghost:hover { background: #f8fafc; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 100; }
    .modal {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #fff; border-radius: 14px; width: 440px; max-width: calc(100vw - 32px);
      z-index: 101; box-shadow: 0 20px 60px rgba(0,0,0,.18);
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0; }
    .modal-header h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
    .modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #94a3b8; padding: 4px; }
    .modal-close:hover { color: #475569; }
    .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
    .modal-footer { padding: 0 24px 20px; display: flex; justify-content: flex-end; gap: 10px; }

    .field { display: flex; flex-direction: column; gap: 5px; }
    .field-row { flex-direction: row; align-items: center; gap: 12px; }
    .field label { font-size: .82rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .04em; }
    .field input, .field select {
      padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: .9rem;
    }
    .field input:focus, .field select:focus { outline: 2px solid #3b82f6; border-color: transparent; }
    .field input.invalid { border-color: #ef4444; }
    .err { font-size: .78rem; color: #dc2626; }

    /* Toggle */
    .toggle { position: relative; display: inline-block; width: 40px; height: 22px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; inset: 0; background: #cbd5e1; border-radius: 999px; cursor: pointer; transition: .2s; }
    .slider:before { content: ''; position: absolute; width: 16px; height: 16px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: .2s; }
    .toggle input:checked + .slider { background: #0f766e; }
    .toggle input:checked + .slider:before { transform: translateX(18px); }

    /* Toast */
    .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 10px; font-size: .9rem; font-weight: 500; z-index: 200; animation: fadeIn .2s ease; }
    .toast.success { background: #166534; color: #fff; }
    .toast.error   { background: #991b1b; color: #fff; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles = ROLES;
  loading = false;
  error = '';

  search = '';
  roleFilter = '';

  modalOpen = false;
  editingId: string | null = null;
  submitted = false;
  form: Omit<User, 'id'> = { name: '', email: '', role: '', active: true };

  confirmDelete: string | null = null;

  toast = '';
  toastType = 'success';
  private toastTimer: any;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.users().subscribe({
      next: (d: any) => { this.users = d; this.loading = false; },
      error: () => {
        this.error = 'Could not reach the backend. Please ensure the server is running and refresh.';
        this.loading = false;
      }
    });
  }

  get filtered(): User[] {
    const q = this.search.toLowerCase();
    return this.users.filter(u =>
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!this.roleFilter || u.role === this.roleFilter)
    );
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  openAdd() {
    this.editingId = null;
    this.form = { name: '', email: '', role: '', active: true };
    this.submitted = false;
    this.modalOpen = true;
    this.confirmDelete = null;
  }

  openEdit(u: User) {
    this.editingId = u.id;
    this.form = { name: u.name, email: u.email, role: u.role, active: u.active };
    this.submitted = false;
    this.modalOpen = true;
    this.confirmDelete = null;
  }

  closeModal() {
    this.modalOpen = false;
    this.submitted = false;
  }

  saveUser() {
    this.submitted = true;
    if (!this.form.name.trim() || !this.validEmail(this.form.email) || !this.form.role) return;

    const body = { ...this.form, name: this.form.name.trim(), email: this.form.email.trim() };

    if (this.editingId == null) {
      this.api.createUser(body).subscribe({
        next: (u: any) => {
          this.users.push(u);
          this.showToast('User added successfully', 'success');
          this.closeModal();
        },
        error: (err: any) => {
          this.showToast(err?.error?.error ?? 'Failed to add user', 'error');
        }
      });
    } else {
      this.api.updateUser(this.editingId, body).subscribe({
        next: (u: any) => {
          const idx = this.users.findIndex(x => x.id === this.editingId);
          if (idx !== -1) this.users[idx] = u;
          this.showToast('User updated successfully', 'success');
          this.closeModal();
        },
        error: (err: any) => {
          this.showToast(err?.error?.error ?? 'Failed to update user', 'error');
        }
      });
    }
  }

  startDelete(u: User) {
    this.confirmDelete = u.id;
  }

  deleteUser(u: User) {
    this.api.deleteUser(u.id).subscribe({
      next: () => {
        this.users = this.users.filter(x => x.id !== u.id);
        this.confirmDelete = null;
        this.showToast(`${u.name} deleted`, 'success');
      },
      error: () => {
        this.confirmDelete = null;
        this.showToast('Failed to delete user', 'error');
      }
    });
  }

  validEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private showToast(msg: string, type: 'success' | 'error') {
    this.toast = msg;
    this.toastType = type;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast = '', 3000);
  }
}
