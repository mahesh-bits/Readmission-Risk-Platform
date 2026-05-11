
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login.component';
import { PatientsComponent } from './patients.component';
import { RiskComponent } from './risk.component';
import { ApiService } from './api.service';

const routes: Routes = [
  { path: '', component: PatientsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'risk', component: RiskComponent }
];

@NgModule({
  declarations: [],
  imports: [BrowserModule, FormsModule, HttpClientModule, RouterModule.forRoot(routes), AppComponent, LoginComponent, PatientsComponent, RiskComponent],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule {}
