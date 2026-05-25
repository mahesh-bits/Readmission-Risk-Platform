import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

interface AppConfig { base: string; mlBase: string; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private config$ = new ReplaySubject<AppConfig>(1);

  constructor(private http: HttpClient) {
    this.http.get<any>('./assets/config.json').subscribe(cfg => {
      this.config$.next({
        base:   cfg.apiBaseUrl,
        mlBase: cfg.mlServiceBaseUrl || cfg.apiBaseUrl
      });
      console.log(cfg.apiBaseUrl);
      console.log(cfg.mlServiceBaseUrl);
    });
  }

  private get<T = any>(path: string) {
    return this.config$.pipe(take(1), switchMap(c => this.http.get<T>(`${c.base}${path}`)));
  }
  private post<T = any>(path: string, body: any) {
    return this.config$.pipe(take(1), switchMap(c => this.http.post<T>(`${c.base}${path}`, body)));
  }
  private put<T = any>(path: string, body: any) {
    return this.config$.pipe(take(1), switchMap(c => this.http.put<T>(`${c.base}${path}`, body)));
  }
  private del<T = any>(path: string) {
    return this.config$.pipe(take(1), switchMap(c => this.http.delete<T>(`${c.base}${path}`)));
  }
  private mlPost<T = any>(path: string, body: any) {
    return this.config$.pipe(take(1), switchMap(c => this.http.post<T>(`${c.mlBase}${path}`, body)));
  }

  login(email: string, password: string)   { return this.post('/api/auth/login', { email, password }); }

  dashboard(providerId?: string) {
    const qs = providerId ? `?providerId=${providerId}` : '';
    return this.get(`/api/dashboard${qs}`);
  }
  patients(providerId?: string) {
    const qs = providerId ? `?providerId=${providerId}` : '';
    return this.get(`/api/patients${qs}`);
  }
  patient(id: string)                      { return this.get(`/api/patients/${id}`); }
  encounters(patientId: string)            { return this.get(`/api/patients/${patientId}/encounters`); }
  documents(patientId: string)             { return this.get(`/api/patients/${patientId}/documents`); }

  predict(payload: any)                    { return this.post('/api/inference/predict', payload); }
  predictMl(features: Record<string, number>) { return this.mlPost('/v1/predict', { features }); }

  users()                                  { return this.get('/api/admin/users'); }
  createUser(body: any)                    { return this.post('/api/admin/users', body); }
  updateUser(id: string, body: any)        { return this.put(`/api/admin/users/${id}`, body); }
  deleteUser(id: string)                   { return this.del(`/api/admin/users/${id}`); }
  roles()                                  { return this.get('/api/admin/roles'); }
  patientNotes(patientId: string)        { return this.get(`/api/patients/${patientId}/notes`); }
  createNote(patientId: string, body: any){ return this.post(`/api/patients/${patientId}/notes`, body); }
  providerNotes(providerId?: string) {
    const qs = providerId ? `?providerId=${providerId}` : '';
    return this.get(`/api/notes${qs}`);
  }
  consents()                               { return this.get('/api/admin/consents'); }
  auditLogs()                              { return this.get('/api/admin/audit'); }
}
