import { Routes } from '@angular/router';
import { UsersComponent } from './users.component';
import { RolesComponent } from './roles.component';
import { ConsentsComponent } from './consents.component';
import { AuditComponent } from './audit.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'users', component: UsersComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'consents', component: ConsentsComponent },
  { path: 'audit', component: AuditComponent },
  { path: '', redirectTo: 'users', pathMatch: 'full' }
];
