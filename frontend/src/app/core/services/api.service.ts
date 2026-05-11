import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '';
  constructor(private http: HttpClient) {
    fetch('/assets/config.json').then(r => r.json()).then(cfg => this.base = cfg.apiBaseUrl);
  }
  patients() { return this.http.get(`${this.base}/api/patients`); }
  patient(id: string) { return this.http.get(`${this.base}/api/patients/${id}`); }
  predict(payload: any) { return this.http.post(`${this.base}/api/inference/predict`, payload); }
  encounters(patientId: string) { return this.http.get(`${this.base}/api/patients/${patientId}/encounters`); }
  documents(patientId: string) { return this.http.get(`${this.base}/api/patients/${patientId}/documents`); }
  users() { return this.http.get(`${this.base}/api/admin/users`); }
  roles() { return this.http.get(`${this.base}/api/admin/roles`); }
  consents() { return this.http.get(`${this.base}/api/admin/consents`); }
  auditLogs() { return this.http.get(`${this.base}/api/admin/audit`); }
}
