import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { CallbackComponent } from './callback.component';
import { ProfileComponent } from './profile.component';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
