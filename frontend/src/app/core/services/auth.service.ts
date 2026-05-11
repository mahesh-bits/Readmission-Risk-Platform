import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;
  private role = 'guest';

  login(username: string, password: string): boolean {
    // Stub: replace with real JWT auth
    if (username && password) {
      this.token = 'mock-jwt-token';
      this.role = username === 'admin' ? 'admin' : 'provider';
      return true;
    }
    return false;
  }

  logout(): void {
    this.token = null;
    this.role = 'guest';
  }

  isAuthenticated(): boolean { return !!this.token; }
  getRole(): string { return this.role; }
  getToken(): string | null { return this.token; }
}
