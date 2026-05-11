import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'patient', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'patient',
    loadChildren: () => import('./features/patient/patient.routes').then(m => m.PATIENT_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'provider',
    loadChildren: () => import('./features/provider/provider.routes').then(m => m.PROVIDER_ROUTES),
    canActivate: [roleGuard(['provider', 'admin'])]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [roleGuard(['admin'])]
  },
  { path: '**', redirectTo: 'patient' }
];
