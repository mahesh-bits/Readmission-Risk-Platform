import { Routes } from '@angular/router';
import { ProviderPanelComponent } from './panel.component';
import { ProviderPatientsComponent } from './patient-list.component';
import { ProviderNotesComponent } from './notes.component';
import { ProviderScoreComponent } from './score.component';
import { DashboardComponent } from './dashboard.component';

export const PROVIDER_ROUTES: Routes = [
  { path: '', component: ProviderPanelComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: ProviderPatientsComponent },
  { path: 'notes', component: ProviderNotesComponent },
  { path: 'score', component: ProviderScoreComponent }
];
