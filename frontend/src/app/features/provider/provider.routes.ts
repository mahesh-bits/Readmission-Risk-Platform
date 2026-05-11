import { Routes } from '@angular/router';
import { ProviderPanelComponent } from './panel.component';
import { ProviderPatientsComponent } from './patient-list.component';
import { ProviderNotesComponent } from './notes.component';

export const PROVIDER_ROUTES: Routes = [
  { path: '', component: ProviderPanelComponent },
  { path: 'patients', component: ProviderPatientsComponent },
  { path: 'notes', component: ProviderNotesComponent }
];
