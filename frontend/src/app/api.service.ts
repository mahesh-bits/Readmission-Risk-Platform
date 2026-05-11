
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '';
  constructor(private http: HttpClient) {
    fetch('/assets/config.json').then(r => r.json()).then(cfg => this.base = cfg.apiBaseUrl);
  }
  patients(){ return this.http.get(`${this.base}/api/patients`); }
  predict(payload:any){ return this.http.post(`${this.base}/api/inference/predict`, payload); }
}
