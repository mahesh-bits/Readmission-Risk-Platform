import { Routes } from '@angular/router';
import { PatientSearchComponent } from './search.component';
import { PatientDetailComponent } from './detail.component';
import { EncountersComponent } from './encounters.component';
import { DocsComponent } from './docs.component';

export const PATIENT_ROUTES: Routes = [
  { path: '', component: PatientSearchComponent },
  { path: ':id', component: PatientDetailComponent },
  { path: ':id/encounters', component: EncountersComponent },
  { path: ':id/docs', component: DocsComponent }
];
